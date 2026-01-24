'use client';
import { MapPin, ArrowRight, Navigation, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MapSection() {
  return (
    <section className="relative h-[100vh] md:h-[700px] w-full overflow-hidden dir-rtl">
      
      {/* Full Background Map */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src="https://maps.google.com/maps?q=24.6407164,46.8435758&hl=ar&z=17&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full grayscale-[100%] contrast-[1.1] opacity-70"
          title="موقع شركة صفوة عنان"
        ></iframe>
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container-custom h-full flex flex-col justify-end md:justify-center px-6 pb-8 md:pb-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-lg pointer-events-auto"
        >
          {/* Content Wrapper */}
          <div className="p-4 md:p-10 relative group">
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[#D4AF37] text-black text-[10px] md:text-xs font-bold mb-4 md:mb-6 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <MapPin size={12} className="md:w-3.5 md:h-3.5" />
                <span>المقر الرئيسي</span>
              </div>

              <h2 className="text-2xl md:text-4xl font-bold text-black mb-3 md:mb-4 leading-tight">
                تفضل بزيارتنا <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#D4AF37] to-[#B8860B]">نصنع المستقبل معاً</span>
              </h2>
              
              <p className="hidden md:block text-gray-800 text-sm md:text-base leading-relaxed mb-6 md:mb-8 font-light">
                يسعدنا استقبالكم في مقرنا بالرياض لمناقشة طموحاتكم الاستثمارية والسكنية، وتقديم أفضل الحلول العقارية المبتكرة.
              </p>

              {/* Info Items */}
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div className="flex items-center gap-3 md:gap-4 text-black/90 group/item">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                    <Navigation size={14} className="text-[#D4AF37] md:w-[18px] md:h-[18px]" />
                  </div>
                  <span className="text-xs md:text-sm font-medium">الرياض، المملكة العربية السعودية</span>
                </div>
                
                <div className="flex items-center gap-3 md:gap-4 text-black/90 group/item">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                    <Clock size={14} className="text-[#D4AF37] md:w-[18px] md:h-[18px]" />
                  </div>
                  <span className="text-xs md:text-sm font-medium">السبت - الخميس: 9:00 ص - 10:00 م</span>
                </div>
              </div>

              {/* CTA Button */}
              <a 
                href="https://maps.app.goo.gl/3KkLHsdk6EKhaMVi8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full group flex items-center justify-center gap-2 md:gap-3 bg-white text-black py-3 md:py-4 rounded-xl font-bold hover:bg-[#D4AF37] transition-all duration-300 shadow-lg text-sm md:text-base"
              >
                <span>احصل على الاتجاهات</span>
                <ArrowRight size={16} className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform md:w-[18px] md:h-[18px]" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
