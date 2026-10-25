'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Upload, X, Plus, Save, Image as ImageIcon, FileText, Layout, Home, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectSections from './ProjectSections';
import ProjectUnits from './ProjectUnits';
import ProjectFiles from './ProjectFiles';
import './ProjectForm.css';
import ProjectLocationPicker from './ProjectLocationPicker';

const editorHelp = {
  info: ['بيانات المشروع', 'عدّل الاسم والموقع والوصف والصورة الرئيسية، ثم اضغط «حفظ التغييرات». هذه البيانات تظهر للزائر في صفحة المشروع.'],
  images: ['صور المشروع', 'اضغط «إضافة صور» واختر صورة أو أكثر. حدّد أسفل كل صورة هل هي داخلية أو خارجية أو مخطط. إضافتها وتصنيفها يُحفظان مباشرة.'],
  sections: ['أقسام المشروع', 'القسم يجمع الوحدات المتشابهة، مثل مبنى أ أو الفلل. أضف القسم أولًا، ثم اربط الوحدات به من «الوحدات». استخدم زر الحفظ داخل نموذج القسم.'],
  units: ['نماذج الوحدات', 'اضغط «إضافة نموذج»، ثم أكمل بياناته ومخططه وراجع المعاينة قبل الحفظ. يمكنك حفظ النموذج وإضافة آخر مباشرة.'],
  files: ['ملفات للتحميل', 'أضف الملفات التي تريد أن يحمّلها الزائر، وسمّ كل ملف باسم واضح مثل «مخطط المشروع». اتبع زر الإضافة أو الحفظ داخل هذا القسم.'],
};
const steps = ['info', 'images', 'sections', 'units', 'files'];

