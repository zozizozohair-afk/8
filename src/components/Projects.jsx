'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowUpRight, Loader2, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'ongoing', label: 'قيد الإنشاء' },
  { id: 'completed', label: 'مكتمل' },
];

export default function Projects() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, location, status, main_image')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const mapped = data.map((p) => ({
          id: p.id,
          title: p.name || 'مشروع',
          location: p.location || 'غير محدد',
          status: p.status === 'ongoing' ? 'قيد الإنشاء' : p.status === 'completed' ? 'مكتمل' : 'قريباً',
          rawStatus: p.status, // For filtering
          image: p.main_image || '/images/4.jpg',
        }));
        setItems(mapped);
        setFilteredItems(mapped);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.rawStatus === activeFilter));
    }
  }, [activeFilter, items]);

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section id="projects" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              مشاريعنا <span className="text-accent">المتميزة</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              نستعرض لكم نخبة من مشاريعنا العقارية التي تجمع بين التصميم العصري والموقع الاستراتيجي لتلبية تطلعاتكم.
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-gold-gradient text-white shadow-lg shadow-accent/25'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        ) : (
          <motion.div 
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode='popLayout'>
              {filteredItems.length > 0 ? (
                filteredItems.map((project) => (
                  <motion.div
                    layout
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/projects/${project.id}`} className="block group h-full">
                      <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white">
                        {/* Image */}
                        <div className="absolute inset-0 bg-gray-200">
                          {!imageErrors[project.id] ? (
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={() => handleImageError(project.id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 flex-col gap-3">
                              <Building2 className="w-10 h-10 text-gray-300" />
                              <span className="text-gray-400 text-sm">صورة غير متوفرة</span>
                            </div>
                          )}
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                        {/* Content */}
                        <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                          {/* Status Badge */}
                          <div className="absolute top-6 right-6">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md border ${
                              project.rawStatus === 'ongoing' 
                                ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' 
                                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                            }`}>
                              {project.status}
                            </span>
                          </div>

                          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors duration-300">
                              {project.title}
                            </h3>

                            <div className="flex items-center text-gray-300 text-sm mb-6">
                              <MapPin className="w-4 h-4 ml-1 text-accent" />
                              <span>{project.location}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-medium text-white group-hover:text-accent transition-colors duration-300 opacity-0 group-hover:opacity-100 delay-75">
                              <span>استعراض التفاصيل</span>
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-gray-500">
                  لا توجد مشاريع في هذا القسم حالياً.
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
