'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ArrowLeft, CheckCircle2, BedDouble, Bath, Home, ArrowUpRight, Eye, MapPin, X, CalendarCheck, Search, Filter, Tag, ArrowDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function UnitModels() {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('الكل');
  const [visibleCount, setVisibleCount] = useState(8);

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
          image: u.main_image || '/images/4.jpg',
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
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              نقدم لكم مجموعة متنوعة من النماذج السكنية المصممة بعناية فائقة لتلبي كافة احتياجاتكم وتطلعاتكم للمستقبل.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-6 md:mb-8">
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

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
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
          <div className="mt-12 text-center">
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
                      href={`https://wa.me/966570109444?text=أرغب بحجز ${selectedUnit.title} في ${selectedUnit.projectName}`}
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

function UnitCard({ unit, index, onPreview, onImageClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-xl transition-all duration-500 flex flex-col h-full relative"
    >
      {/* Image Container */}
      <div className="relative h-[160px] md:h-[240px] overflow-hidden bg-gray-100 cursor-pointer" onClick={onImageClick}>
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
          <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/95 backdrop-blur-md rounded-lg text-[10px] md:text-xs font-bold text-primary shadow-sm border border-gray-100 flex items-center gap-1">
            <Home size={12} className="text-[#D4AF37] w-3 h-3 md:w-auto md:h-auto" />
            {unit.type}
          </span>
        </div>
        
        {unit.status === "متاح" && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
              <span className="px-2 py-0.5 md:px-3 md:py-1 bg-emerald-500/90 backdrop-blur-md rounded-lg text-[10px] md:text-xs font-bold text-white shadow-sm flex items-center gap-1">
                <CheckCircle2 size={12} className="w-3 h-3 md:w-auto md:h-auto" /> متاح
              </span>
            </div>
        )}
        
        <div 
            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${unit.image})` }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
        
        {/* Hover Overlay Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
             <Maximize2 className="text-white" size={20} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-6 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm md:text-xl font-bold text-primary group-hover:text-accent transition-colors duration-300">
            {unit.title}
            </h3>
            {unit.projectName && (
                <span className="text-[8px] md:text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{unit.projectName}</span>
            )}
        </div>
        
        <p className="text-gray-500 text-[10px] md:text-sm mb-3 md:mb-6 line-clamp-2 leading-relaxed h-[30px] md:h-[40px]">
          {unit.details || 'تصميم عصري ومساحات رحبة تناسب جميع الأذواق.'}
        </p>

        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="flex flex-col items-center justify-center p-2 md:p-3 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group/area">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1 group-hover/area:text-blue-500 transition-colors">
                    <Maximize2 size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span className="text-[9px] md:text-xs font-medium">المساحة</span>
                </div>
                <span className="text-xs md:text-lg font-bold text-gray-900 dir-ltr">{unit.area} <span className="text-[8px] md:text-xs font-normal text-gray-500">م²</span></span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 md:p-3 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-colors group/price">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1 group-hover/price:text-[#D4AF37] transition-colors">
                    <Tag size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span className="text-[9px] md:text-xs font-medium">السعر</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-xs md:text-lg font-bold text-primary">{unit.price}</span>
                    <span className="text-[8px] md:text-xs font-normal text-gray-500">ر.س</span>
                </div>
            </div>
        </div>

        <div className="mt-auto flex items-center gap-2 md:gap-3">
            <button 
              onClick={onPreview}
              className="flex-1 py-2 md:py-3 bg-gray-50 text-primary font-medium rounded-lg md:rounded-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 group/btn"
            >
              <Eye size={14} className="w-3.5 h-3.5 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-base">معاينة</span>
            </button>
            
            <a 
                  href={`https://wa.me/966570109444?text=استفسار عن ${unit.title}`}
                  target="_blank" 
                  rel="noopener noreferrer"
              className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl border border-gray-100 text-gray-400 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300"
              title="تواصل عبر واتساب"
            >
              <ArrowUpRight size={14} className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </a>
        </div>
      </div>
    </motion.div>
  );
}
