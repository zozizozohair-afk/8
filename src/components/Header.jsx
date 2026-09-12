'use client';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, Home, Info, Briefcase, Building2, Phone, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from './GlobalSearch';

export default function Header({ breadcrumb, variant = 'default' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [darkness, setDarkness] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      const isLocked = isMenuOpen || isSearchOpen;
      const lastScrollY = lastScrollYRef.current;
      const delta = scrollY - lastScrollY;
      const shouldHide = scrollY > 120 && delta > 10;
      const shouldShow = delta < -10;

      if (isLocked) {
        setIsHeaderVisible(true);
      } else if (shouldHide) {
        setIsHeaderVisible(false);
      } else if (shouldShow) {
        setIsHeaderVisible(true);
      }

      lastScrollYRef.current = scrollY;

      const darkSections = document.querySelectorAll('[data-theme="dark"], #contact, footer');
      const gradualSections = document.querySelectorAll('[data-theme="gradual-dark"]');
      
      let newDarkness = 0;

      darkSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom >= 80) {
          newDarkness = 1;
        }
      });

      gradualSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom >= 80) {
            const start = 80;
            const end = 80 - (rect.height / 2);
            const progress = (start - rect.top) / (start - end);
            newDarkness = Math.min(Math.max(progress, 0), 1);
        }
      });

      setDarkness(newDarkness);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen, isSearchOpen]);

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

  const bgR = Math.round(255 - (240 * darkness));
  const bgG = Math.round(255 - (240 * darkness));
  const bgB = Math.round(255 - (240 * darkness));
  
  const headerStyle = (isHome && !isScrolled)
    ? {}
    : { backgroundColor: `rgba(${bgR}, ${bgG}, ${bgB}, 0.92)` };

  const headerClassName = [
    'fixed top-0 w-full z-50 transition-all duration-500 h-[88px] md:h-[92px] flex items-center [font-family:var(--font-cairo)]',
    isHeaderVisible ? 'translate-y-0' : '-translate-y-full',
    isHome
      ? (isScrolled
          ? 'backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] border-b border-black/5'
          : 'bg-gradient-to-b from-black/55 via-black/20 to-transparent border-b border-transparent')
      : 'backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]'
  ].join(' ');

  const borderClass = '';

  const navLinkClassName = (linkName) => [
    'relative text-[13px] md:text-[14px] font-semibold transition-all duration-300 px-4 py-2.5 rounded-[10px] flex items-center gap-2 group tracking-wide',
    (isHome && !isScrolled) || isDarkTheme
      ? 'text-white/85 hover:text-white hover:bg-white/[0.07]'
      : 'text-primary/85 hover:text-primary hover:bg-gray-50',
    hoveredLink === linkName ? 'scale-[1.02]' : ''
  ].join(' ');

  const iconButtonClassName = [
    'p-2.5 rounded-xl transition-all duration-300 border',
    (isHome && !isScrolled) || isDarkTheme
      ? 'text-white/80 hover:text-white hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.18]'
      : 'text-primary/70 hover:text-primary hover:bg-gray-50 border-gray-100 hover:border-gray-200'
  ].join(' ');

  const whatsappButtonClassName = [
    'relative px-[24px] md:px-[28px] py-[11px] md:py-[12px] rounded-[14px] text-[13px] md:text-[14px] font-bold transition-all duration-300 inline-flex items-center justify-center gap-2 overflow-hidden group',
    'ring-1 ring-offset-0',
    (isHome && !isScrolled) || isDarkTheme
      ? 'bg-white/[0.12] text-white border border-white/[0.18] hover:bg-white/[0.2] backdrop-blur-xl ring-white/5 hover:ring-white/10 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.2)]'
      : 'bg-gradient-to-br from-[#25D366] to-[#1fb85a] text-white hover:from-[#1fb85a] hover:to-[#16a34a] ring-[#25D366]/20 hover:ring-[#25D366]/30 shadow-[0_10px_30px_-10px_rgba(37,211,102,0.45)] hover:shadow-[0_14px_35px_-10px_rgba(37,211,102,0.55)] hover:-translate-y-[1px]'
  ].join(' ');

  return (
    <header className={`${headerClassName} ${borderClass}`} style={headerStyle}>
      <div className="container-custom w-full flex justify-between items-center">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className={`
              relative w-[58px] h-[58px] md:w-[64px] md:h-[64px] rounded-2xl flex items-center justify-center
              transition-all duration-500 overflow-hidden
              ${(isHome && !isScrolled) || isDarkTheme 
                ? 'bg-white/[0.08] border border-white/[0.15] backdrop-blur-md' 
                : 'bg-white border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)]'}
            `}>
              <img
                src="/images/logo.png"
                alt="صفوة عنان"
                className={[
                  'w-[42px] h-[42px] md:w-[48px] md:h-[48px] object-contain transition-all duration-500',
                  (isHome && !isScrolled) || isDarkTheme ? 'brightness-0 invert drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]' : ''
                ].join(' ')}
              />
            </div>
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className={`
              text-[15px] md:text-[17px] font-bold tracking-wide transition-colors duration-300
              ${(isHome && !isScrolled) || isDarkTheme ? 'text-white' : 'text-primary'}
            `}>
              صفوة عنان
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`
                h-[1.5px] w-4 rounded-full transition-colors duration-300
                ${(isHome && !isScrolled) || isDarkTheme ? 'bg-white/30' : 'bg-gray-200'}
              `} />
              <span className={`
                text-[10px] md:text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-300
                ${(isHome && !isScrolled) || isDarkTheme ? 'text-white/55' : 'text-secondary-text/60'}
              `}>
                للتطوير العقاري
              </span>
            </div>
          </div>
        </Link>

        {/* Breadcrumb or Nav */}
        {hasBreadcrumb ? (
          <nav className="flex-1 mx-4 min-w-0">
            <div className={`
              flex items-center gap-2.5 text-[12.5px] md:text-[13px] truncate
              px-4 py-2 rounded-xl
              ${(isHome && !isScrolled) || isDarkTheme 
                ? 'text-gray-300 bg-white/[0.05] border border-white/[0.08] backdrop-blur-md' 
                : 'text-gray-500 bg-gray-50 border border-gray-100'}
            `}>
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                  <div key={`${item.href || item.label}-${index}`} className="flex items-center gap-2.5 min-w-0">
                    {isLast ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${(isHome && !isScrolled) || isDarkTheme 
                            ? 'bg-gold-gradient text-black' 
                            : 'bg-gold-gradient text-white'}
                        `}>
                          {item.label}
                        </span>
                      </div>
                    ) : (
                      <Link href={item.href} className={`
                        hover:text-[#D4AF37] transition-colors truncate font-medium
                        ${(isHome && !isScrolled) || isDarkTheme ? 'text-gray-300' : 'text-gray-500'}
                      `}>
                        {item.label}
                      </Link>
                    )}
                    {!isLast && (
                      <ChevronDown className={`
                        w-3.5 h-3.5 -rotate-90 flex-shrink-0
                        ${(isHome && !isScrolled) || isDarkTheme ? 'text-gray-500' : 'text-gray-300'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-[6px] lg:gap-[10px]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className={navLinkClassName(link.name)}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <Icon size={15} className={`
                    opacity-60 group-hover:opacity-100 transition-all duration-300
                    group-hover:scale-110
                    ${(isHome && !isScrolled) || isDarkTheme ? 'text-[#D4AF37]' : 'text-accent'}
                  `} />
                  <span className="relative">
                    {link.name}
                    <span className={`
                      absolute -bottom-0.5 left-0 w-full h-[2px] rounded-full
                      transition-all duration-400 ease-out
                      ${hoveredLink === link.name 
                        ? 'opacity-100 scale-x-100' 
                        : 'opacity-0 scale-x-0'}
                      ${(isHome && !isScrolled) || isDarkTheme
                        ? 'bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent'
                        : 'bg-gold-gradient'}
                    `} />
                  </span>
                </a>
              );
            })}
            
            {/* Decorative Divider */}
            <div className={`
              w-px h-7 mx-3 rounded-full transition-colors duration-300
              ${(isHome && !isScrolled) || isDarkTheme ? 'bg-white/[0.12]' : 'bg-gray-100'}
            `} />
          </nav>
        )}

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className={iconButtonClassName}
            aria-label="بحث"
          >
            <Search size={19} strokeWidth={2.2} />
          </button>
          
          <a 
            href="https://wa.me/966570109444" 
            className={whatsappButtonClassName}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" className="group-hover:scale-110 transition-transform duration-300">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              تواصل عبر واتساب
            </span>
            <div className={`
              absolute inset-0 transition-all duration-400
              ${(isHome && !isScrolled) || isDarkTheme 
                ? 'bg-gradient-to-r from-white/0 via-white/[0.08] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%]' 
                : 'bg-gradient-to-r from-white/0 via-white/[0.25] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%]'}
            `} />
          </a>
        </div>

        {/* Mobile Menu Button & Search */}
        <div className="md:hidden flex items-center gap-2.5">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className={`
              p-2.5 rounded-xl transition-all duration-300 border
              ${(isHome && !isScrolled) || isDarkTheme 
                ? 'text-white/80 hover:text-white hover:bg-white/[0.08] border-white/[0.08] backdrop-blur-md' 
                : 'text-primary/70 hover:text-primary hover:bg-gray-50 border-gray-100'}
            `}
          >
            <Search size={22} strokeWidth={2.1} />
          </button>
          {!hasBreadcrumb && (
            <button 
              className={`
                p-2.5 rounded-xl transition-all duration-300 border
                ${(isHome && !isScrolled) || isDarkTheme 
                  ? 'text-white/80 hover:text-white hover:bg-white/[0.08] border-white/[0.08] backdrop-blur-md' 
                  : 'text-primary/70 hover:text-primary hover:bg-gray-50 border-gray-100'}
              `} 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? <X size={22} strokeWidth={2.2} /> : <Menu size={22} strokeWidth={2.2} />}
                </motion.div>
              </AnimatePresence>
            </button>
          )}
        </div>
      </div>

      {/* Bottom decorative line when scrolled */}
      <AnimatePresence>
        {!isHome || isScrolled ? (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent"
            style={{ originX: 0.5 }}
          />
        ) : null}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {!hasBreadcrumb && isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden absolute top-[88px] left-0 w-full overflow-hidden"
          >
            <div className="mx-4 mb-4 rounded-[28px] border border-white/20 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-[#0f0f0f]/[0.97] via-[#151515]/[0.96] to-[#0f0f0f]/[0.97]">
              
              {/* Mobile Menu Header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center">
                      <img src="/images/logo.png" alt="" className="w-7 h-7 object-contain brightness-0 invert" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">صفوة عنان</p>
                      <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">قائمة التنقل</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-gold-gradient/20 border border-[#D4AF37]/30">
                    <span className="text-[#D4AF37] text-[10px] font-bold tracking-wider">صفوة عنان</span>
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              <div className="flex flex-col p-4 space-y-1.5">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.a 
                      key={link.name} 
                      href={link.href} 
                      initial={{ opacity: 0, x: -25 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
                      className="
                        flex items-center gap-4 p-4 rounded-[18px] 
                        bg-white/[0.03] hover:bg-white/[0.08] 
                        text-white/75 hover:text-white 
                        transition-all duration-300 group
                        border border-transparent hover:border-white/[0.1]
                      "
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="
                        w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/10 
                        flex items-center justify-center 
                        border border-[#D4AF37]/20 
                        group-hover:from-[#D4AF37]/30 group-hover:to-[#B8860B]/20 
                        transition-all duration-300
                        group-hover:scale-110
                      ">
                        <Icon size={20} className="text-[#D4AF37]" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <span className="text-base font-semibold block">{link.name}</span>
                        <span className="text-[11px] text-white/35 mt-0.5 block">
                          {link.name === 'الرئيسية' && 'الصفحة الرئيسية'}
                          {link.name === 'عن الشركة' && 'تعرف على صفوة عنان'}
                          {link.name === 'خدماتنا' && 'حلولنا العقارية المتكاملة'}
                          {link.name === 'المشاريع' && 'استكشف مشاريعنا'}
                          {link.name === 'تواصل معنا' && 'فريقنا جاهز لخدمتكم'}
                        </span>
                      </div>
                      <div className="
                        w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center
                        group-hover:bg-white/[0.1] transition-colors
                      ">
                        <ChevronDown size={17} className="text-white/30 group-hover:text-[#D4AF37] transition-colors -rotate-90" />
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              {/* Mobile Menu Footer - CTA */}
              <div className="p-5 pt-4 border-t border-white/[0.08]">
                <a 
                  href="https://wa.me/966570109444"
                  className="
                    flex items-center justify-center gap-3 w-full
                    py-4 rounded-[18px]
                    bg-gradient-to-br from-[#25D366] to-[#1fb85a]
                    text-white font-bold text-sm
                    shadow-[0_12px_35px_-12px_rgba(37,211,102,0.6)]
                    hover:shadow-[0_16px_40px_-12px_rgba(37,211,102,0.75)]
                    hover:-translate-y-[1px]
                    transition-all duration-300
                  "
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  تواصل معنا عبر واتساب
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
