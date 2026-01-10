'use client';
import { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle, X, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formState);
  };

  const handleCardClick = (item) => {
    if (item.type === 'phone') {
      setShowPhoneModal(true);
    } else if (item.type === 'email') {
      window.location.href = `mailto:${item.details[0]}`;
    } else if (item.type === 'address') {
      window.open('https://maps.app.goo.gl/pVDXxh6RvbsfU6QY7', '_blank');
    }
  };

  const contactInfo = [
    {
      type: 'phone',
      icon: Phone,
      title: "اتصل بنا",
      details: ["0570109444"],
      isLtr: true
    },
    {
      type: 'email',
      icon: Mail,
      title: "راسلنا عبر البريد",
      details: ["marketing@safwat-anan.sa"],
      isLtr: true
    },
    {
      type: 'address',
      icon: MapPin,
      title: "زورونا في مقرنا",
      details: ["المملكة العربية السعودية", " الرياض"],
      isLtr: false
    }
  ];

  return (
    <section id="contact" className="py-32 bg-[#0f0f0f] relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-[0.05] fixed-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#0f0f0f]/95 to-[#0f0f0f]" />
      
      {/* Golden Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#B8860B]/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
             <div className="flex items-center justify-center gap-2 mb-4">
                 <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                 <span className="text-[#D4AF37] tracking-wider font-medium">تواصل معنا</span>
                 <Sparkles className="w-5 h-5 text-[#D4AF37]" />
             </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              نحن هنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F0E68C]">لخدمتك</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              فريقنا جاهز للإجابة على استفساراتكم ومساعدتكم في تحقيق طموحاتكم العقارية.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Contact Info Side */}
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                onClick={() => handleCardClick(item)}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1a1a1a]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer group hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)]"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center shrink-0 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-500">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">{item.title}</h3>
                      <ExternalLink className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1">
                      {item.details.map((detail, idx) => (
                        <p 
                          key={idx} 
                          className={`text-gray-400 font-medium group-hover:text-gray-200 transition-colors ${item.isLtr ? 'dir-ltr text-right' : ''}`}
                        >
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Form Side */}
          <motion.div 
            className="lg:col-span-3 bg-[#1a1a1a]/60 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Form Glow */}
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[#D4AF37]">الاسم الكامل</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all duration-300"
                    placeholder="الاسم"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[#D4AF37]">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all duration-300"
                    placeholder="example@domain.com"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-[#D4AF37]">الرسالة</label>
                <textarea 
                  rows="5" 
                  className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all duration-300 resize-none"
                  placeholder="كيف يمكننا مساعدتك؟"
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <span className="relative z-10">إرسال الرسالة</span>
                <Send className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Phone Options Modal */}
      <AnimatePresence>
        {showPhoneModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowPhoneModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowPhoneModal(false)}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] mx-auto mb-4 ring-1 ring-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                  <Phone size={36} />
                </div>
                <h3 className="text-xl font-bold text-white">طريقة التواصل</h3>
                <p className="text-gray-400 mt-2 text-sm">اختر الطريقة الأنسب لك للتواصل معنا</p>
              </div>

              <div className="space-y-4">
                {/* Mobile Number Actions */}
                <div className="p-5 rounded-xl bg-black/40 border border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                  <p className="text-xs text-[#D4AF37] mb-2 text-center font-medium">الجوال الموحد</p>
                  <p className="text-xl font-bold text-white text-center mb-5 dir-ltr tracking-wider">0570109444</p>
                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href="tel:0570109444"
                      className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#D4AF37] text-black hover:bg-[#c5a028] transition-colors font-bold text-sm shadow-lg shadow-[#D4AF37]/10"
                    >
                      <Phone size={16} />
                      اتصال
                    </a>
                    <a 
                      href="https://wa.me/966570109444"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors font-bold text-sm shadow-lg shadow-[#25D366]/10"
                    >
                      <MessageCircle size={16} />
                      واتساب
                    </a>
                  </div>
                </div>

                {/* Unified Number Actions */}
                <div className="p-5 rounded-xl bg-black/40 border border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                  <p className="text-xs text-[#D4AF37] mb-2 text-center font-medium">الرقم الموحد</p>
                  <p className="text-xl font-bold text-white text-center mb-5 dir-ltr tracking-wider">92000-7936</p>
                  <a 
                    href="tel:920007936"
                    className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold text-sm w-full"
                  >
                    <Phone size={16} />
                    اتصال
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
