'use client';
import { useState } from 'react';
import { ArrowUpLeft, ArrowLeft, Phone, Mail, MessageCircle, Check } from 'lucide-react';
import { companyContact, contactDraft } from '@/lib/companyContact.mjs';

const topics = ['شراء وحدة سكنية', 'تسويق عقار', 'إدارة الأملاك', 'استفسار آخر'];
const initialForm = { name: '', email: '', topic: topics[0], message: '' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const change = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setDraft(''); setError(''); };
  const prepare = event => {
    event.preventDefault();
    if (!form.name.trim() || !form.message.trim()) { setError('اكتب اسمك ورسالتك لنجهّز الاستفسار.'); return; }
    setError('');
    setDraft(contactDraft(form));
  };
  return <section id="contact" className="sf-contact sf-section" aria-labelledby="sf-contact-title"><div className="container-custom">
    <div className="sf-section-label"><span>05 / لنتحدث</span><span lang="en" dir="ltr">GOOD CONVERSATIONS. NEW BEGINNINGS.</span></div>
    <div className="sf-contact__grid"><div className="sf-contact__intro"><span className="sf-kicker">الخطوة القادمة، نبدأها معًا.</span><h2 id="sf-contact-title">كل اختيار جميل،<br /><em>يبدأ بحديث.</em></h2><p>بيت جديد، فرصة عقارية، أو عناية بأملاكك.<br />قل لنا ما تبحث عنه، ولنبدأ من هناك.</p><div className="sf-contact__direct"><a href={companyContact.phoneHref}><Phone size={17} aria-hidden="true" /><span>اتصل بفريقنا<strong dir="ltr">{companyContact.phone}</strong></span><ArrowUpLeft size={18} aria-hidden="true" /></a><a href={`mailto:${companyContact.email}`}><Mail size={17} aria-hidden="true" /><span>أو اكتب لنا<strong dir="ltr">{companyContact.email}</strong></span><ArrowUpLeft size={18} aria-hidden="true" /></a></div><a className="sf-contact__quick" href={companyContact.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" />تفضّل الحديث مباشرة؟ افتح واتساب <ArrowUpLeft size={16} aria-hidden="true" /></a></div>
    <form className="sf-contact__form" onSubmit={prepare}>
      <fieldset><legend>كيف نقدر نساعدك؟</legend><div className="sf-contact__topics">{topics.map(topic => <label key={topic} className={form.topic === topic ? 'is-selected' : ''}><input type="radio" name="contact-topic" value={topic} checked={form.topic === topic} onChange={() => change('topic', topic)} />{form.topic === topic && <Check size={13} aria-hidden="true" />}{topic}</label>)}</div></fieldset>
      <div className="sf-contact__fields"><label htmlFor="sf-contact-name">اسمك الكريم <span>مطلوب</span><input id="sf-contact-name" name="name" autoComplete="name" required maxLength={100} placeholder="كيف نناديك؟" value={form.name} onChange={event => change('name', event.target.value)} /></label><label htmlFor="sf-contact-email">البريد الإلكتروني <span>اختياري</span><input id="sf-contact-email" type="email" name="email" autoComplete="email" maxLength={254} placeholder="name@example.com" dir="auto" value={form.email} onChange={event => change('email', event.target.value)} /></label></div>
      <label className="sf-contact__message" htmlFor="sf-contact-message">ماذا يدور في بالك؟ <span>مطلوب</span><textarea id="sf-contact-message" name="message" required rows={3} maxLength={2000} placeholder="أخبرنا عن طلبك أو الوحدة التي لفتت انتباهك…" value={form.message} onChange={event => change('message', event.target.value)} /></label>
      {error && <p className="sf-contact__error" role="alert">{error}</p>}
      {!draft ? <div className="sf-contact__submit"><button type="submit">جهّز رسالتي <ArrowLeft size={18} aria-hidden="true" /></button><p>تراجع الرسالة أولًا، ثم تفتحها في واتساب لإرسالها بنفسك.</p></div> : <div className="sf-contact__draft"><p role="status"><Check size={16} aria-hidden="true" />رسالتك جاهزة للمراجعة</p><pre>{draft}</pre><a href={`${companyContact.whatsapp}?text=${encodeURIComponent(draft)}`} target="_blank" rel="noopener noreferrer">افتح الرسالة في واتساب <ArrowUpLeft size={18} aria-hidden="true" /></a><small>فتح واتساب لا يرسل الرسالة تلقائيًا. يمكنك تعديلها قبل الإرسال.</small></div>}
    </form></div>
  </div></section>;
}
