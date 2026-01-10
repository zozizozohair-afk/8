'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase, supabaseUrl } from '@/lib/supabaseClient';
import { Upload, X, Plus, Save, Image as ImageIcon, FileText, Layout, Home, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectSections from './ProjectSections';
import ProjectUnits from './ProjectUnits';
import ProjectFiles from './ProjectFiles';

export default function ProjectForm({ project, onSuccess }) {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [projectId, setProjectId] = useState(project?.id || null);

  // Form States
  const [projectInfo, setProjectInfo] = useState({
    name: project?.name || '',
    slug: project?.slug || '',
    description: project?.description || '',
    location: project?.location || '',
    link: project?.link || '',
    start_year: project?.start_year || new Date().getFullYear(),
    status: project?.status || 'upcoming',
    main_image: project?.main_image || '',
    brochure: project?.brochure || ''
  });

  const [images, setImages] = useState([]);
  
  // Load initial data if editing
  useEffect(() => {
    if (project?.id) {
        const fetchRelatedData = async () => {
            const { data: imagesData } = await supabase
                .from('project_images')
                .select('*')
                .eq('project_id', project.id);
            if (imagesData) setImages(imagesData);
            
            // Fetch sections, units, files...
        };
        fetchRelatedData();
    }
  }, [project]);
  const [sections, setSections] = useState([]);
  const [units, setUnits] = useState([]);
  const [files, setFiles] = useState([]);

  // Refs for file inputs
  const mainImageInputRef = useRef(null);
  const brochureInputRef = useRef(null);
  const projectImagesInputRef = useRef(null);
  const projectFilesInputRef = useRef(null);

  // --- Helpers ---
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name' && !projectId) {
       setProjectInfo(prev => ({ ...prev, [name]: value, slug: generateSlug(value) }));
    } else {
       setProjectInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const uploadFile = async (file, bucket = 'images', folder = 'projects') => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const filePath = `${folder}/${fileName}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
    
    if (error) {
        console.error('Upload error:', error);
        throw error;
    }
    
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  // --- Handlers ---

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        setLoading(true);
        const url = await uploadFile(file, 'images', 'main');
        setProjectInfo(prev => ({ ...prev, main_image: url }));
        setLoading(false);
    } catch (error) {
        setMessage({ type: 'error', text: 'فشل رفع الصورة' });
        setLoading(false);
    }
  };

  const handleBrochureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        setLoading(true);
        const url = await uploadFile(file, 'files', 'brochures');
        setProjectInfo(prev => ({ ...prev, brochure: url }));
        setLoading(false);
    } catch (error) {
        setMessage({ type: 'error', text: 'فشل رفع الملف' });
        setLoading(false);
    }
  };

  const handleSaveProjectInfo = async () => {
    try {
        setLoading(true);
        setMessage(null);

        console.log('Supabase URL (save):', supabaseUrl);
        const dataToSave = { ...projectInfo };
        
        let error;
        let data;

        if (projectId) {
            // Update
            const { error: updateError } = await supabase
                .from('projects')
                .update(dataToSave)
                .eq('id', projectId);
            if (updateError && /schema cache|Could not find.*link.*column/i.test(updateError.message || '')) {
                const { link, ...rest } = dataToSave;
                const { error: fallbackError } = await supabase
                    .from('projects')
                    .update(rest)
                    .eq('id', projectId);
                if (!fallbackError) {
                    setMessage({ type: 'warning', text: 'تم الحفظ بدون حقل الرابط بسبب مشكلة كاش المخطط. يرجى تحديث كاش قاعدة البيانات في لوحة Supabase ثم إعادة المحاولة.' });
                }
                error = fallbackError;
            } else {
                error = updateError;
            }
        } else {
            // Insert
            const { data: insertedData, error: insertError } = await supabase
                .from('projects')
                .insert([dataToSave])
                .select();

            if (insertError && /schema cache|Could not find.*link.*column/i.test(insertError.message || '')) {
                const { link, ...rest } = dataToSave;
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('projects')
                    .insert([rest])
                    .select();
                
                if (!fallbackError) {
                    setMessage({ type: 'warning', text: 'تم إنشاء المشروع ولكن لم يتم حفظ الرابط بسبب تحديثات قاعدة البيانات. يرجى تعديل المشروع لإضافة الرابط لاحقاً.' });
                    data = fallbackData;
                } else {
                    error = fallbackError;
                }
            } else {
                error = insertError;
                data = insertedData;
            }

            if (data) setProjectId(data[0].id);
        }

        if (error) throw error;

        setMessage({ type: 'success', text: 'تم حفظ بيانات المشروع بنجاح' });
        if (!projectId) setActiveTab('images'); // Move to next tab on first save
    } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
        setLoading(false);
    }
  };

  const handleAddImage = async (e) => {
      const filesList = Array.from(e.target.files);
      if (filesList.length === 0) return;

      try {
          setLoading(true);
          const newImages = [];
          
          for (const file of filesList) {
              const url = await uploadFile(file, 'images', 'gallery');
              newImages.push({
                  project_id: projectId,
                  image_url: url,
                  type: 'interior' // Default
              });
          }

          const { data, error } = await supabase
            .from('project_images')
            .insert(newImages)
            .select();

          if (error) throw error;

          setImages(prev => [...prev, ...data]);
          setLoading(false);
      } catch (error) {
          console.error(error);
          setMessage({ type: 'error', text: 'فشل رفع الصور' });
          setLoading(false);
      }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
    try {
        // setLoading(true); // Optional: might flicker too much for small actions
        const { error } = await supabase
            .from('project_images')
            .delete()
            .eq('id', imageId);

        if (error) throw error;

        setImages(prev => prev.filter(img => img.id !== imageId));
        setMessage({ type: 'success', text: 'تم حذف الصورة بنجاح' });
    } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'فشل حذف الصورة' });
    }
  };

  const handleUpdateImageType = async (imageId, newType) => {
      try {
          const { error } = await supabase
              .from('project_images')
              .update({ type: newType })
              .eq('id', imageId);

          if (error) throw error;

          setImages(prev => prev.map(img => 
              img.id === imageId ? { ...img, type: newType } : img
          ));
      } catch (error) {
          console.error(error);
          setMessage({ type: 'error', text: 'فشل تحديث نوع الصورة' });
      }
  };

  // --- Render Helpers ---

  const TabButton = ({ id, icon: Icon, label, disabled }) => (
    <button
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-300 border-b-2 ${
        activeTab === id 
          ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5' 
          : 'border-transparent text-secondary-text hover:text-primary'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-8 py-6 border-b border-border-light flex justify-between items-center">
        <div>
            <h2 className="text-xl font-medium text-primary">
                {projectId ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
            </h2>
            <p className="text-sm text-secondary-text mt-1">أدخل تفاصيل المشروع ومكوناته</p>
        </div>
        {message && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
            >
                {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
                {message.text}
            </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border-light scrollbar-hide">
        <TabButton id="info" icon={Layout} label="بيانات المشروع" />
        <TabButton id="images" icon={ImageIcon} label="الصور والميديا" disabled={!projectId} />
        <TabButton id="sections" icon={Home} label="الأقسام" disabled={!projectId} />
        <TabButton id="units" icon={Layout} label="الوحدات" disabled={!projectId} />
        <TabButton id="files" icon={FileText} label="الملفات" disabled={!projectId} />
      </div>

      {/* Content */}
      <div className="p-8">
        {/* TAB 1: INFO */}
        {activeTab === 'info' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">اسم المشروع</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={projectInfo.name} 
                        onChange={handleInfoChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                        placeholder="مثال: أبراج العلياء"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">Slug (الرابط المختصر)</label>
                    <input 
                        type="text" 
                        name="slug" 
                        value={projectInfo.slug} 
                        onChange={handleInfoChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                        placeholder="example-project-name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">رابط الموقع/الخريطة</label>
                    <input 
                        type="text" 
                        name="link" 
                        value={projectInfo.link} 
                        onChange={handleInfoChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all dir-ltr"
                        placeholder="https://maps.app.goo.gl/..."
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary mb-2">الوصف</label>
                    <textarea 
                        name="description" 
                        value={projectInfo.description} 
                        onChange={handleInfoChange}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                        placeholder="وصف مختصر للمشروع ومميزاته..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">الموقع (نص)</label>
                    <input 
                        type="text" 
                        name="location" 
                        value={projectInfo.location} 
                        onChange={handleInfoChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                        placeholder="الحي، المدينة"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">حالة المشروع</label>
                    <select 
                        name="status" 
                        value={projectInfo.status} 
                        onChange={handleInfoChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                    >
                        <option value="upcoming">قريباً</option>
                        <option value="ongoing">قيد الإنشاء</option>
                        <option value="completed">مكتمل</option>
                    </select>
                </div>
            </div>

            {/* Main Image & Brochure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">الصورة الرئيسية</label>
                    <div 
                        onClick={() => mainImageInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group"
                    >
                        {projectInfo.main_image ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <img src={projectInfo.main_image} alt="Main" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-sm">تغيير الصورة</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8">
                                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-[#D4AF37]" />
                                <span className="text-sm text-gray-500">اضغط لرفع صورة</span>
                            </div>
                        )}
                        <input 
                            ref={mainImageInputRef} 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleMainImageUpload} 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-primary mb-2">بروشور المشروع (PDF)</label>
                    <div 
                        onClick={() => brochureInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all h-[150px] flex items-center justify-center group"
                    >
                         {projectInfo.brochure ? (
                            <div className="flex items-center gap-3">
                                <FileText className="text-[#D4AF37] w-8 h-8" />
                                <span className="text-sm text-primary font-medium">تم رفع الملف</span>
                            </div>
                        ) : (
                            <div>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-[#D4AF37]" />
                                <span className="text-sm text-gray-500">اضغط لرفع PDF</span>
                            </div>
                        )}
                        <input 
                            ref={brochureInputRef} 
                            type="file" 
                            accept=".pdf" 
                            className="hidden" 
                            onChange={handleBrochureUpload} 
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <button 
                    onClick={handleSaveProjectInfo}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#C9A24D] via-[#D4AF37] to-[#B89B5E] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    <span>{projectId ? 'حفظ التغييرات' : 'إنشاء المشروع'}</span>
                </button>
            </div>
          </motion.div>
        )}

        {/* TAB 2: IMAGES */}
        {activeTab === 'images' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-medium">معرض الصور</h3>
                     <button 
                        onClick={() => projectImagesInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-white transition-all"
                     >
                         <Plus size={16} />
                         <span>إضافة صور</span>
                     </button>
                     <input 
                        ref={projectImagesInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleAddImage}
                     />
                 </div>

                 {images.length === 0 ? (
                     <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                         <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                         <p className="text-gray-500">لا توجد صور مضافة بعد</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {images.map((img, idx) => (
                             <div key={img.id || idx} className="relative group rounded-lg overflow-hidden h-40 bg-gray-100">
                                 <img 
                                    src={img.image_url} 
                                    alt="" 
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                 />
                                 <button 
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    title="حذف الصورة"
                                 >
                                     <X size={14} />
                                 </button>
                                 <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <select 
                                        className="w-full text-xs bg-transparent text-white border-none outline-none cursor-pointer"
                                        value={img.type || 'interior'}
                                        onChange={(e) => handleUpdateImageType(img.id, e.target.value)}
                                     >
                                         <option value="interior" className="text-black">داخلية</option>
                                         <option value="exterior" className="text-black">خارجية</option>
                                         <option value="plan" className="text-black">مخطط</option>
                                     </select>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </motion.div>
        )}

        {/* Other tabs can be implemented similarly... placeholder for now */}
        {activeTab === 'sections' && <ProjectSections projectId={projectId} />}
        {activeTab === 'units' && <ProjectUnits projectId={projectId} />}
        {activeTab === 'files' && <ProjectFiles projectId={projectId} />}

      </div>
    </div>
  );
}
