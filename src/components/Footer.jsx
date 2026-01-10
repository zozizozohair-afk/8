'use client';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, YoutubeIcon, Heart, Globe } from 'lucide-react';
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
    <footer className="bg-[#0a0a0a] text-white pt-24 pb-10 relative overflow-hidden border-t border-white/5">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient opacity-50" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20"
        >
          
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Link href="/" className="block w-28 h-28 bg-white/5 rounded-2xl flex items-center justify-center p-5 mb-8 hover:bg-white/10 transition-all duration-300 group">
              <img src="/images/logo.png" alt="صفوة عنان" className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
            </Link>
            <p className="text-gray-400 text-sm leading-loose mb-8 max-w-xs">
              شركة صفوة عنان للتسويق والتطوير العقاري. رؤية عصرية وحلول متكاملة لبناء مستقبل عقاري مستدام.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>, href: "#", color: "hover:bg-[#00f2ea]" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 4C12 4 15.3 4 15.3 7.8C15.3 9.1 14.9 9.5 14.2 9.8C14.2 9.8 13.9 9.9 13.9 10.4C13.9 10.8 14.3 11.1 14.5 11.2C14.5 11.2 15.5 11.9 15.5 14.1C15.5 15.9 14.5 16.3 13.4 16.3C13.4 16.3 13.1 16.3 13.1 16.8C13.1 17.3 14.1 17.4 14.9 17.7C15.6 18.1 16.6 18.9 15.5 20C14.5 21.1 12.6 20.4 12 20.4C11.4 20.4 9.5 21.1 8.5 20C7.4 18.9 8.4 18.1 9.1 17.7C9.9 17.4 10.9 17.3 10.9 16.8C10.9 16.3 10.6 16.3 9.5 16.3C8.5 16.3 7.5 15.9 7.5 14.1C7.5 11.9 8.5 11.2 8.5 11.2C8.7 11.1 9.1 10.8 9.1 10.4C9.1 9.9 8.8 9.8 8.8 9.8C8.1 9.5 7.7 9.1 7.7 7.8C7.7 4 11 4 11 4H12Z" /></svg>, href: "#", color: "hover:bg-[#FFFC00] hover:text-black" },
                { icon: <YoutubeIcon size={20} />, href: "#", color: "hover:bg-[#FF0000]" },
                { icon: <Instagram size={20} />, href: "#", color: "hover:bg-[#E1306C]" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 ${social.color} hover:text-white transition-all duration-300 hover:scale-110`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links (Site Map) */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-1 h-6 bg-accent rounded-full block"></span>
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
                  <Link href={link.href} className="text-gray-400 hover:text-accent transition-all duration-300 flex items-center gap-2 group w-fit">
                    <span className="w-1.5 h-1.5 bg-accent/50 rounded-full group-hover:bg-accent group-hover:w-3 transition-all duration-300"></span>
                    <span className="group-hover:translate-x-[-5px] transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-6 bg-gold-gradient rounded-full block"></span>
              <h4 className="text-xl font-bold">تواصل معنا</h4>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { 
                  icon: <Mail className="w-6 h-6" />, 
                  label: "البريد الإلكتروني", 
                  value: "marketing@safwat-anan.sa", 
                  href: "mailto:marketing@safwat-anan.sa" 
                },
                { 
                  icon: <Globe className="w-6 h-6" />, 
                  label: "الموقع الإلكتروني", 
                  value: "www.safwat-anan.sa", 
                  href: "https://safwat-anan.sa" 
                },
              ].map((info, idx) => (
                <a 
                  key={idx}
                  href={info.href}
                  className="bg-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    {info.icon}
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block mb-1">{info.label}</span>
                    <span className="text-white font-medium dir-ltr block">{info.value}</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} شركة صفوة عنان للتسويق والتطوير العقاري. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-accent transition-colors">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-accent transition-colors">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
