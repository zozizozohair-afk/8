'use client';
import { useState, useEffect } from 'react';
import { Search, ArrowUpLeft, ArrowLeft, MapPin, Phone, Menu, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import GlobalSearch from './GlobalSearch';
import NavigationDialog from './NavigationDialog';
import { companyContact } from '@/lib/companyContact.mjs';
import './Header.css';

const navigation = [
  { name: 'الرئيسية', id: 'top', english: 'HOME' },
  { name: 'روح صفوة', id: 'about', english: 'OUR STORY' },
  { name: 'المشاريع', id: 'projects', english: 'DESTINATIONS' },
  { name: 'الوحدات', id: 'unit-models', english: 'RESIDENCES' },
  { name: 'الخدمات', id: 'services', english: 'OUR EXPERTISE' },
  { name: 'سجّل اهتمامك', id: 'register-interest', english: 'REGISTER INTEREST' },
];

export default function Header({ breadcrumb, variant = 'default', interestHref }) {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState('top');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const hasBreadcrumb = Array.isArray(breadcrumb) && breadcrumb.length > 1;
  const isHome = variant === 'home' && !hasBreadcrumb;
  const hrefFor = id => id === 'register-interest' && interestHref ? interestHref : isHome ? `#${id}` : `/#${id}`;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 48);
      const darkAtHeader = [...document.querySelectorAll('[data-theme="dark"]')].some(section => { const rect = section.getBoundingClientRect(); return rect.top <= 90 && rect.bottom > 90; });
      setDark(darkAtHeader);
      if (isHome) {
        let next = 'top';
        navigation.slice(1).forEach(item => { const section = document.getElementById(item.id); if (section && section.getBoundingClientRect().top <= 180) next = item.id; });
        setActive(next);
      }
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, y / total)) : 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    update();
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); observer.disconnect(); cancelAnimationFrame(frame); };
  }, [isHome]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1120px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  const openSearch = () => { setMenuOpen(false); setSearchOpen(true); };
  const tone = (isHome && !scrolled) || dark ? 'dark' : 'light';

  return <>
    <a href={isHome ? '#about' : '#project-main'} className="sn-skip">انتقل إلى المحتوى</a>
    <header className={`sn-header sn-header--${tone} ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="sn-header__frame">
        <Link className="sn-brand" href={isHome ? '#top' : '/'} aria-label="صفوة عنان، الصفحة الرئيسية"><img src="/images/logo.png" width="52" height="52" alt="" aria-hidden="true" /><span>صفوة عنان<small>للتسويق والتطوير العقاري</small></span></Link>
        {hasBreadcrumb ? <nav className="sn-breadcrumb" aria-label="مسار الصفحة"><ol>{breadcrumb.map((item, index) => <li key={`${item.label}-${index}`}>{index > 0 && <ChevronLeft size={13} aria-hidden="true" />}{index === breadcrumb.length - 1 ? <span aria-current="page">{item.label}</span> : <Link href={item.href || '/'}>{item.label}</Link>}</li>)}</ol></nav> : <nav className="sn-nav" aria-label="التنقل الرئيسي">{navigation.map(item => <a key={item.id} href={hrefFor(item.id)} aria-current={isHome && active === item.id ? 'location' : undefined}>{item.name}<span aria-hidden="true" /></a>)}</nav>}
        <div className="sn-header__actions"><button className="sn-search-button" aria-label="البحث في المشاريع والوحدات" aria-haspopup="dialog" onClick={openSearch}><Search size={20} strokeWidth={1.5} /><span>بحث</span></button><a className="sn-consult" href={hrefFor('register-interest')}>سجّل اهتمامك <ArrowUpLeft size={17} strokeWidth={1.5} aria-hidden="true" /></a><button className="sn-menu-toggle" aria-label="فتح قائمة التنقل" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls={menuOpen ? 'sn-mobile-navigation' : undefined} onClick={() => setMenuOpen(true)}><span>القائمة</span><Menu size={23} strokeWidth={1.4} /></button></div>
        <div className="sn-header__progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      </div>
    </header>
    {menuOpen && <NavigationDialog title="قائمة التنقل" className="sn-menu-dialog" onClose={() => setMenuOpen(false)}><div className="sn-menu__brand"><span>صفوة عنان</span><small lang="en" dir="ltr">A PLACE. A POSSIBILITY.</small></div><div className="sn-menu__layout"><nav id="sn-mobile-navigation" aria-label="قائمة التنقل">{navigation.map((item, index) => <a key={item.id} href={hrefFor(item.id)} aria-current={isHome && active === item.id ? 'location' : undefined} onClick={() => setMenuOpen(false)}><small>0{index + 1}</small><span>{item.name}<em lang="en" dir="ltr">{item.english}</em></span><ArrowUpLeft size={23} strokeWidth={1.2} aria-hidden="true" /></a>)}</nav><div className="sn-menu__aside"><span className="sn-menu__motto">عنوانك القادم،<br />يبدأ من هنا.</span><p><MapPin size={14} aria-hidden="true" />الرياض، المملكة العربية السعودية</p><a href={companyContact.phoneHref}><Phone size={14} aria-hidden="true" /><span dir="ltr">{companyContact.phone}</span></a><button onClick={openSearch}>ابحث عن مساحتك <Search size={18} aria-hidden="true" /></button></div></div><a className="sn-menu__contact" href={hrefFor('contact')} onClick={() => setMenuOpen(false)}>لنبدأ الحديث <ArrowLeft size={18} aria-hidden="true" /></a></NavigationDialog>}
    <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
  </>;
}
