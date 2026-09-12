'use client';
import Link from 'next/link';
import { Facebook, Instagram, Mail, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="bg-[#0a0a0a] text-white pt-24 pb-10 relative overflow-hidden border-t border-white/5 dir-rtl [font-family:var(--font-cairo)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B8953E] via-[#C9A84B] to-transparent opacity-50" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#B8953E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#8B6A14]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20"
        >
          
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Link href="/" className="block w-28 h-28 bg-white/5 rounded-2xl flex items-center justify-center p-5 mb-8 hover:bg-white/10 transition-all duration-300 group ring-1 ring-white/5 hover:ring-[#B8953E]/20">
              <img src="/images/logo.png" alt="صفوة عنان" className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
            </Link>
            <p className="text-gray-400 text-sm leading-loose mb-8 max-w-xs font-light">
              شركة صفوة عنان للتسويق والتطوير العقاري. رؤية عصرية وحلول متكاملة لبناء مستقبل عقاري مستدام.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>, href: "https://www.tiktok.com/@safwat.sm", color: "hover:bg-[#00f2ea]" },
                { icon: <Facebook size={20} strokeWidth={2.25} />, href: "https://www.facebook.com/share/1DqmY6KymN/?mibextid=wwXIfr", color: "hover:bg-[#1877F2]" },
                { icon: <Instagram size={20} strokeWidth={2.25} />, href: "https://www.instagram.com/safwoat.sm/", color: "hover:bg-[#E1306C]" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-gray-400 ${social.color} hover:text-white transition-all duration-300 hover:scale-110 ring-1 ring-white/5`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-extrabold text-white mb-8 flex items-center gap-3 tracking-tight">
              <span className="w-1 h-6 bg-gradient-to-b from-[#B8953E] via-[#8B6A14] to-[#6B5210] rounded-2xl block"></span>
              خريطة الموقع
            </h3>
            <ul className="space-y-4">
              {[
                { name: "الرئيسية", href: "/" },
                { name: "من نحن", href: "#about" },
                { name: "خدماتنا", href: "#services" },
                { name: "مشاريعنا", href: "#projects" },
                { name: "نماذج الوحدات", href: "#models" },
                { name: "تواصل معنا", href: "#contact" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-gray-400 hover:text-[#C9A84B] transition-all duration-300 flex items-center gap-2 group w-fit">
                    <span className="w-1.5 h-1.5 bg-[#8B6A14]/50 rounded-2xl group-hover:bg-gradient-to-b group-hover:from-[#B8953E] group-hover:via-[#8B6A14] group-hover:to-[#6B5210] group-hover:w-3 transition-all duration-300"></span>
                    <span className="group-hover:translate-x-[-5px] transition-transform font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-6 bg-gradient-to-b from-[#B8953E] via-[#8B6A14] to-[#6B5210] rounded-2xl block"></span>
              <h4 className="text-xl font-extrabold tracking-tight">تواصل معنا</h4>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { 
                  icon: <Mail className="w-6 h-6" strokeWidth={2.25} />, 
                  label: "البريد الإلكتروني", 
                  value: "marketing@safwat-anan.sa", 
                  href: "mailto:marketing@safwat-anan.sa" 
                },
                { 
                  icon: <Globe className="w-6 h-6" strokeWidth={2.25} />, 
                  label: "الموقع الإلكتروني", 
                  value: "www.safwat-anan.sa", 
                  href: "https://safwat-anan.sa" 
                },
              ].map((info, idx) => (
                <a 
                  key={idx}
                  href={info.href}
                  className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all duration-300 group ring-1 ring-white/5 hover:ring-[#B8953E]/20"
                >
                  <div className="w-12 h-12 bg-gradient-to-b from-[#B8953E]/15 to-[#6B5210]/10 rounded-2xl flex items-center justify-center text-[#C9A84B] group-hover:scale-110 transition-transform ring-1 ring-[#B8953E]/15">
                    {info.icon}
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block mb-1 font-semibold">{info.label}</span>
                    <span className="text-white font-medium dir-ltr block">{info.value}</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p className="font-light">© {currentYear} شركة صفوة عنان للتسويق والتطوير العقاري. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#C9A84B] transition-colors font-medium">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-[#C9A84B] transition-colors font-medium">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
