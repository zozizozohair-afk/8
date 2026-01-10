'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, FileText, Loader2, Download, Eye } from 'lucide-react';

export default function ProjectFiles({ projectId }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchFiles = useCallback(async () => {
        const { data } = await supabase.from('project_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
        if (data) setFiles(data);
        setLoading(false);
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            const t = setTimeout(() => {
                fetchFiles();
            }, 0);
            return () => clearTimeout(t);
        }
    }, [projectId, fetchFiles]);

    const handleUpload = async (e) => {
        const fileList = Array.from(e.target.files);
        if (!fileList.length) return;
        setUploading(true);

        for (const file of fileList) {
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const { data, error } = await supabase.storage.from('files').upload(`docs/${fileName}`, file);
            
            if (!error) {
                const { data: publicUrl } = supabase.storage.from('files').getPublicUrl(`docs/${fileName}`);
                
                await supabase.from('project_files').insert({
                    project_id: projectId,
                    file_url: publicUrl.publicUrl,
                    name: file.name,
                    type: file.type.split('/')[1] || 'unknown' // pdf, png, etc
                });
            } else {
                console.error(error);
            }
        }

        setUploading(false);
        fetchFiles();
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
        await supabase.from('project_files').delete().eq('id', id);
        fetchFiles();
    };

    if (loading && !files.length) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">الملفات والمرفقات</h3>
                <div>
                    <input 
                        type="file" 
                        multiple 
                        onChange={handleUpload} 
                        className="hidden" 
                        id="multi-file-upload" 
                    />
                    <label 
                        htmlFor="multi-file-upload" 
                        className={`flex items-center gap-2 bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#B8860B] transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        {uploading ? 'جاري الرفع...' : 'رفع ملفات'}
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map(file => (
                    <div key={file.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-3 bg-gray-50 rounded-lg text-[#D4AF37]">
                                <FileText size={24} />
                            </div>
                            <button onClick={() => handleDelete(file.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <h4 className="font-medium text-gray-800 mb-1 truncate" title={file.name}>{file.name}</h4>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded">{file.type}</span>
                            <div className="flex gap-2">
                                <a 
                                    href={file.file_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-1.5 text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-lg transition-colors"
                                    title="مشاهدة"
                                >
                                    <Eye size={18} />
                                </a>
                                <a 
                                    href={file.file_url} 
                                    download
                                    className="p-1.5 text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-lg transition-colors"
                                    title="تحميل"
                                >
                                    <Download size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
                
                {!loading && files.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        لا توجد ملفات مرفقة بعد. يمكنك رفع مخططات، عقود، أو أي مستندات أخرى.
                    </div>
                )}
            </div>
        </div>
    );
}
