'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, ArrowUpLeft, Heart, SlidersHorizontal, Search, X, Maximize2, MapPin, Scale, LayoutGrid, Building2, Share2, Clock, ChevronDown, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { areaLabel, filterUnits, formatNumber, kindLabels, mapUnit, priceLabel, safeExternalUrl, statusLabels, unitContactUrl } from '@/lib/unitCatalog.mjs';
import { cleanRecentIds, rememberUnit, readSharedSelection, unitShareUrl, saudiToday, viewingRequestUrl } from '@/lib/unitExperience.mjs';
import { projectMapUrl } from '@/lib/projectMap.mjs';
import './UnitModels.css';

const FAVORITES_KEY = 'safwa-unit-favorites-v1';
const RECENT_KEY = 'safwa-recent-units-v1';
const initialFilters = { search: '', project: 'all', kind: 'all', available: false, favoritesOnly: false, sort: 'latest' };

export default function UnitModels() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [favorites, setFavorites] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  const [storageReady, setStorageReady] = useState(false);
  const [recentIds, setRecentIds] = useState([]);
  const sharedRequest = useRef('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      if (Array.isArray(saved)) setFavorites([...new Set(saved.filter(id => typeof id === 'string'))]);
    } catch { /* Favorites remain usable when local storage is unavailable. */ }
    try { setRecentIds(cleanRecentIds(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'))); } catch {}
    setStorageReady(true);
  }, []);
  useEffect(() => {
    if (storageReady) { try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch {} }
  }, [favorites, storageReady]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const { data, error: fetchError } = await supabase.from('units').select('id, project_id, unit_number, type, size, price, status, main_image, model_details, model_count, projects (name, location, link)').order('created_at', { ascending: false });
        if (fetchError) throw fetchError;
        if (active) setUnits((data || []).map(mapUnit));
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (storageReady) { try { localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds)); } catch {} }
  }, [recentIds, storageReady]);

  useEffect(() => {
    if (loading || error) return;
    const applySharedLink = () => {
      const search = window.location.search;
      if (sharedRequest.current === search) return;
      sharedRequest.current = search;
      const selection = readSharedSelection(search);
      if (!selection) return;
      const matched = selection.ids.map(id => units.find(unit => unit.id === id)).filter(Boolean);
      if (!matched.length) { setNotice('النماذج في هذا الرابط غير متاحة حاليًا. يمكنك استعراض المجموعة.'); return; }
      if (selection.type === 'compare' && matched.length > 1) {
        setComparison(matched.map(unit => unit.id));
        setModal({ type: 'compare' });
      } else {
        setRecentIds(previous => rememberUnit(previous, matched[0].id));
        setModal({ type: 'details', unit: matched[0] });
      }
      if (matched.length < selection.ids.length) setNotice('بعض النماذج في الرابط لم تعد متاحة؛ نعرض النماذج الموجودة.');
    };
    applySharedLink();
    window.addEventListener('popstate', applySharedLink);
    return () => window.removeEventListener('popstate', applySharedLink);
  }, [loading, error, units]);

  const openUnit = unit => {
    setRecentIds(previous => rememberUnit(previous, unit.id));
    setModal({ type: 'details', unit });
  };
  const closeModal = () => {
    setModal(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('unit') || url.searchParams.has('compare')) {
      url.searchParams.delete('unit'); url.searchParams.delete('compare');
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
      sharedRequest.current = url.search;
    }
  };
  const recentUnits = recentIds.map(id => units.find(unit => unit.id === id)).filter(Boolean);

  const updateFilter = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setVisibleCount(6); };
  const reset = () => { setFilters(initialFilters); setVisibleCount(6); };
  const filtered = filterUnits(units, { ...filters, favorites });
  const compared = comparison.map(id => units.find(unit => unit.id === id)).filter(Boolean);
  const favoriteCount = units.filter(unit => favorites.includes(unit.id)).length;
  const projects = [...new Map(units.filter(unit => unit.projectId).map(unit => [unit.projectId, unit.projectName])).entries()];
  const kinds = [...new Set(units.map(unit => unit.kind))];
  const hasFilters = filters.search || filters.project !== 'all' || filters.kind !== 'all' || filters.available || filters.favoritesOnly;
  const toggleFavorite = unit => {
    const exists = favorites.includes(unit.id);
    setFavorites(previous => exists ? previous.filter(id => id !== unit.id) : [...previous, unit.id]);
    setNotice(exists ? `أُزيل ${unit.title} من المفضلة` : `حُفظ ${unit.title} في المفضلة على هذا المتصفح`);
  };
  const toggleComparison = unit => {
    if (comparison.includes(unit.id)) { setComparison(previous => previous.filter(id => id !== unit.id)); setNotice(`أُزيل ${unit.title} من المقارنة`); }
    else if (comparison.length < 3) { setComparison(previous => [...previous, unit.id]); setNotice(`أُضيف ${unit.title} للمقارنة`); }
    else setNotice('يمكنك مقارنة ثلاثة نماذج. أزل أحدها لإضافة نموذج آخر.');
  };

  return (
    <section id="unit-models" className="uc-catalog sf-section" aria-labelledby="uc-title">
      <div className="container-custom">
        <div className="sf-section-label"><span>مجموعة صفوة / نماذج السكن</span><span lang="en" dir="ltr">THE RESIDENCE COLLECTION</span></div>
        <div className="uc-heading">
          <div><span className="sf-kicker"><span className="uc-tiny-square" aria-hidden="true" /> كل تفصيل، أقرب لاختيارك.</span><h2 id="uc-title">مساحتك القادمة.<br /><em>تأمّلها على مهل.</em></h2></div>
          <div className="uc-heading__aside"><p>تصفّح المخططات، احتفظ بما يعجبك،<br />وقارن التفاصيل التي تصنع فرقًا.</p><span><LayoutGrid size={14} aria-hidden="true" />{loading ? 'جارٍ تحميل المجموعة' : `${formatNumber(units.length)} نموذجًا للاكتشاف`}</span></div>
        </div>

        <div className="uc-toolbar">
          <label className="uc-search"><Search size={19} aria-hidden="true" /><span className="sr-only">ابحث في نماذج الوحدات</span><input type="search" placeholder="اسم النموذج، الحي، أو المساحة…" value={filters.search} onChange={event => updateFilter('search', event.target.value)} />{filters.search && <button type="button" aria-label="مسح البحث" onClick={() => updateFilter('search', '')}><X size={17} /></button>}</label>
          <label className="uc-select"><span>المشروع</span><select value={filters.project} onChange={event => updateFilter('project', event.target.value)}><option value="all">جميع المشاريع</option>{projects.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
          <label className="uc-select"><span>الترتيب</span><select value={filters.sort} onChange={event => updateFilter('sort', event.target.value)}><option value="latest">الأحدث أولًا</option><option value="area-asc">المساحة: من الأصغر</option><option value="area-desc">المساحة: من الأكبر</option><option value="price-asc">السعر: من الأقل</option><option value="price-desc">السعر: من الأعلى</option></select></label>
        </div>
        <div className="uc-filter-row">
          <div className="uc-kinds" role="group" aria-label="نوع الوحدة"><button aria-pressed={filters.kind === 'all'} onClick={() => updateFilter('kind', 'all')}>كل المساحات</button>{kinds.map(kind => <button key={kind} aria-pressed={filters.kind === kind} onClick={() => updateFilter('kind', kind)}>{kindLabels[kind]}</button>)}</div>
          <div className="uc-filter-options"><label><input type="checkbox" checked={filters.available} onChange={event => updateFilter('available', event.target.checked)} />المتاح فقط</label><button className="uc-favorites-filter" aria-pressed={filters.favoritesOnly} onClick={() => updateFilter('favoritesOnly', !filters.favoritesOnly)}><Heart size={15} fill={filters.favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" />المفضلة <span>{formatNumber(favoriteCount)}</span></button></div>
        </div>
        <div className="uc-results-line"><span role="status">{loading ? 'نجهّز لك التفاصيل…' : `${formatNumber(filtered.length)} نموذجًا${hasFilters ? ' يطابق اختيارك' : ' في المجموعة'}`}</span>{hasFilters ? <button onClick={reset}>مسح الفلاتر <X size={13} aria-hidden="true" /></button> : <span className="uc-results-hint"><Scale size={14} aria-hidden="true" /> أضف حتى ٣ نماذج للمقارنة</span>}</div>
        <p className="uc-session-notice" role="status">{notice}</p>{recentUnits.length > 0 && <div className="uc-recent"><span><Clock size={14} aria-hidden="true" /> شاهدتها مؤخرًا <small>على هذا المتصفح</small></span><div>{recentUnits.map(unit => <button key={unit.id} onClick={() => openUnit(unit)}>{unit.title}<ArrowUpLeft size={12} aria-hidden="true" /></button>)}</div><button aria-label="مسح سجل المشاهدات على هذا المتصفح" onClick={() => { setRecentIds([]); setNotice("مُسح سجل المشاهدات من هذا المتصفح"); }}><X size={15} /></button></div>}

        {loading ? <div className="uc-grid" aria-busy="true" aria-label="تحميل النماذج">{[0, 1, 2].map(index => <div className="uc-skeleton" key={index}><div /><span /><span /></div>)}</div> : error ? <div className="uc-empty" role="alert"><Building2 size={36} strokeWidth={1} /><h3>تعذّر تحميل المجموعة</h3><p>أعد المحاولة للاطّلاع على النماذج وبياناتها.</p><button className="uc-button" onClick={() => setAttempt(value => value + 1)}>إعادة المحاولة <ArrowLeft size={17} /></button></div> : filtered.length === 0 ? <div className="uc-empty"><SlidersHorizontal size={36} strokeWidth={1} /><h3>{filters.favoritesOnly ? 'امنح اختياراتك مكانًا هنا.' : 'نوسّع دائرة الاختيار؟'}</h3><p>{filters.favoritesOnly ? 'اضغط القلب على أي نموذج لحفظه، أو غيّر الفلاتر لرؤية اختياراتك.' : 'جرّب مشروعًا آخر أو عدّل البحث لتكتشف المزيد.'}</p><button className="uc-button" onClick={reset}>استعرض كل النماذج <ArrowLeft size={17} /></button></div> : <>
          <div className="uc-grid">{filtered.slice(0, visibleCount).map((unit, index) => <UnitCard key={unit.id} unit={unit} index={index} favorite={favorites.includes(unit.id)} compared={comparison.includes(unit.id)} comparisonFull={comparison.length >= 3} onFavorite={() => toggleFavorite(unit)} onCompare={() => toggleComparison(unit)} onDetails={() => openUnit(unit)} />)}</div>
          <div className="uc-grid-footer"><span>عرض {formatNumber(Math.min(visibleCount, filtered.length))} من {formatNumber(filtered.length)} نموذجًا</span>{visibleCount < filtered.length && <button className="uc-load-more" onClick={() => setVisibleCount(value => value + 6)}>اكتشف المزيد من المساحات <ArrowDown size={17} aria-hidden="true" /></button>}<a href="#contact">نساعدك في الاختيار <ArrowUpLeft size={17} aria-hidden="true" /></a></div>
        </>}
        <details className="uc-help"><summary>قبل ما تختار <span>٣ إجابات سريعة</span><ChevronDown size={16} aria-hidden="true" /></summary><div><h3>كيف أرتّب معاينة؟</h3><p>افتح تفاصيل النموذج واختر «طلب معاينة»، ثم حدّد اليوم والفترة المفضّلة. يراجع الفريق طلبك ويؤكد الموعد معك.</p><h3>هل السعر والتوفر نهائيان؟</h3><p>نعرض البيانات المسجّلة للنموذج؛ يؤكد فريقنا السعر والتوفر والمواصفات عند التواصل.</p><h3>هل أحتاج حسابًا لحفظ اختياراتي؟</h3><p>لا. المفضلة وآخر المشاهدات تُحفظ في هذا المتصفح. ولعرض اختياراتك على جهاز آخر، شارك رابط النموذج أو المقارنة.</p></div></details>
        <p className="uc-data-note">المساحات والأسعار والتوفر بحسب البيانات المسجّلة. يؤكد فريقنا التفاصيل النهائية عند التواصل.</p>
      </div>

      {compared.length > 0 && <div className="uc-compare-dock"><div className="uc-compare-dock__intro"><Scale size={22} aria-hidden="true" /><span>اختياراتك أقرب<small>{formatNumber(compared.length)} من ٣ نماذج للمقارنة</small></span></div><div className="uc-compare-dock__items">{compared.map(unit => <button key={unit.id} onClick={() => toggleComparison(unit)} aria-label={`إزالة ${unit.title} من المقارنة`}><span>{unit.title}</span><X size={13} aria-hidden="true" /></button>)}</div><button className="uc-button" disabled={compared.length < 2} onClick={() => setModal({ type: 'compare' })}>قارن الآن <ArrowLeft size={17} aria-hidden="true" /></button><button className="uc-compare-dock__clear" aria-label="مسح المقارنة" onClick={() => { setComparison([]); setNotice('مُسحت المقارنة'); }}><X size={18} /></button></div>}

      {modal?.type === 'details' && <CatalogDialog title={modal.unit.title} onClose={closeModal} className="uc-detail-dialog"><UnitDetails unit={modal.unit} favorite={favorites.includes(modal.unit.id)} onFavorite={() => toggleFavorite(modal.unit)} /></CatalogDialog>}
      {modal?.type === 'compare' && <CatalogDialog title="التفاصيل جنبًا إلى جنب" onClose={closeModal} className="uc-comparison-dialog"><div className="uc-comparison-heading"><span className="sf-kicker">اختيار أوضح، بكل التفاصيل.</span><h2>التفاصيل جنبًا إلى جنب</h2><p>قارن ما يهمك، ثم تواصل لترتيب معاينة.</p><ShareSelection ids={compared.map(unit => unit.id)} comparison /></div><div className="uc-comparison-scroll"><table><caption className="sr-only">مقارنة النماذج السكنية المختارة</caption><thead><tr><th scope="col">التفاصيل</th>{compared.map(unit => <th scope="col" key={unit.id}><UnitImage unit={unit} /><strong>{unit.title}</strong><small>{unit.projectName}</small></th>)}</tr></thead><tbody>{[
        ['النوع', unit => unit.type], ['المساحة', areaLabel], ['السعر', priceLabel], ['الحالة', unit => statusLabels[unit.status] || 'عند التواصل'], ['الموقع', unit => unit.location || 'غير محدد'], ['العدد المسجّل', unit => unit.count === null ? 'غير محدد' : formatNumber(unit.count)], ['التفاصيل', unit => unit.details || 'تتوفر عند التواصل'],
      ].map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{compared.map(unit => <td key={unit.id}>{value(unit)}</td>)}</tr>)}<tr><th scope="row">الخطوة التالية</th>{compared.map(unit => <td key={unit.id}><a className="uc-text-link" href={unitContactUrl(unit)} target="_blank" rel="noopener noreferrer">استفسر عن النموذج <ArrowUpLeft size={15} aria-hidden="true" /></a></td>)}</tr></tbody></table></div></CatalogDialog>}
    </section>
  );
}

