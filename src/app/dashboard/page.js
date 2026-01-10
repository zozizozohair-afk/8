'use client';
import { useState, useEffect } from 'react';
import { supabase, supabaseUrl } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/admin/ProjectForm';
import { Plus, LayoutGrid, List, Search, Edit, Trash2, Building, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const [view, setView] = useState('list'); // 'list', 'grid', 'form'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/');
      } else {
        setSession(session);
        fetchProjects();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/');
        setSession(null);
      } else {
        setSession(session);
        fetchProjects();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchProjects = async () => {
    try {
        setLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        setProjects(data || []);
    } catch (error) {
        console.error('Error fetching projects:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDelete = async (id) => {
      if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
      
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) {
          setProjects(prev => prev.filter(p => p.id !== id));
      }
  };

  if (!session) {
      return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-cairo">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="صفوة عنان" className="h-10 w-auto object-contain" />
            <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
            <h1 className="text-xl font-medium text-primary">لوحة التحكم</h1>
            <span className="ml-3 px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">{supabaseUrl}</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-sm text-secondary-text hidden md:block">
                {session.user.email}
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="تسجيل خروج"
            >
                <LogOut size={20} />
            </button>
        </div>
      </nav>

      <main className="container-custom py-8">
        {view === 'form' ? (
            <div className="max-w-5xl mx-auto">
                <button 
                    onClick={() => { setView('list'); setEditingProject(null); }}
                    className="mb-6 text-sm text-secondary-text hover:text-primary flex items-center gap-2"
                >
                    ← العودة للقائمة
                </button>
                <ProjectForm 
                    project={editingProject} 
                    onSuccess={() => { setView('list'); fetchProjects(); }} 
                />
            </div>
        ) : (
            <>
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="بحث عن مشروع..." 
                            className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:border-accent outline-none bg-white"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                            <button 
                                onClick={() => setView('list')}
                                className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400'}`}
                            >
                                <List size={20} />
                            </button>
                            <button 
                                onClick={() => setView('grid')}
                                className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-400'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                        </div>

                        <button 
                            onClick={() => { setEditingProject(null); setView('form'); }}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex-1 md:flex-none justify-center"
                        >
                            <Plus size={20} />
                            <span>مشروع جديد</span>
                        </button>
                        <button 
                            onClick={async () => {
                                try {
                                    const testProject = { name: 'مشروع اختبار ' + new Date().toLocaleTimeString(), location: 'الرياض', status: 'upcoming' };
                                    const { data, error } = await supabase.from('projects').insert(testProject).select().single();
                                    
                                    if (error) throw error;
                                    
                                    alert(`✅ نجح الاتصال!\n\nتم الاتصال بـ: ${supabaseUrl}\nتم إنشاء مشروع برقم: ${data.id}\n\nيرجى تحديث الصفحة لرؤية المشروع.`);
                                    fetchProjects();
                                } catch (err) {
                                    alert(`❌ فشل الاتصال:\n${err.message}`);
                                    console.error(err);
                                }
                            }}
                            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-primary hover:border-accent"
                        >
                            فحص الربط
                        </button>
                    </div>
                </div>

                {/* Projects List */}
                {loading ? (
                    <div className="text-center py-20">جاري التحميل...</div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Building className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">لا توجد مشاريع حتى الآن</h3>
                        <p className="text-gray-400 mb-6">ابدأ بإضافة أول مشروع عقاري</p>
                        <button 
                            onClick={() => setView('form')}
                            className="text-accent hover:underline"
                        >
                            إضافة مشروع جديد
                        </button>
                    </div>
                ) : (
                    <div className={view === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                        {projects.map((project) => (
                            <motion.div 
                                key={project.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`bg-white border border-border-light rounded-xl overflow-hidden hover:border-accent/50 transition-all group ${view === 'list' ? 'flex items-center p-4 gap-6' : 'flex flex-col'}`}
                            >
                                <div className={`${view === 'list' ? 'w-24 h-24 rounded-lg' : 'w-full h-48'} bg-gray-100 relative overflow-hidden flex-shrink-0`}>
                                    {project.main_image ? (
                                        <img src={project.main_image} alt={project.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Building size={24} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium text-primary">
                                        {project.status === 'upcoming' ? 'قريباً' : project.status === 'ongoing' ? 'قيد الإنشاء' : 'مكتمل'}
                                    </div>
                                </div>

                                <div className="flex-grow p-4 md:p-0">
                                    <h3 className="text-lg font-medium text-primary group-hover:text-accent transition-colors">{project.name}</h3>
                                    <p className="text-sm text-secondary-text mb-2 flex items-center gap-1">
                                        <span>{project.location}</span>
                                        {project.start_year && <span>• {project.start_year}</span>}
                                    </p>
                                    <p className="text-xs text-gray-400 line-clamp-2">{project.description}</p>
                                </div>

                                <div className={`flex items-center gap-2 ${view === 'grid' ? 'p-4 border-t border-gray-100 justify-end' : ''}`}>
                                    <button 
                                        onClick={() => { setEditingProject(project); setView('form'); }}
                                        className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(project.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </>
        )}
      </main>
    </div>
  );
}
