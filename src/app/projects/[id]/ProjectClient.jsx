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
  const [mapError, setMapError] = useState(false);
 
   useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch Project Details
        const { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectData) {
          setProject(projectData);
        }

        // Fetch Units (Models)
        const { data: unitsData } = await supabase
          .from('units')
          .select('*')
          .eq('project_id', id)
          .order('price', { ascending: true });

        if (unitsData) setUnits(unitsData);

        // Fetch Gallery Images
        const { data: galleryData } = await supabase
          .from('project_images')
          .select('*')
          .eq('project_id', id);
          
        if (galleryData) setGalleryImages(galleryData);

        // Fetch Files (Docs)
        const { data: filesData, error: filesError } = await supabase
          .from('project_files')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false });

        if (filesError) {
           console.error('Error fetching project files:', filesError);
        } else {
           console.log('Fetched files:', filesData);
        }

        if (filesData) {
          setFiles(filesData);
        }

        // Fetch Sections
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

  // Documents only from project_files
  const documents = files; 

  // Combine main image with gallery images for the gallery view
  // Map galleryImages to match the structure needed (file_url is image_url in DB)
  const mappedGalleryImages = galleryImages.map(img => ({
    id: img.id,
    file_url: img.image_url,
    name: img.type === 'interior' ? 'صورة داخلية' : (img.type === 'exterior' ? 'صورة خارجية' : 'صورة')
  }));

  const allImages = project?.main_image 
    ? [{ id: 'main', file_url: project.main_image, name: 'الواجهة الرئيسية' }, ...mappedGalleryImages] 
    : mappedGalleryImages;

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1)); // RTL logic: Right arrow goes to "previous" (visually right)
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));  // RTL logic: Left arrow goes to "next" (visually left)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, allImages.length]);

  // Helper function to generate Google Maps Embed URL
  const getMapEmbedUrl = (link, location) => {
    // If there is a link, prioritize it
    if (link) {
      const safeLink = link.startsWith('http') ? link : `https://${link}`;

      // 1. If it's already an embed link, ensure it's from Google Maps strictly
      if (safeLink.includes('/maps/embed')) {
        // Security Check: Only allow Google Maps domains to prevent phishing/malicious iframes
        if (safeLink.startsWith('https://www.google.com/maps') || 
            safeLink.startsWith('https://maps.google.com') ||
            safeLink.startsWith('https://google.com/maps')) {
          return safeLink;
        }
        // If it looks like an embed link but not from Google, we ignore it and fall back to search
      }

      // 2. Try to extract coordinates (@lat,lng)
      const coordsMatch = safeLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordsMatch) {
        const [_, lat, lng] = coordsMatch;
        return `https://maps.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;
      }

      // 3. Try to extract place name from /place/Name
      const placeMatch = safeLink.match(/\/maps\/place\/([^/]+)/);
      if (placeMatch) {
         // Decode the place name (e.g. Al+Riyadh -> Al Riyadh)
         const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
         return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&hl=ar&z=15&output=embed`;
      }

      // 4. Try to extract coordinates from 'q=' parameter if present
      const qMatch = safeLink.match(/[?&]q=([^&]+)/);
      if (qMatch) {
        return `https://maps.google.com/maps?q=${qMatch[1]}&hl=ar&z=15&output=embed`;
      }
      
      // 5. Try to extract query from 'll=' parameter (lat,long)
      const llMatch = safeLink.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) {
        return `https://maps.google.com/maps?q=${llMatch[1]},${llMatch[2]}&hl=ar&z=15&output=embed`;
      }
      
      // 6. Check if the link itself is just coordinates (e.g. "24.7136,46.6753")
      // Sometimes users might paste just coordinates into the link field
      const rawCoordsMatch = safeLink.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
      if (rawCoordsMatch) {
          return `https://maps.google.com/maps?q=${rawCoordsMatch[1]},${rawCoordsMatch[2]}&hl=ar&z=15&output=embed`;
      }

      // 7. If we can't parse it, DO NOT use the full link as 'q' because it breaks the embed if it's a URL.
      // Instead, fall back to the location name, which is safer.
    }

    // Fallback -> search by location name
    // This handles cases where the link is a shortened URL (maps.app.goo.gl) that we can't resolve,
    // or if the link is missing/invalid. Searching by name is better than a broken map.
    return `https://maps.google.com/maps?q=${encodeURIComponent(location || 'الرياض')}&hl=ar&z=15&output=embed`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-secondary-text animate-pulse">جاري تحميل تفاصيل المشروع...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">المشروع غير موجود</h1>
          <Link href="/" className="text-[#D4AF37] hover:underline flex items-center justify-center gap-2">
            <ArrowRight size={16} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // Filter units based on active section
  const filteredUnits = activeSection 
    ? units.filter(u => u.section_id === activeSection) 
    : units;

  return (
    <main className="min-h-screen bg-[#f9f9f9]">
      <Header
        breadcrumb={[
          { label: 'الرئيسية', href: '/' },
          { label: 'المشاريع', href: '/#projects' },
          { label: project?.name || `مشروع ${id}`, href: `/projects/${id}` }
        ]}
      />
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gray-900">
          <img 
            src={project.main_image || '/images/4.jpg'} 
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
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  project.status === 'ongoing' ? 'bg-accent text-white' : 'bg-green-600 text-white'
                }`}>
                  {project.status === 'ongoing' ? 'قيد الإنشاء' : 'مكتمل'}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {project.type || 'سكني فاخر'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {project.name}
              </h1>
              
              <div className="w-24 h-1 bg-gold-gradient rounded-full mb-6" /> 

              <div className="flex flex-wrap items-center gap-6 text-white/90 text-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="text-accent" size={20} />
                  <span>{project.location || 'الرياض، المملكة العربية السعودية'}</span>
                  <button 
                    onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                  >
                    عرض الخريطة
                  </button>
                </div>
                {project.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="text-accent" size={20} />
                    <span>بدأ في {new Date(project.start_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Tabs Navigation */}
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
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap tracking-wide text-sm ${
                    activeTab === tab.id 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-secondary-text bg-transparent hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border-light">
                      <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
                        <span className="w-10 h-1 bg-accent rounded-full" />
                        عن المشروع
                      </h3>
                      <div className="prose prose-lg text-secondary-text leading-loose max-w-none first-letter:text-4xl first-letter:font-bold first-letter:text-primary">
                        {project.description ? (
                          <p>{project.description}</p>
                        ) : (
                          <p className="text-gray-400 italic">لا يوجد وصف متاح للمشروع حالياً.</p>
                        )}
                      </div>
                    </div>

                    {/* Features Grid (Example features - can be dynamic later) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-transparent transition-all duration-300">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                          <CheckCircle2 size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-primary mb-2">تصاميم عصرية</h4>
                        <p className="text-secondary-text text-sm">تصاميم معمارية فريدة تجمع بين الأصالة والحداثة.</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-transparent transition-all duration-300">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                          <CheckCircle2 size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-primary mb-2">موقع استراتيجي</h4>
                        <p className="text-secondary-text text-sm">بالقرب من أهم المعالم والخدمات الحيوية في المدينة.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Sections Tab */}
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
                        <div key={section.id} className="bg-white p-6 rounded-3xl shadow-sm border border-border-light flex flex-col md:flex-row gap-8">
                          <div className="w-full md:w-2/5 h-64 bg-gray-100 rounded-2xl overflow-hidden relative group">
                            {section.plan_image ? (
                                <img 
                                src={section.plan_image} 
                                alt={section.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                    <ImageIcon size={48} />
                                </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-3xl font-bold tracking-tight text-primary mb-4">{section.name}</h3>
                            <div className="w-16 h-1 bg-gold-gradient rounded-full mb-4" />
                            <p className="text-secondary-text leading-relaxed mb-6">
                              {section.description || 'لا يوجد وصف لهذا القسم.'}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 mt-auto">
                                <button 
                                    onClick={() => {
                                        setActiveSection(section.id);
                                        setActiveTab('units');
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    <Home size={18} />
                                    <span>عرض الوحدات</span>
                                </button>
                                
                                {section.brochure && (
                                    <a 
                                        href={section.brochure}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 border border-border-light text-primary rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <Download size={18} />
                                        <span>تحميل البروشور</span>
                                    </a>
                                )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <LayoutGrid className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">لا توجد أقسام مضافة</h3>
                        <p className="text-gray-500">لم يتم إضافة أقسام للمشروع بعد.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Units Tab */}
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
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            !activeSection ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-text hover:bg-gray-200'
                          }`}
                        >
                          الكل
                        </button>
                        {sections.map(section => (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                              activeSection === section.id ? 'bg-primary text-white' : 'bg-gray-100 text-secondary-text hover:bg-gray-200'
                            }`}
                          >
                            {section.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredUnits.length > 0 ? (
                      filteredUnits.map((unit) => (
                        <div key={unit.id} className="bg-white p-6 rounded-3xl shadow-sm border border-border-light flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                          <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-100 rounded-2xl overflow-hidden relative group">
                            <img 
                              src={unit.main_image || '/images/4.jpg'} 
                              alt={unit.type} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                              {unit.status === 'available' ? 'متاح' : 'مباع'}
                            </div>
                            {unit.price && (
                                <div className="absolute top-3 left-3 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                                    {unit.price.toLocaleString()} ر.س
                                </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-2">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-bold text-primary">{unit.type} {unit.unit_number && `- ${unit.unit_number}`}</h4>
                              </div>
                              <p className="text-secondary-text text-sm mb-4 line-clamp-2">
                                {unit.model_details || 'نموذج سكني فاخر يتميز بتصميم عصري وتشطيبات عالية الجودة.'}
                              </p>
                              
                              <div className="flex flex-wrap gap-4 mb-6">
                                {unit.size && (
                                  <div className="flex items-center gap-2 text-sm text-secondary-text bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Ruler size={16} className="text-accent" />
                                    <span>{unit.size} م²</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-secondary-text bg-gray-50 px-3 py-1.5 rounded-lg">
                                  <Home size={16} className="text-accent" />
                                  <span>{unit.type}</span>
                                </div>
                                {unit.model_count && (
                                  <div className="flex items-center gap-2 text-sm text-secondary-text bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <LayoutGrid size={16} className="text-accent" />
                                    <span>{unit.model_count} وحدات</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <a 
                        href={`https://wa.me/966570109444?text=${encodeURIComponent(`أرغب في حجز معاينة للوحدة: ${unit.type} ${unit.unit_number ? `- ${unit.unit_number}` : ''} في مشروع ${project.name}${unit.section_id ? ` - قسم ${sections.find(s => s.id === unit.section_id)?.name || ''}` : ''}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                                className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center text-center"
                              >
                                حجز معاينة
                              </a>
                              <button 
                                onClick={() => setSelectedUnit(unit)}
                                className="px-4 py-2.5 border border-border-light rounded-xl hover:bg-gray-50 transition-colors text-primary"
                              >
                                تفاصيل أكثر
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Home className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">لا توجد وحدات متاحة حالياً</h3>
                        <p className="text-gray-500">سيتم إضافة وحدات المشروع قريباً.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Gallery Tab */}
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
                          onClick={() => setLightboxIndex(index)}
                          className="aspect-[4/3] rounded-3xl overflow-hidden relative group cursor-zoom-in shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-gray-100"
                        >
                          <img 
                            src={img.file_url} 
                            alt={img.name || `صورة ${index + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white transform scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/30">
                              <ZoomIn size={32} />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                            <p className="text-white font-medium text-lg">{img.name || `صورة ${index + 1}`}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">المعرض فارغ</h3>
                        <p className="text-gray-500">لم يتم إضافة صور للمشروع بعد.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Files Tab */}
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
                        <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-border-light flex items-center justify-between group hover:border-accent/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-primary mb-1">{doc.name}</h4>
                              <p className="text-xs text-secondary-text uppercase">{doc.type}</p>
                            </div>
                          </div>
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-primary hover:bg-accent hover:text-white transition-all"
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">لا توجد ملفات</h3>
                        <p className="text-gray-500">لم يتم إضافة بروشورات أو مخططات بعد.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Contact Card */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-border-light sticky top-8">
              <h3 className="text-xl font-bold text-primary mb-6">مهتم بهذا المشروع؟</h3>
              <p className="text-secondary-text mb-8 text-sm">
                تواصل معنا اليوم للحصول على مزيد من المعلومات أو لحجز موعد لزيارة المشروع على أرض الواقع.
              </p>
              
              <div className="space-y-4 mb-8">
                <a href="tel:+966570109444" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-accent">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block text-xs text-secondary-text">اتصل بنا</span>
                    <span className="font-bold text-primary dir-ltr">0570109444</span>
                  </div>
                </a>
                
                <a href="mailto:MSC22@OUTLOOK.SA" className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-accent">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="block text-xs text-secondary-text">راسلنا</span>
                    <span className="font-bold text-primary">MSC22@OUTLOOK.SA</span>
                  </div>
                </a>
              </div>

              <a 
                href={`https://wa.me/966570109444?text=${encodeURIComponent(`أرغب في حجز موعد لزيارة مشروع ${project.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-accent text-white py-4 rounded-xl font-bold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
              >
                احجز موعد الآن
              </a>

              <div className="text-xs text-gray-400 mt-6 text-center space-y-2">
                <p className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span>مرخص من وزارة الشؤون البلدية</span>
                </p>
                <p className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span>مشاريع موثوقة</span>
                </p>
                <p className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span>خبرة أكثر من 10 سنوات</span>
                </p>
              </div>
            </div>

            {/* Google Map Embed */}
            <div id="map-section" className="bg-white p-2 rounded-3xl shadow-sm border border-border-light h-[300px] overflow-hidden relative group">
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
                    <MapPin size={48} className="mb-2 opacity-50" />
                    <span className="font-bold text-xl text-gray-500">حي النزهه</span>
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
                  className="bg-white text-primary px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                >
                  <MapPin size={16} />
                  فتح في Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Unit Details Modal */}
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
              className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row"
            >
              {/* Image Side */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative group">
                <img 
                  src={selectedUnit.main_image || '/images/4.jpg'} 
                  alt={selectedUnit.type} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                <button 
                  onClick={() => setSelectedUnit(null)}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-colors md:hidden z-10"
                >
                  <X size={20} />
                </button>
                {selectedUnit.status && (
                    <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm z-10 ${selectedUnit.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {selectedUnit.status === 'available' ? 'متاح' : 'مباع'}
                    </div>
                )}
              </div>

              {/* Details Side */}
              <div className="w-full md:w-1/2 p-8 flex flex-col bg-white">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <h3 className="text-2xl font-bold text-primary mb-2">{selectedUnit.type} {selectedUnit.unit_number && `- ${selectedUnit.unit_number}`}</h3>
                          {selectedUnit.price && (
                              <p className="text-2xl font-bold text-accent font-serif">{selectedUnit.price.toLocaleString()} <span className="text-sm font-sans font-normal text-gray-500">ر.س</span></p>
                          )}
                      </div>
                      <button 
                          onClick={() => setSelectedUnit(null)}
                          className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors hidden md:block"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  <div className="prose prose-sm text-secondary-text mb-8 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pl-2">
                      <h4 className="text-primary font-bold mb-2">تفاصيل النموذج</h4>
                      <p className="whitespace-pre-line leading-relaxed">{selectedUnit.model_details || 'لا توجد تفاصيل إضافية لهذا النموذج حالياً.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      {selectedUnit.size && (
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <span className="text-xs text-gray-500 block mb-1">المساحة</span>
                              <div className="flex items-center gap-2 font-bold text-primary">
                                  <Ruler size={18} className="text-accent" />
                                  <span>{selectedUnit.size} م²</span>
                              </div>
                          </div>
                      )}
                      {selectedUnit.model_count && (
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <span className="text-xs text-gray-500 block mb-1">عدد الوحدات</span>
                              <div className="flex items-center gap-2 font-bold text-primary">
                                  <LayoutGrid size={18} className="text-accent" />
                                  <span>{selectedUnit.model_count}</span>
                              </div>
                          </div>
                      )}
                  </div>

                  <a 
                      href={`https://wa.me/966570109444?text=${encodeURIComponent(`أرغب في حجز معاينة للوحدة: ${selectedUnit.type} ${selectedUnit.unit_number ? `- ${selectedUnit.unit_number}` : ''} في مشروع ${project.name}${selectedUnit.section_id ? ` - قسم ${sections.find(s => s.id === selectedUnit.section_id)?.name || ''}` : ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                      <span>احجز هذا النموذج الآن</span>
                      <ArrowRight size={18} />
                  </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Lightbox Gallery */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-[160]"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={28} />
            </button>

            {/* Navigation Buttons */}
            <button 
              className="absolute left-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all z-[160] hidden md:block hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
              }}
            >
              <ChevronRight size={32} />
            </button>
            <button 
              className="absolute right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all z-[160] hidden md:block hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
              }}
            >
              <ChevronLeft size={32} />
            </button>

            {/* Main Image */}
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
                src={allImages[lightboxIndex].file_url}
                alt={allImages[lightboxIndex].name}
                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg"
              />
              
              {/* Caption & Counter */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/10"
                >
                  <p className="text-lg font-medium mb-1">{allImages[lightboxIndex].name || `صورة ${lightboxIndex + 1}`}</p>
                  <p className="text-sm text-white/60 dir-ltr">{lightboxIndex + 1} / {allImages.length}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="bg-[#111] text-white py-12 text-center text-sm border-t border-gray-800 flex flex-col items-center gap-6 mt-12">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center p-4">
          <img src="/images/logo.png" alt="صفوة عنان" className="w-full h-full object-contain opacity-90" />
        </div>
        <p>&copy; {new Date().getFullYear()} صفوة عنان للتسويق والتطوير العقاري. جميع الحقوق محفوظة.</p>
      </footer>
    </main>
  );
}
