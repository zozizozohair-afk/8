'use client';
import { useCallback, useEffect, useState } from 'react';
import { Phone, ArrowUpLeft, RefreshCw, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { formatNumber, normalizeSearch } from '@/lib/unitCatalog.mjs';
import { interestStatuses } from '@/lib/interestRequests.mjs';
import '../InterestRegistration.css';

const dateLabel = value => new Date(value).toLocaleString('ar-SA-u-ca-gregory', { timeZone: 'Asia/Riyadh', dateStyle: 'medium', timeStyle: 'short' });
export default function InterestRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data, error: fetchError } = await supabase.from('interest_requests').select('id, created_at, full_name, phone, interest, message, status, admin_notes, consented_at, consent_version').order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch { setError('تعذّر تحميل طلبات الاهتمام. تحقق من الاتصال ومن تنفيذ ملف تهيئة طلبات الاهتمام في Supabase.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const filtered = requests.filter(request => (status === 'all' || request.status === status) && (!query.trim() || normalizeSearch([request.full_name, request.phone, request.interest, request.message].join(' ')).includes(normalizeSearch(query))));
  return <section className="ir-admin" aria-labelledby="ir-admin-title"><div className="ir-admin-heading"><div><h2 id="ir-admin-title">طلبات الاهتمام</h2><p>بيانات العملاء الذين وافقوا على حفظ طلباتهم والتواصل معهم.</p></div><button onClick={load} disabled={loading}><RefreshCw size={16} aria-hidden="true" />تحديث الطلبات</button></div><div className="ir-admin-status-grid" role="group" aria-label="تصفية الطلبات بالحالة">{Object.entries(interestStatuses).map(([key, label]) => <button key={key} aria-pressed={status === key} onClick={() => setStatus(previous => previous === key ? 'all' : key)}>{label}<strong>{loading ? '—' : formatNumber(requests.filter(request => request.status === key).length)}</strong></button>)}</div><div className="ir-admin-filters"><label><Search size={17} aria-hidden="true" /><span className="sr-only">البحث في طلبات الاهتمام</span><input placeholder="الاسم، الجوال، أو الاهتمام…" value={query} onChange={event => setQuery(event.target.value)} /></label><label><span className="sr-only">حالة الطلب</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">كل الحالات ({requests.length})</option>{Object.entries(interestStatuses).map(([key, label]) => <option key={key} value={key}>{label} ({requests.filter(request => request.status === key).length})</option>)}</select></label></div>{error ? <p className="ir-admin-error" role="alert">{error}</p> : loading ? <p className="ir-admin-empty" role="status">جارٍ تحميل الطلبات…</p> : filtered.length === 0 ? <p className="ir-admin-empty">لا توجد طلبات تطابق هذا الاختيار.</p> : <div className="ir-admin-list">{filtered.map(request => <InterestRow key={request.id} request={request} onSaved={patch => setRequests(previous => previous.map(item => item.id === request.id ? { ...item, ...patch } : item))} />)}</div>}</section>;
}

function InterestRow({ request, onSaved }) {
  const [status, setStatus] = useState(request.status);
  const [notes, setNotes] = useState(request.admin_notes || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const save = async () => {
    setBusy(true); setMessage('');
    try {
      const patch = { status, admin_notes: notes.trim() };
      const { data, error } = await supabase.from('interest_requests').update(patch).eq('id', request.id).select('id').single();
      if (error || !data) throw new Error('Unable to update');
      onSaved(patch); setMessage('حُفظت المتابعة.');
    } catch { setMessage('لم يتم حفظ التعديل. حاول مرة أخرى.'); }
    finally { setBusy(false); }
  };
  return <article className="ir-admin-card"><div className="ir-admin-card-top"><div><h3>{request.full_name}</h3><span>{request.interest}</span></div><time dateTime={request.created_at}>{dateLabel(request.created_at)}</time></div><div className="ir-admin-contact"><a href={`tel:${request.phone}`}><Phone size={15} aria-hidden="true" /><span dir="ltr">{request.phone}</span></a><a href={`https://wa.me/${request.phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer">افتح واتساب <ArrowUpLeft size={15} aria-hidden="true" /></a><label>الحالة<select value={status} disabled={busy} onChange={event => { setStatus(event.target.value); setMessage(''); }}>{Object.entries(interestStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>{request.message && <p className="ir-admin-client-message">{request.message}</p>}<details><summary>ملاحظات المتابعة وسجل الموافقة</summary><label className="ir-admin-note">ملاحظات داخلية<textarea maxLength={2000} rows={2} value={notes} disabled={busy} onChange={event => { setNotes(event.target.value); setMessage(''); }} placeholder="نتيجة الاتصال أو الخطوة التالية…" /></label><small>وافق العميل على حفظ بياناته والتواصل معه بتاريخ {dateLabel(request.consented_at)} · {request.consent_version}</small></details><div className="ir-admin-save"><button onClick={save} disabled={busy || (status === request.status && notes.trim() === (request.admin_notes || ''))}>{busy ? 'جارٍ الحفظ…' : 'حفظ المتابعة'}</button><span role="status">{message}</span></div></article>;
}
