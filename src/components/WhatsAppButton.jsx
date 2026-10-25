'use client';
import { MessageCircle } from 'lucide-react';
import { companyContact } from '@/lib/companyContact.mjs';

export default function WhatsAppButton() {
  return <a href={`${companyContact.whatsapp}?text=${encodeURIComponent('مرحبًا، أستفسر عن مشاريع صفوة عنان العقارية.')}`} target="_blank" rel="noopener noreferrer" aria-label="تواصل مع صفوة عنان عبر واتساب" className="sf-whatsapp"><MessageCircle size={25} strokeWidth={1.7} aria-hidden="true" /><span>لنتحدث عن اختيارك</span></a>;
}
