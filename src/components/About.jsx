import { ArrowDownLeft } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="sf-intro sf-section" aria-labelledby="sf-intro-title">
      <div className="container-custom">
        <div className="sf-section-label"><span>01 / روح صفوة</span><span lang="en" dir="ltr">A CONSIDERED WAY OF LIVING</span></div>
        <div className="sf-intro__grid">
          <div className="sf-intro__heading">
            <span className="sf-kicker">المكان الذي تختاره، يصنع فرقًا.</span>
            <h2 id="sf-intro-title">بعض الأماكن نسكنها.<br /><span>وبعضها يُشبهنا.</span></h2>
            <a className="sf-text-link" href="#projects">اكتشف ما يشبهك <ArrowDownLeft size={20} aria-hidden="true" /></a>
          </div>
          <div className="sf-intro__story">
            <p>للبيت معنى يتجاوز المساحة. هو ضوء الصباح، وخصوصية العائلة، وتفاصيل صغيرة تصنع يومًا أفضل.</p>
            <p>منذ انطلاقتنا في 2020، تجمع صفوة عنان بين التطوير والتسويق وإدارة العقار؛ لنرافقك من أول اختيار، إلى ما بعد الاستقرار.</p>
            <div className="sf-intro__signature"><span className="sf-signature-mark" aria-hidden="true">ص</span><span>صفوة عنان<small>اختيارات مدروسة. لحياة تستحق.</small></span></div>
          </div>
        </div>
        <div className="sf-intro__visual">
          <img src="/images/1.jpg" alt="تفاصيل الواجهات والشرفات في أحد التصاميم السكنية المعروضة" width="1440" height="810" loading="lazy" />
          <div className="sf-intro__visual-note"><span>التفاصيل تصنع المكان</span><span lang="en" dir="ltr">THE ART OF FEELING AT HOME</span></div>
          <span className="sf-intro__seal" aria-hidden="true">حياة<br />تليق بك</span>
        </div>
        <div className="sf-principles">
          <div><span>01</span><p>المكان أولًا<small>موقع يلائم تفاصيل يومك</small></p></div>
          <div><span>02</span><p>مساحة لحياتك<small>خيارات سكنية باحتياجات مختلفة</small></p></div>
          <div><span>03</span><p>علاقة تستمر<small>تسويق وإدارة وعناية بالعقار</small></p></div>
        </div>
      </div>
    </section>
  );
}
