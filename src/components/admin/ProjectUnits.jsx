'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Pencil, Trash2, Save, Upload, LayoutGrid, Search, Loader2, ArrowRight, Check, Image as ImageIcon } from 'lucide-react';
import './ProjectUnits.css';

const empty = { unit_number: '', type: 'Apartment', size: '', price: '', status: 'available', section_id: '', main_image: '', model_details: '', model_count: '' };
const types = { Apartment: 'شقة', Villa: 'فيلا', Office: 'مكتب', Shop: 'محل تجاري' };
const statuses = { available: 'متاح', reserved: 'محجوز', sold: 'مباع' };
const number = value => new Intl.NumberFormat('ar-SA').format(value);
export default function ProjectUnits({ projectId, onEditingChange }) {
  const [units, setUnits] = useState([]), [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null), [data, setData] = useState(empty), [baseline, setBaseline] = useState(empty);
  const [stage, setStage] = useState(0), [query, setQuery] = useState(''), [filter, setFilter] = useState('all');
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [loadError, setLoadError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const pending = useRef(false), input = useRef(null);
  const dirty = JSON.stringify(data) !== JSON.stringify(baseline);
  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true); setLoadError('');
    try {
      const [s, u] = await Promise.all([supabase.from('project_sections').select('id,name').eq('project_id', projectId), supabase.from('units').select('*').eq('project_id', projectId).order('created_at')]);
      if (s.error || u.error) throw s.error || u.error;
      setSections(s.data || []); setUnits(u.data || []);
    } catch { setLoadError('تعذّر تحميل النماذج. تحقق من الاتصال ثم أعد المحاولة.'); }
    finally { setLoading(false); }
  }, [projectId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { onEditingChange?.(!!editing); return () => onEditingChange?.(false); }, [editing, onEditingChange]);
  useEffect(() => {
    const guard = e => { if (editing && dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [editing, dirty]);
  const update = (key, value) => { setData(old => ({ ...old, [key]: value })); setError(''); };
  const open = unit => {
    const next = Object.fromEntries(Object.keys(empty).map(key => [key, unit?.[key] ?? empty[key]]));
    setData(next); setBaseline(next); setEditing(unit?.id || 'new'); setStage(0); setError(''); setNotice('');
  };
  const close = () => {
    if (busy || uploading || (dirty && !confirm('لديك تعديلات لم تُحفظ. هل تريد مغادرة النموذج؟'))) return;
    setEditing(null); setError('');
  };
  const validate = () => {
    if (!data.unit_number.trim()) { setStage(0); setError('اكتب اسمًا للنموذج، مثل «نموذج أ».'); return false; }
    for (const [key, label] of [['size','المساحة'], ['price','السعر'], ['model_count','عدد الوحدات']]) {
      if (data[key] !== '' && (!Number.isFinite(Number(data[key])) || Number(data[key]) < 0 || (key === 'model_count' && !Number.isInteger(Number(data[key]))))) {
        setStage(0); setError(`أدخل ${label} بقيمة صحيحة لا تقل عن صفر.`); return false;
      }
    }
    return true;
  };
  const save = async (another = false) => {
    if (pending.current || uploading || !validate()) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const payload = { ...data, unit_number: data.unit_number.trim(), project_id: projectId, section_id: data.section_id || null, size: data.size === '' ? null : Number(data.size), price: data.price === '' ? null : Number(data.price), model_count: data.model_count === '' ? null : Number(data.model_count) };
      const request = editing === 'new' ? supabase.from('units').insert(payload) : supabase.from('units').update(payload).eq('id', editing).eq('project_id', projectId);
      const { data: saved, error: failure } = await request.select('*').single();
      if (failure || !saved) throw failure || new Error();
      setUnits(old => editing === 'new' ? [...old, saved] : old.map(item => item.id === saved.id ? saved : item));
      if (another) { setData({ ...empty, section_id: data.section_id }); setBaseline({ ...empty, section_id: data.section_id }); setEditing('new'); setStage(0); }
      else setEditing(null);
      setNotice('تم حفظ النموذج بنجاح.');
    } catch { setError('لم يتم حفظ النموذج. تحقق من الاتصال والصلاحيات ثم حاول مجددًا. بياناتك ما زالت موجودة.'); }
    finally { pending.current = false; setBusy(false); }
  };
  const upload = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = '';
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { setError('اختر صورة JPG أو PNG أو WebP لا تتجاوز 10 ميجابايت.'); return; }
    setUploading(true); setError('');
    try {
      const path = `units/${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`;
      const { error: failure } = await supabase.storage.from('files').upload(path, file);
      if (failure) throw failure;
      update('main_image', supabase.storage.from('files').getPublicUrl(path).data.publicUrl);
    } catch { setError('تعذّر رفع الصورة. جرّب مجددًا، ثم احفظ النموذج بعد اكتمال الرفع.'); }
    finally { setUploading(false); }
  };
  const remove = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const result = await supabase.from('units').delete().eq('id', deleting.id).eq('project_id', projectId).select('id').single();
      if (result.error || !result.data) throw result.error || new Error();
      setUnits(old => old.filter(u => u.id !== deleting.id)); setDeleting(null); setNotice('تم حذف النموذج.');
    } catch { setError('تعذّر حذف النموذج. أعد المحاولة.'); }
    finally { pending.current = false; setBusy(false); }
  };
  const field = (key, label, hint, numeric = false) => <label className="um-field" htmlFor={`um-${key}`}><span>{label}</span>{hint && <small>{hint}</small>}<input id={`um-${key}`} value={data[key]} onChange={e => update(key, e.target.value)} type={numeric ? 'number' : 'text'} min={numeric ? 0 : undefined} step={key === 'model_count' ? 1 : numeric ? 'any' : undefined} placeholder={key === 'unit_number' ? 'مثال: نموذج أ — ثلاث غرف' : key === 'size' ? '180' : key === 'price' ? '850000' : '12'} /></label>;
  const visible = units.filter(u => (filter === 'all' || u.status === filter) && `${u.unit_number} ${types[u.type] || u.type}`.toLowerCase().includes(query.toLowerCase().trim()));
  const preview = <article className="um-preview"><div className="um-preview-image">{data.main_image ? <img src={data.main_image} alt="مخطط النموذج" /> : <><LayoutGrid size={48}/><span>مخطط النموذج يظهر هنا</span></>}</div><div className="um-preview-body"><span className={`um-status ${data.status}`}>{statuses[data.status]}</span><small>{types[data.type]} · {sections.find(s => s.id === data.section_id)?.name || 'بدون قسم'}</small><h3>{data.unit_number || 'اسم النموذج'}</h3><div className="um-facts"><span>المساحة<strong>{data.size !== '' ? `${number(data.size)} م²` : 'غير محددة'}</strong></span><span>السعر<strong>{data.price !== '' ? `${number(data.price)} ر.س` : 'غير محدد'}</strong></span><span>عدد الوحدات<strong>{data.model_count !== '' ? number(data.model_count) : 'غير محدد'}</strong></span></div><p>{data.model_details || 'أضف وصفًا يوضح توزيع الغرف ومميزات النموذج.'}</p></div></article>;
  return <section className="um" aria-label="إدارة نماذج الوحدات">
    <header className="um-heading"><div><span className="um-eyebrow">مساحة لكل احتمال</span><h2>{editing ? editing === 'new' ? 'أضف نموذجًا جديدًا.' : 'عدّل تفاصيل النموذج.' : 'نماذج وحداتك، بوضوح.'}</h2><p>{editing ? 'ثلاث خطوات بسيطة، من التفاصيل إلى المعاينة والحفظ.' : 'عرّف نماذج المشروع ومخططاتها وأسعارها في مكان واحد.'}</p></div>{editing ? <button type="button" onClick={close} disabled={busy || uploading}><ArrowRight size={16}/>العودة للنماذج</button> : <button className="um-primary" type="button" onClick={() => open(null)} disabled={loading || !!loadError}><Plus size={18}/>إضافة نموذج</button>}</header>
    {notice && <p role="status" className="um-notice"><Check size={17}/>{notice}</p>}
    {error && <p role="alert" className="um-error">{error}</p>}
    {editing ? <>
      <nav className="um-stages" aria-label="خطوات إضافة النموذج">{['بيانات النموذج','المخطط والتفاصيل','المراجعة والحفظ'].map((name,i) => <button key={name} type="button" aria-current={stage === i ? 'step' : undefined} disabled={busy || uploading} onClick={() => { if (i === 0 || validate()) setStage(i); }}><b>{i+1}</b><span>{name}</span></button>)}</nav>
      <div className="um-editor"><form onSubmit={e => { e.preventDefault(); if (stage < 2) { if (validate()) setStage(stage+1); } else save(); }} className="um-form"><fieldset disabled={busy || uploading}>
        {stage === 0 && <><div className="um-section-title"><span>01</span><div><h3>لنبدأ بالأساسيات</h3><p>اسم النموذج مطلوب. أضف باقي التفاصيل عند توفرها.</p></div></div>{field('unit_number','اسم النموذج *','اسم واضح يساعد العميل على تمييز هذا التصميم.')}<div className="um-two"><label className="um-field"><span>نوع الوحدة</span><select value={data.type} onChange={e => update('type',e.target.value)}>{Object.entries(types).map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select></label><label className="um-field"><span>القسم التابع له</span><select value={data.section_id} onChange={e => update('section_id',e.target.value)}><option value="">بدون قسم — اختياري</option>{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>{field('size','المساحة بالمتر المربع','المساحة الإجمالية للوحدة.',true)}{field('price','السعر بالريال السعودي','اتركه فارغًا إن لم يتحدد بعد.',true)}{field('model_count','عدد الوحدات من هذا النموذج','كم وحدة تتشارك نفس التصميم؟',true)}</div><div className="um-field"><span>حالة التوفر</span><div className="um-status-options" role="radiogroup" aria-label="حالة التوفر">{Object.entries(statuses).map(([v,t]) => <label key={v}><input type="radio" name="um-status" checked={data.status === v} onChange={() => update('status',v)}/><span>{t}</span></label>)}</div></div></>}
        {stage === 1 && <><div className="um-section-title"><span>02</span><div><h3>قرّب الصورة للعميل</h3><p>مخطط واضح ووصف مختصر يساعدان على فهم النموذج.</p></div></div><div className="um-upload">{data.main_image ? <img src={data.main_image} alt="معاينة المخطط المرفوع"/> : <Upload size={34}/>}<strong>{uploading ? 'جارٍ رفع المخطط…' : data.main_image ? 'المخطط جاهز' : 'أضف مخطط النموذج أو صورته'}</strong><p>JPG، PNG، WebP · حتى 10 ميجابايت</p><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} hidden/><button type="button" onClick={() => input.current?.click()}>{data.main_image ? 'اختيار صورة أخرى' : 'اختيار صورة من الجهاز'}</button>{data.main_image && <button type="button" onClick={() => update('main_image','')}>إزالة الصورة من النموذج</button>}</div><label className="um-field"><span>ما الذي يميز هذا النموذج؟</span><small>اذكر عدد الغرف ودورات المياه والمجلس والشرفة أو أي مميزات أخرى.</small><textarea rows={5} value={data.model_details} onChange={e => update('model_details',e.target.value)} placeholder="مثال: ثلاث غرف نوم، مجلس مستقل، صالة واسعة وشرفة…"/></label><p className="um-tip">الصورة والوصف اختياريان. يمكنك إضافتهما لاحقًا.</p></>}
        {stage === 2 && <><div className="um-section-title"><span>03</span><div><h3>كل شيء جاهز؟</h3><p>راجع البطاقة بجانبك، ثم احفظ النموذج لإظهاره ضمن المشروع.</p></div></div><div className="um-review">{[['اسم النموذج',data.unit_number],['نوع الوحدة',types[data.type]],['القسم',sections.find(s => s.id === data.section_id)?.name || 'بدون قسم'],['حالة التوفر',statuses[data.status]],['المخطط',data.main_image ? 'مرفوع' : 'لم يضف بعد']].map(([k,v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div><p className="um-tip">يمكنك الرجوع لأي خطوة لتعديل البيانات قبل الحفظ.</p></>}
      </fieldset><footer className="um-actions"><button type="button" disabled={busy || uploading} onClick={() => stage > 0 ? setStage(stage-1) : close()}>{stage ? 'السابق' : 'إلغاء'}</button>{stage === 2 && <button type="button" disabled={busy || uploading} onClick={() => save(true)}>حفظ وإضافة نموذج آخر</button>}<button className="um-primary" type="submit" disabled={busy || uploading}>{busy || uploading ? <Loader2 className="ad-spin" size={17}/> : stage === 2 ? <Save size={17}/> : null}{busy ? 'جارٍ الحفظ…' : uploading ? 'جارٍ الرفع…' : stage === 2 ? 'حفظ النموذج' : 'متابعة'}</button></footer></form><aside className="um-preview-wrap"><span className="um-eyebrow">معاينة بيانات النموذج</span>{preview}<p>تتحدث المعاينة أثناء الكتابة. لا تُنشر التعديلات إلا عند الحفظ.</p></aside></div>
    </> : <>
      <div className="um-summary"><div><LayoutGrid size={20}/><span>إجمالي النماذج<strong>{number(units.length)}</strong></span></div><div><span>نماذج متاحة<strong>{number(units.filter(u => u.status === 'available').length)}</strong></span></div><div><span>نماذج بمخططات<strong>{number(units.filter(u => u.main_image).length)}</strong></span></div></div>
      <div className="um-toolbar"><label><Search size={18}/><input aria-label="البحث في النماذج" value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث باسم النموذج…"/></label><select aria-label="تصفية حسب التوفر" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">كل الحالات</option>{Object.entries(statuses).map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select></div>
      {loadError ? <div className="um-empty" role="alert"><p>{loadError}</p><button type="button" onClick={load}>إعادة المحاولة</button></div> : loading ? <div className="um-empty" role="status"><Loader2 size={26} className="ad-spin"/>جارٍ تحميل النماذج…</div> : visible.length ? <div className="um-cards">{visible.map(u => <article key={u.id} className="um-card"><div className="um-card-image">{u.main_image ? <img src={u.main_image} alt={`مخطط ${u.unit_number}`}/> : <ImageIcon size={36}/>}<span className={`um-status ${u.status}`}>{statuses[u.status]}</span></div><div className="um-card-body"><small>{types[u.type] || u.type} · {sections.find(s => s.id === u.section_id)?.name || 'بدون قسم'}</small><h3>{u.unit_number}</h3><div className="um-card-facts"><span>{u.size != null ? `${number(u.size)} م²` : 'المساحة غير محددة'}</span><span>{u.price != null ? `${number(u.price)} ر.س` : 'السعر غير محدد'}</span></div><p>{u.model_details || 'لم تُضف تفاصيل لهذا النموذج بعد.'}</p></div><footer><button type="button" onClick={() => open(u)}><Pencil size={15}/>تعديل النموذج</button><button type="button" aria-label={`حذف ${u.unit_number}`} onClick={() => { setDeleting(u); setError(''); }}><Trash2 size={16}/></button></footer></article>)}</div> : <div className="um-empty"><LayoutGrid size={38}/><h3>{units.length ? 'لا توجد نتائج مطابقة' : 'أول نموذج، يبدأ من هنا.'}</h3><p>{units.length ? 'جرّب اسمًا آخر أو اعرض جميع الحالات.' : 'أضف تصميم الوحدة مرة واحدة، وحدّد عدد الوحدات التي تتبعه.'}</p><button type="button" className="um-primary" onClick={() => units.length ? (setQuery(''),setFilter('all')) : open(null)}>{units.length ? 'مسح البحث والتصفية' : 'إضافة أول نموذج'}</button></div>}
      {deleting && <div className="um-delete" role="alertdialog" aria-label="تأكيد حذف النموذج"><h3>حذف «{deleting.unit_number}»؟</h3><p>سيُحذف النموذج من المشروع. لا يمكن التراجع عن الحذف.</p><button type="button" disabled={busy} onClick={() => setDeleting(null)}>إلغاء</button><button type="button" disabled={busy} onClick={remove}>{busy ? 'جارٍ الحذف…' : 'تأكيد الحذف'}</button></div>}
    </>}
  </section>;
}
