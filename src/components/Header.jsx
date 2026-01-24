'use client';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Home, Info, Briefcase, Building2, Phone } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from './GlobalSearch';

export default function Header({ breadcrumb, variant = 'default' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [darkness, setDarkness] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      // Check sections
      const darkSections = document.querySelectorAll('[data-theme="dark"], #contact, footer');
      const gradualSections = document.querySelectorAll('[data-theme="gradual-dark"]');
      
      let newDarkness = 0;

      // Check standard dark sections (binary)
      darkSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom >= 80) {
          newDarkness = 1;
        }
      });

      // Check gradual sections (overrides binary if active in the section)
      gradualSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // If header overlaps with the section
        if (rect.top <= 80 && rect.bottom >= 80) {
            // Calculate progress: 0 at top, 1 at middle (height/2)
            const start = 80;
            const end = 80 - (rect.height / 2);
            const progress = (start - rect.top) / (start - end);
            newDarkness = Math.min(Math.max(progress, 0), 1);
        }
      });

      setDarkness(newDarkness);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'الرئيسية', href: '#', icon: Home },
    { name: 'عن الشركة', href: '#about', icon: Info },
    { name: 'خدماتنا', href: '#services', icon: Briefcase },
    { name: 'المشاريع', href: '#projects', icon: Building2 },
    { name: 'تواصل معنا', href: '#contact', icon: Phone },
  ];

  const breadcrumbItems = Array.isArray(breadcrumb) ? breadcrumb : null;
  const hasBreadcrumb = Boolean(breadcrumbItems && breadcrumbItems.length >= 2);
  const isHome = variant === 'home' && !hasBreadcrumb;

  const isDarkTheme = darkness > 0.5;

  // Calculate background color based on darkness
  // Light: 255, 255, 255 (white)
  // Dark: 15, 15, 15 (#0f0f0f)
  const bgR = Math.round(255 - (240 * darkness));
  const bgG = Math.round(255 - (240 * darkness));
  const bgB = Math.round(255 - (240 * darkness));
  
  const headerStyle = (isHome && !isScrolled)
    ? {}
    : { backgroundColor: `rgba(${bgR}, ${bgG}, ${bgB}, 0.9)` };

  const headerClassName = [
    'fixed top-0 w-full z-50 transition-all duration-300 h-[80px] flex items-center',
    isHome
      ? (isScrolled
          ? 'backdrop-blur-md shadow-sm'
          : 'bg-gradient-to-b from-black/45 via-black/15 to-transparent border-b border-transparent')
      : 'backdrop-blur-md'
  ].join(' ');

  // Border color logic
  const borderClass = (isHome && !isScrolled) 
     ? '' 
     : (isDarkTheme ? 'border-b border-white/10' : 'border-b border-border-light');

  const navLinkClassName = [
    'text-[14px] font-medium transition-all duration-300 px-3 py-2 rounded-full relative flex items-center gap-2',
    'after:content-[\'\'] after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-accent after:opacity-0 after:transition after:duration-300 hover:after:opacity-100',
    (isHome && !isScrolled) || isDarkTheme
      ? 'text-white/90 hover:text-white hover:bg-white/10'
      : 'text-primary hover:text-accent hover:bg-gray-50'
  ].join(' ');

  const iconButtonClassName = [
    'p-2 rounded-full transition-all',
    (isHome && !isScrolled) || isDarkTheme
      ? 'text-white/90 hover:text-white hover:bg-white/10'
      : 'text-primary hover:text-accent hover:bg-gray-50'
  ].join(' ');

  const whatsappButtonClassName = [
    'px-[22px] py-[10px] rounded-full text-[14px] font-semibold transition-all duration-300 inline-flex items-center justify-center',
    'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-white',
    (isHome && !isScrolled) || isDarkTheme
      ? 'bg-white/15 text-white border border-white/25 hover:bg-white/25 backdrop-blur-md'
      : 'bg-[#25D366] text-white hover:bg-[#1fb85a] shadow-sm'
  ].join(' ');

  return (
    <header className={`${headerClassName} ${borderClass}`} style={headerStyle}>
      <div className="container-custom w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="صفوة عنان"
            className={[
              'h-16 w-auto object-contain transition-all duration-300',
              (isHome && !isScrolled) || isDarkTheme ? 'brightness-0 invert drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]' : ''
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
          <nav className="hidden md:flex gap-[20px] lg:gap-[40px] items-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className={navLinkClassName}
                >
                  <Icon size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  {link.name}
                </a>
              );
            })}
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
            className={(isHome && !isScrolled) || isDarkTheme ? 'text-white/90 hover:text-white transition p-2' : 'text-primary hover:text-accent transition p-2'}
          >
            <Search size={24} />
          </button>
          {!hasBreadcrumb && (
            <button className={(isHome && !isScrolled) || isDarkTheme ? 'text-white/90 hover:text-white transition' : 'text-primary hover:text-accent transition'} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {!hasBreadcrumb && isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/95 backdrop-blur-xl absolute top-[80px] left-0 w-full border-b border-gray-100 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-3">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.a 
                    key={link.name} 
                    href={link.href} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-[#D4AF37]/10 text-gray-700 hover:text-[#D4AF37] transition-all duration-300 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#D4AF37]">
                      <Icon size={20} />
                    </div>
                    <span className="text-base font-medium">{link.name}</span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
