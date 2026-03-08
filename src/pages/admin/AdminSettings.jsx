import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import logger from '../../utils/logger';
import { useToast } from '../../context/ToastContext';
import { Save, Type, FileText, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
    const { showToast } = useToast();
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { fetchContent(); }, []);

    async function fetchContent() {
        setLoading(true);
        const { data } = await supabase.from('site_content').select('*').order('category').order('key');

        let currentData = data || [];
        const requiredKeys = [
            { key: 'gallery_hero_title', value: 'Biskra Through Your Lens', label: 'Gallery Page Hero Title', type: 'text', category: 'hero' },
            { key: 'gallery_hero_subtitle', value: 'Share your best shots of the oasis or vote in the latest photo competition.', label: 'Gallery Page Hero Subtitle', type: 'textarea', category: 'hero' }
        ];

        let missingKeys = false;
        for (const req of requiredKeys) {
            if (!currentData.find(d => d.key === req.key)) {
                await supabase.from('site_content').insert([req]);
                missingKeys = true;
            }
        }

        if (missingKeys) {
            const { data: refreshed } = await supabase.from('site_content').select('*').order('category').order('key');
            setContent(refreshed || []);
        } else {
            setContent(currentData);
        }

        setLoading(false);
    }

    function updateValue(id, newValue) {
        setContent(prev => prev.map(c => c.id === id ? { ...c, value: newValue } : c));
        setSaved(false);
    }

    async function saveAll() {
        setSaving(true);
        try {
            const updates = content.map(item => ({
                id: item.id,
                key: item.key,
                value: item.value,
                updated_at: new Date().toISOString()
            }));
            const { error } = await supabase.from('site_content').upsert(updates, { onConflict: 'id' });
            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            showToast('Settings saved successfully!', 'success');
        } catch (err) {
            logger.error('Save error:', err);
            showToast('Error saving. Check console.', 'error');
        } finally {
            setSaving(false);
        }
    }

    // Group by category — exclude image-type items (images are managed as local assets)
    const grouped = content.reduce((acc, item) => {
        if (item.type === 'image') return acc; // images are local assets, not editable
        const cat = item.category || 'general';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const categoryLabels = {
        hero: 'Hero Headlines & Badges',
        media: 'Fallback Content',
        general: 'General'
    };

    const typeIcon = (type) => {
        switch (type) {
            case 'textarea': return <FileText size={14} className="text-blue-500" />;
            default: return <Type size={14} className="text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Website Content</h2>
                    <p className="text-sm text-slate-500">Edit page titles, subtitles, and hero text across the website.</p>
                </div>
                <button onClick={saveAll} disabled={saving} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm ${saved ? 'bg-emerald-600 text-white' : 'bg-sky-600 hover:bg-sky-700 text-white'} disabled:opacity-50`}>
                    {saved ? <><CheckCircle size={18} /> Saved!</> : saving ? 'Saving...' : <><Save size={18} /> Save All Changes</>}
                </button>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Loading settings...</div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                    <p className="font-medium text-lg mb-2">No content entries found.</p>
                    <p className="text-sm">Run the <code className="bg-slate-100 px-2 py-1 rounded text-xs">005_site_content.sql</code> migration to seed default entries.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([category, items]) => (
                    <div key={category} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-base font-bold text-slate-700">{categoryLabels[category] || category}</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {items.map(item => (
                                <div key={item.id} className="px-6 py-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        {typeIcon(item.type)}
                                        <label className="text-sm font-bold text-slate-600">{item.label || item.key}</label>
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">{item.key}</span>
                                    </div>

                                    {item.type === 'textarea' ? (
                                        <textarea
                                            value={item.value || ''}
                                            onChange={e => updateValue(item.id, e.target.value)}
                                            rows={2}
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 resize-none"
                                        />
                                    ) : (
                                        <input
                                            value={item.value || ''}
                                            onChange={e => updateValue(item.id, e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminSettings;
