import './ProjectLoading.css';

export default function ProjectLoading() {
  return <div className="pl-transition" role="status" aria-live="polite" aria-busy="true">
    <div className="pl-transition__grid" aria-hidden="true" />
    <div className="pl-transition__content"><img src="/images/logo.png" width="88" height="88" alt="صفوة عنان" /><span className="pl-transition__eyebrow" lang="en" dir="ltr">A PLACE. A POSSIBILITY.</span><div className="pl-transition__arch" aria-hidden="true"><i /><i /><i /></div><h1>خطوة أقرب،<br /><em>إلى عنوانك القادم.</em></h1><p>نحضّر لك تفاصيل المشروع</p><span className="pl-transition__line" aria-hidden="true"><i /></span></div>
    <span className="pl-transition__signature">صفوة عنان · مساحات تستحق الانتظار</span>
  </div>;
}
