'use client';
import { MapPin, ArrowRight, Navigation, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MapSection() {
  return (
    <section className="relative h-[600px] md:h-[700px] w-full overflow-hidden dir-rtl">
      
      {/* Full Background Map */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.847316623083!2d46.736397!3d24.774322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f01a4a3b6f9c7%3A0x8a5b6c4d0c9f3c1!2sSafwat%20Anan!5e0!3m2!1sar!2ssa!4v1700000000000"
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
      <div className="relative z-10 container-custom h-full flex flex-col justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-lg"
        >
          {/* Floating Glass Card */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#D4AF37]/30 transition-colors duration-500" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-xs font-bold mb-6 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <MapPin size={14} />
                <span>المقر الرئيسي</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                تفضل بزيارتنا <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#D4AF37] to-[#B8860B]">نصنع المستقبل معاً</span>
              </h2>
              
              <p className="text-gray-300 leading-relaxed mb-8 font-light">
                يسعدنا استقبالكم في مقرنا بالرياض لمناقشة طموحاتكم الاستثمارية والسكنية، وتقديم أفضل الحلول العقارية المبتكرة.
              </p>

              {/* Info Items */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 text-white/90 group/item">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-[#D4AF37]/50 transition-colors">
                    <Navigation size={18} className="text-[#D4AF37]" />
                  </div>
                  <span className="text-sm">الرياض، المملكة العربية السعودية</span>
                </div>
                
                <div className="flex items-center gap-4 text-white/90 group/item">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-[#D4AF37]/50 transition-colors">
                    <Clock size={18} className="text-[#D4AF37]" />
                  </div>
                  <span className="text-sm">السبت - الخميس: 9:00 ص - 10:00 م</span>
                </div>
              </div>

              {/* CTA Button */}
              <a 
                href="https://maps.app.goo.gl/ditz9KsxSeQ4L2bj8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full group flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-bold hover:bg-[#D4AF37] transition-all duration-300 shadow-lg"
              >
                <span>احصل على الاتجاهات</span>
                <ArrowRight size={18} className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
