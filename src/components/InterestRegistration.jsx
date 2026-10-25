'use client';
import { useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { interestConsent, interestOptions, normalizeSaudiMobile, validateInterest } from '@/lib/interestRequests.mjs';
import './InterestRegistration.css';

const emptyForm = { fullName: '', phone: '', interest: interestOptions[0], message: '', consent: false, website: '' };
export default function InterestRegistration({ projectName = '' }) {
  const initialForm = { ...emptyForm, message: projectName ? `مهتم بمشروع: ${projectName}` : '' };
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const sending = useRef(false);
  const resultRef = useRef(null);
  const update = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setError(''); };
  const submit = async event => {
    event.preventDefault();
    if (sending.current) return;
    const validation = validateInterest(form);
    if (validation) { setError(validation); return; }
    sending.current = true; setBusy(true); setError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const { error: saveError } = await supabase.rpc('register_interest', {
        p_full_name: form.fullName.trim(), p_phone: normalizeSaudiMobile(form.phone),
        p_interest: form.interest, p_message: form.message.trim(), p_consent: form.consent, p_website: form.website,
      }).abortSignal(controller.signal);
      if (saveError) throw saveError;
      setSaved(true); setForm(initialForm);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setError('لم نتمكن من تأكيد حفظ طلبك. بياناتك ما زالت هنا؛ حاول مرة أخرى بعد قليل أو تواصل معنا مباشرة.');
    } finally { clearTimeout(timeout); sending.current = false; setBusy(false); }
  };
  return <section id="register-interest" className="ir-section sf-section" aria-labelledby="ir-title"><div className="container-custom"><div className="ir-panel"><div className="ir-intro"><span className="sf-kicker">نرجع لك، بالاختيار المناسب.</span><h2 id="ir-title">سجّل اهتمامك.<br /><em>وخَلّ الباقي علينا.</em></h2><p>اترك اسمك ورقم جوالك، ليتواصل معك فريق صفوة عنان بخصوص ما تبحث عنه.</p><span className="ir-caption"><Phone size={14} aria-hidden="true" />بدون حساب، وبدون الحاجة لإرسال واتساب.</span></div>
    {saved ? <div ref={resultRef} className="ir-success" role="status" tabIndex={-1}><CheckCircle2 size={34} strokeWidth={1.3} aria-hidden="true" /><h3>وصلنا اهتمامك.</h3><p>حُفظ طلبك لدى صفوة عنان، ويمكن لفريقنا التواصل معك على الرقم الذي سجّلته.</p><button onClick={() => setSaved(false)}>تسجيل اهتمام آخر <ArrowLeft size={16} aria-hidden="true" /></button></div> : <form onSubmit={submit} className="ir-form" aria-busy={busy}><fieldset disabled={busy}><div className="ir-fields"><label htmlFor="ir-name">الاسم<input id="ir-name" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="اسمك الكريم" value={form.fullName} onChange={event => update('fullName', event.target.value)} /></label><label htmlFor="ir-phone">رقم الجوال<input id="ir-phone" name="tel" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" required maxLength={20} placeholder="05XXXXXXXX" value={form.phone} onChange={event => update('phone', event.target.value)} /></label></div><label className="ir-interest" htmlFor="ir-topic">مهتم بـ<select id="ir-topic" value={form.interest} onChange={event => update('interest', event.target.value)}>{interestOptions.map(option => <option key={option}>{option}</option>)}</select></label><details className="ir-optional"><summary>أضف تفاصيل عن طلبك <span>اختياري</span></summary><label htmlFor="ir-message" className="sr-only">تفاصيل طلب الاهتمام</label><textarea id="ir-message" rows={2} maxLength={1000} value={form.message} onChange={event => update('message', event.target.value)} placeholder="الحي، نوع الوحدة، أو أفضل وقت للتواصل…" /></details><div className="ir-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={event => update('website', event.target.value)} /></label></div><label className="ir-consent"><input type="checkbox" required checked={form.consent} onChange={event => update('consent', event.target.checked)} /><span>{interestConsent}</span></label>{error && <p className="ir-error" role="alert">{error}<a href="#contact">التواصل المباشر <ArrowLeft size={13} aria-hidden="true" /></a></p>}<button className="ir-submit" type="submit">{busy ? 'جارٍ حفظ اهتمامك…' : 'سجّل اهتمامي'}<ArrowLeft size={18} aria-hidden="true" /></button><small>يُحفظ الطلب للمتابعة من فريقنا، دون إنشاء حساب للزائر.</small></fieldset></form>}
  </div></div></section>;
}
