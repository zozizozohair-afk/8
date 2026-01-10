'use client';
import { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import Link from 'next/link';
import GlobalSearch from './GlobalSearch';

export default function Header({ breadcrumb, variant = 'default' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'الرئيسية', href: '#' },
    { name: 'عن الشركة', href: '#about' },
    { name: 'خدماتنا', href: '#services' },
    { name: 'المشاريع', href: '#projects' },
    { name: 'تواصل معنا', href: '#contact' },
  ];

  const breadcrumbItems = Array.isArray(breadcrumb) ? breadcrumb : null;
  const hasBreadcrumb = Boolean(breadcrumbItems && breadcrumbItems.length >= 2);
  const isHome = variant === 'home' && !hasBreadcrumb;

  const headerClassName = [
    'fixed top-0 w-full z-50 transition-all duration-300 h-[80px] flex items-center',
    isHome
      ? (isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-border-light shadow-sm'
          : 'bg-gradient-to-b from-black/45 via-black/15 to-transparent border-b border-transparent')
      : 'bg-white/80 backdrop-blur-md border-b border-border-light'
  ].join(' ');

  const navLinkClassName = [
    'text-[14px] font-medium transition-all duration-300 px-3 py-2 rounded-full relative',
    'after:content-[\'\'] after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-accent after:opacity-0 after:transition after:duration-300 hover:after:opacity-100',
    isHome && !isScrolled
      ? 'text-white/90 hover:text-white hover:bg-white/10'
      : 'text-primary hover:text-accent hover:bg-gray-50'
  ].join(' ');

  const iconButtonClassName = [
    'p-2 rounded-full transition-all',
    isHome && !isScrolled
      ? 'text-white/90 hover:text-white hover:bg-white/10'
      : 'text-primary hover:text-accent hover:bg-gray-50'
  ].join(' ');

  const whatsappButtonClassName = [
    'px-[22px] py-[10px] rounded-full text-[14px] font-semibold transition-all duration-300 inline-flex items-center justify-center',
    'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-white',
    isHome && !isScrolled
      ? 'bg-white/15 text-white border border-white/25 hover:bg-white/25 backdrop-blur-md'
      : 'bg-[#25D366] text-white hover:bg-[#1fb85a] shadow-sm'
  ].join(' ');

  return (
    <header className={headerClassName}>
      <div className="container-custom w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="صفوة عنان"
            className={[
              'h-16 w-auto object-contain transition-all duration-300',
              isHome && !isScrolled ? 'brightness-0 invert drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]' : ''
            ].join(' ')}
          />
        </Link>

        {hasBreadcrumb ? (
          <nav className="flex-1 mx-4 min-w-0">
            <div className="flex items-center gap-2 text-[13px] text-gray-500 truncate">
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                  <div key={`${item.href || item.label}-${index}`} className="flex items-center gap-2 min-w-0">
                    {isLast ? (
                      <span className="text-primary font-medium truncate">{item.label}</span>
                    ) : (
                      <Link href={item.href} className="hover:text-[#D4AF37] transition truncate">
                        {item.label}
                      </Link>
                    )}
                    {!isLast && <span className="text-gray-300">›</span>}
                  </div>
                );
              })}
            </div>
          </nav>
        ) : (
          <nav className="hidden md:flex gap-[40px] items-center">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className={navLinkClassName}
              >
                {link.name}
              </a>
            ))}
          </nav>
        )}

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className={iconButtonClassName}
            aria-label="بحث"
          >
            <Search size={20} />
          </button>
          
          <a 
            href="https://wa.me/966570109444" 
            className={whatsappButtonClassName}
          >
            تواصل عبر واتساب
          </a>
        </div>

        {/* Mobile Menu Button & Search */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className={isHome && !isScrolled ? 'text-white/90 hover:text-white transition p-2' : 'text-primary hover:text-accent transition p-2'}
          >
            <Search size={24} />
          </button>
          {!hasBreadcrumb && (
            <button className={isHome && !isScrolled ? 'text-white/90 hover:text-white transition' : 'text-primary hover:text-accent transition'} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {!hasBreadcrumb && isMenuOpen && (
        <div className="md:hidden bg-white absolute top-[80px] left-0 w-full border-t border-border-light shadow-lg">
          <div className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-[14px] font-medium text-primary hover:text-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
