'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import { 
  MapPin, 
  Calendar, 
  Home, 
  Ruler, 
  Download, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  FileText,
  Image as ImageIcon,
  LayoutGrid,
   X,
   ChevronLeft,
   ChevronRight,
   ZoomIn
 } from 'lucide-react';
 import Link from 'next/link';
 
 export default function ProjectDetails() {
   const { id } = useParams();
   const [project, setProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [files, setFiles] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('overview');
   const [activeSection, setActiveSection] = useState(null);
   const [selectedUnit, setSelectedUnit] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectData) {
          setProject(projectData);
        }

        const { data: unitsData } = await supabase
          .from('units')
          .select('*')
          .eq('project_id', id)
          .order('price', { ascending: true });

        if (unitsData) setUnits(unitsData);

        const { data: galleryData } = await supabase
          .from('project_images')
          .select('*')
          .eq('project_id', id);
          
        if (galleryData) setGalleryImages(galleryData);

        const { data: filesData, error: filesError } = await supabase
          .from('project_files')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false });

        if (filesError) {
           console.error('Error fetching project files:', filesError);
        }

        if (filesData) {
          setFiles(filesData);
        }

        const { data: sectionsData } = await supabase
          .from('project_sections')
          .select('*')
          .eq('project_id', id);

        if (sectionsData) setSections(sectionsData);

      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const documents = files; 

  const mappedGalleryImages = galleryImages.map(img => ({
    id: img.id,
    file_url: img.image_url,
    name: img.type === 'interior' ? 'صورة داخلية' : (img.type === 'exterior' ? 'صورة خارجية' : 'صورة')
  }));

  const allImages = project?.main_image 
    ? [{ id: 'main', file_url: project.main_image, name: 'الواجهة الرئيسية' }, ...mappedGalleryImages] 
    : mappedGalleryImages;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, lightboxImages]);

  const getMapEmbedUrl = (link, location) => {
    if (link) {
      const safeLink = link.startsWith('http') ? link : `https://${link}`;

      if (safeLink.includes('/maps/embed')) {
        if (safeLink.startsWith('https://www.google.com/maps') || 
            safeLink.startsWith('https://maps.google.com') ||
            safeLink.startsWith('https://google.com/maps')) {
          return safeLink;
        }
      }

      const coordsMatch = safeLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordsMatch) {
        const [_, lat, lng] = coordsMatch;
        return `https://maps.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;
      }

      const placeMatch = safeLink.match(/\/maps\/place\/([^/]+)/);
      if (placeMatch) {
         const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
         return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&hl=ar&z=15&output=embed`;
      }

      const qMatch = safeLink.match(/[?&]q=([^&]+)/);
      if (qMatch) {
        return `https://maps.google.com/maps?q=${qMatch[1]}&hl=ar&z=15&output=embed`;
      }
      
      const llMatch = safeLink.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) {
        return `https://maps.google.com/maps?q=${llMatch[1]},${llMatch[2]}&hl=ar&z=15&output=embed`;
      }
      
      const rawCoordsMatch = safeLink.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
      if (rawCoordsMatch) {
          return `https://maps.google.com/maps?q=${rawCoordsMatch[1]},${rawCoordsMatch[2]}&hl=ar&z=15&output=embed`;
      }
    }

    return `https://maps.google.com/maps?q=${encodeURIComponent(location || 'الرياض')}&hl=ar&z=15&output=embed`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] dir-rtl [font-family:var(--font-cairo)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#8B6A14] border-t-transparent rounded-full animate-spin" />
          <p className="text-secondary-text animate-pulse font-medium">جاري تحميل تفاصيل المشروع...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] dir-rtl [font-family:var(--font-cairo)]">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-[#6B5210] mb-4 tracking-tight">المشروع غير موجود</h1>
          <Link href="/" className="text-[#8B6A14] hover:underline flex items-center justify-center gap-2 font-semibold">
            <ArrowRight size={16} className="rtl:rotate-180" strokeWidth={2.25} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const filteredUnits = activeSection 
    ? units.filter(u => u.section_id === activeSection) 
    : units;

  return (
    <main className="min-h-screen bg-[#f9f9f9] dir-rtl [font-family:var(--font-cairo)]">
      <Header
        breadcrumb={[
          { label: 'الرئيسية', href: '/' },
          { label: 'المشاريع', href: '/#projects' },
          { label: project?.name || `مشروع ${id}`, href: `/projects/${id}` }
        ]}
      />
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gray-900">
          <img 
            src={project.main_image || '/images/4.png'} 
            alt={project.name} 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="container-custom pb-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`px-4 py-1.5 rounded-2xl text-sm font-semibold ${
                  project.status === 'ongoing' ? 'bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] ring-1 ring-[#B8953E]/30' : 'bg-green-600 text-white'
                }`}>
                  {project.status === 'ongoing' ? 'قيد الإنشاء' : 'مكتمل'}
                </span>
                <span className="px-4 py-1.5 rounded-2xl text-sm font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {project.type || 'سكني فاخر'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                {project.name}
              </h1>
              
              <div className="w-24 h-1 bg-gradient-to-r from-[#B8953E] via-[#C9A84B] to-[#E0C16E] rounded-2xl mb-6" /> 

              <div className="flex flex-wrap items-center gap-6 text-white/90 text-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="text-[#C9A84B]" size={20} strokeWidth={2.25} />
                  <span className="font-medium">{project.location || 'الرياض، المملكة العربية السعودية'}</span>
                  <button 
                    onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-2xl transition-all flex items-center gap-1 cursor-pointer font-semibold tracking-wide"
                  >
                    عرض الخريطة
                  </button>
                </div>
                {project.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="text-[#C9A84B]" size={20} strokeWidth={2.25} />
                    <span className="font-medium">بدأ في {new Date(project.start_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-12">
            
            <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-gray-100 overflow-x-auto">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: FileText },
                { id: 'sections', label: 'أقسام المشروع', icon: LayoutGrid },
                { id: 'units', label: 'نماذج الوحدات', icon: Home },
                { id: 'gallery', label: 'معرض الصور', icon: ImageIcon },
                { id: 'files', label: 'البروشور والملفات', icon: Download },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap tracking-wide text-sm ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] shadow-md ring-1 ring-[#B8953E]/30' 
                      : 'text-secondary-text bg-transparent hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={18} strokeWidth={2.25} />
                  <span className="font-extrabold">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-light ring-1 ring-black/5">
                      <h3 className="text-2xl font-extrabold text-[#6B5210] mb-6 flex items-center gap-3 tracking-tight">
                        <span className="w-10 h-1 bg-gradient-to-b from-[#B8953E] via-[#8B6A14] to-[#6B5210] rounded-2xl" />
                        عن المشروع
                      </h3>
                      <div className="prose prose-lg text-secondary-text leading-loose max-w-none first-letter:text-4xl first-letter:font-extrabold first-letter:text-[#8B6A14]">
                        {project.description ? (
                          <p className="font-light">{project.description}</p>
                        ) : (
                          <p className="text-gray-400 italic">لا يوجد وصف متاح للمشروع حالياً.</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-transparent transition-all duration-300 ring-1 ring-black/5">
                        <div className="w-12 h-12 bg-gradient-to-b from-[#B8953E]/15 to-[#6B5210]/10 rounded-2xl flex items-center justify-center text-[#8B6A14] mb-4 ring-1 ring-[#B8953E]/15">
                          <CheckCircle2 size={24} strokeWidth={2.25} />
                        </div>
                        <h4 className="text-lg font-extrabold text-[#6B5210] mb-2 tracking-tight">تصاميم عصرية</h4>
                        <p className="text-secondary-text text-sm font-light">تصاميم معمارية فريدة تجمع بين الأصالة والحداثة.</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-transparent transition-all duration-300 ring-1 ring-black/5">
                        <div className="w-12 h-12 bg-gradient-to-b from-[#B8953E]/15 to-[#6B5210]/10 rounded-2xl flex items-center justify-center text-[#8B6A14] mb-4 ring-1 ring-[#B8953E]/15">
                          <CheckCircle2 size={24} strokeWidth={2.25} />
                        </div>
                        <h4 className="text-lg font-extrabold text-[#6B5210] mb-2 tracking-tight">موقع استراتيجي</h4>
                        <p className="text-secondary-text text-sm font-light">بالقرب من أهم المعالم والخدمات الحيوية في المدينة.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'sections' && (
                  <motion.div
                    key="sections"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 gap-6"
                  >
                    {sections.length > 0 ? (
                      sections.map((section) => (
                        <div key={section.id} className="bg-white p-6 rounded-2xl shadow-sm border border-border-light flex flex-col md:flex-row gap-8 ring-1 ring-black/5">
                          <div className="w-full md:w-2/5 h-64 bg-gray-100 rounded-2xl overflow-hidden relative group cursor-pointer ring-1 ring-black/5"
                               onClick={() => {
                                 if (section.plan_image) {
                                   setLightboxImages([{ file_url: section.plan_image, name: section.name }]);
                                   setLightboxIndex(0);
                                 }
                               }}
                          >
                            {section.plan_image ? (
                                <img 
                                src={section.plan_image} 
                                alt={section.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                    <ImageIcon size={48} strokeWidth={2.25} />
                                </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-3xl font-extrabold tracking-tight text-[#6B5210] mb-4">{section.name}</h3>
                            <div className="w-16 h-1 bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] rounded-2xl mb-4" />
                            <p className="text-secondary-text leading-relaxed mb-6 font-light">
                              {section.description || 'لا يوجد وصف لهذا القسم.'}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 mt-auto">
                                <button 
                                    onClick={() => {
                                        setActiveSection(section.id);
                                        setActiveTab('units');
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] rounded-2xl hover:shadow-[0_0_20px_rgba(184,149,62,0.3)] transition-all ring-1 ring-[#B8953E]/30 font-extrabold tracking-wide"
                                >
                                    <Home size={18} strokeWidth={2.25} />
                                    <span>عرض الوحدات</span>
                                </button>
                                
                                {section.brochure && (
                                    <a 
                                        href={section.brochure}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-[#6B5210] rounded-2xl hover:bg-gray-50 hover:border-[#B8953E]/30 transition-all font-extrabold tracking-wide"
                                    >
                                        <Download size={18} strokeWidth={2.25} />
                                        <span>تحميل البروشور</span>
                                    </a>
                                )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <LayoutGrid className="mx-auto h-12 w-12 text-gray-300 mb-4" strokeWidth={2.25} />
                        <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">لا توجد أقسام مضافة</h3>
                        <p className="text-gray-500 font-light">لم يتم إضافة أقسام للمشروع بعد.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'units' && (
                  <motion.div
                    key="units"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 gap-6"
                  >
                    {sections.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        <button
                          onClick={() => setActiveSection(null)}
                          className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-colors ${
                            !activeSection ? 'bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] ring-1 ring-[#B8953E]/30' : 'bg-gray-100 text-secondary-text hover:bg-gray-200'
                          }`}
                        >
                          الكل
                        </button>
                        {sections.map(section => (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-colors ${
                              activeSection === section.id ? 'bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] ring-1 ring-[#B8953E]/30' : 'bg-gray-100 text-secondary-text hover:bg-gray-200'
                            }`}
                          >
                            {section.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredUnits.length > 0 ? (
                      filteredUnits.map((unit) => (
                        <div key={unit.id} className="bg-white p-6 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-[0_30px_60px_-15px_rgba(184,149,62,0.3)] transition-all duration-300 hover:scale-[1.02] hover:border-[#B8953E]/50 relative overflow-hidden group/card ring-1 ring-black/5">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8953E]/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover/card:scale-110" />
                          
                          <div className="w-full md:w-1/3 h-64 md:h-auto bg-gray-100 rounded-2xl overflow-hidden relative group cursor-pointer shadow-md group-hover/card:shadow-lg transition-shadow duration-300 ring-1 ring-black/5"
                               onClick={() => {
                                 setLightboxImages([{ file_url: unit.main_image || '/images/4.png', name: unit.type }]);
                                 setLightboxIndex(0);
                               }}
                          >
                            <img 
                              src={unit.main_image || '/images/4.png'} 
                              alt={unit.type} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-2xl text-xs font-extrabold text-[#6B5210] shadow-sm tracking-wide">
                              {unit.status === 'available' ? 'متاح' : 'مباع'}
                            </div>
                            {unit.price && (
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] px-4 py-1 rounded-2xl text-sm font-extrabold shadow-sm ring-1 ring-[#B8953E]/30 tracking-wide">
                                    {unit.price.toLocaleString()} ر.س
                                </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-2">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-extrabold text-[#6B5210] tracking-tight">{unit.type} {unit.unit_number && `- ${unit.unit_number}`}</h4>
                              </div>
                              <p className="text-secondary-text text-sm mb-4 line-clamp-2 font-light">
                                {unit.model_details || 'نموذج سكني فاخر يتميز بتصميم عصري وتشطيبات عالية الجودة.'}
                              </p>
                              
                              <div className="flex flex-wrap gap-4 mb-6">
                                {unit.size && (
                                  <div className="flex items-center gap-2 text-sm text-secondary-text bg-gray-50 px-3 py-1.5 rounded-2xl font-medium">
                                    <Ruler size={16} className="text-[#8B6A14]" strokeWidth={2.25} />
                                    <span>{unit.size} م²</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-secondary-text bg-gray-50 px-3 py-1.5 rounded-2xl font-medium">
                                  <Home size={16} className="text-[#8B6A14]" strokeWidth={2.25} />
                                  <span>{unit.type}</span>
                                </div>
                                {unit.model_count && (
                                  <div className="flex items-center gap-2 text-sm text-secondary-text bg-gray-50 px-3 py-1.5 rounded-2xl font-medium">
                                    <LayoutGrid size={16} className="text-[#8B6A14]" strokeWidth={2.25} />
                                    <span>{unit.model_count} وحدات</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-3 mt-4">
                              <a 
                        href={`https://wa.me/966570109444?text=${encodeURIComponent(`أرغب في حجز معاينة للوحدة: ${unit.type} ${unit.unit_number ? `- ${unit.unit_number}` : ''} في مشروع ${project.name}${unit.section_id ? ` - قسم ${sections.find(s => s.id === unit.section_id)?.name || ''}` : ''}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                                className="flex-1 bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] py-3 rounded-2xl font-extrabold hover:shadow-[0_0_20px_rgba(184,149,62,0.3)] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center text-center group-hover/card:ring-1 ring-[#B8953E]/30 tracking-wide"
                              >
                                حجز معاينة
                              </a>
                              <button 
                                onClick={() => setSelectedUnit(unit)}
                                className="px-6 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-[#B8953E]/30 transition-all text-[#6B5210] font-extrabold tracking-wide"
                              >
                                تفاصيل أكثر
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Home className="mx-auto h-12 w-12 text-gray-300 mb-4" strokeWidth={2.25} />
                        <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">لا توجد وحدات متاحة حالياً</h3>
                        <p className="text-gray-500 font-light">سيتم إضافة وحدات المشروع قريباً.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'gallery' && (
                  <motion.div
                    key="gallery"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {allImages.length > 0 ? (
                      allImages.map((img, index) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={index}
                          onClick={() => {
                            setLightboxImages(allImages);
                            setLightboxIndex(index);
                          }}
                          className="aspect-[4/3] rounded-2xl overflow-hidden relative group cursor-zoom-in shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-gray-100 ring-1 ring-black/5"
                        >
                          <img 
                            src={img.file_url} 
                            alt={img.name || `صورة ${index + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white transform scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/30">
                              <ZoomIn size={32} strokeWidth={2.25} />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                            <p className="text-white font-semibold text-lg">{img.name || `صورة ${index + 1}`}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" strokeWidth={2.25} />
                        <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">المعرض فارغ</h3>
                        <p className="text-gray-500 font-light">لم يتم إضافة صور للمشروع بعد.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'files' && (
                  <motion.div
                    key="files"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {documents.length > 0 ? (
                      documents.map((doc, index) => (
                        <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-border-light flex items-center justify-between group hover:border-[#B8953E]/30 transition-colors ring-1 ring-black/5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 ring-1 ring-red-100">
                              <FileText size={24} strokeWidth={2.25} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-[#6B5210] mb-1 tracking-tight">{doc.name}</h4>
                              <p className="text-xs text-secondary-text uppercase font-semibold">{doc.type}</p>
                            </div>
                          </div>
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-[#6B5210] hover:bg-gradient-to-r hover:from-[#B8953E] hover:via-[#8B6A14] hover:to-[#6B5210] hover:text-[#FAF3E0] transition-all ring-1 ring-gray-100 hover:ring-[#B8953E]/30"
                          >
                            <Download size={18} strokeWidth={2.25} />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" strokeWidth={2.25} />
                        <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">لا توجد ملفات</h3>
                        <p className="text-gray-500 font-light">لم يتم إضافة بروشورات أو مخططات بعد.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-light sticky top-8 ring-1 ring-black/5">
              <h3 className="text-xl font-extrabold text-[#6B5210] mb-6 tracking-tight">مهتم بهذا المشروع؟</h3>
              <p className="text-secondary-text mb-8 text-sm font-light">
                تواصل معنا اليوم للحصول على مزيد من المعلومات أو لحجز موعد لزيارة المشروع على أرض الواقع.
              </p>
              
              <div className="space-y-4 mb-8">
                <a href="tel:+966570109444" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#B8953E]/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#8B6A14] ring-1 ring-black/5">
                    <Phone size={18} strokeWidth={2.25} />
                  </div>
                  <div>
                    <span className="block text-xs text-secondary-text font-semibold">اتصل بنا</span>
                    <span className="font-extrabold text-[#6B5210] dir-ltr tracking-tight">0570109444</span>
                  </div>
                </a>
                
                <a href="mailto:marketing@safwat-anan.sa" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#B8953E]/5 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#8B6A14] ring-1 ring-black/5">
                    <Mail size={18} strokeWidth={2.25} />
                  </div>
                  <div>
                    <span className="block text-xs text-secondary-text font-semibold">راسلنا</span>
                    <span className="font-extrabold text-[#6B5210]">marketing@safwat-anan.sa</span>
                  </div>
                </a>
              </div>

              <a 
                href={`https://wa.me/966570109444?text=${encodeURIComponent(`أرغب في حجز موعد لزيارة مشروع ${project.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] py-4 rounded-2xl font-extrabold hover:shadow-[0_0_25px_rgba(184,149,62,0.35)] transition-colors shadow-lg shadow-[#B8953E]/15 ring-1 ring-[#B8953E]/30 tracking-wide"
              >
                احجز موعد الآن
              </a>

              <div className="text-xs text-gray-400 mt-6 text-center space-y-2">
                <p className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" strokeWidth={2.25} />
                    <span className="font-medium">مرخص من وزارة الشؤون البلدية</span>
                </p>
                <p className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" strokeWidth={2.25} />
                    <span className="font-medium">مشاريع موثوقة</span>
                </p>
                <p className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" strokeWidth={2.25} />
                    <span className="font-medium">خبرة أكثر من 10 سنوات</span>
                </p>
              </div>
            </div>

            <div id="map-section" className="bg-white p-2 rounded-2xl shadow-sm border border-border-light h-[300px] overflow-hidden relative group ring-1 ring-black/5">
              <div className="w-full h-full rounded-2xl overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500 bg-gray-100">
                {!mapError ? (
                  <iframe 
                      src={getMapEmbedUrl(project.link, project.location)} 
                      className="w-full h-full" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      onError={() => setMapError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                    <MapPin size={48} className="mb-2 opacity-50" strokeWidth={2.25} />
                    <span className="font-extrabold text-xl text-gray-500 tracking-tight">حي النزهه</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:bg-transparent transition-colors duration-300" />
              </div>
              
              <div className="absolute bottom-4 left-4 z-10">
                <a 
                  href={project.link 
                    ? project.link.startsWith('http') 
                      ? project.link 
                      : `https://${project.link}` 
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location || 'الرياض')}` 
                  } 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white text-[#6B5210] px-6 py-2 rounded-2xl font-extrabold text-sm hover:scale-105 transition-transform shadow-lg flex items-center gap-2 ring-1 ring-black/5 tracking-wide"
                >
                  <MapPin size={16} strokeWidth={2.25} />
                  فتح في Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedUnit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUnit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row ring-1 ring-black/5"
            >
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative group">
                <img 
                  src={selectedUnit.main_image || '/images/4.png'} 
                  alt={selectedUnit.type} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                <button 
                  onClick={() => setSelectedUnit(null)}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-2xl text-white hover:bg-white/40 transition-colors md:hidden z-10"
                >
                  <X size={20} strokeWidth={2.25} />
                </button>
                {selectedUnit.status && (
                    <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-2xl text-xs font-extrabold text-white shadow-sm z-10 tracking-wide ${selectedUnit.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {selectedUnit.status === 'available' ? 'متاح' : 'مباع'}
                    </div>
                )}
              </div>

              <div className="w-full md:w-1/2 p-8 flex flex-col bg-white">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <h3 className="text-2xl font-extrabold text-[#6B5210] mb-2 tracking-tight">{selectedUnit.type} {selectedUnit.unit_number && `- ${selectedUnit.unit_number}`}</h3>
                          {selectedUnit.price && (
                              <p className="text-2xl font-extrabold text-[#8B6A14] tracking-tight">{selectedUnit.price.toLocaleString()} <span className="text-sm font-sans font-normal text-gray-500">ر.س</span></p>
                          )}
                      </div>
                      <button 
                          onClick={() => setSelectedUnit(null)}
                          className="bg-gray-100 p-2 rounded-2xl text-gray-500 hover:bg-gray-200 transition-colors hidden md:block"
                      >
                          <X size={20} strokeWidth={2.25} />
                      </button>
                  </div>

                  <div className="prose prose-sm text-secondary-text mb-8 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pl-2">
                      <h4 className="text-[#6B5210] font-extrabold mb-2 tracking-tight">تفاصيل النموذج</h4>
                      <p className="whitespace-pre-line leading-relaxed font-light">{selectedUnit.model_details || 'لا توجد تفاصيل إضافية لهذا النموذج حالياً.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      {selectedUnit.size && (
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <span className="text-xs text-gray-500 block mb-1 font-semibold">المساحة</span>
                              <div className="flex items-center gap-2 font-extrabold text-[#6B5210] tracking-tight">
                                  <Ruler size={18} className="text-[#8B6A14]" strokeWidth={2.25} />
                                  <span>{selectedUnit.size} م²</span>
                              </div>
                          </div>
                      )}
                      {selectedUnit.model_count && (
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <span className="text-xs text-gray-500 block mb-1 font-semibold">عدد الوحدات</span>
                              <div className="flex items-center gap-2 font-extrabold text-[#6B5210] tracking-tight">
                                  <LayoutGrid size={18} className="text-[#8B6A14]" strokeWidth={2.25} />
                                  <span>{selectedUnit.model_count}</span>
                              </div>
                          </div>
                      )}
                  </div>

                  <a 
                      href={`https://wa.me/966570109444?text=${encodeURIComponent(`أرغب في حجز معاينة للوحدة: ${selectedUnit.type} ${selectedUnit.unit_number ? `- ${selectedUnit.unit_number}` : ''} في مشروع ${project.name}${selectedUnit.section_id ? ` - قسم ${sections.find(s => s.id === selectedUnit.section_id)?.name || ''}` : ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-[#B8953E] via-[#8B6A14] to-[#6B5210] text-[#FAF3E0] py-4 rounded-2xl font-extrabold hover:shadow-[0_0_25px_rgba(184,149,62,0.35)] transition-colors text-center flex items-center justify-center gap-2 shadow-lg shadow-[#B8953E]/15 ring-1 ring-[#B8953E]/30 tracking-wide"
                  >
                      <span>احجز هذا النموذج الآن</span>
                      <ArrowRight size={18} className="rtl:rotate-180" strokeWidth={2.25} />
                  </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all z-[160]"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={28} strokeWidth={2.25} />
            </button>

            <button 
              className="absolute left-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all z-[160] hidden md:block hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
              }}
            >
              <ChevronRight size={32} strokeWidth={2.25} />
            </button>
            <button 
              className="absolute right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all z-[160] hidden md:block hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
              }}
            >
              <ChevronLeft size={32} strokeWidth={2.25} />
            </button>

            <div 
              className="relative w-full h-full max-w-7xl max-h-screen p-4 md:p-10 flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                src={lightboxImages[lightboxIndex]?.file_url}
                alt={lightboxImages[lightboxIndex]?.name}
                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-2xl"
              />
              
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-2xl border border-white/10"
                >
                  <p className="text-lg font-semibold mb-1">{lightboxImages[lightboxIndex]?.name || `صورة ${lightboxIndex + 1}`}</p>
                  <p className="text-sm text-white/60 dir-ltr">{lightboxIndex + 1} / {lightboxImages.length}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="bg-[#111] text-white py-12 text-center text-sm border-t border-gray-800 flex flex-col items-center gap-6 mt-12 dir-rtl [font-family:var(--font-cairo)]">
        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center p-4 ring-1 ring-white/10">
          <img src="/images/logo.png" alt="صفوة عنان" className="w-full h-full object-contain opacity-90" />
        </div>
        <p className="font-light">© {new Date().getFullYear()} صفوة عنان للتسويق والتطوير العقاري. جميع الحقوق محفوظة.</p>
      </footer>
    </main>
  );
}
