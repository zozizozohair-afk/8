'use client';
import { useState } from 'react';
import { ArrowUpLeft } from 'lucide-react';

const milestones = [
  { year: '2020', title: 'البداية، برؤية واضحة.', description: 'انطلقت صفوة عنان في قطاع التطوير والتسويق العقاري، لتبدأ حكاية تجمع المكان بالطموح.', label: 'التأسيس والانطلاق' },
  { year: '2022', title: 'خبرات تتسع مع المكان.', description: 'توسّع نطاق العمل ليشمل إدارة الأملاك والمرافق، إلى جانب التطوير والتسويق العقاري.', label: 'التوسع والنمو' },
  { year: '2024', title: 'أقرب إليك، رقميًا.', description: 'حضور رقمي يقرّب المشاريع والخدمات، ويجعل الوصول إلى المعلومات والتواصل أكثر سهولة.', label: 'التحول الرقمي' },
  { year: 'القادم', title: 'والحكاية تتجدد.', description: 'نواصل العمل على تطوير تجربتنا وخدماتنا، مع اهتمام بالتفاصيل وبناء علاقات تدوم.', label: 'نحو المستقبل' },
];

export default function Timeline() {
  const [selected, setSelected] = useState(0);
  const current = milestones[selected];
  return <section id="timeline" className="sf-journey sf-section" data-theme="dark" aria-labelledby="sf-journey-title"><div className="container-custom">
    <div className="sf-section-label"><span>04 / حكاية مستمرة</span><span lang="en" dir="ltr">ROOTED IN VISION. MOVING FORWARD.</span></div>
    <div className="sf-journey__heading"><h2 id="sf-journey-title">نكبر بالخبرة.<br /><em>ونقترب بالتفاصيل.</em></h2><p>من أول خطوة، إلى كل ما هو قادم.<br />محطات من حكاية صفوة عنان.</p></div>
    <div className="sf-journey__navigation" role="group" aria-label="محطات مسيرة صفوة عنان">{milestones.map((item, index) => <button key={item.year} aria-pressed={selected === index} aria-controls="sf-journey-story" onClick={() => setSelected(index)}><span>{item.year}</span><small>{item.label}</small><i aria-hidden="true" /></button>)}</div>
    <div className="sf-journey__story" id="sf-journey-story" aria-live="polite" aria-atomic="true"><span className="sf-journey__year" aria-hidden="true">{current.year}</span><div><span className="sf-kicker">{current.year} / {current.label}</span><h3>{current.title}</h3><p>{current.description}</p><a href="#contact">كن جزءًا من الحكاية <ArrowUpLeft size={18} aria-hidden="true" /></a></div><div className="sf-journey__image"><img src="/images/4.png" width="1536" height="1024" alt="تفاصيل واجهة سكنية مضاءة ليلًا" loading="lazy" /><span lang="en" dir="ltr">A VISION TO CALL HOME</span></div></div>
  </div></section>;
}
