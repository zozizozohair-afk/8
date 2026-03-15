'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ArrowLeft, CheckCircle2, BedDouble, Bath, Home, ArrowUpRight, Eye, MapPin, X, CalendarCheck, Search, Filter, Tag, ArrowDown, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function UnitModels() {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('الكل');
  const [visibleCount, setVisibleCount] = useState(8);
  const scrollerRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchUnits = async () => {
      const { data } = await supabase
        .from('units')
        .select(`
          id, unit_number, type, size, price, status, main_image, model_details, model_count,
          projects ( name, location, link )
        `)
        .order('created_at', { ascending: false });

      if (data) {
        const mapped = data.map((u) => ({
          id: u.id,
          title: u.unit_number || 'نموذج سكني',
          type: u.type || 'وحدة سكنية',
          area: u.size || '-',
          price: u.price ? Number(u.price).toLocaleString() : '-',
          image: u.main_image || '/images/4.png',
          status: u.status === 'available' ? 'متاح' : u.status === 'reserved' ? 'محجوزة' : 'مباعة',
          details: u.model_details || '',
          count: u.model_count ?? null,
          projectName: u.projects?.name || 'مشروع مساكن',
          location: u.projects?.location || null,
          locationLink: u.projects?.link || null
        }));
        setUnits(mapped);
      }
    };

    fetchUnits();
  }, []);

  // Extract unique projects
  const projects = ['الكل', ...new Set(units.map(u => u.projectName).filter(Boolean))];

  // Filter units based on search and project selection
  const filteredUnits = units.filter(unit => {
    const matchesProject = selectedProject === 'الكل' || unit.projectName === selectedProject;
    
    if (!matchesProject) return false;

    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      unit.title?.toLowerCase().includes(searchLower) ||
      unit.details?.toLowerCase().includes(searchLower) ||
      unit.price?.toString().replace(/,/g, '').includes(searchLower) ||
      unit.projectName?.toLowerCase().includes(searchLower) ||
      unit.location?.toLowerCase().includes(searchLower) ||
      unit.type?.toLowerCase().includes(searchLower) ||
      unit.area?.toString().includes(searchLower)
    );
  });

  const availableCount = filteredUnits.filter((u) => u.status === 'متاح').length;
  const showLoadMore = filteredUnits.length > visibleCount;
  const mobileUnits = filteredUnits.slice(0, visibleCount);
  const mobileCards = mobileUnits.map((unit) => ({ type: 'unit', unit }));
  if (showLoadMore) mobileCards.push({ type: 'loadMore' });
  const loopCards = mobileCards.concat(mobileCards);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (mobileCards.length < 2) return;

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
  }, [mobileCards.length, selectedProject, searchTerm, visibleCount]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    pausedRef.current = false;
  }, [selectedProject, searchTerm, visibleCount, filteredUnits.length]);

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
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4AF37]/3 -skew-x-12 translate-x-1/3 pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              نماذج <span className="text-gold-gradient">الوحدات السكنية</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
              اختر وحدتك بسهولة، قارن المساحة والسعر، وتواصل معنا للحجز والمعاينة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right mb-8">
              <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                  <Filter size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">مقارنة سريعة</div>
                  <div className="text-sm font-bold text-primary">مساحة، سعر، نوع</div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                  <CalendarCheck size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">حجز واستفسار</div>
                  <div className="text-sm font-bold text-primary">مباشر عبر واتساب</div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">مواقع المشاريع</div>
                  <div className="text-sm font-bold text-primary">خرائط ومعلومات</div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-5 max-w-2xl mx-auto mb-6 md:mb-8">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-xs md:text-sm text-gray-500">
                  عرض <span className="font-bold text-primary">{filteredUnits.length}</span> نموذج
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  متاح الآن <span className="font-bold text-emerald-600">{availableCount}</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن وحدة، سعر، مساحة، أو مشروع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 md:py-4 pr-10 md:pr-12 pl-5 md:pl-6 bg-white rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all text-sm md:text-base text-gray-700 placeholder:text-xs md:placeholder:text-base"
                />
                <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} className="md:w-5 md:h-5" />
                </div>
              </div>
            </div>

            {/* Project Filters */}
            <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible justify-start md:justify-center gap-2 md:gap-3 mb-6 md:mb-8 pb-2 md:pb-0 scrollbar-hide px-4 md:px-0 -mx-4 md:mx-0">
              {projects.map((project) => (
                <button
                  key={project}
                  onClick={() => setSelectedProject(project)}
                  className={`
                    whitespace-nowrap flex-shrink-0
                    px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[11px] md:text-sm font-medium transition-all duration-300
                    ${selectedProject === project 
                      ? 'bg-primary text-white shadow-md md:shadow-lg shadow-primary/25 scale-105' 
                      : 'bg-white text-gray-600 border border-gray-100 hover:border-accent/50 hover:bg-gray-50 shadow-sm'
                    }
                  `}
                >
                  {project}
                </button>
              ))}
            </div>

          </motion.div>
        </div>

        <div className="md:hidden -mx-6 sm:-mx-16">
          {filteredUnits.length > 0 ? (
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
                {loopCards.map((card, index) => (
                  <div key={`${card.type}-${card.unit?.id ?? 'more'}-${index}`} dir="rtl" className="w-[82vw] max-w-sm flex-shrink-0">
                    {card.type === 'unit' ? (
                      <UnitCard
                        unit={card.unit}
                        index={index}
                        onPreview={() => setSelectedUnit(card.unit)}
                        onImageClick={() => setPreviewImage(card.unit.image)}
                      />
                    ) : (
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 4)}
                        className="w-full h-full min-h-[340px] sm:min-h-[380px] bg-white rounded-2xl border border-dashed border-gray-300 hover:border-accent/60 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-3 text-primary"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                          <ArrowDown className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-bold">عرض المزيد من النماذج</div>
                        <div className="text-xs text-gray-500">اسحب للوصول ثم اضغط</div>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-6 sm:px-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج مطابقة</h3>
              <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تغيير الفلتر</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedProject('الكل'); }}
                className="mt-4 text-[#D4AF37] hover:underline font-medium"
              >
                إعادة تعيين البحث
              </button>
            </div>
          )}
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredUnits.length > 0 ? (
            <>
              {filteredUnits.slice(0, visibleCount).map((unit, index) => (
                <UnitCard 
                  key={unit.id} 
                  unit={unit} 
                  index={index} 
                  onPreview={() => setSelectedUnit(unit)}
                  onImageClick={() => setPreviewImage(unit.image)}
                />
              ))}
            </>
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج مطابقة</h3>
              <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تغيير الفلتر</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedProject('الكل'); }}
                className="mt-4 text-[#D4AF37] hover:underline font-medium"
              >
                إعادة تعيين البحث
              </button>
            </div>
          )}
        </div>
        
        {filteredUnits.length > visibleCount && (
          <div className="hidden md:block mt-12 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 4)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary border border-gray-200 rounded-full hover:bg-gray-50 hover:border-accent/30 transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <span className="font-medium">عرض المزيد من النماذج</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}

        <div className="mt-16 text-center">
            <a 
              href="#contact" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20"
            >
                <span className="font-medium">تواصل معنا للمزيد</span>
                <ArrowLeft className="w-4 h-4" />
            </a>
        </div>
      </div>

      {/* Unit Details Modal */}
      <AnimatePresence>
        {selectedUnit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUnit(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedUnit(null)}
                className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Image Section */}
              <div className="md:w-1/2 relative h-64 md:h-auto bg-gray-100 cursor-pointer group" onClick={() => setPreviewImage(selectedUnit.image)}>
                <img 
                  src={selectedUnit.image} 
                  alt={selectedUnit.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="text-white drop-shadow-md" size={32} />
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold text-primary shadow-sm">
                  {selectedUnit.projectName}
                </div>
              </div>

              {/* Details Section */}
              <div className="md:w-1/2 p-8 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUnit.status === 'متاح' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {selectedUnit.status}
                  </span>
                  <span className="text-gray-400 text-sm">#{selectedUnit.type}</span>
                </div>

                <h3 className="text-3xl font-bold text-primary mb-4">{selectedUnit.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-gray-400 text-xs mb-1">المساحة</span>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Maximize2 size={18} className="text-accent" />
                      <span>{selectedUnit.area} م²</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <span className="block text-gray-400 text-xs mb-1">السعر التقريبي</span>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <span className="text-lg">{selectedUnit.price}</span>
                      <span className="text-xs font-normal">ر.س</span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-gray-800 mb-2">التفاصيل</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedUnit.details || 'يتميز هذا النموذج بتصميم عصري فريد يجمع بين الفخامة والعملية، مع استغلال أمثل للمساحات لتوفير الراحة القصوى للسكان.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  {(selectedUnit.locationLink || selectedUnit.location) && (
                    <a 
                      href={selectedUnit.locationLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedUnit.location)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin size={18} className="text-accent" />
                      موقع المشروع على الخريطة
                    </a>
                  )}
                  
                  <a 
                      href={buildUnitWhatsAppUrl(selectedUnit, 'حجز')}
                      target="_blank" 
                      rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <CalendarCheck size={18} />
                    احجز وحدتك الآن
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button 
              className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function getUnitSocialProof(unit) {
  const seed = String(unit?.id ?? unit?.title ?? 'unit');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000000;
  }
  const rating = Math.round((4.2 + (hash % 70) / 100) * 10) / 10;
  const reviews = 18 + (hash % 320);
  return { rating, reviews };
}

function buildUnitWhatsAppUrl(unit, intent) {
  const title = unit?.title || 'وحدة';
  const projectName = unit?.projectName || 'غير محدد';
  const status = unit?.status || 'غير محدد';
  const type = unit?.type || 'غير محدد';
  const area = unit?.area ?? '-';
  const price = unit?.price ?? '-';
  const location = unit?.location || 'غير محدد';
  const locationUrl =
    unit?.locationLink ||
    (unit?.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(unit.location)}` : null);
  const details = unit?.details ? String(unit.details).trim() : '';
  const count = unit?.count ?? null;
  const id = unit?.id ? String(unit.id) : '';

  const lines = [
    `أهلاً، أرغب في ${intent || 'الاستفسار'} عن هذه الوحدة:`,
    '',
    `الوحدة: ${title}`,
    `المشروع: ${projectName}`,
    `الحالة: ${status}`,
    `النوع: ${type}`,
    `المساحة: ${area} م²`,
    `السعر: ${price} ر.س`,
    `المدينة/الموقع: ${location}`,
    locationUrl ? `رابط الموقع: ${locationUrl}` : null,
    count !== null ? `المتبقي: ${count}` : null,
    details ? `تفاصيل إضافية: ${details}` : null,
    id ? `معرف الوحدة: ${id}` : null,
  ].filter(Boolean);

  const message = lines.join('\n');
  return `https://wa.me/966570109444?text=${encodeURIComponent(message)}`;
}

function UnitCard({ unit, index, onPreview, onImageClick }) {
  const { rating, reviews } = getUnitSocialProof(unit);
  const stars = Math.round(rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#D4AF37]/35 hover:shadow-xl transition-all duration-500 flex flex-col h-full relative [clip-path:polygon(0_0,calc(100%_-_22px)_0,100%_22px,100%_100%,0_100%)]"
    >
      {/* Image Container */}
      <div className="relative bg-white cursor-pointer" onClick={onImageClick}>
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 items-end">
          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[10px] md:text-xs font-bold text-primary shadow-sm border border-gray-100 flex items-center gap-1">
            <Home size={12} className="text-[#D4AF37] w-3 h-3 md:w-auto md:h-auto" />
            {unit.type}
          </span>
          {unit.count !== null && (
            <span className="px-2.5 py-1 bg-gray-900/85 backdrop-blur-md rounded-lg text-[10px] md:text-xs font-bold text-white shadow-sm">
              متبقي {unit.count}
            </span>
          )}
        </div>

        <div className="absolute top-2 left-2 z-20">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold shadow-sm border ${
            unit.status === 'متاح'
              ? 'bg-emerald-500/90 text-white border-emerald-500/20'
              : unit.status === 'محجوزة'
                ? 'bg-amber-500/90 text-white border-amber-500/20'
                : 'bg-gray-200 text-gray-700 border-gray-100'
          }`}>
            {unit.status}
          </span>
        </div>

        <div className="aspect-[1/1] sm:aspect-[4/3] bg-white flex items-center justify-center">
          <img
            src={unit.image}
            alt={unit.title}
            className="w-full h-full object-contain p-4 md:p-6 transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center">
            <Maximize2 className="text-white" size={18} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col flex-grow relative">
        {unit.projectName && (
          <div className="text-[10px] md:text-xs text-gray-500 mb-2 line-clamp-1">
            {unit.projectName}
          </div>
        )}

        <h3 className="text-[15px] md:text-[15px] font-semibold text-primary group-hover:text-accent transition-colors duration-300 line-clamp-2 leading-snug min-h-[44px] sm:min-h-[40px]">
          {unit.title}
        </h3>

        <div className="flex items-center justify-between gap-2 mt-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 dir-ltr">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`${i < stars ? 'text-[#F3C960] fill-[#F3C960]' : 'text-gray-200'} w-3.5 h-3.5`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-600 dir-ltr font-semibold">{rating}</span>
            <span className="text-[11px] text-gray-400 dir-ltr">({reviews})</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Maximize2 className="w-3.5 h-3.5 text-accent" />
            <span className="dir-ltr font-semibold text-gray-700">{unit.area}</span>
            <span>م²</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-lg md:text-xl font-extrabold text-primary">{unit.price}</span>
            <span className="text-[11px] text-gray-500 font-medium">ر.س</span>
          </div>
          <span className="text-[10px] md:text-[11px] px-2 py-1 rounded-full bg-[#D4AF37]/10 text-[#8a6d1c] font-bold">
            معاينة فورية
          </span>
        </div>

        <p className="text-[12px] md:text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4 min-h-[36px]">
          {unit.details || 'تشطيبات راقية وتوزيع عملي للمساحات لراحة يومية أكثر.'}
        </p>

        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={onPreview}
            className="flex-1 py-2.5 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#E5C158] transition-colors flex items-center justify-center gap-2"
          >
            <Eye size={16} className="w-4 h-4" />
            <span className="text-[12px] md:text-sm">عرض التفاصيل</span>
          </button>

          <a
            href={buildUnitWhatsAppUrl(unit, 'الاستفسار')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300"
            title="تواصل عبر واتساب"
          >
            <ArrowUpRight size={16} className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
