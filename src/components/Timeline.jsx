'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Flag, TrendingUp, Lightbulb, Target, Sparkles, Building2, Users, Trophy } from 'lucide-react';

const timelineData = [
  { 
    year: "2020", 
    title: "التأسيس والانطلاق", 
    description: "انطلاقة قوية برؤية طموحة في عالم التطوير العقاري، مع تنفيذ أولى مشاريعنا الناجحة التي وضعت حجر الأساس لسمعتنا.", 
    icon: Flag 
  },
  { 
    year: "2022", 
    title: "التوسع والنمو", 
    description: "توسيع نطاق عملياتنا ليشمل إدارة الأملاك والمرافق، وبناء محفظة عقارية متنوعة تلبي احتياجات السوق المتنامية.", 
    icon: TrendingUp 
  },
  { 
    year: "2024", 
    title: "التحول الرقمي", 
    description: "إطلاق هويتنا الرقمية الجديدة ومنصاتنا التفاعلية، لتقديم تجربة عملاء سلسة وعصرية تواكب تطلعات المستقبل.", 
    icon: Lightbulb 
  },
  { 
    year: "المستقبل", 
    title: "الريادة والاستدامة", 
    description: "نسعى لنكون الخيار الأول في الحلول العقارية المبتكرة، مع التركيز على الاستدامة وبناء مجتمعات سكنية متكاملة.", 
    icon: Target 
  },
];

export default function Timeline() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} className="py-32 relative overflow-hidden bg-[#0f0f0f]">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03] fixed-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#0f0f0f]/95 to-[#0f0f0f]" />
      
      {/* Decorative Golden Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#B8860B]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
             <Sparkles className="w-5 h-5 text-[#D4AF37]" />
             <span className="text-[#D4AF37] tracking-wider font-medium">مسيرتنا</span>
             <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            تاريخ يصنعه <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F0E68C]">التميز</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            خطوات ثابتة نحو القمة، نكتب فيها قصة نجاح مستمرة برؤية واضحة وطموح لا يتوقف لخدمة عملائنا ومجتمعنا.
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-0">
          {/* Central Line */}
          <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 md:-translate-x-1/2 rounded-full overflow-hidden">
            <motion.div 
              style={{ scaleY, transformOrigin: "top" }} 
              className="w-full h-full bg-gradient-to-b from-[#D4AF37] via-[#F0E68C] to-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.5)]" 
            />
          </div>

          <div className="space-y-16 md:space-y-32 pb-12">
            {timelineData.map((item, index) => (
              <TimelineItem key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ item, index }) {
  const isEven = index % 2 === 0;
  const Icon = item.icon;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  return (
    <motion.div 
      ref={ref}
      style={{ opacity, y, scale }}
      className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Content Card */}
      <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-16">
        <div className="group relative bg-[#1a1a1a]/50 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:bg-[#1a1a1a]/80 hover:border-[#D4AF37]/30 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:-translate-y-2">
            
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/0 via-[#D4AF37]/0 to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

            {/* Year Badge */}
            <div className={`absolute -top-5 ${isEven ? 'md:left-8' : 'md:right-8'} right-8 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold px-6 py-2 rounded-full shadow-lg shadow-[#D4AF37]/20 z-10`}>
                {item.year}
            </div>

            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4 mt-2 group-hover:text-[#D4AF37] transition-colors">
                    {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-base group-hover:text-gray-300 transition-colors">
                    {item.description}
                </p>
            </div>

            {/* Decorative Corner */}
            <div className={`absolute bottom-0 ${isEven ? 'left-0' : 'right-0'} w-16 h-16 overflow-hidden opacity-50`}>
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#D4AF37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
            </div>
        </div>
      </div>

      {/* Center Icon Node */}
      <div className="absolute left-[3px] md:left-1/2 top-8 md:top-1/2 w-8 h-8 md:w-14 md:h-14 md:-translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center z-20">
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Pulse Effect */}
            <div className="absolute inset-0 bg-[#D4AF37] rounded-full animate-ping opacity-20" />
            
            {/* Icon Container */}
            <div className="relative w-full h-full bg-[#0f0f0f] border-2 border-[#D4AF37] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-4 h-4 md:w-6 md:h-6 text-[#D4AF37]" />
            </div>
        </div>
      </div>

      {/* Spacer for Desktop Balance */}
      <div className="w-full md:w-1/2 hidden md:block" />
    </motion.div>
  );
}
