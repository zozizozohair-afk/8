'use client';
import { motion } from 'framer-motion';
import { Building2, Award, Users, Trophy, Target, Sparkles } from 'lucide-react';

const stats = [
  { label: "سنوات من التميز", value: "+4", icon: Trophy },
  { label: "مشروع نوعي", value: "+50", icon: Building2 },
  { label: "شريك نجاح", value: "+1000", icon: Users },
];

export default function About() {
  return (
    <section id="about" className="py-20 md:py-32 bg-white relative overflow-hidden dir-rtl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#B8860B]/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" />

      <div className="container-custom relative z-10 px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 text-right"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>رؤية تتجدد</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              نصنع المستقبل <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#D4AF37] to-[#B8860B]">في عالم العقار</span>
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed text-lg md:text-xl font-light">
              <p>
                انطلقت <span className="font-bold text-gray-900">صفوة عنان</span> في عام 2020 لتكون علامة فارقة في قطاع التطوير والتسويق العقاري. نحن لا نبني مجرد مساحات، بل نبتكر بيئات سكنية واستثمارية ترتقي بجودة الحياة.
              </p>
              <p>
                من خلال المزج بين الإدارة الاحترافية والرؤية العصرية، نجحنا في كسب ثقة عملائنا وشركائنا، مقدمين حلولاً عقارية مستدامة تضمن أعلى عوائد استثمارية وراحة سكنية.
              </p>
            </div>

            {/* Features */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Award, title: "جودة لا تضاهى", desc: "معايير عالمية في التنفيذ" },
                { icon: Target, title: "رؤية ثاقبة", desc: "استراتيجيات استثمارية مدروسة" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#D4AF37]/30 transition-colors">
                  <div className="p-3 bg-white rounded-lg shadow-sm text-[#D4AF37]">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visuals / Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 relative"
          >
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {/* Large Card - Vision */}
              <div className="col-span-2 bg-[#1a1a1a] text-white p-6 md:p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#D4AF37]/30 transition-colors" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Target className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">رؤيتنا ورسالتنا</h3>
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                    أن نكون الخيار الأول في الحلول العقارية المتكاملة، عبر الابتكار المستمر وبناء شراكات استراتيجية طويلة الأمد تحقق القيمة المضافة للجميع.
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -5 }}
                  className={`p-5 md:p-6 rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50 flex flex-col items-center justify-center text-center group hover:border-[#D4AF37]/30 transition-all ${index === 2 ? 'col-span-2 sm:col-span-1' : ''}`}
                >
                  <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-[#D4AF37] mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</span>
                  <span className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-[#D4AF37]/5 rounded-[3rem] -rotate-6" />
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] border border-[#D4AF37]/10 rounded-[3rem] rotate-3" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
