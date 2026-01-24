'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Building2, MapPin, Phone, Star, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]); // Fade out on scroll

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] dir-rtl font-sans">
      {/* Cinematic Background with Parallax */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/50 z-10" /> {/* Slightly darker for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-transparent to-[#050505]/90 z-10" />
        
        <motion.div 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 15, ease: "easeOut" }} // Slower zoom for more cinematic feel
          className="w-full h-full bg-[url('/images/3.jpg')] bg-cover bg-center bg-no-repeat"
        />
      </motion.div>

      {/* Animated Grain Overlay for Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

      {/* Ambient Gold Glow Effects - Animated */}
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#D4AF37] blur-[180px] rounded-full pointer-events-none mix-blend-screen" 
      />
      <motion.div 
         animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.2, 1] }}
         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
         className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#B8860B] blur-[180px] rounded-full pointer-events-none mix-blend-screen" 
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] z-10 pointer-events-none" />

      {/* Main Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 container-custom h-full flex flex-col items-center justify-center text-center px-4 pt-10 md:pt-0"
      >
        
        {/* Floating Label */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8 md:mb-10 px-6 py-2 rounded-full border border-[#D4AF37]/30 bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs md:text-sm tracking-wider uppercase flex items-center gap-3 shadow-[0_0_30px_rgba(212,175,55,0.15)] group hover:bg-black/50 transition-colors cursor-default"
        >
          <Star className="w-3 h-3 fill-[#D4AF37] animate-pulse" />
          <span className="font-bold tracking-widest">مفهوم جديد للسكن الفاخر</span>
          <Star className="w-3 h-3 fill-[#D4AF37] animate-pulse delay-75" />
        </motion.div>

        {/* Main Title - Massive & Elegant */}
        <div className="relative mb-6 md:mb-8">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold text-white tracking-tighter leading-none"
          >
            صفوة <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] via-[#F4D03F] to-[#8a6d1c]">عنان</span>
          </motion.h1>
          
          {/* Decorative Line Animation */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
            className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full mt-4 opacity-70"
          />
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-sm sm:max-w-3xl font-light leading-relaxed drop-shadow-lg px-4"
        >
          نبتكر مساحات سكنية تتناغم فيها <span className="text-white font-medium">الفخامة</span> مع <span className="text-white font-medium">الراحة</span>، لنقدم لك تجربة حياة استثنائية في قلب المملكة.
        </motion.p>

        {/* CTA Button */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1.2 }}
           className="mt-8 md:mt-12 flex flex-col items-center gap-6 md:gap-8"
        >
          <a href="#projects" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#D4AF37] text-black font-bold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_-10px_rgba(212,175,55,0.7)] hover:scale-105 hover:bg-[#E5C158]">
            <span className="relative z-10 text-base md:text-lg">استكشف مشاريعنا</span>
            <ArrowRight className="w-5 h-5 relative z-10 rtl:rotate-180 transition-transform group-hover:-translate-x-1" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>

          {/* Floating Dock Navigation - Moved to Center */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 80, damping: 20 }}
            className="w-auto max-w-[95%] md:max-w-md"
          >
            <div className="flex items-center justify-center gap-3 sm:gap-6 p-3 md:p-4 rounded-3xl bg-black/30 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] ring-1 ring-white/5">
              <DockItem icon={<Building2 className="w-5 h-5 md:w-6 md:h-6" />} label="المشاريع" href="#projects" active />
              <div className="w-[1px] h-6 md:h-10 bg-white/10 mx-1" />
              <DockItem icon={<MapPin className="w-5 h-5 md:w-6 md:h-6" />} label="مواقعنا" href="#location" />
              <DockItem icon={<Phone className="w-5 h-5 md:w-6 md:h-6" />} label="اتصل بنا" href="#contact" />
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
            <span className="text-[10px] text-white/50 uppercase tracking-widest">تصفح المزيد</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0 overflow-hidden">
                <motion.div 
                    animate={{ y: [-20, 20] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-full h-1/2 bg-white/80 blur-[1px]"
                />
            </div>
        </motion.div>

      </motion.div>

      {/* Corner Stats - Desktop Only */}
      <div className="absolute top-10 left-10 hidden lg:block z-20">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="flex items-center gap-5 text-white/90 group cursor-default"
        >
          <div className="text-right">
            <p className="text-[10px] uppercase text-[#D4AF37] tracking-[0.3em] font-bold mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity">الموقع الحالي</p>
            <p className="font-bold text-sm tracking-wide group-hover:text-[#D4AF37] transition-colors">الرياض، المملكة العربية السعودية</p>
          </div>
          <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37] blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="w-14 h-14 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.1)] group-hover:scale-110 transition-transform duration-500">
                <MapPin className="w-6 h-6 text-[#D4AF37]" />
              </div>
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
      className={`relative group flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl transition-all duration-500 ease-out ${
          active 
          ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-black shadow-[0_10px_20px_-5px_rgba(212,175,55,0.4)] scale-110' 
          : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white hover:scale-105 border border-transparent hover:border-white/10'
      }`}
    >
      <div className={`mb-0 md:mb-1 transition-transform duration-500 group-hover:-translate-y-1 ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`hidden md:block text-[10px] font-bold absolute bottom-2 transition-all duration-500 transform ${
          active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
      }`}>
        {label}
      </span>
      {active && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D4AF37] border-2 border-black"></span>
        </span>
      )}
    </a>
  );
}