export default function ProjectForm({ project, onSuccess }) {
  const [activeTab, setActiveTab] = useState('info');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [projectId, setProjectId] = useState(project?.id || null);
  const [unitEditorOpen, setUnitEditorOpen] = useState(false);
  const stepIndex = steps.indexOf(activeTab);
  const changeStep = (id) => {
    setActiveTab(id);
    setMessage(null);
    requestAnimationFrame(() => document.getElementById('pe-step-title')?.focus());
  };

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

  const handleSaveProjectInfo = async (advance = false) => {
    if (!projectInfo.name.trim()) {
        setMessage({ type: 'error', text: 'اكتب اسم المشروع أولًا، ثم احفظ.' });
        document.getElementById('project-name')?.focus();
        return;
    }
    try {
        setLoading(true);
        setMessage(null);

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
        if (advance || !projectId) changeStep('images');
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
      onClick={() => !disabled && changeStep(id)}
      disabled={disabled || loading || unitEditorOpen || (activeTab === 'info' && id !== 'info')}
      type="button"
      aria-current={activeTab === id ? 'step' : undefined}
      title={disabled ? 'احفظ بيانات المشروع أولًا لفتح هذا القسم' : label}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-300 border-b-2 ${
        activeTab === id 
          ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5' 
          : 'border-transparent text-secondary-text hover:text-primary'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="pe-step-number">{steps.indexOf(id) + 1}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="project-editor bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
      {locationPickerOpen && <ProjectLocationPicker link={projectInfo.link} location={projectInfo.location} onClose={() => setLocationPickerOpen(false)} onSelect={link => { setProjectInfo(previous => ({ ...previous, link })); setLocationPickerOpen(false); }} />}
      {/* Header */}
      <div className="bg-gray-50 px-8 py-6 border-b border-border-light flex justify-between items-center">
        <div>
            <h2 className="text-xl font-medium text-primary">
                {projectId ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
            </h2>
            <p className="text-sm text-secondary-text mt-1">أكمل المشروع خطوة بخطوة. يمكنك الرجوع لأي خطوة، وتجاوز التفاصيل الاختيارية.</p>
        </div>
        {message && (
            <motion.div 
                role={message.type === 'error' ? 'alert' : 'status'}
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
      <div className="pe-steps flex overflow-x-auto border-b border-border-light scrollbar-hide" role="navigation" aria-label="خطوات تجهيز المشروع">
        <TabButton id="info" icon={Layout} label="البيانات الأساسية" />
        <TabButton id="images" icon={ImageIcon} label="صور المشروع" disabled={!projectId} />
        <TabButton id="sections" icon={Home} label="الأقسام" disabled={!projectId} />
        <TabButton id="units" icon={Layout} label="الوحدات" disabled={!projectId} />
        <TabButton id="files" icon={FileText} label="الملفات" disabled={!projectId} />
      </div>

      {/* Content */}
      <div className="p-8">
        <h3 id="pe-step-title" tabIndex={-1} className="pe-step-title">الخطوة {stepIndex + 1} من {steps.length}: {editorHelp[activeTab][0]}</h3>
        <aside className="pe-help" aria-label="تعليمات التعديل">
          <strong>كيف أعدّل {editorHelp[activeTab][0]}؟</strong>
          <p>{editorHelp[activeTab][1]}</p>
          <details><summary>دليل سريع لإدارة المشروع</summary><ol>
            <li>البيانات الأساسية: اسم المشروع ووصفه وموقعه وصورته الرئيسية.</li>
            <li>صور المشروع: صور إضافية تظهر في معرض الصور.</li>
            <li>الأقسام: المباني أو المجموعات التي تتبع لها الوحدات.</li>
            <li>الوحدات: الشقق أو الفلل وتفاصيل كل وحدة.</li>
            <li>الملفات: مستندات ومخططات يستطيع الزائر تحميلها.</li>
          </ol><p>لا تحتاج تعبئة كل الأقسام مرة واحدة. ابدأ بالبيانات الأساسية، وأكمل الباقي عند توفره.</p></details>
        </aside>
        {/* TAB 1: INFO */}
        {activeTab === 'info' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pe-info-layout">
            <div className="pe-info-main">
              <section className="pe-info-card" aria-labelledby="pe-identity-title">
                <header><span>01</span><div><h3 id="pe-identity-title">تعريف المشروع</h3><p>ابدأ بما سيتعرف عليه العميل عند زيارة المشروع.</p></div></header>
                <label className="pe-field" htmlFor="project-name"><span>اسم المشروع <b>مطلوب</b></span><input id="project-name" name="name" value={projectInfo.name} onChange={handleInfoChange} placeholder="مثال: صفوة الروضة" /></label>
                <label className="pe-field" htmlFor="project-description"><span>نبذة عن المشروع <small>اختياري</small></span><textarea id="project-description" name="description" value={projectInfo.description} onChange={handleInfoChange} rows={5} placeholder="عرّف المشروع في سطرين أو ثلاثة، واذكر أبرز مميزاته…"/><small>مثال: وحدات سكنية عصرية في حي الروضة، بتصاميم واسعة وقريبة من الخدمات.</small></label>
              </section>
              <section className="pe-info-card" aria-labelledby="pe-location-title">
                <header><span>02</span><div><h3 id="pe-location-title">الموقع وحالة المشروع</h3><p>ساعد العميل على معرفة مكان المشروع ومرحلة إنجازه.</p></div></header>
                <div className="pe-field-row">
                  <label className="pe-field" htmlFor="project-location"><span>المدينة والحي</span><input id="project-location" name="location" value={projectInfo.location} onChange={handleInfoChange} placeholder="مثال: جدة، حي الروضة"/></label>
                  <label className="pe-field" htmlFor="project-status"><span>حالة المشروع</span><select id="project-status" name="status" value={projectInfo.status} onChange={handleInfoChange}><option value="upcoming">قريبًا</option><option value="ongoing">قيد الإنشاء</option><option value="completed">مكتمل</option></select></label>
                </div>
                <div className="pe-field"><span>الموقع على الخريطة <small>اختياري</small></span><button type="button" className="pe-map-choose" disabled={loading} onClick={() => setLocationPickerOpen(true)}><Home size={17}/>{projectInfo.link ? 'تحديد أو تغيير الموقع على الخريطة' : 'تحديد الموقع على الخريطة'}</button><small>{projectInfo.link ? 'تمت إضافة رابط الموقع. يمكنك تغييره من الخريطة أو تعديل الرابط يدويًا.' : 'افتح الخريطة وحدّد مكان المشروع بنقرة واحدة.'}</small><details className="pe-map-field"><summary>إضافة رابط خرائط يدويًا</summary><label htmlFor="project-map" className="sr-only">رابط الخريطة</label><input id="project-map" name="link" dir="ltr" value={projectInfo.link} onChange={handleInfoChange} placeholder="https://maps.app.goo.gl/..."/></details></div>
              </section>
              <details className="pe-advanced"><summary>إعدادات إضافية — الرابط المختصر</summary><label className="pe-field" htmlFor="project-slug"><span>الرابط المختصر</span><input id="project-slug" name="slug" dir="ltr" value={projectInfo.slug} onChange={handleInfoChange} placeholder="example-project"/><small>يمكنك تركه كما هو. عند تغييره استخدم حروفًا إنجليزية وشرطات بين الكلمات.</small></label></details>
            </div>
            <aside className="pe-info-media" aria-label="صورة المشروع والبروشور">
              <section className="pe-info-card">
                <header><span><ImageIcon size={18}/></span><div><h3>الصورة الرئيسية</h3><p>تظهر في بطاقة المشروع وأعلى صفحته.</p></div></header>
                <button type="button" className={`pe-cover-upload ${projectInfo.main_image ? 'has-image' : ''}`} disabled={loading} onClick={() => mainImageInputRef.current?.click()}>
                  {projectInfo.main_image ? <img src={projectInfo.main_image} alt="الصورة الرئيسية للمشروع"/> : <><Upload size={30}/><strong>اختر صورة المشروع</strong><small>صورة أفقية واضحة تعكس هوية المشروع</small></>}
                  {projectInfo.main_image && <span>تغيير الصورة</span>}
                </button>
                <input ref={mainImageInputRef} type="file" accept="image/*" hidden onChange={handleMainImageUpload}/>
                <p className="pe-media-hint">بعد رفع الصورة، اضغط «حفظ ومتابعة» لتثبيتها ضمن بيانات المشروع.</p>
              </section>
              <section className="pe-info-card">
                <header><span><FileText size={18}/></span><div><h3>بروشور المشروع <small>اختياري</small></h3><p>ملف تعريفي يستطيع العميل تحميله.</p></div></header>
                <button type="button" className="pe-brochure-upload" disabled={loading} onClick={() => brochureInputRef.current?.click()}><FileText size={27}/><span><strong>{projectInfo.brochure ? 'البروشور مرفوع' : 'إرفاق البروشور'}</strong><small>{projectInfo.brochure ? 'اضغط لاختيار ملف بديل' : 'اختر ملف PDF من جهازك'}</small></span><Plus size={18}/></button>
                <input ref={brochureInputRef} type="file" accept=".pdf" hidden onChange={handleBrochureUpload}/>
                {projectInfo.brochure && <a className="pe-file-preview" href={projectInfo.brochure} target="_blank" rel="noopener noreferrer">معاينة البروشور ↗</a>}
              </section>
              <p className="pe-media-hint">الصور الإضافية ومخططات الوحدات لها خطوات مستقلة بعد حفظ هذه البيانات.</p>
            </aside>
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
        {projectId && <>
          <div hidden={activeTab !== 'sections'}><ProjectSections projectId={projectId} /></div>
          <div hidden={activeTab !== 'units'}><ProjectUnits projectId={projectId} onEditingChange={setUnitEditorOpen} /></div>
          <div hidden={activeTab !== 'files'}><ProjectFiles projectId={projectId} /></div>
        </>}

        <div className="pe-step-actions" hidden={unitEditorOpen}>
          <button type="button" disabled={stepIndex === 0 || loading} onClick={() => changeStep(steps[stepIndex - 1])}>السابق</button>
          <p>{activeTab === 'info' ? 'سنحفظ البيانات الأساسية قبل الانتقال للصور.' : 'احفظ أي نموذج مفتوح من زر الحفظ الخاص به. يمكنك إكمال هذه الخطوة لاحقًا.'}</p>
          <button type="button" className="pe-next" disabled={loading} onClick={() => {
            if (activeTab === 'info') handleSaveProjectInfo(true);
            else if (stepIndex < steps.length - 1) changeStep(steps[stepIndex + 1]);
            else onSuccess?.();
          }}>{loading ? 'جارٍ الحفظ أو الرفع…' : activeTab === 'info' ? 'حفظ ومتابعة للصور' : stepIndex === steps.length - 1 ? 'إنهاء والعودة للمشاريع' : `التالي: ${editorHelp[steps[stepIndex + 1]][0]}`}</button>
        </div>

      </div>
    </div>
  );
}
