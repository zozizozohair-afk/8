'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const scrollerRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);

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
          image: p.main_image || '/images/4.png',
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

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (loading) return;
    if (filteredItems.length === 0) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) return;

    const isMdUp = window.matchMedia?.('(min-width: 768px)')?.matches;
    if (isMdUp) return;

    let rafId = 0;
    let lastTs;
    const speedPxPerMs = 0.04;

    const tick = (ts) => {
      if (lastTs === undefined) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (!pausedRef.current) {
        el.scrollLeft += dt * speedPxPerMs;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
      window.cancelAnimationFrame(rafId);
    };
  }, [activeFilter, filteredItems.length, loading]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    pausedRef.current = false;
  }, [activeFilter, filteredItems.length, loading]);

  const pauseAutoScroll = () => {
    pausedRef.current = true;
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
    }
  };

  const scheduleResumeAutoScroll = () => {
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 1400);
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
          <>
            <div className="md:hidden -mx-6 sm:-mx-16">
              {filteredItems.length > 0 ? (
                <div
                  ref={scrollerRef}
                  dir="ltr"
                  onPointerDown={pauseAutoScroll}
                  onPointerUp={scheduleResumeAutoScroll}
                  onPointerCancel={scheduleResumeAutoScroll}
                  onMouseEnter={pauseAutoScroll}
                  onMouseLeave={scheduleResumeAutoScroll}
                  onTouchStart={pauseAutoScroll}
                  onTouchEnd={scheduleResumeAutoScroll}
                  className="overflow-x-auto scrollbar-hide px-6 sm:px-16"
                >
                  <div className="flex w-max gap-4 pb-2">
                    {filteredItems.concat(filteredItems).map((project, index) => (
                      <Link
                        key={`${project.id}-${index}`}
                        href={`/projects/${project.id}`}
                        dir="rtl"
                        className="block group w-[88vw] max-w-sm flex-shrink-0"
                      >
                        <div className="relative h-[390px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 bg-white border border-gray-200 ring-1 ring-black/5">
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

                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />

                          <div className="absolute inset-0 p-7 flex flex-col justify-end text-white">
                            <div className="absolute top-5 right-5">
                              <span className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide backdrop-blur-md border shadow-sm ${
                                project.rawStatus === 'ongoing' 
                                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-200' 
                                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                              }`}>
                                {project.status}
                              </span>
                            </div>

                            <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors duration-300 drop-shadow-[0_10px_25px_rgba(0,0,0,0.55)]">
                              {project.title}
                            </h3>

                            <div className="flex items-center text-gray-200 text-base mb-4">
                              <MapPin className="w-4 h-4 ml-1 text-accent" />
                              <span>{project.location}</span>
                            </div>

                            <div className="flex items-center gap-2 text-base font-bold text-white group-hover:text-accent transition-colors duration-300">
                              <span>استعراض التفاصيل</span>
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  لا توجد مشاريع في هذا القسم حالياً.
                </div>
              )}
            </div>

            <motion.div 
              layout
              className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
          </>
        )}
      </div>
    </section>
  );
}
