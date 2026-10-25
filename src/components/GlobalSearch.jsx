'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpLeft, Building2, Home, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { formatNumber, kindLabels } from '@/lib/unitCatalog.mjs';
import { unitKind } from '@/lib/projectDiscovery.mjs';
import NavigationDialog from './NavigationDialog';

export default function GlobalSearch({ isOpen, onClose }) {
  return isOpen ? <SearchPanel onClose={onClose} /> : null;
}

function SearchPanel({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ projects: [], units: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  // PostgREST filter punctuation is removed before composing the OR expression.
  const term = query.replace(/[,().%_*\\"']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
  useEffect(() => {
    if (!term) { setLoading(false); setError(false); setResults({ projects: [], units: [] }); return; }
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setResults({ projects: [], units: [] });
    const timer = setTimeout(async () => {
      try {
        const [projects, units] = await Promise.all([
          supabase.from('projects').select('id, name, location, main_image').or(`name.ilike.%${term}%,location.ilike.%${term}%`).limit(6).abortSignal(controller.signal),
          supabase.from('units').select('id, unit_number, type, project_id, size, projects(name)').or(`unit_number.ilike.%${term}%,type.ilike.%${term}%,model_details.ilike.%${term}%`).limit(6).abortSignal(controller.signal),
        ]);
        if (projects.error || units.error) throw new Error('Search unavailable');
        if (active) setResults({ projects: projects.data || [], units: units.data || [] });
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    }, 300);
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [term, retry]);

  return <NavigationDialog title="البحث في صفوة عنان" className="sn-search-dialog" onClose={onClose} inputFocus>
    <div className="sn-search__intro"><span lang="en" dir="ltr">YOUR NEXT ADDRESS</span><h2>عمّ تبحث اليوم؟</h2><p>ابحث باسم المشروع، الحي، أو نموذج الوحدة.</p></div>
    <label className="sn-search__input"><Search size={23} strokeWidth={1.4} aria-hidden="true" /><span className="sr-only">البحث في صفوة عنان</span><input autoFocus type="search" maxLength={100} value={query} onChange={event => setQuery(event.target.value)} placeholder="ابدأ باسم أو كلمة…" /></label>
    <div className="sn-search__results" aria-live="polite" aria-busy={loading}>
      {!term ? <div className="sn-search__suggestions"><span>أو ابدأ من هنا</span><Link href="/#projects" onClick={onClose}><Building2 size={19} strokeWidth={1.4} aria-hidden="true" />استكشف المشاريع<ArrowUpLeft size={17} aria-hidden="true" /></Link><Link href="/#unit-models" onClick={onClose}><Home size={19} strokeWidth={1.4} aria-hidden="true" />تصفّح نماذج الوحدات<ArrowUpLeft size={17} aria-hidden="true" /></Link></div> : loading ? <p className="sn-search__status" role="status">نبحث لك عن التفاصيل…</p> : error ? <div className="sn-search__status"><p>تعذّر البحث حاليًا.</p><button onClick={() => setRetry(value => value + 1)}>حاول مرة أخرى</button></div> : results.projects.length + results.units.length === 0 ? <p className="sn-search__status">لم نجد نتائج لـ «{query}». جرّب اسم مشروع أو حي آخر.</p> : <>
      {results.projects.length > 0 && <div className="sn-search__group"><h3>المشاريع <span>{formatNumber(results.projects.length)}</span></h3>{results.projects.map(project => <Link key={project.id} href={`/projects/${project.id}`} onClick={onClose}><Building2 size={21} strokeWidth={1.2} aria-hidden="true" /><span><strong>{project.name || 'مشروع سكني'}</strong><small><MapPin size={11} aria-hidden="true" />{project.location || 'تفاصيل الموقع داخل المشروع'}</small></span><ArrowUpLeft size={17} aria-hidden="true" /></Link>)}</div>}
      {results.units.length > 0 && <div className="sn-search__group"><h3>نماذج الوحدات <span>{formatNumber(results.units.length)}</span></h3>{results.units.map(unit => <Link key={unit.id} href={unit.project_id ? `/projects/${unit.project_id}` : '/#unit-models'} onClick={onClose}><Home size={21} strokeWidth={1.2} aria-hidden="true" /><span><strong>{unit.unit_number || kindLabels[unitKind(unit.type)]}</strong><small>{(Array.isArray(unit.projects) ? unit.projects[0]?.name : unit.projects?.name) || 'نموذج سكني'}{Number(unit.size) > 0 ? ` · ${formatNumber(unit.size)} م²` : ''}</small></span><ArrowUpLeft size={17} aria-hidden="true" /></Link>)}</div>}
    </>}
    </div><div className="sn-search__foot"><span>تفاصيل أقرب. اختيار أوضح.</span><span><kbd>Esc</kbd> للإغلاق</span></div>
  </NavigationDialog>;
}
