'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    
    if (error) {
      alert(error.message);
    } else {
      onClose();
      router.push('/dashboard');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm dir-rtl [font-family:var(--font-cairo)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-border-light w-full max-w-md relative ring-1 ring-black/5"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-2xl hover:bg-gray-100"
          >
            <X size={24} strokeWidth={2.25} />
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-[#8B6A14] mb-2 tracking-tight">تسجيل الدخول</h1>
            <p className="text-secondary-text text-sm font-light">لوحة تحكم إدارة المشاريع</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#6B5210] mb-2 tracking-wide">البريد الإلكتروني</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#B8953E] focus:ring-1 focus:ring-[#B8953E] outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#6B5210] mb-2 tracking-wide">كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#B8953E] focus:ring-1 focus:ring-[#B8953E] outline-none transition-all"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] py-3 rounded-2xl font-extrabold hover:shadow-[0_0_20px_rgba(184,149,62,0.3)] transition-all disabled:opacity-50 ring-1 ring-[#B8953E]/30 tracking-wide"
            >
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
