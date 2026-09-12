'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] dir-rtl [font-family:var(--font-cairo)]">
      {/* Clean Background: Building Image + Soft Dark Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full bg-[url('/images/4.png')] bg-cover bg-center bg-no-repeat"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Main Content - Centered & Clean */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 container-custom h-full flex flex-col items-center justify-center px-4 md:px-10 lg:px-16 py-[calc(88px+3rem)] md:py-[calc(92px+3rem)]"
      >
        <div className="w-full max-w-3xl text-center mx-auto">
        
        {/* Floating Label - Formal Rounded Corners */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8 md:mb-10 px-5 py-2.5 rounded-2xl border border-[#8B6A14]/40 bg-black/45 backdrop-blur-md text-[#B8953E] text-[10px] md:text-xs tracking-wider uppercase inline-flex items-center gap-3 shadow-[0_0_25px_rgba(139,106,20,0.12)] group hover:bg-black/55 transition-colors cursor-default"
        >
          <Star className="w-3 h-3 fill-[#8B6A14] animate-pulse" />
          <span className="font-bold tracking-widest">مفهوم جديد للسكن الفاخر</span>
          <Star className="w-3 h-3 fill-[#8B6A14] animate-pulse delay-75" />
        </motion.div>

        {/* Main Title - Massive & Elegant */}
        <div className="relative mb-7 md:mb-9">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold text-white tracking-tight leading-[0.95]"
          >
            صفوة <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#B8953E] via-[#8B6A14] to-[#4A380A]">عنان</span>
          </motion.h1>
          
          {/* Decorative Line Animation - Bronze Muted */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
            className="h-[1.5px] bg-gradient-to-r from-transparent via-[#8B6A14] to-transparent w-3/4 md:w-2/3 mx-auto mt-5 opacity-60"
          />
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-6 md:mt-8 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-xl md:max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg"
        >
          نبتكر مساحات سكنية تتناغم فيها <span className="text-white font-semibold">الفخامة</span> مع <span className="text-white font-semibold">الراحة</span>، لنقدم لك تجربة حياة استثنائية في قلب المملكة.
        </motion.p>

        {/* CTA Button - Single Clean Action */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1.2 }}
           className="mt-10 md:mt-14"
        >
          <a href="#projects" className="group relative inline-flex items-center gap-3 px-9 md:px-11 py-4 md:py-[18px] bg-gradient-to-br from-[#8B6A14] to-[#6B5210] text-[#FAF3E0] font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_45px_-10px_rgba(139,106,20,0.55)] hover:scale-[1.03] hover:from-[#9C7C20] hover:to-[#7A6212] ring-1 ring-[#8B6A14]/30">
            <span className="relative z-10 text-sm md:text-base md:text-[17px] tracking-wide">استكشف مشاريعنا</span>
            <ArrowRight className="w-5 h-5 md:w-[22px] md:h-[22px] relative z-10 rtl:rotate-180 transition-transform group-hover:-translate-x-1" />
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
        </motion.div>

        {/* Scroll Indicator - Minimal */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
            <span className="text-[10px] text-white/50 uppercase tracking-[0.25em]">تصفح المزيد</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0 overflow-hidden">
                <motion.div 
                    animate={{ y: [-20, 20] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-full h-1/2 bg-white/80 blur-[1px]"
                />
            </div>
        </motion.div>

        </div>
      </motion.div>

      {/* Curved Bottom Divider - White, Smooth Curve: Left 0px → Right 50px Up */}
      <svg 
        className="absolute bottom-0 left-0 right-0 z-30 w-full" 
        viewBox="0 0 1440 50" 
        preserveAspectRatio="none"
        style={{ height: '50px' }}
      >
        <path 
          fill="#ffffff" 
          d="M0,50 L0,50 C480,50 960,0 1440,0 L1440,50 Z"
        />
      </svg>
    </section>
  );
}
