'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Building2, MapPin, Phone, Star, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  
  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] dir-rtl font-sans">
      {/* Cinematic Background with Parallax */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80 z-10" />
        
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="w-full h-full bg-[url('/images/3.jpg')] bg-cover bg-center bg-no-repeat"
        />
      </motion.div>

      {/* Ambient Gold Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#D4AF37] blur-[180px] opacity-[0.15] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#B8860B] blur-[180px] opacity-[0.1] rounded-full pointer-events-none mix-blend-screen" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] z-10 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-20 container-custom h-full flex flex-col items-center justify-center text-center px-4 pt-10 md:pt-0">
        
        {/* Floating Label */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-6 md:mb-8 px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-[#D4AF37]/30 bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs md:text-sm tracking-wider uppercase flex items-center gap-2 md:gap-3 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
        >
          <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-[#D4AF37]" />
          <span className="font-medium">مفهوم جديد للسكن الفاخر</span>
          <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-[#D4AF37]" />
        </motion.div>

        {/* Main Title - Massive & Elegant */}
        <div className="relative mb-4 md:mb-6">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter"
          >
            صفوة <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] via-[#F4D03F] to-[#8a6d1c]">عنان</span>
          </motion.h1>
          
          {/* Decorative Line Animation */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
            className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full mt-1 md:mt-2 opacity-50"
          />
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-4 md:mt-6 text-base sm:text-lg md:text-2xl text-gray-200 max-w-sm sm:max-w-2xl font-light leading-relaxed drop-shadow-lg px-2"
        >
          نبتكر مساحات سكنية تتناغم فيها الفخامة مع الراحة، لنقدم لك تجربة حياة استثنائية في قلب المملكة.
        </motion.p>

        {/* CTA Button */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1.2 }}
           className="mt-8 md:mt-12"
        >
          <a href="#projects" className="group relative inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-[#D4AF37] text-black font-bold rounded-full overflow-hidden transition-all hover:shadow-[0_0_40px_-10px_rgba(212,175,55,0.6)] hover:scale-105">
            <span className="relative z-10 text-sm md:text-base">استكشف مشاريعنا</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 relative z-10 rtl:rotate-180 transition-transform group-hover:-translate-x-1" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
        </motion.div>

      </div>

      {/* Floating Dock Navigation - Bottom */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 80, damping: 20 }}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30 w-auto max-w-[95%] md:max-w-md"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-4 p-2 md:p-2.5 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/5">
          <DockItem icon={<Building2 className="w-4 h-4 md:w-6 md:h-6" />} label="المشاريع" href="#projects" active />
          <div className="w-[1px] h-5 md:h-8 bg-white/10 mx-1 md:mx-2" />
          <DockItem icon={<MapPin className="w-4 h-4 md:w-6 md:h-6" />} label="مواقعنا" href="#location" />
          <DockItem icon={<Phone className="w-4 h-4 md:w-6 md:h-6" />} label="اتصل بنا" href="#contact" />
        </div>
      </motion.div>

      {/* Corner Stats - Desktop Only */}
      <div className="absolute top-8 left-8 hidden lg:block z-20">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="flex items-center gap-4 text-white/90"
        >
          <div className="text-right">
            <p className="text-[10px] uppercase text-[#D4AF37] tracking-[0.2em] font-bold mb-1">الموقع الحالي</p>
            <p className="font-medium text-sm tracking-wide">الرياض، المملكة العربية السعودية</p>
          </div>
          <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-black/20 backdrop-blur-sm shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <MapPin className="w-5 h-5 text-[#D4AF37]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DockItem({ icon, label, href, active }) {
  return (
    <a 
      href={href}
      className={`relative group flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl transition-all duration-300 ${active ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-black shadow-lg shadow-[#D4AF37]/20' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
    >
      <div className={`mb-0 md:mb-1 transition-transform duration-300 group-hover:-translate-y-1 ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className="hidden md:block text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute bottom-1.5 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        {label}
      </span>
      {active && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      )}
    </a>
  );
}