function UnitImage({ unit }) {
  const [failed, setFailed] = useState(false);
  return unit.image && !failed ? <img src={unit.image} alt={`مخطط أو صورة ${unit.title}`} loading="lazy" onError={() => setFailed(true)} /> : <div className="uc-image-placeholder"><Building2 size={38} strokeWidth={1} aria-hidden="true" /><span>صور النموذج عند التواصل</span></div>;
}

function UnitCard({ unit, index, favorite, compared, comparisonFull, onFavorite, onCompare, onDetails }) {
  return <article className={`uc-card ${compared ? 'is-compared' : ''}`}>
    <div className="uc-card__image"><button className="uc-card__open" onClick={onDetails} aria-label={`عرض تفاصيل ${unit.title}`}><UnitImage unit={unit} /><span className="uc-card__explore">تأمّل التفاصيل <ArrowUpLeft size={16} aria-hidden="true" /></span></button><span className={`uc-status uc-status--${unit.status === 'available' ? 'available' : 'neutral'}`}><i aria-hidden="true" />{statusLabels[unit.status] || 'التوفر عند التواصل'}</span><button className="uc-heart" aria-label={`${favorite ? 'إزالة' : 'حفظ'} ${unit.title} ${favorite ? 'من' : 'في'} المفضلة`} aria-pressed={favorite} onClick={onFavorite}><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></button><span className="uc-card__index" aria-hidden="true">{String(index + 1).padStart(2, '0')} / {unit.type}</span></div>
    <div className="uc-card__content"><span className="uc-card__project">{unit.projectName}</span><h3><button onClick={onDetails}>{unit.title}</button></h3><div className="uc-card__facts"><span><Maximize2 size={14} aria-hidden="true" />{areaLabel(unit)}</span><span>{unit.type}</span></div><div className="uc-card__price"><strong>{unit.price ? formatNumber(unit.price) : 'لنتحدث عن التفاصيل'}</strong><span>{unit.price ? 'ريال سعودي' : 'السعر عند التواصل'}</span></div><div className="uc-card__bottom"><label title={comparisonFull && !compared ? 'أزل نموذجًا من المقارنة لإضافة هذا النموذج' : ''}><input type="checkbox" checked={compared} disabled={comparisonFull && !compared} onChange={onCompare} /><span>{compared ? 'ضمن المقارنة' : 'أضف للمقارنة'}</span></label><button onClick={onDetails}>التفاصيل <ArrowUpLeft size={18} aria-hidden="true" /></button></div></div>
  </article>;
}

