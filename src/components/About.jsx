'use client';
import { motion } from 'framer-motion';
import { Building2, Award, Users, Trophy, Target, Sparkles, Gem } from 'lucide-react';

const stats = [
  { label: "سنوات من التميز", value: "+4", icon: Trophy },
  { label: "مشروع نوعي", value: "+50", icon: Building2 },
  { label: "شريك نجاح", value: "+1000", icon: Users },
];

export default function About() {
  return (
    <section id="about" className="py-20 md:py-32 bg-white relative overflow-hidden dir-rtl [font-family:var(--font-cairo)]">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <div className="container-custom relative z-10 px-4 md:px-6">
        
        {/* Holder for both the outline frame + inner filled card (keeps them aligned perfectly) */}
        <div className="relative mx-auto max-w-[1400px]">

          {/* Decorative Outline Card - Slightly Larger, Border-Only (no fill) */}
          <div aria-hidden="true" className="pointer-events-none absolute -inset-3 md:-inset-4 rounded-[28px] border-2 border-[#8B6A14]/45 z-0" />

          {/* Single Grand Card - Antique Bronze Theme (Reduced Radius) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative z-10 rounded-[22px] overflow-hidden shadow-[0_50px_100px_-25px_rgba(74,56,10,0.35)]"
        >
          {/* Bronze Gradient Background + Texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#B8953E] via-[#8B6A14] to-[#6B5210]" />
          <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Inner Decorative Glow Circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C9A84B]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-[28rem] h-[28rem] bg-[#4A380A]/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_30%_20%,rgba(255,245,210,0.12),transparent_60%)]" />
          
          {/* Corner Frame - Top Right */}
          <div className="absolute top-8 right-8 md:top-10 md:right-10 w-14 h-14 z-20 opacity-60">
            <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-[#FFF3C4]/80 to-transparent" />
            <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-[#FFF3C4]/80 to-transparent" />
          </div>
          {/* Corner Frame - Bottom Left */}
          <div className="absolute bottom-8 left-8 md:bottom-10 md:left-10 w-14 h-14 z-20 opacity-60">
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FFF3C4]/70 to-transparent" />
            <div className="absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-[#FFF3C4]/70 to-transparent" />
          </div>

          {/* Inner Card Padding */}
          <div className="relative z-10 p-7 sm:p-10 md:p-14 lg:p-[90px]">

            {/* Section Header Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="flex justify-center mb-10 md:mb-12"
            >
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm text-[#FFF3C4] text-xs md:text-sm font-bold ring-1 ring-white/15 shadow-lg">
                <Gem className="w-4 h-4 fill-[#FFF3C4]/30" />
                <span className="tracking-[0.2em]">رؤية تتجدد</span>
                <Sparkles className="w-4 h-4 fill-[#FFF3C4]/30" />
              </div>
            </motion.div>

            {/* Main Title + Subtitle + Description (Top Block) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-14 md:mb-[90px]"
            >
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold text-white mb-6 md:mb-8 leading-[1.1] tracking-tight">
                نصنع المستقبل <br className="sm:hidden md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#FFF3C4] via-[#F0D98A] to-[#C9A84B]">في عالم العقار</span>
              </h2>

              <div className="max-w-3xl mx-auto space-y-4 md:space-y-5 text-[#FAF3E0] leading-relaxed text-sm sm:text-lg md:text-xl font-light opacity-90">
                <p>
                  انطلقت <span className="font-bold text-white">صفوة عنان</span> في عام 2020 لتكون علامة فارقة في قطاع التطوير والتسويق العقاري. نحن لا نبني مجرد مساحات، بل نبتكر بيئات سكنية واستثمارية ترتقي بجودة الحياة.
                </p>
                <p>
                  من خلال المزج بين الإدارة الاحترافية والرؤية العصرية، نجحنا في كسب ثقة عملائنا وشركائنا، مقدمين حلولاً عقارية مستدامة تضمن أعلى عوائد استثمارية وراحة سكنية.
                </p>
              </div>
            </motion.div>

            {/* =========================
                Row 1: Vision + Features
                ========================= */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 md:gap-7 mb-8 md:mb-10">
              
              {/* Vision Card (Dark Bronze, large) */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                viewport={{ once: true }}
                className="xl:col-span-3 p-6 md:p-9 rounded-[28px] bg-gradient-to-br from-[#3D2E08]/90 via-[#2A1F05]/85 to-[#1a1403]/80 backdrop-blur-md ring-1 ring-[#FFF3C4]/10 shadow-[inset_0_1px_0_rgba(255,243,196,0.08)]"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="p-4 bg-gradient-to-br from-[#8B6A14] to-[#6B5210] rounded-2xl ring-1 ring-[#C9A84B]/30 shadow-lg">
                    <Target className="w-6 h-6 md:w-7 md:h-7 text-[#FFF3C4]" strokeWidth={2.25} />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-[32px] font-extrabold text-white tracking-tight leading-none">رؤيتنا ورسالتنا</h3>
                    <div className="mt-2 h-[2px] w-16 rounded-full bg-gradient-to-l from-transparent via-[#C9A84B]/70 to-transparent" />
                  </div>
                </div>
                <p className="text-[#F5E7B8]/80 leading-loose text-sm md:text-lg font-light">
                  أن نكون الخيار الأول في الحلول العقارية المتكاملة، عبر الابتكار المستمر وبناء شراكات استراتيجية طويلة الأمد تحقق القيمة المضافة للجميع.
                </p>
              </motion.div>

              {/* Two Feature Cards */}
              <div className="xl:col-span-2 grid grid-cols-2 gap-5 md:gap-7">
                {[
                  { icon: Award, title: "جودة لا تضاهى", desc: "معايير عالمية في التنفيذ" },
                  { icon: Target, title: "رؤية ثاقبة", desc: "استراتيجيات استثمارية مدروسة" }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    viewport={{ once: true }}
                    className="p-5 md:p-6 rounded-[28px] bg-white/5 backdrop-blur-sm ring-1 ring-white/10 hover:bg-white/[0.08] hover:ring-[#FFF3C4]/25 transition-all duration-300 group shadow-inner shadow-black/20"
                  >
                    <div className="mb-4 md:mb-5 p-3.5 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 ring-1 ring-white/10 w-fit text-[#FFF3C4] group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-6 h-6 md:w-[26px] md:h-[26px]" strokeWidth={2.25} />
                    </div>
                    <h4 className="font-bold text-white mb-1.5 md:mb-2 text-sm md:text-lg tracking-tight">{item.title}</h4>
                    <p className="text-xs md:text-sm text-[#F5E7B8]/70 leading-relaxed font-light">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* =========================
                Row 2: Three Stats Cards
                ========================= */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-7">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.08 }}
                  whileHover={{ y: -4 }}
                  viewport={{ once: true }}
                  className="group relative p-6 md:p-8 rounded-[28px] bg-gradient-to-b from-white/[0.09] to-white/[0.02] backdrop-blur-sm ring-1 ring-white/10 overflow-hidden transition-all duration-300 hover:ring-[#FFF3C4]/30 hover:bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  {/* Top accent stripe */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-20 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-[#F0D98A]/60 to-transparent group-hover:via-[#FFF3C4] transition-colors" />
                  
                  <div className="flex flex-col items-center justify-center text-center relative z-10">
                    <stat.icon className="w-7 h-7 md:w-9 md:h-9 text-[#FFF3C4] mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_12px_rgba(240,217,138,0.35)]" strokeWidth={2.25} />
                    <span className="text-3xl md:text-5xl font-black text-white mb-1 md:mb-2 tracking-tight drop-shadow-sm">{stat.value}</span>
                    <span className="text-xs md:text-sm text-[#F5E7B8]/80 font-bold tracking-wide mt-1">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>
        </div> {/* /holder */}
      </div>
    </section>
  );
}
