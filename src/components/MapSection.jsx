'use client';
import { MapPin, ArrowRight, Navigation, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MapSection() {
  return (
    <section className="relative h-[100vh] md:h-[700px] w-full overflow-hidden dir-rtl [font-family:var(--font-cairo)]">
      
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src="https://maps.google.com/maps?q=24.6407164,46.8435758&hl=ar&z=17&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full [filter:grayscale(1)_invert(0.92)_contrast(1.15)_brightness(0.9)_saturate(0.9)]"
          title="موقع شركة صفوة عنان"
        ></iframe>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
      </div>

      <div className="relative z-10 container-custom h-full flex flex-col justify-end md:justify-center px-6 pb-8 md:pb-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-lg pointer-events-auto"
        >
          <div className="p-4 md:p-10 relative group">
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] text-[10px] md:text-xs font-extrabold mb-4 md:mb-6 shadow-[0_0_15px_rgba(184,149,62,0.4)] ring-1 ring-[#B8953E]/30 tracking-wide">
                <MapPin size={12} className="md:w-3.5 md:h-3.5" strokeWidth={2.25} />
                <span>المقر الرئيسي</span>
              </div>

              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 md:mb-4 leading-tight drop-shadow-[0_8px_25px_rgba(0,0,0,0.5)] tracking-tight">
                تفضل بزيارتنا <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#B8953E] via-[#C9A84B] to-[#E0C16E]">نصنع المستقبل معاً</span>
              </h2>
              
              <p className="hidden md:block text-white/80 text-sm md:text-base leading-relaxed mb-6 md:mb-8 font-light">
                يسعدنا استقبالكم في مقرنا بالرياض لمناقشة طموحاتكم الاستثمارية والسكنية، وتقديم أفضل الحلول العقارية المبتكرة.
              </p>

              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div className="flex items-center gap-3 md:gap-4 text-white/90 group/item">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-black/60 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300 ring-1 ring-white/10">
                    <Navigation size={14} className="text-[#C9A84B] md:w-[18px] md:h-[18px]" strokeWidth={2.25} />
                  </div>
                  <span className="text-xs md:text-sm font-medium">الرياض، المملكة العربية السعودية</span>
                </div>
                
                <div className="flex items-center gap-3 md:gap-4 text-white/90 group/item">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-black/60 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300 ring-1 ring-white/10">
                    <Clock size={14} className="text-[#C9A84B] md:w-[18px] md:h-[18px]" strokeWidth={2.25} />
                  </div>
                  <span className="text-xs md:text-sm font-medium">السبت - الخميس: 9:00 ص - 10:00 م</span>
                </div>
              </div>

              <a 
                href="https://maps.app.goo.gl/3KkLHsdk6EKhaMVi8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full group flex items-center justify-center gap-2 md:gap-3 bg-white/10 text-white border border-white/20 backdrop-blur-md py-3 md:py-4 rounded-2xl font-extrabold hover:bg-gradient-to-r hover:from-[#B8953E] hover:via-[#8B6A14] hover:to-[#6B5210] hover:text-[#FAF3E0] hover:border-transparent transition-all duration-300 shadow-lg text-sm md:text-base ring-1 ring-white/5 hover:ring-[#B8953E]/30 tracking-wide"
              >
                <span>احصل على الاتجاهات</span>
                <ArrowRight size={16} className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform md:w-[18px] md:h-[18px]" strokeWidth={2.25} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