export function CatalogDialog({ title, onClose, className, children }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={dialogRef} className={`uc-dialog ${className}`} aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}><button className="uc-dialog__close" aria-label="إغلاق النافذة" onClick={onClose} autoFocus><X size={21} /></button>{children}</dialog>;
}

function ShareSelection({ ids, comparison = false }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const inputRef = useRef(null);
  const reveal = () => { setUrl(unitShareUrl(window.location.origin, ids, comparison)); setCopied(false); setCopyError(false); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); inputRef.current?.focus(); inputRef.current?.select(); }
  };
  return <div className="uc-share"><button type="button" className="uc-share__toggle" onClick={reveal}><Share2 size={15} aria-hidden="true" />{comparison ? 'مشاركة المقارنة' : 'مشاركة النموذج'}</button>{url && <div className="uc-share__link"><label><span className="sr-only">رابط {comparison ? 'المقارنة' : 'النموذج'}</span><input ref={inputRef} type="text" readOnly value={url} dir="ltr" onFocus={event => event.target.select()} /></label><button type="button" onClick={copy}>{copied ? 'نُسخ الرابط' : 'نسخ'}</button><small role="status">{copyError ? 'حدّد الرابط وانسخه يدويًا من الحقل.' : copied ? 'جاهز للمشاركة مع من تحب.' : 'يفتح الرابط نفس الاختيار، دون الحاجة لحساب.'}</small></div>}</div>;
}

