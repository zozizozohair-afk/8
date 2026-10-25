'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowDownLeft, MapPin, ArrowDown } from 'lucide-react';

const destinations = [
  { number: '01', title: 'مشاريعنا السكنية', description: 'تعرّف على وجهتك القادمة', href: '#projects' },
  { number: '02', title: 'اختر مساحتك', description: 'استعرض نماذج الوحدات', href: '#unit-models' },
  { number: '03', title: 'نرافقك في اختيارك', description: 'تواصل مع فريقنا', href: '#contact' },
];

export default function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="estate-hero" aria-labelledby="hero-heading" data-theme="dark">
      <div className="estate-hero__scene">
        <img
          src="/images/4.png"
          alt="واجهة سكنية معاصرة بإضاءة دافئة وأشجار النخيل"
          className="estate-hero__image"
          fetchPriority="high"
          width="1536"
          height="1024"
        />
        <div className="estate-hero__shade" aria-hidden="true" />

        <div className="container-custom estate-hero__layout">
          <motion.div
            className="estate-hero__content"
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="estate-hero__eyebrow"><span aria-hidden="true" /> صفوة عنان للتسويق والتطوير العقاري</p>
            <h1 id="hero-heading">للحياة عنوان.<br /><span>ولك صفوة الاختيار.</span></h1>
            <p className="estate-hero__description">
              مساحات تشبه طموحك، وتفاصيل تستحقها.<br className="hidden sm:block" /> اكتشف خياراتنا السكنية في الرياض، وابدأ حكاية بيتك القادم.
            </p>
            <div className="estate-hero__actions">
              <a href="#projects" className="estate-hero__primary">اكتشف مشاريعنا <ArrowLeft size={19} aria-hidden="true" /></a>
              <a href="#contact" className="estate-hero__secondary">تحدّث مع مستشارنا <ArrowDownLeft size={18} aria-hidden="true" /></a>
            </div>
          </motion.div>

          <div className="estate-hero__caption">
            <span className="estate-hero__location"><MapPin size={15} aria-hidden="true" /> الرياض، المملكة العربية السعودية</span>
            <a href="#about" className="estate-hero__scroll">تعرّف على صفوة عنان <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
        </div>
        <span className="estate-hero__vertical" aria-hidden="true">SAFWAT ANAN · REAL ESTATE</span>
      </div>

      <nav className="estate-hero__destinations" aria-label="ابدأ رحلتك العقارية">
        <div className="container-custom estate-hero__destination-grid">
          {destinations.map((item) => (
            <a key={item.number} href={item.href} className="estate-hero__destination">
              <span className="estate-hero__number" aria-hidden="true">{item.number}</span>
              <span className="estate-hero__destination-copy"><strong>{item.title}</strong><span>{item.description}</span></span>
              <ArrowDownLeft size={22} aria-hidden="true" />
            </a>
          ))}
        </div>
      </nav>
    </section>
  );
}
