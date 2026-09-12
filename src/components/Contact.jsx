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
    
    const { name, email, message } = formState;
    
    const whatsappMessage = `*استفسار جديد من الموقع الإلكتروني*
------------------------
*الاسم:* ${name}
*البريد الإلكتروني:* ${email}
------------------------
*الرسالة:*
${message}`.trim();

    const whatsappUrl = `https://wa.me/966570109444?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    
    setFormState({
      name: '',
      email: '',
      message: ''
    });
  };

  const handleCardClick = (item) => {
    if (item.type === 'phone') {
      setShowPhoneModal(true);
    } else if (item.type === 'email') {
      window.location.href = `mailto:${item.details[0]}`;
    } else if (item.type === 'address') {
      window.open('https://maps.app.goo.gl/3KkLHsdk6EKhaMVi8', '_blank');
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
    <section id="contact" className="py-32 bg-[#0f0f0f] relative overflow-hidden dir-rtl [font-family:var(--font-cairo)]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-[0.05] fixed-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#0f0f0f]/95 to-[#0f0f0f]" />
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B8953E]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#8B6A14]/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
             <div className="flex items-center justify-center gap-2 mb-4">
                 <Sparkles className="w-5 h-5 text-[#C9A84B]" strokeWidth={2.25} />
                 <span className="text-[#C9A84B] tracking-wider font-semibold">تواصل معنا</span>
                 <Sparkles className="w-5 h-5 text-[#C9A84B]" strokeWidth={2.25} />
             </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              نحن هنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B8953E] via-[#C9A84B] to-[#E0C16E]">لخدمتك</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed font-light">
              فريقنا جاهز للإجابة على استفساراتكم ومساعدتكم في تحقيق طموحاتكم العقارية.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                onClick={() => handleCardClick(item)}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1a1a1a]/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-[#C9A84B]/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer group hover:shadow-[0_10px_30px_rgba(201,168,75,0.1)]"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-[#B8953E]/10 rounded-2xl flex items-center justify-center shrink-0 text-[#C9A84B] group-hover:bg-gradient-to-b group-hover:from-[#B8953E] group-hover:via-[#8B6A14] group-hover:to-[#6B5210] group-hover:text-[#FAF3E0] transition-all duration-500 ring-1 ring-[#B8953E]/10">
                    <item.icon className="w-6 h-6" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold text-white mb-2 group-hover:text-[#C9A84B] transition-colors tracking-tight">{item.title}</h3>
                      <ExternalLink className="w-4 h-4 text-[#C9A84B] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.25} />
                    </div>
                    <div className="space-y-1">
                      {item.details.map((detail, idx) => (
                        <p 
                          key={idx} 
                          className={`text-gray-400 font-semibold group-hover:text-gray-200 transition-colors ${item.isLtr ? 'dir-ltr text-right' : ''}`}
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

          <motion.div 
            className="lg:col-span-3 bg-[#1a1a1a]/60 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/5 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B8953E] via-[#C9A84B] to-transparent opacity-60" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[#C9A84B] tracking-wide">الاسم الكامل</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-[#B8953E] focus:ring-1 focus:ring-[#B8953E] outline-none transition-all duration-300"
                    placeholder="الاسم"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[#C9A84B] tracking-wide">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    className="w-full px-5 py-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-[#B8953E] focus:ring-1 focus:ring-[#B8953E] outline-none transition-all duration-300"
                    placeholder="example@domain.com"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#C9A84B] tracking-wide">الرسالة</label>
                <textarea 
                  rows="5" 
                  className="w-full px-5 py-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-[#B8953E] focus:ring-1 focus:ring-[#B8953E] outline-none transition-all duration-300 resize-none"
                  placeholder="كيف يمكننا مساعدتك؟"
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] font-extrabold py-4 rounded-2xl hover:shadow-[0_0_25px_rgba(184,149,62,0.35)] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden ring-1 ring-[#B8953E]/30 tracking-wide"
              >
                <span className="relative z-10">إرسال الرسالة</span>
                <Send className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform rtl:rotate-180" strokeWidth={2.25} />
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>

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
              className="bg-[#1a1a1a] border border-[#B8953E]/20 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowPhoneModal(false)}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-2xl hover:bg-red-500/10"
              >
                <X size={20} strokeWidth={2.25} />
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-b from-[#B8953E]/15 to-[#6B5210]/10 rounded-2xl flex items-center justify-center text-[#C9A84B] mx-auto mb-4 ring-1 ring-[#B8953E]/20 shadow-[0_0_20px_rgba(184,149,62,0.1)]">
                  <Phone size={36} strokeWidth={2.25} />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">طريقة التواصل</h3>
                <p className="text-gray-400 mt-2 text-sm font-light">اختر الطريقة الأنسب لك للتواصل معنا</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-[#C9A84B]/30 transition-colors">
                  <p className="text-xs text-[#C9A84B] mb-2 text-center font-semibold tracking-wide">الجوال الموحد</p>
                  <p className="text-xl font-extrabold text-white text-center mb-5 dir-ltr tracking-wider">0570109444</p>
                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href="tel:0570109444"
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] hover:shadow-[0_0_15px_rgba(184,149,62,0.3)] transition-all font-extrabold text-sm ring-1 ring-[#B8953E]/30 tracking-wide"
                    >
                      <Phone size={16} strokeWidth={2.25} />
                      اتصال
                    </a>
                    <a 
                      href="https://wa.me/966570109444"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors font-extrabold text-sm shadow-lg shadow-[#25D366]/10 tracking-wide"
                    >
                      <MessageCircle size={16} strokeWidth={2.25} />
                      واتساب
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-[#C9A84B]/30 transition-colors">
                  <p className="text-xs text-[#C9A84B] mb-2 text-center font-semibold tracking-wide">الرقم الموحد</p>
                  <p className="text-xl font-extrabold text-white text-center mb-5 dir-ltr tracking-wider">92000-7936</p>
                  <a 
                    href="tel:920007936"
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all font-extrabold text-sm w-full tracking-wide"
                  >
                    <Phone size={16} strokeWidth={2.25} />
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