function ViewingRequest({ unit }) {
  const [date, setDate] = useState('');
  const [period, setPeriod] = useState('صباحًا (9 – 12)');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const today = saudiToday();
  const prepare = event => {
    event.preventDefault();
    const requestedDate = String(new FormData(event.currentTarget).get('preferredDate') || '');
    if (!requestedDate || requestedDate < saudiToday()) { setError('اختر اليوم أو تاريخًا قادمًا.'); setReady(false); return; }
    setDate(requestedDate);
    setError(''); setReady(true);
  };
  return <details className="uc-viewing"><summary><Calendar size={17} aria-hidden="true" />طلب معاينة <ChevronDown size={16} aria-hidden="true" /></summary><form onSubmit={prepare}><p>اختر ما يناسبك، ويؤكد فريقنا الموعد معك.</p><div><label htmlFor="uc-view-date">اليوم المفضّل<input id="uc-view-date" name="preferredDate" type="date" required min={today} value={date} onChange={event => { setDate(event.target.value); setReady(false); setError(''); }} /></label><label htmlFor="uc-view-period">الفترة المفضّلة<select id="uc-view-period" value={period} onChange={event => { setPeriod(event.target.value); setReady(false); }}><option>صباحًا (9 – 12)</option><option>ظهرًا (12 – 5)</option><option>مساءً (5 – 10)</option></select></label></div>{error && <p className="uc-viewing__error" role="alert">{error}</p>}{ready ? <div className="uc-viewing__ready"><span role="status">طلبك جاهز: {date} · {period}</span><a href={viewingRequestUrl(unit, date, period)} className="uc-button" target="_blank" rel="noopener noreferrer">افتح طلب المعاينة في واتساب <ArrowUpLeft size={16} aria-hidden="true" /></a><small>هذا طلب لموعد مفضّل، وليس حجزًا مؤكدًا. تُرسل الرسالة بنفسك من واتساب.</small></div> : <button type="submit" className="uc-button">جهّز طلب المعاينة <ArrowLeft size={16} aria-hidden="true" /></button>}</form></details>;
}

