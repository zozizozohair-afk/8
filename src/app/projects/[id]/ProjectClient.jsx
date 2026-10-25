'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpLeft, MapPin, Maximize2, LayoutGrid, Download, FileText, Phone, ChevronLeft, ChevronRight, Heart, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { areaLabel, formatNumber, mapUnit, priceLabel, safeExternalUrl, statusLabels } from '@/lib/unitCatalog.mjs';
import { companyContact } from '@/lib/companyContact.mjs';
import { projectMapUrl } from '@/lib/projectMap.mjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectLoading from '@/components/ProjectLoading';
import NavigationDialog from '@/components/NavigationDialog';
import { CatalogDialog, UnitDetails } from '@/components/UnitModels';
import InterestRegistration from '@/components/InterestRegistration';
import InterestQuickAccess from '@/components/InterestQuickAccess';
import '@/components/HomeExperience.css';
import '@/components/ClosingExperience.css';
import './ProjectExperience.css';

const FAVORITES_KEY = 'safwa-unit-favorites-v1';
const projectStatuses = { upcoming: 'قريبًا', ongoing: 'قيد الإنشاء', completed: 'مكتمل' };
function ProjectImage({ src, alt, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? <img className={className} src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} /> : <div className={`pd-image-fallback ${className}`}><Building2 size={44} strokeWidth={1} aria-hidden="true" /><span>صفوة عنان</span><small>الصور تُحدّث قريبًا</small></div>;
}
export default function ProjectDetails({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState('units');
  const [section, setSection] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [favorites, setFavorites] = useState([]);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); if (Array.isArray(saved)) setFavorites(saved.filter(value => typeof value === 'string')); } catch {} }, []);
  const toggleFavorite = unit => setFavorites(previous => {
    const next = previous.includes(unit.id) ? previous.filter(value => value !== unit.id) : [...previous, unit.id];
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch {}
    return next;
  });
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true); setError(false); setData(null); setSection('all'); setTab('units'); setAvailableOnly(false); setSelectedUnit(null); setLightbox(null);
    async function load() {
      try {
        const results = await Promise.all([
          supabase.from('projects').select('*').eq('id', id).maybeSingle().abortSignal(controller.signal),
          supabase.from('units').select('*').eq('project_id', id).order('price', { ascending: true }).abortSignal(controller.signal),
          supabase.from('project_images').select('*').eq('project_id', id).abortSignal(controller.signal),
          supabase.from('project_files').select('*').eq('project_id', id).order('created_at', { ascending: false }).abortSignal(controller.signal),
          supabase.from('project_sections').select('*').eq('project_id', id).abortSignal(controller.signal),
        ]);
        if (results[0].error) throw results[0].error;
        if (active) setData({ project: results[0].data, units: results[1].data || [], gallery: results[2].data || [], files: results[3].data || [], sections: results[4].data || [], partial: results.slice(1).some(result => result.error) });
      } catch { if (active) setError(true); }
      finally { clearTimeout(timeout); if (active) setLoading(false); }
    }
    load();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [id, attempt]);
  if (loading) return <ProjectLoading />;
  if (error || !data?.project) return <main className="pd-error" id="project-main" tabIndex={-1}><span className="pd-eyebrow">صفوة عنان / المشاريع</span><Building2 size={42} strokeWidth={1} aria-hidden="true" /><h1>{error ? 'نحتاج لحظة أخرى.' : 'لم نعثر على هذا المشروع.'}</h1><p>{error ? 'تعذّر تحميل تفاصيل المشروع. أعد المحاولة أو استكشف بقية مشاريعنا.' : 'قد يكون الرابط تغيّر. يمكنك العودة لاختيار مشروع من قائمتنا.'}</p><div>{error && <button className="pd-button" onClick={() => setAttempt(value => value + 1)}>إعادة المحاولة <ArrowLeft size={17} /></button>}<Link href="/#projects" className="pd-text-link">استكشف المشاريع <ArrowLeft size={17} /></Link></div></main>;
  const { project, units, sections, partial } = data;
  const mappedUnits = units.map(unit => ({ ...mapUnit({ ...unit, projects: project }), sectionId: unit.section_id }));
  const available = units.filter(unit => unit.status === 'available').length;
  const areas = mappedUnits.map(unit => unit.area).filter(Boolean);
  const prices = mappedUnits.filter(unit => unit.status === 'available').map(unit => unit.price).filter(Boolean);
  const visibleUnits = mappedUnits.filter(unit => (section === 'all' || unit.sectionId === section) && (!availableOnly || unit.status === 'available'));
  const gallery = [...(project.main_image ? [{ image_url: project.main_image, name: 'الواجهة الرئيسية' }] : []), ...data.gallery].filter((image, index, all) => image.image_url && all.findIndex(item => item.image_url === image.image_url) === index).map(image => ({ src: image.image_url, name: image.name || (image.type === 'interior' ? 'من الداخل' : 'من زوايا المشروع') }));
  const documents = [...data.files.map(file => ({ name: file.name || 'ملف المشروع', url: safeExternalUrl(file.file_url) })), ...(project.brochure ? [{ name: 'كتيّب المشروع', url: safeExternalUrl(project.brochure) }] : [])].filter((file, index, all) => file.url && all.findIndex(item => item.url === file.url) === index);
  const locationUrl = projectMapUrl(project.link, project.location);
  const contactUrl = `${companyContact.whatsapp}?text=${encodeURIComponent(`مرحبًا، أرغب في معرفة تفاصيل مشروع ${project.name} وترتيب معاينة.\n${project.location || ''}`)}`;
  const tabs = [{ id: 'units', label: 'الوحدات والمخططات', count: units.length }, ...(sections.length ? [{ id: 'sections', label: 'أقسام المشروع', count: sections.length }] : []), { id: 'gallery', label: 'معرض الصور', count: gallery.length }, ...(documents.length ? [{ id: 'files', label: 'ملفات المشروع', count: documents.length }] : [])];
  const openGallery = (images, index) => setLightbox({ images, index });
  const nextImage = direction => setLightbox(previous => ({ ...previous, index: (previous.index + direction + previous.images.length) % previous.images.length }));
  const handleTabKeys = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.findIndex(item => item.id === tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowLeft' ? 1 : -1) + tabs.length) % tabs.length;
    setTab(tabs[next].id); event.currentTarget.querySelector(`#pd-tab-${tabs[next].id}`)?.focus();
  };
  return <>
    <Header interestHref="#register-interest" breadcrumb={[{ label: 'الرئيسية', href: '/' }, { label: 'المشاريع', href: '/#projects' }, { label: project.name }]} />
    <main id="project-main" tabIndex={-1} className="pd-page"><div id="top" />
      <section className="pd-hero" data-theme="dark" aria-labelledby="pd-title"><ProjectImage src={project.main_image} alt={`واجهة مشروع ${project.name}`} eager className="pd-hero__image" /><div className="pd-hero__shade" /><div className="pd-hero__content container-custom"><Link className="pd-hero__back" href="/#projects"><ArrowRight size={16} />جميع المشاريع</Link><div className="pd-hero__heading"><div><span className="pd-eyebrow"><i />{projectStatuses[project.status] || 'أحد مشاريع صفوة عنان'}</span><h1 id="pd-title">{project.name}</h1>{project.location && <p><MapPin size={17} strokeWidth={1.5} aria-hidden="true" />{project.location}</p>}</div><div className="pd-hero__actions"><a href="#register-interest" className="pd-button pd-button--gold">هذا قد يكون عنواني <ArrowUpLeft size={19} aria-hidden="true" /></a>{gallery.length > 0 && <button className="pd-hero__gallery" onClick={() => openGallery(gallery, 0)}><LayoutGrid size={16} aria-hidden="true" />شاهد الصور <span>{formatNumber(gallery.length)}</span></button>}</div></div><div className="pd-hero__baseline"><span>عنوان جديد. تفاصيل تستحق.</span><span lang="en" dir="ltr">SAFWAT ANAN / RESIDENCES</span></div></div></section>
      <section className="pd-intro container-custom" aria-labelledby="pd-intro-title"><div className="pd-intro__copy"><span className="pd-eyebrow">عن المشروع</span><h2 id="pd-intro-title">تأمّل المكان.<br /><em>وتخيّل حياتك هنا.</em></h2><p>{project.description || `تعرّف على ${project.name}، واستعرض الوحدات والمخططات المتاحة لتجد المساحة الأقرب إلى احتياجك.`}</p>{locationUrl && <a className="pd-text-link" href={locationUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16} />استكشف موقع المشروع <ArrowUpLeft size={16} /></a>}</div><dl className="pd-facts"><div><dt>النماذج السكنية</dt><dd>{formatNumber(units.length)}<small>نموذج مسجّل</small></dd></div><div><dt>النماذج المتاحة</dt><dd>{formatNumber(available)}<small>حسب آخر تحديث</small></dd></div>{areas.length > 0 && <div><dt>المساحات تبدأ من</dt><dd>{formatNumber(Math.min(...areas))}<small>متر مربع</small></dd></div>}{prices.length > 0 ? <div><dt>الأسعار تبدأ من</dt><dd>{formatNumber(Math.min(...prices))}<small>ريال سعودي · للوحدات المتاحة</small></dd></div> : project.start_year ? <div><dt>سنة بدء المشروع</dt><dd>{project.start_year}<small>رحلة المشروع</small></dd></div> : <div><dt>لنتحدث عن اختيارك</dt><dd className="pd-facts__note">تفاصيل أكثر<small>الأسعار والتوفر عند التواصل</small></dd></div>}</dl></section>
      <section id="project-collection" className="pd-collection container-custom" aria-labelledby="pd-collection-title"><div className="pd-section-heading"><div><span className="pd-eyebrow">المشروع، عن قرب</span><h2 id="pd-collection-title">كل زاوية، تستحق نظرة.</h2></div><span lang="en" dir="ltr">EXPLORE THE DETAILS</span></div>
        {partial && <p className="pd-notice" role="status">بعض تفاصيل المشروع لم تُحمّل. <button onClick={() => setAttempt(value => value + 1)}>أعد التحميل</button></p>}
        <div className="pd-tabs" role="tablist" aria-label="تفاصيل المشروع" onKeyDown={handleTabKeys}>{tabs.map(item => <button key={item.id} id={`pd-tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls={`pd-panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)}>{item.label}<span>{formatNumber(item.count)}</span></button>)}</div>
        <div role="tabpanel" id={`pd-panel-${tab}`} aria-labelledby={`pd-tab-${tab}`} tabIndex={0} className="pd-panel">
          {tab === 'units' && <><div className="pd-unit-toolbar"><p>{formatNumber(visibleUnits.length)} نموذج يناسب اختيارك</p><div>{sections.length > 0 && <label>القسم<select value={section} onChange={event => setSection(event.target.value)}><option value="all">كل الأقسام</option>{sections.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}<label><input type="checkbox" checked={availableOnly} onChange={event => setAvailableOnly(event.target.checked)} />المتاح فقط</label></div></div>{visibleUnits.length ? <div className="pd-units">{visibleUnits.map((unit, index) => <article key={unit.id} className="pd-unit"><div className="pd-unit__visual"><button className="pd-unit__image-button" onClick={() => setSelectedUnit(unit)} aria-label={`عرض مخطط ${unit.title}`}><ProjectImage src={unit.image} alt={`مخطط ${unit.title}`} /><span><Maximize2 size={15} />افتح المخطط</span></button><span className={`pd-unit__status ${unit.status === 'available' ? 'is-available' : ''}`}><i />{statusLabels[unit.status] || 'التوفر عند التواصل'}</span><button className="pd-unit__save" aria-pressed={favorites.includes(unit.id)} aria-label={`${favorites.includes(unit.id) ? 'إزالة' : 'حفظ'} ${unit.title} ${favorites.includes(unit.id) ? 'من' : 'في'} المفضلة`} onClick={() => toggleFavorite(unit)}><Heart size={18} fill={favorites.includes(unit.id) ? 'currentColor' : 'none'} /></button></div><div className="pd-unit__body"><span className="pd-unit__type">{unit.type}<small dir="ltr">{String(index + 1).padStart(2, '0')}</small></span><h3><button onClick={() => setSelectedUnit(unit)}>{unit.title}</button></h3><div className="pd-unit__facts"><span>{areaLabel(unit)}</span>{unit.count !== null && <span>{formatNumber(unit.count)} وحدة مسجّلة</span>}</div><div className="pd-unit__bottom"><strong>{priceLabel(unit)}</strong><button onClick={() => setSelectedUnit(unit)}>اكتشف التفاصيل <ArrowUpLeft size={17} /></button></div></div></article>)}</div> : <div className="pd-empty"><Building2 size={32} strokeWidth={1} /><h3>{availableOnly ? 'لا توجد نماذج متاحة لهذا الاختيار.' : 'نحضّر تفاصيل الوحدات.'}</h3><p>سجّل اهتمامك، ليوافيك فريقنا بأحدث الخيارات والتفاصيل.</p>{(availableOnly || section !== 'all') && <button className="pd-text-link" onClick={() => { setAvailableOnly(false); setSection('all'); }}>اعرض كل النماذج <ArrowLeft size={16} /></button>}</div>}</>}
          {tab === 'sections' && <div className="pd-sections">{sections.map(item => <article key={item.id}><div className="pd-section-plan">{item.plan_image ? <button onClick={() => openGallery([{ src: item.plan_image, name: item.name }], 0)} aria-label={`تكبير مخطط ${item.name}`}><ProjectImage src={item.plan_image} alt={`مخطط ${item.name}`} /><Maximize2 size={19} /></button> : <ProjectImage alt={item.name} />}</div><div><span className="pd-eyebrow">أقسام المشروع</span><h3>{item.name}</h3>{item.description && <p>{item.description}</p>}<button className="pd-text-link" onClick={() => { setSection(item.id); setTab('units'); }}>استعرض نماذج القسم <ArrowLeft size={16} /></button>{safeExternalUrl(item.brochure) && <a className="pd-section-download" href={safeExternalUrl(item.brochure)} target="_blank" rel="noopener noreferrer"><Download size={14} />كتيّب القسم</a>}</div></article>)}</div>}
          {tab === 'gallery' && (gallery.length ? <div className="pd-gallery">{gallery.map((image, index) => <button key={image.src} onClick={() => openGallery(gallery, index)} aria-label={`تكبير ${image.name}، الصورة ${index + 1}`}><ProjectImage src={image.src} alt={`${project.name} · ${image.name}`} /><span>{image.name}<Maximize2 size={18} /></span></button>)}</div> : <div className="pd-empty"><LayoutGrid size={30} strokeWidth={1} /><p>صور المشروع ستُضاف قريبًا.</p></div>)}
          {tab === 'files' && <div className="pd-documents"><p>خذ التفاصيل معك، وتصفّحها على راحتك.</p>{documents.map((file, index) => <a href={file.url} key={file.url} target="_blank" rel="noopener noreferrer"><span>{String(index + 1).padStart(2, '0')}</span><FileText size={23} strokeWidth={1.3} /><span>{file.name}<small>فتح الملف في نافذة جديدة</small></span><ArrowUpLeft size={21} /></a>)}</div>}
        </div>
      </section>
      <section id="contact" className="pd-conversation" data-theme="dark"><div className="container-custom"><div><span className="pd-eyebrow">من الشاشة، إلى المكان</span><h2>بعض التفاصيل،<br /><em>تُحسّ عند الزيارة.</em></h2><p>فريقنا يجيب عن أسئلتك ويرتّب معك معاينة المشروع.</p></div><div className="pd-conversation__actions"><a className="pd-button pd-button--gold" href={contactUrl} target="_blank" rel="noopener noreferrer">لنتحدث عن {project.name} <ArrowUpLeft size={18} /></a><a className="pd-conversation__phone" href={companyContact.phoneHref}><Phone size={15} /><span dir="ltr">{companyContact.phone}</span><small>اتصل بفريق صفوة</small></a>{locationUrl && <a className="pd-text-link" href={locationUrl} target="_blank" rel="noopener noreferrer">اتجاهات المشروع <MapPin size={16} /></a>}</div></div></section>
      <InterestRegistration key={project.id} projectName={project.name} />
    </main><Footer /><InterestQuickAccess />
    {selectedUnit && <CatalogDialog title={selectedUnit.title} onClose={() => setSelectedUnit(null)} className="uc-detail-dialog"><UnitDetails unit={selectedUnit} favorite={favorites.includes(selectedUnit.id)} onFavorite={() => toggleFavorite(selectedUnit)} /></CatalogDialog>}
    {lightbox && <NavigationDialog title="صور المشروع" className="pd-lightbox" onClose={() => setLightbox(null)} onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); nextImage(event.key === 'ArrowLeft' ? 1 : -1); } }}><div className="pd-lightbox__inner"><div className="pd-lightbox__heading"><span>{project.name}</span><small dir="ltr">{lightbox.index + 1} / {lightbox.images.length}</small></div><div className="pd-lightbox__image"><ProjectImage key={lightbox.images[lightbox.index].src} src={lightbox.images[lightbox.index].src} alt={lightbox.images[lightbox.index].name} eager /></div><div className="pd-lightbox__bottom"><p>{lightbox.images[lightbox.index].name}</p>{lightbox.images.length > 1 && <div><button aria-label="الصورة السابقة" onClick={() => nextImage(-1)}><ChevronRight size={24} /></button><button aria-label="الصورة التالية" onClick={() => nextImage(1)}><ChevronLeft size={24} /></button></div>}</div></div></NavigationDialog>}
  </>;
}
