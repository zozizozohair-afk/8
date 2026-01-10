'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Home, Loader2, ArrowRight } from 'lucide-react';

export default function ProjectUnits({ projectId }) {
    const [units, setUnits] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({ 
        unit_number: '', 
        type: 'Apartment', 
        size: '', 
        price: '', 
        status: 'available', 
        section_id: '',
        main_image: '',
        model_details: '',
        model_count: ''
    });
    const [uploading, setUploading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: sectionsData } = await supabase.from('project_sections').select('id, name').eq('project_id', projectId);
        if (sectionsData) setSections(sectionsData);
        const { data: unitsData } = await supabase.from('units').select(`
            *,
            project_sections ( name )
        `).eq('project_id', projectId).order('created_at');
        if (unitsData) setUnits(unitsData);
        setLoading(false);
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            const t = setTimeout(() => {
                fetchData();
            }, 0);
            return () => clearTimeout(t);
        }
    }, [projectId, fetchData]);

    const handleSave = async () => {
        if (!projectId) {
            alert('لا يمكن حفظ الوحدة بدون مشروع معرف');
            return;
        }
        if (!formData.unit_number) {
            alert('رقم الوحدة مطلوب');
            return;
        }
        setLoading(true);
        
        const { id, created_at, project_sections, ...dataToSave } = formData;
        const payload = {
            ...dataToSave,
            project_id: projectId,
            section_id: formData.section_id || null,
            size: formData.size === '' ? null : Number(formData.size),
            price: formData.price === '' ? null : Number(formData.price),
            model_count: formData.model_count === '' ? null : parseInt(formData.model_count, 10)
        };
        
        let error;
        if (editingId && editingId !== 'new') {
            const { error: err } = await supabase.from('units').update(payload).eq('id', editingId);
            error = err;
        } else {
            const { error: err } = await supabase.from('units').insert(payload);
            error = err;
        }

        if (!error) {
            setEditingId(null);
            setFormData({ unit_number: '', type: 'Apartment', size: '', price: '', status: 'available', section_id: '', main_image: '', model_details: '', model_count: '' });
            fetchData();
        } else {
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء الحفظ' });
            alert(`حدث خطأ أثناء الحفظ: ${error.message || 'غير معروف'}`);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        await supabase.from('units').delete().eq('id', id);
        fetchData();
    };

    const handleEdit = (unit) => {
        setEditingId(unit.id);
        setFormData({
            ...unit,
            section_id: unit.section_id || '',
            model_details: unit.model_details || '',
            model_count: unit.model_count ?? ''
        });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const { data, error } = await supabase.storage.from('files').upload(`units/${fileName}`, file);
        if (!error) {
            const { data: publicUrl } = supabase.storage.from('files').getPublicUrl(`units/${fileName}`);
            setFormData(prev => ({ ...prev, main_image: publicUrl.publicUrl }));
        } else {
            console.error(error);
            alert('فشل رفع الملف');
        }
        setUploading(false);
    };

    if (loading && !units.length) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">نماذج الوحدات</h3>
                {!editingId && (
                    <button 
                        onClick={() => setEditingId('new')}
                        className="flex items-center gap-2 bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#B8860B] transition-colors"
                    >
                        <Plus size={18} /> إضافة نموذج
                    </button>
                )}
            </div>

            {/* Form */}
            {(editingId === 'new' || editingId) && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم/رقم النموذج</label>
                            <input 
                                type="text" 
                                value={formData.unit_number}
                                onChange={(e) => setFormData({...formData, unit_number: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                placeholder="مثال: نموذج A-101"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                            <select 
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none bg-white"
                            >
                                <option value="Apartment">شقة (Apartment)</option>
                                <option value="Villa">فيلا (Villa)</option>
                                <option value="Office">مكتب (Office)</option>
                                <option value="Shop">محل تجاري (Shop)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">القسم التابع له (اختياري)</label>
                            <select 
                                value={formData.section_id}
                                onChange={(e) => setFormData({...formData, section_id: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none bg-white"
                            >
                                <option value="">بدون قسم محدد</option>
                                {sections.map(sec => (
                                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المساحة (م²)</label>
                            <input 
                                type="number" 
                                value={formData.size}
                                onChange={(e) => setFormData({...formData, size: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                            <input 
                                type="number" 
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">عدد النموذج</label>
                            <input 
                                type="number" 
                                value={formData.model_count}
                                onChange={(e) => setFormData({...formData, model_count: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                placeholder="مثال: 12"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none bg-white"
                            >
                                <option value="available">متاحة (Available)</option>
                                <option value="reserved">محجوزة (Reserved)</option>
                                <option value="sold">مباعة (Sold)</option>
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">صورة الوحدة (اختياري)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="file" 
                                    onChange={handleUpload}
                                    className="hidden" 
                                    id="unit-image-upload"
                                />
                                <label htmlFor="unit-image-upload" className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                                    <span className="text-sm text-gray-600">{formData.main_image ? 'تم الرفع (تغيير)' : 'رفع صورة'}</span>
                                </label>
                                {formData.main_image && (
                                    <a href={formData.main_image} target="_blank" rel="noreferrer" className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                        <ImageIcon size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل النموذج</label>
                            <textarea 
                                value={formData.model_details}
                                onChange={(e) => setFormData({...formData, model_details: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                rows="3"
                                placeholder="أدخل وصفاً تفصيلياً لهذا النموذج: عدد الغرف، المميزات، التشطيب، إلخ"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => { setEditingId(null); setFormData({ unit_number: '', type: 'Apartment', size: '', price: '', status: 'available', section_id: '', main_image: '', model_details: '', model_count: '' }); }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={loading || uploading}
                            className="flex items-center gap-2 bg-[#D4AF37] text-white px-6 py-2 rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            حفظ
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                            <th className="p-4 font-semibold">اسم/رقم النموذج</th>
                            <th className="p-4 font-semibold">النوع</th>
                            <th className="p-4 font-semibold">القسم</th>
                            <th className="p-4 font-semibold">المساحة</th>
                            <th className="p-4 font-semibold">السعر</th>
                            <th className="p-4 font-semibold">عدد النموذج</th>
                            <th className="p-4 font-semibold">تفاصيل</th>
                            <th className="p-4 font-semibold">الحالة</th>
                            <th className="p-4 font-semibold">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.map(unit => (
                            <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-gray-800 flex items-center gap-3">
                                    {unit.main_image && (
                                        <img src={unit.main_image} alt="" className="w-8 h-8 rounded object-cover bg-gray-200" />
                                    )}
                                    {unit.unit_number}
                                </td>
                                <td className="p-4 text-gray-600">{unit.type}</td>
                                <td className="p-4 text-gray-600">{unit.project_sections?.name || '-'}</td>
                                <td className="p-4 text-gray-600">{unit.size ? `${unit.size} م²` : '-'}</td>
                                <td className="p-4 text-gray-600">{unit.price ? unit.price.toLocaleString() : '-'}</td>
                                <td className="p-4 text-gray-600">{unit.model_count ?? '-'}</td>
                                <td className="p-4 text-gray-600">{unit.model_details ? unit.model_details.slice(0, 60) + (unit.model_details.length > 60 ? '…' : '') : '-'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        unit.status === 'available' ? 'bg-green-100 text-green-700' :
                                        unit.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {unit.status === 'available' ? 'متاحة' :
                                         unit.status === 'reserved' ? 'محجوزة' : 'مباعة'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(unit)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(unit.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && units.length === 0 && !editingId && (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-4">
                        لا توجد نماذج مضافة بعد
                    </div>
                )}
            </div>
        </div>
    );
}
