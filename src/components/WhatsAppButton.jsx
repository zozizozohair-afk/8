'use client';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  const phoneNumber = '966570109444'; // رقم صفوة عنان
  const message = 'مرحباً، أستفسر عن مشاريع صفوة عنان العقارية.';

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-[#25D366]/40 hover:shadow-2xl transition-all duration-300 group"
      aria-label="تواصل عبر واتساب"
    >
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      <MessageCircle size={28} strokeWidth={2.5} />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1 bg-white text-black text-sm font-bold rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        تواصل معنا
      </span>
    </motion.button>
  );
}
