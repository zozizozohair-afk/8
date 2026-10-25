'use client';
import { useEffect, useState } from 'react';
import { ArrowUp, ArrowUpLeft, Phone } from 'lucide-react';
import './InterestQuickAccess.css';

export default function InterestQuickAccess() {
  const [atRegistration, setAtRegistration] = useState(false);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const section = document.getElementById('register-interest');
    const observer = new IntersectionObserver(([entry]) => setAtRegistration(entry.isIntersecting), { rootMargin: '-100px 0px -100px 0px' });
    if (section) observer.observe(section);
    const update = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); window.removeEventListener('scroll', update); };
  }, []);
  const goTo = (event, id) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    const focusTarget = id === 'top' ? target : target.querySelector('h2') || target;
    focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({ preventScroll: true });
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  };
  return <aside className="ir-floating" aria-label="وصول سريع لتسجيل الاهتمام">
    {!atRegistration && <a className="ir-floating__register" href="#register-interest" onClick={event => goTo(event, 'register-interest')}><span className="ir-floating__icon"><Phone size={19} strokeWidth={1.5} aria-hidden="true" /></span><span>سجّل اهتمامك<small>واترك لنا خطوة التواصل</small></span><ArrowUpLeft size={21} strokeWidth={1.5} aria-hidden="true" /></a>}
    {showTop && <a className="ir-floating__top" href="#top" onClick={event => goTo(event, 'top')} aria-label="الرجوع إلى أعلى الصفحة" title="الرجوع إلى أعلى الصفحة"><ArrowUp size={19} strokeWidth={1.5} aria-hidden="true" /></a>}
  </aside>;
}
