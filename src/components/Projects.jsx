'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpLeft, Compass, MapPin, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { discoverProjects, unitKind } from '@/lib/projectDiscovery.mjs';

const kinds = [
  { id: 'all', label: 'كل المساحات' },
  { id: 'apartment', label: 'شقق' },
  { id: 'villa', label: 'فلل' },
  { id: 'townhouse', label: 'تاون هاوس' },
  { id: 'other', label: 'خيارات أخرى' },
];
const statusLabels = { completed: 'مكتمل', ongoing: 'قيد الإنشاء', upcoming: 'قريبًا' };
const number = value => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(value);

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [kind, setKind] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const [projectResult, unitResult] = await Promise.all([
          supabase.from('projects').select('id, name, location, status, main_image, description').order('created_at', { ascending: false }),
          supabase.from('units').select('id, project_id, type, size, status'),
        ]);
        if (projectResult.error || unitResult.error) throw new Error('Unable to load discovery data');
        if (active) {
          setProjects(projectResult.data || []);
          setUnits(unitResult.data || []);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [attempt]);

  const results = discoverProjects(projects, units, kind, availableOnly);
  const current = results.find(project => project.id === selectedId) || results[0];
  const currentIndex = current ? results.findIndex(project => project.id === current.id) : 0;
  const availableKinds = new Set(units.map(unit => unitKind(unit.type)));
  const selectKind = value => { setKind(value); setSelectedId(null); };
  const changeProject = direction => setSelectedId(results[(currentIndex + direction + results.length) % results.length].id);
  const reset = () => { setKind('all'); setAvailableOnly(false); setSelectedId(null); };
  const areaText = current?.minArea === null || !current ? 'تواصل لمعرفة المساحات' :
    current.minArea === current.maxArea ? `${number(current.minArea)} م²` : `${number(current.minArea)} – ${number(current.maxArea)} م²`;

  return (
    <section id="projects" className="sf-discovery sf-section" data-theme="dark" aria-labelledby="sf-discovery-title">
      <div className="container-custom">
        <div className="sf-section-label"><span>02 / بوصلة صفوة</span><span lang="en" dir="ltr">FIND YOUR PLACE</span></div>
        <div className="sf-discovery__heading">
          <div><span className="sf-kicker"><Compass size={16} aria-hidden="true" /> اختياراتك تقود الطريق</span><h2 id="sf-discovery-title">ما شكل <em>حياتك القادمة؟</em></h2></div>
          <p>ابدأ بالمساحة التي تناسبك.<br />ودع بوصلة صفوة تقرّب لك الاختيار.</p>
        </div>

        <div className="sf-discovery__controls">
          <div className="sf-kind-options" role="group" aria-label="نوع السكن">
            {kinds.filter(item => item.id === 'all' || availableKinds.has(item.id)).map(item => (
              <button key={item.id} aria-pressed={kind === item.id} onClick={() => selectKind(item.id)}>{item.label}</button>
            ))}
          </div>
          <label className="sf-availability"><input type="checkbox" checked={availableOnly} onChange={event => { setAvailableOnly(event.target.checked); setSelectedId(null); }} /><span>نماذج متاحة فقط</span><SlidersHorizontal size={15} aria-hidden="true" /></label>
        </div>

        {loading ? <div className="sf-discovery__empty" role="status"><Compass size={34} aria-hidden="true" /><p>نرتّب لك وجهاتك القادمة…</p></div> : error ?
          <div className="sf-discovery__empty" role="alert"><p>تعذّر تحميل المشاريع حاليًا.</p><button className="sf-text-link" onClick={() => setAttempt(value => value + 1)}>حاول مرة أخرى <ArrowLeft size={18} /></button></div> : !current ?
          <div className="sf-discovery__empty"><p>لا توجد مشاريع تطابق هذا الاختيار حاليًا.</p><button className="sf-text-link" onClick={reset}>استعرض كل المشاريع <ArrowLeft size={18} /></button></div> : (
          <div className="sf-discovery__workspace">
            <div className="sf-project-menu">
              <p className="sf-project-menu__count" role="status">{number(results.length)} وجهات للاكتشاف <span>اختر مشروعًا</span></p>
              <div className="sf-project-menu__list" role="group" aria-label="اختيار المشروع">
                {results.map((project, index) => (
                  <button key={project.id} onClick={() => setSelectedId(project.id)} aria-pressed={current.id === project.id}>
                    <span className="sf-project-menu__number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="sf-project-menu__copy"><strong>{project.name || 'مشروع سكني'}</strong><small>{project.location || 'تفاصيل الموقع قريبًا'}</small></span>
                    <ArrowUpLeft size={20} aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="sf-project-menu__foot"><span>خياراتك، بمنظور أوضح.</span><Compass size={36} strokeWidth={1} aria-hidden="true" /></div>
            </div>

            <div className="sf-project-showcase">
              <div className="sf-project-showcase__image" key={current.id}>
                {current.main_image && !failedImages[current.id] ? <img src={current.main_image} alt={current.name || 'صورة المشروع'} loading="lazy" onError={() => setFailedImages(previous => ({ ...previous, [current.id]: true }))} /> : <div className="sf-project-showcase__placeholder"><Compass size={52} strokeWidth={1} /><span>صور المشروع قريبًا</span></div>}
                <div className="sf-project-showcase__overlay" aria-hidden="true" />
                <span className="sf-project-status">{statusLabels[current.status] || 'اكتشف المشروع'}</span>
                <div className="sf-project-showcase__identity"><span><MapPin size={14} aria-hidden="true" />{current.location || 'الموقع عند التواصل'}</span><h3>{current.name || 'مشروع سكني'}</h3></div>
                {results.length > 1 && <div className="sf-project-showcase__arrows"><button aria-label="المشروع السابق" onClick={() => changeProject(-1)}><ArrowRight size={20} /></button><button aria-label="المشروع التالي" onClick={() => changeProject(1)}><ArrowLeft size={20} /></button></div>}
              </div>
              <div className="sf-project-facts" aria-live="polite" aria-atomic="true">
                <div><span>المساحات المسجّلة</span><strong dir="auto">{areaText}</strong></div>
                <div><span>النماذج المتاحة</span><strong>{number(current.availableModels)} <small>من {number(current.models.length)} نموذج</small></strong></div>
                <Link href={`/projects/${current.id}`} className="sf-project-detail">اكتشف المشروع <ArrowUpLeft size={20} aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        )}
        <div className="sf-discovery__footer"><span>المساحات والأعداد بحسب النماذج المسجّلة، ويؤكد فريقنا التوفر عند التواصل.</span><a href="#unit-models">تفضّل المقارنة بالتفصيل؟ استعرض النماذج <ArrowDownLeft size={17} aria-hidden="true" /></a></div>
      </div>
    </section>
  );
}
