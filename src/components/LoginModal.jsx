'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import NavigationDialog from './NavigationDialog';
import './AdminAccess.css';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sending = useRef(false);
  const mounted = useRef(true);
  const router = useRouter();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const handleLogin = async event => {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true; setLoading(true); setError('');
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (loginError) throw loginError;
      if (mounted.current) { setPassword(''); onClose(); router.push('/dashboard'); }
    } catch (loginError) {
      if (mounted.current) setError(loginError.status === 429 ? 'محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مجددًا.' : 'تعذّر تسجيل الدخول. تأكد من بيانات الدخول واتصالك ثم أعد المحاولة.');
    } finally { sending.current = false; if (mounted.current) setLoading(false); }
  };
  if (!isOpen) return null;
  return <NavigationDialog title="دخول الإدارة" className="admin-access" onClose={onClose} inputFocus>
    <div className="admin-access__brand"><img src="/images/logo.png" width="58" height="58" alt="صفوة عنان" /><span lang="en" dir="ltr">PRIVATE ACCESS</span></div>
    <span className="admin-access__label"><LockKeyhole size={14} aria-hidden="true" />مساحة الإدارة</span><h2>أهلًا بعودتك.</h2><p>سجّل دخولك لإدارة المشاريع وطلبات الاهتمام.</p>
    <form onSubmit={handleLogin} aria-busy={loading}><fieldset disabled={loading}><label htmlFor="admin-email">البريد الإلكتروني<input autoFocus id="admin-email" name="username" type="email" autoComplete="username" dir="ltr" required value={email} onChange={event => { setEmail(event.target.value); setError(''); }} /></label><label htmlFor="admin-password">كلمة المرور<input id="admin-password" name="password" type="password" autoComplete="current-password" dir="ltr" required value={password} onChange={event => { setPassword(event.target.value); setError(''); }} /></label>{error && <p className="admin-access__error" role="alert">{error}</p>}<button type="submit">{loading ? 'جارٍ التحقق…' : 'دخول لوحة التحكم'}<ArrowLeft size={17} aria-hidden="true" /></button></fieldset></form>
  </NavigationDialog>;
}
