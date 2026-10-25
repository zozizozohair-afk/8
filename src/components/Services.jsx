'use client';
import { useState } from 'react';
import { ArrowUpLeft, Plus, Minus } from 'lucide-react';

const services = [
  { title: 'إدارة الأملاك', english: 'PROPERTY MANAGEMENT', description: 'عناية مستمرة بأصولك العقارية، من إدارة العلاقة مع المستأجرين وتحصيل الإيجارات، إلى متابعة العقود والحفاظ على قيمة العقار.', features: ['إدارة المستأجرين', 'متابعة العقود', 'تحصيل الإيجارات'] },
  { title: 'إدارة المرافق', english: 'FACILITY MANAGEMENT', description: 'نشرف على تفاصيل التشغيل اليومي للمباني والمرافق، وننظّم الأعمال التشغيلية لتحسين الاستخدام والعناية بالمكان.', features: ['الإشراف اليومي', 'تنظيم التشغيل', 'كفاءة الاستخدام'] },
  { title: 'الصيانة والأمن', english: 'CARE & MAINTENANCE', description: 'حلول صيانة دورية وطارئة وفق العقود المعتمدة، مع متابعة أنظمة الأمن والسلامة والاشتراطات اللازمة للعقار.', features: ['صيانة دورية وطارئة', 'أنظمة الأمن والسلامة', 'متابعة الاشتراطات'] },
  { title: 'تسويق العقارات', english: 'REAL ESTATE MARKETING', description: 'نُبرز ما يميّز عقارك ونوصله للجمهور المناسب؛ بخطط تسويقية وحملات رقمية ومحتوى يقدّم المكان كما يستحق.', features: ['الخطط التسويقية', 'الحملات الرقمية', 'إبراز مزايا العقار'] },
  { title: 'خدمات المكاتب', english: 'PARTNER SERVICES', description: 'نساند المكاتب العقارية في بناء حضورها الرقمي، وإدارة حملاتها وحساباتها، ودعم خطوات المبيعات.', features: ['الهوية الرقمية', 'إدارة الحسابات', 'دعم المبيعات'] },
];

export default function Services() {
  const [open, setOpen] = useState(0);
  return (
    <section id="services" className="sf-services sf-section" aria-labelledby="sf-services-title">
      <div className="container-custom">
        <div className="sf-section-label"><span>03 / ما وراء المكان</span><span lang="en" dir="ltr">CARE BEYOND THE ADDRESS</span></div>
        <div className="sf-services__grid">
          <div className="sf-services__intro"><span className="sf-kicker">من أول خطوة، إلى كل يوم بعدها.</span><h2 id="sf-services-title">عقار يُختار بعناية.<br /><em>ويُدار باهتمام.</em></h2><p>للمالك، والمستثمر، والباحث عن بيت.<br />خبرات متكاملة حول احتياجك.</p><a href="#contact" className="sf-text-link">لنتحدث عن احتياجك <ArrowUpLeft size={19} aria-hidden="true" /></a><span className="sf-services__wordmark" aria-hidden="true">عناية.</span></div>
          <div className="sf-services__list">
            {services.map((service, index) => (
              <div key={service.title} className={`sf-service ${open === index ? 'is-open' : ''}`}>
                <h3><button id={`sf-service-trigger-${index}`} aria-expanded={open === index} aria-controls={`sf-service-panel-${index}`} onClick={() => setOpen(open === index ? null : index)}><span className="sf-service__number">0{index + 1}</span><span>{service.title}<small lang="en" dir="ltr">{service.english}</small></span>{open === index ? <Minus size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}</button></h3>
                <div id={`sf-service-panel-${index}`} role="region" aria-labelledby={`sf-service-trigger-${index}`} hidden={open !== index} className="sf-service__body"><p>{service.description}</p><ul>{service.features.map(feature => <li key={feature}>{feature}</li>)}</ul><a href={`https://wa.me/966570109444?text=${encodeURIComponent(`مرحبًا، أرغب في الاستفسار عن ${service.title}`)}`} target="_blank" rel="noopener noreferrer">استفسر عن الخدمة <ArrowUpLeft size={17} aria-hidden="true" /></a></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
