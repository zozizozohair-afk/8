'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { normalizeSearch, formatNumber } from '@/lib/unitCatalog.mjs';
import ProjectForm from '@/components/admin/ProjectForm';
import InterestRequests from '@/components/admin/InterestRequests';
import UserRoles from '@/components/admin/UserRoles';
import NavigationDialog from '@/components/NavigationDialog';
import { Plus, LayoutGrid, List, Search, Pencil, Trash2, Building2, LogOut, ArrowUpLeft, ArrowRight, RefreshCw, Inbox, Clock3, CheckCheck, MapPin, ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react';
import '@/components/Header.css';
import './Dashboard.css';

const statusLabels = { upcoming: 'قريبًا', ongoing: 'قيد الإنشاء', completed: 'مكتمل' };
export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [access, setAccess] = useState({ userId: null, role: null, loading: true, error: false });
  const [accessRetry, setAccessRetry] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRequests, setNewRequests] = useState(null);
  const [view, setView] = useState('grid');
  const [section, setSection] = useState('projects');
  const [editingProject, setEditingProject] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('latest');
  const [deleting, setDeleting] = useState(null);
  const [confirmation, setConfirmation] = useState('');
  const [busyDelete, setBusyDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [notice, setNotice] = useState('');
  const alive = useRef(true);
  const loadVersion = useRef(0);
  const deletePending = useRef(false);
  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true); setError('');
    try {
      const [result, count] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('interest_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      ]);
      if (!alive.current || version !== loadVersion.current) return;
      setNewRequests(count.error ? null : count.count);
      if (result.error) throw result.error;
      setProjects(result.data || []);
    } catch { if (alive.current && version === loadVersion.current) setError('تعذّر تحميل المشاريع. تحقق من الاتصال ثم أعد المحاولة.'); }
    finally { if (alive.current && version === loadVersion.current) setLoading(false); }
  }, []);
  useEffect(() => {
    alive.current = true;
    let observedAuthEvent = false;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive.current || observedAuthEvent) return;
      if (sessionError || !data.session) router.replace('/');
      else setSession(data.session);
    }).catch(() => { if (alive.current && !observedAuthEvent) router.replace('/'); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      observedAuthEvent = true;
      if (!alive.current) return;
      setSession(next);
      if (!next) router.replace('/');
    });
    return () => { alive.current = false; ++loadVersion.current; subscription.unsubscribe(); };
  }, [router]);
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const check = async () => {
      try {
        const result = await supabase.rpc('current_admin_role');
        if (result.error) throw result.error;
        if (!cancelled) {
          const role = ['owner','manager','staff'].includes(result.data) ? result.data : null;
          setAccess({ userId, role, loading: false, error: false });
          if (role === 'staff') { setSection('interest'); setView('grid'); setEditingProject(null); }
          else if (role !== 'owner') setSection(previous => previous === 'users' ? 'projects' : previous);
        }
      } catch { if (!cancelled) setAccess({ userId, role: null, loading: false, error: true }); }
    };
    setAccess({ userId, role: null, loading: true, error: false });
    check();
    const refresh = () => { check(); };
    window.addEventListener('focus', refresh);
    const interval = setInterval(refresh, 60000);
    return () => { cancelled = true; clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, [userId, accessRetry]);
  const role = access.userId === userId ? access.role : null;
  const canManage = role === 'owner' || role === 'manager';
  useEffect(() => { if (userId && role) load(); }, [userId, role, load]);
  const logout = async () => {
    setLoggingOut(true); setNotice('');
    try { const { error: logoutError } = await supabase.auth.signOut(); if (logoutError) throw logoutError; router.replace('/'); }
    catch { setNotice('تعذّر تسجيل الخروج. أعد المحاولة.'); setLoggingOut(false); }
  };
  const removeProject = async () => {
    if (!canManage || deletePending.current || !deleting || confirmation.trim() !== deleting.name.trim()) return;
    deletePending.current = true; setBusyDelete(true); setDeleteError('');
    try {
      const { data, error: removeError } = await supabase.from('projects').delete().eq('id', deleting.id).select('id').single();
      if (removeError || !data) throw new Error('Delete failed');
      setProjects(previous => previous.filter(project => project.id !== deleting.id));
      setDeleting(null); setConfirmation(''); setNotice('تم حذف المشروع.');
    } catch { setDeleteError('لم يتم حذف المشروع. تحقق من الصلاحيات والاتصال ثم حاول مجددًا.'); }
    finally { deletePending.current = false; setBusyDelete(false); }
  };
  const navigate = next => { if ((next === 'projects' && !canManage) || (next === 'users' && role !== 'owner')) return; setSection(next); setView('grid'); setEditingProject(null); setNotice(''); };
  const edit = project => { if (!canManage) return; setEditingProject(project); setView('form'); setNotice(''); };
  const filtered = projects.filter(project => (status === 'all' || project.status === status) && (!query.trim() || normalizeSearch(`${project.name} ${project.location || ''} ${project.description || ''}`).includes(normalizeSearch(query))));
  if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  else if (sort === 'oldest') filtered.reverse();
  if (!session) return <main className="ad-loading" role="status"><img src="/images/logo.png" width="62" height="62" alt="صفوة عنان" /><Loader2 size={22} className="ad-spin" aria-hidden="true" /><p>نحضّر مساحة الإدارة…</p></main>;
  if (access.userId !== userId || access.loading) return <main className="ad-loading" role="status"><Loader2 className="ad-spin"/><p>نتحقق من صلاحياتك…</p></main>;
  if (!role) return <main className="ad-loading"><ShieldCheck size={35}/><h1>{access.error ? 'تعذّر التحقق من الصلاحيات' : 'لا تملك صلاحية إدارية'}</h1><p>{access.error ? 'تحقق من اتصالك ثم أعد المحاولة.' : 'اطلب من مالك النظام تعيين دور لحسابك.'}</p><button onClick={() => setAccessRetry(n => n + 1)}>إعادة التحقق</button><button onClick={logout} disabled={loggingOut}>تسجيل الخروج</button>{notice && <p role="alert">{notice}</p>}<Link href="/">العودة للموقع</Link></main>;
  return <div className="ad-shell">
    <aside className="ad-sidebar"><Link href="/" className="ad-brand"><img src="/images/logo.png" width="46" height="46" alt="" /><span>صفوة عنان<small>مساحة الإدارة</small></span></Link><span className="ad-sidebar__label">مساحة عملك</span><nav aria-label="أقسام الإدارة">{canManage && <button aria-current={section === 'projects' ? 'page' : undefined} onClick={() => navigate('projects')}><Building2 size={19} /><span>إدارة المشاريع</span><ChevronLeft size={15} /></button>}<button aria-current={section === 'interest' ? 'page' : undefined} onClick={() => navigate('interest')}><Inbox size={19} /><span>طلبات الاهتمام</span>{newRequests !== null && newRequests > 0 && <b>{formatNumber(newRequests)}</b>}</button>{role === 'owner' && <button aria-current={section === 'users' ? 'page' : undefined} onClick={() => navigate('users')}><ShieldCheck size={19}/><span>المستخدمون والصلاحيات</span></button>}</nav><div className="ad-sidebar__bottom"><div><ShieldCheck size={17} /><span>{({owner: 'مالك النظام', manager: 'مدير', staff: 'موظف متابعة'})[role]}<small>أهلًا بفريق صفوة عنان</small></span></div><Link href="/" target="_blank" rel="noopener noreferrer">معاينة الموقع <ArrowUpLeft size={16} /></Link><button onClick={logout} disabled={loggingOut}><LogOut size={16} />{loggingOut ? 'جارٍ الخروج…' : 'تسجيل الخروج'}</button></div><span className="ad-sidebar__signature" lang="en">A PLACE. A POSSIBILITY.</span></aside>
    <div className="ad-workspace"><header className="ad-topbar"><div><span>صفوة عنان</span><ChevronLeft size={12} /><span>{section === 'users' ? 'المستخدمون والصلاحيات' : section === 'interest' ? 'طلبات الاهتمام' : view === 'form' ? 'تحرير مشروع' : 'إدارة المشاريع'}</span></div><Link href="/" target="_blank" rel="noopener noreferrer">الموقع <ArrowUpLeft size={15} /></Link></header>
      <main className="ad-main"><div className="ad-heading"><div><span className="ad-kicker">{section === 'users' ? 'فريقك، بصلاحيات واضحة' : section === 'interest' ? 'علاقات تبدأ باهتمام' : view === 'form' ? 'تفاصيل تصنع المكان' : 'نظرة واضحة. إدارة أسهل.'}</span><h1>{section === 'users' ? 'إدارة الفريق والصلاحيات.' : section === 'interest' ? 'كل اهتمام، فرصة جديدة.' : view === 'form' ? (editingProject ? editingProject.name : 'مشروع جديد.') : 'مشاريعك، في مكان واحد.'}</h1><p>{section === 'users' ? 'عيّن الأدوار وحدّد من يدير المحتوى ومن يتابع العملاء.' : section === 'interest' ? 'تابع الطلبات ونظّم خطوات التواصل مع عملائك.' : view === 'form' ? 'أكمل بيانات المشروع، ثم نظّم صوره وأقسامه ووحداته.' : 'حدّث مشاريعك، راجع محتواها، وابقَ قريبًا من عملائك.'}</p></div>{canManage && section === 'projects' && view !== 'form' && <button className="ad-primary" onClick={() => edit(null)}><Plus size={17} />إضافة مشروع</button>}</div>
      {notice && <p className="ad-notice" role="status">{notice}</p>}
      {section === 'users' && role === 'owner' ? <UserRoles currentUserId={userId} /> : section === 'interest' || !canManage ? <InterestRequests /> : view === 'form' ? <><div className="ad-editor-toolbar"><button onClick={() => { setView('grid'); setEditingProject(null); load(); }}><ArrowRight size={16} />العودة إلى المشاريع</button>{editingProject && <Link href={`/projects/${editingProject.id}`} target="_blank" rel="noopener noreferrer">معاينة المشروع <ArrowUpLeft size={15} /></Link>}</div><div className="ad-editor"><ProjectForm key={editingProject?.id || 'new'} project={editingProject} onSuccess={() => { setView('grid'); load(); }} /></div></> : <>
        <div className="ad-stats"><div><span><Building2 size={17} />إجمالي المشاريع</span><strong>{loading || error ? '—' : formatNumber(projects.length)}</strong><small>مشاريعك المسجّلة</small></div><div><span><Clock3 size={17} />قيد الإنشاء</span><strong>{loading || error ? '—' : formatNumber(projects.filter(project => project.status === 'ongoing').length)}</strong><small>مشاريع في طور الإنجاز</small></div><div><span><CheckCheck size={17} />مشاريع مكتملة</span><strong>{loading || error ? '—' : formatNumber(projects.filter(project => project.status === 'completed').length)}</strong><small>مسجّلة بحالة مكتمل</small></div><button onClick={() => navigate('interest')}><span><Inbox size={17} />اهتمامات جديدة<ArrowUpLeft size={14} /></span><strong>{loading || newRequests === null ? '—' : formatNumber(newRequests)}</strong><small>{newRequests === null && !loading ? 'افتح الطلبات للتحقق' : 'بانتظار خطوة التواصل'}</small></button></div>
        <section className="ad-projects" aria-labelledby="ad-projects-title"><div className="ad-collection-heading"><div><h2 id="ad-projects-title">مجموعة المشاريع</h2><span>{loading ? 'جارٍ التحديث…' : `${formatNumber(filtered.length)} من ${formatNumber(projects.length)} مشروع`}</span></div><button onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'ad-spin' : ''} />تحديث</button></div><div className="ad-toolbar"><label className="ad-search"><Search size={18} /><span className="sr-only">البحث في المشاريع</span><input type="search" placeholder="ابحث باسم المشروع أو الحي…" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="ad-select"><span className="sr-only">حالة المشروع</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">كل الحالات</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="ad-select"><span className="sr-only">ترتيب المشاريع</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="latest">الأحدث أولًا</option><option value="oldest">الأقدم أولًا</option><option value="name">حسب الاسم</option></select></label><div className="ad-view" role="group" aria-label="طريقة عرض المشاريع"><button aria-label="عرض بطاقات" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid size={17} /></button><button aria-label="عرض قائمة" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={18} /></button></div></div>
        {error ? <div className="ad-empty" role="alert"><Building2 size={32} /><h3>تعذّر تحديث المشاريع.</h3><p>{error}</p><button className="ad-primary" onClick={load}>إعادة المحاولة <RefreshCw size={15} /></button></div> : loading ? <div className="ad-skeletons" role="status" aria-label="تحميل المشاريع">{[1,2,3].map(value => <div key={value}><i /><span /><span /></div>)}</div> : !filtered.length ? <div className="ad-empty"><Building2 size={35} strokeWidth={1.2} /><h3>{projects.length ? 'لم نجد مشروعًا بهذا الاختيار.' : 'أول مشروع، يبدأ من هنا.'}</h3><p>{projects.length ? 'جرّب اسمًا آخر أو اعرض جميع الحالات.' : 'أضف مشروعك الأول ليظهر ضمن مجموعة صفوة عنان.'}</p><button className="ad-primary" onClick={() => { if (projects.length) { setQuery(''); setStatus('all'); } else edit(null); }}>{projects.length ? 'مسح التصفية' : 'إضافة مشروع'}<Plus size={16} /></button></div> : <div className={`ad-project-grid ${view === 'list' ? 'is-list' : ''}`}>{filtered.map(project => <article className="ad-project" key={project.id}><div className="ad-project__image">{project.main_image ? <img src={project.main_image} alt={project.name} loading="lazy" /> : <Building2 size={36} strokeWidth={1} />}<span className={`ad-status ad-status--${project.status}`}>{statusLabels[project.status] || 'غير محدد'}</span></div><div className="ad-project__body"><span className="ad-project__location"><MapPin size={12} />{project.location || 'الموقع غير محدد'}{project.start_year && <small>{project.start_year}</small>}</span><h3><button onClick={() => edit(project)}>{project.name}</button></h3><p>{project.description || 'أضف وصفًا يعرّف الزائر بهذا المشروع.'}</p></div><div className="ad-project__actions"><button onClick={() => edit(project)}><Pencil size={14} />تحرير المشروع</button><Link href={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer" aria-label={`معاينة ${project.name}`} title="معاينة المشروع"><ArrowUpLeft size={17} /></Link><button className="ad-delete" aria-label={`حذف ${project.name}`} onClick={() => { setDeleting(project); setConfirmation(''); setDeleteError(''); }}><Trash2 size={15} /></button></div></article>)}</div>}
        </section></>}
        <footer className="ad-footer"><span>صفوة عنان · مساحة الإدارة</span><span lang="en" dir="ltr">CONSIDERED IN EVERY DETAIL.</span></footer>
      </main>
    </div>
    {deleting && <NavigationDialog title="تأكيد حذف المشروع" className="ad-delete-dialog" onClose={() => { if (!busyDelete) setDeleting(null); }}><Trash2 size={28} strokeWidth={1.2} /><h2>حذف المشروع؟</h2><p>سيُحذف «{deleting.name}» من المشاريع. لا يمكن التراجع عن هذا الإجراء من لوحة التحكم.</p><label>اكتب اسم المشروع للتأكيد<input value={confirmation} disabled={busyDelete} onChange={event => setConfirmation(event.target.value)} autoComplete="off" /></label>{deleteError && <p role="alert">{deleteError}</p>}<div><button onClick={() => setDeleting(null)} disabled={busyDelete}>الاحتفاظ بالمشروع</button><button onClick={removeProject} disabled={busyDelete || confirmation.trim() !== deleting.name.trim()}>{busyDelete ? 'جارٍ الحذف…' : 'حذف نهائي'}</button></div></NavigationDialog>}
  </div>;
}
