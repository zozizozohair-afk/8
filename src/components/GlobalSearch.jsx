'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Building2, Home, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function GlobalSearch({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ projects: [], units: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length < 1) {
        setResults({ projects: [], units: [] });
        return;
      }

      setLoading(true);
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, location, main_image, description')
          .or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5);
        if (projectsError) throw projectsError;

        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('id, type, project_id, size, model_details')
          .or(`type.ilike.%${searchTerm}%,model_details.ilike.%${searchTerm}%`)
          .limit(5);
        if (unitsError) throw unitsError;
        
        let unitsWithProjects = [];
        if (unitsData && unitsData.length > 0) {
            const projectIds = [...new Set(unitsData.map(u => u.project_id))];
            const { data: projectsForUnits } = await supabase
                .from('projects')
                .select('id, name')
                .in('id', projectIds);
            
            unitsWithProjects = unitsData.map(unit => ({
                ...unit,
                project_name: projectsForUnits?.find(p => p.id === unit.project_id)?.name || ''
            }));
        }

        setResults({
          projects: projectsData || [],
          units: unitsWithProjects || []
        });

      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleClose = () => {
    setSearchTerm('');
    setResults({ projects: [], units: [] });
    onClose();
  };

  const handleNavigate = (path) => {
    router.push(path);
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 dir-rtl [font-family:var(--font-cairo)]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div 
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] ring-1 ring-black/5"
          >
            <div className="p-4 border-b border-gray-100">
                <div className="relative flex items-center gap-3">
                    <Search className="text-gray-400 w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.25} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن مشروع، وحدة، حي..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-3 pr-12 pl-12 text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#B8953E]/20 transition-all font-medium"
                    />
                    <button 
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} strokeWidth={2.25} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin text-[#8B6A14]" strokeWidth={2.25} />
                            <span className="mr-3 text-sm font-semibold">جاري البحث...</span>
                        </div>
                    ) : (
                        searchTerm.length > 0 ? (
                            <div className="space-y-6">
                                {results.projects.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-extrabold text-gray-500 px-2 flex items-center gap-2 tracking-wide">
                                            <Building2 size={14} strokeWidth={2.25} />
                                            المشاريع
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {results.projects.map(project => (
                                                <div 
                                                    key={project.id}
                                                    onClick={() => handleNavigate(`/projects/${project.id}`)}
                                                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#B8953E]/5 cursor-pointer transition-colors group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                                        <img 
                                                            src={project.main_image || '/images/placeholder.jpg'} 
                                                            alt={project.name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-[#8B6A14] truncate tracking-tight">{project.name}</h4>
                                                        <p className="text-xs text-gray-500 truncate font-medium">{project.location}</p>
                                                    </div>
                                                    <ArrowRight size={16} className="text-gray-300 group-hover:text-[#8B6A14] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all rtl:rotate-180" strokeWidth={2.25} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.units.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-extrabold text-gray-500 px-2 flex items-center gap-2 tracking-wide">
                                            <Home size={14} strokeWidth={2.25} />
                                            الوحدات
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {results.units.map(unit => (
                                                <div 
                                                    key={unit.id}
                                                    onClick={() => handleNavigate(`/projects/${unit.project_id}`)}
                                            className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:border-[#B8953E]/30 hover:shadow-sm cursor-pointer transition-all bg-white group"
                                        >
                                            <div>
                                                <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-[#8B6A14] transition-colors tracking-tight">{unit.type}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5 font-medium">مشروع: {unit.project_name}</p>
                                                    </div>
                                                    {unit.size && (
                                                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-2xl border border-gray-100 font-semibold">
                                                            {unit.size} م²
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.projects.length === 0 && results.units.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm font-medium">لا توجد نتائج مطابقة لـ «{searchTerm}»</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400 text-sm opacity-60 font-light">
                                ابدأ الكتابة للبحث...
                            </div>
                        )
                    )}
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
