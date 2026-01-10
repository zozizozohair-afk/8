'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';

export default function ProjectSections({ projectId }) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', plan_image: '', brochure: '' });
    const [uploading, setUploading] = useState(false);

    const fetchSections = useCallback(async () => {
        const { data } = await supabase.from('project_sections').select('*').eq('project_id', projectId).order('created_at');
        if (data) setSections(data);
        setLoading(false);
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            const t = setTimeout(() => {
                fetchSections();
            }, 0);
            return () => clearTimeout(t);
        }
    }, [projectId, fetchSections]);

    const handleSave = async () => {
        if (!formData.name) return;
        setLoading(true);
        
        // Remove 'id' and 'created_at' from payload if they exist to avoid issues
        const { id, created_at, ...dataToSave } = formData;
        const payload = { ...dataToSave, project_id: projectId };
        
        let error;
        if (editingId && editingId !== 'new') {
            const { error: err } = await supabase.from('project_sections').update(payload).eq('id', editingId);
            error = err;
        } else {
            const { error: err } = await supabase.from('project_sections').insert(payload);
            error = err;
        }

        if (!error) {
            setEditingId(null);
            setFormData({ name: '', description: '', plan_image: '', brochure: '' });
            fetchSections();
        } else {
            console.error(error);
            alert('حدث خطأ أثناء الحفظ');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        await supabase.from('project_sections').delete().eq('id', id);
        fetchSections();
    };

    const handleEdit = (section) => {
        setEditingId(section.id);
        setFormData(section);
    };

    const handleUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const { data, error } = await supabase.storage.from('files').upload(`sections/${fileName}`, file);
        if (!error) {
            const { data: publicUrl } = supabase.storage.from('files').getPublicUrl(`sections/${fileName}`);
            setFormData(prev => ({ ...prev, [field]: publicUrl.publicUrl }));
        } else {
            console.error(error);
            alert('فشل رفع الملف');
        }
        setUploading(false);
    };

    if (loading && !sections.length) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">أقسام المشروع</h3>
                {!editingId && (
                    <button 
                        onClick={() => setEditingId('new')}
                        className="flex items-center gap-2 bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#B8860B] transition-colors"
                    >
                        <Plus size={18} /> إضافة قسم
                    </button>
                )}
            </div>

            {/* Form */}
            {(editingId === 'new' || editingId) && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                placeholder="مثال: المرحلة الأولى، المبنى A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">صورة المخطط (اختياري)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="file" 
                                    onChange={(e) => handleUpload(e, 'plan_image')}
                                    className="hidden" 
                                    id="section-plan-upload"
                                />
                                <label htmlFor="section-plan-upload" className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                                    <span className="text-sm text-gray-600">{formData.plan_image ? 'تم الرفع (تغيير)' : 'رفع صورة'}</span>
                                </label>
                                {formData.plan_image && (
                                    <a href={formData.plan_image} target="_blank" rel="noreferrer" className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                        <ImageIcon size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                rows="2"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ملف البروشور (PDF - اختياري)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="file" 
                                    onChange={(e) => handleUpload(e, 'brochure')}
                                    className="hidden" 
                                    id="section-brochure-upload"
                                    accept=".pdf"
                                />
                                <label htmlFor="section-brochure-upload" className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                    <span className="text-sm text-gray-600">{formData.brochure ? 'تم الرفع (تغيير)' : 'رفع ملف PDF'}</span>
                                </label>
                                {formData.brochure && (
                                    <a href={formData.brochure} target="_blank" rel="noreferrer" className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                        <FileText size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => { setEditingId(null); setFormData({ name: '', description: '', plan_image: '', brochure: '' }); }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={loading || uploading}
                            className="flex items-center gap-2 bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            حفظ
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {sections.map(section => (
                    <div key={section.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-accent/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {section.plan_image ? (
                                    <img src={section.plan_image} alt={section.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl font-bold text-gray-300">{section.name[0]}</span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{section.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1">{section.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            {section.brochure && (
                                <a href={section.brochure} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="تحميل البروشور">
                                    <FileText size={18} />
                                </a>
                            )}
                            <button onClick={() => handleEdit(section)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(section.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {!loading && sections.length === 0 && !editingId && (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        لا توجد أقسام مضافة بعد
                    </div>
                )}
            </div>
        </div>
    );
}
