'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, Megaphone, Hotel, Home, CheckCircle2, Award, AwardIcon } from 'lucide-react';

const services = [
  {
    icon: Home,
    title: "إدارة الأملاك",
    description: "نقدم خدمات متكاملة لإدارة الأملاك العقارية تشمل إدارة العلاقة مع المستأجرين، تحصيل الإيجارات، متابعة العقود، والحفاظ على قيمة الأصل العقاري وتعظيم العائد الاستثماري.",
    features: ["تحصيل الإيجارات", "متابعة العقود", "إدارة المستأجرين"],
    action: "اطلب الخدمة"
  },
  {
    icon: Hotel,
    title: "إدارة المرافق",
    description: "إدارة وتشغيل المرافق بكفاءة عالية لضمان استدامة المباني وجودة التشغيل، وتشمل الإشراف اليومي، تنظيم الأعمال التشغيلية، وتحسين كفاءة الاستخدام.",
    features: ["إشراف يومي", "تشغيل مستدام", "كفاءة استخدام"],
    action: "تواصل معنا"
  },
  {
    icon: CheckCircle2,
    title: "الصيانة والأمن",
    description: "نوفر حلول صيانة شاملة وفق عقود معتمدة تشمل الصيانة الدورية والطارئة، أنظمة الأمن والسلامة، والالتزام بالاشتراطات والأنظمة المعتمدة.",
    features: ["صيانة دورية", "أنظمة أمنية", "مطابقة للاشتراطات"],
    action: "احصل على عرض"
  },
  {
    icon: Megaphone,
    title: "تسويق العقارات",
    description: "نقدم خدمات تسويق احترافية للعقارات السكنية والتجارية تشمل إعداد الخطط التسويقية، التسويق الرقمي، إدارة الإعلانات، وإبراز المزايا التنافسية للعقار.",
    features: ["خطط تسويقية", "تسويق رقمي", "إدارة إعلانات"],
    action: "ابدأ حملتك"
  },
  {
    icon: AwardIcon,
    title: "خدمات المكاتب",
    description: "خدمات مخصصة لمكاتب العقار تشمل إدارة الحملات التسويقية، إنشاء الهوية الرقمية، إدارة الحسابات في منصات العقار، ودعم المبيعات وتحسين الظهور.",
    features: ["هوية رقمية", "إدارة حسابات", "دعم مبيعات"],
    action: "تعاون معنا"
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-primary mb-6"
          >
            خدماتنا <span className="text-gold-gradient">المتكاملة</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-gray-600 text-lg leading-relaxed"
          >
            نقدم مجموعة شاملة من الخدمات العقارية والفندقية المصممة لتلبية احتياجاتك بأعلى معايير الجودة والاحترافية.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl p-8 border border-[#D4AF37]/10 shadow-sm hover:shadow-xl hover:border-[#B8860B]/30 transition-all duration-500 relative flex flex-col h-full overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent group-hover:via-[#B8860B] transition-all duration-700" />
              
              <div className="mb-6 relative">
                <div className="w-14 h-14 bg-gold-gradient rounded-2xl flex items-center justify-center group-hover:bg-[#B8860B] group-hover:scale-110 transition-all duration-500 shadow-lg shadow-[#D4AF37]/20">
                  <service.icon className="w-7 h-7 text-white transition-colors duration-500" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#D4AF37] mb-4 group-hover:text-[#B8860B] transition-colors duration-300">
                {service.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                {service.description}
              </p>

              <div className="space-y-4 mb-8">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    {feature}
                  </div>
                ))}
              </div>

              <a 
                    href={`https://wa.me/966570109444?text=أهلاً، أرغب في الاستفسار عن ${service.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                className="inline-flex items-center justify-between w-full px-6 py-3 rounded-xl bg-[#D4AF37] text-white font-medium group-hover:bg-[#B8860B] transition-all duration-300 mt-auto shadow-md shadow-[#D4AF37]/20"
              >
                <span>{service.action}</span>
                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