export function UnitDetails({ unit, favorite, onFavorite }) {
  const [zoomed, setZoomed] = useState(false);
  const mapUrl = projectMapUrl(unit.locationLink, unit.location);
  return <div className={`uc-detail ${zoomed ? 'is-zoomed' : ''}`}>
    <div className="uc-detail__visual"><span className="uc-detail__image-label">المساحة، من منظور أقرب.</span><div className="uc-detail__image-scroll"><UnitImage unit={unit} /></div>{unit.image && <button className="uc-detail__zoom" onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}><Maximize2 size={16} aria-hidden="true" />{zoomed ? 'العودة للحجم الكامل' : 'تكبير المخطط'}</button>}</div>
    <div className="uc-detail__body">
      <span className="sf-kicker">{unit.projectName} / {unit.type}</span><h2>{unit.title}</h2><span className={`uc-status uc-status--${unit.status === 'available' ? 'available' : 'neutral'}`}><i aria-hidden="true" />{statusLabels[unit.status] || 'التوفر عند التواصل'}</span>
      <dl className="uc-detail__facts"><div><dt>المساحة</dt><dd>{areaLabel(unit)}</dd></div><div><dt>السعر المسجّل</dt><dd>{priceLabel(unit)}</dd></div>{unit.count !== null && <div><dt>العدد المسجّل للنموذج</dt><dd>{formatNumber(unit.count)}</dd></div>}<div><dt>نوع السكن</dt><dd>{unit.type}</dd></div></dl>
      <h3>عن هذه المساحة</h3><p className="uc-detail__description">{unit.details || 'تواصل مع فريقنا لمعرفة مواصفات هذا النموذج وتفاصيله.'}</p>
      {unit.location && <p className="uc-detail__location"><MapPin size={16} aria-hidden="true" />{unit.location}</p>}
      <div className="uc-detail__links">{mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer">موقع المشروع <ArrowUpLeft size={15} /></a>}{unit.projectId && <Link href={`/projects/${unit.projectId}`}>صفحة المشروع <ArrowUpLeft size={15} /></Link>}</div>
      <ShareSelection ids={[unit.id]} />
      {unit.location && <details className="uc-nearby"><summary>استكشف الحي في الخرائط <ChevronDown size={14} aria-hidden="true" /></summary><p>ابحث عن الخدمات حول {unit.location} عبر خرائط Google.</p><div>{['مدارس', 'حدائق', 'خدمات صحية'].map(category => <a key={category} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${category} بالقرب من ${unit.location}`)}`} target="_blank" rel="noopener noreferrer">{category}<ArrowUpLeft size={12} aria-hidden="true" /></a>)}</div></details>}
      {unit.status === 'available' && <ViewingRequest unit={unit} />}
      <div className="uc-detail__actions"><a className="uc-button" href={unitContactUrl(unit)} target="_blank" rel="noopener noreferrer">استفسر عن النموذج <ArrowUpLeft size={18} aria-hidden="true" /></a><button className="uc-detail__save" aria-pressed={favorite} onClick={onFavorite}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />{favorite ? 'محفوظ في المفضلة' : 'احفظ لاختيار لاحق'}</button></div><p className="uc-detail__note">تُؤكد الأسعار والتوفر وتفاصيل المعاينة مع فريقنا.</p>
    </div>
  </div>;
}
