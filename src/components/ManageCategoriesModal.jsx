import { useState } from 'react';
import { X, Plus, Pencil, Trash2, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useToast } from '../context/ToastContext';

const defaultForm = { name_en: '', name_fr: '', name_ar: '', sort_order: 0 };

const ManageCategoriesModal = ({ tableName, categories, onClose, onCategoryChange }) => {
    const { showToast } = useToast();
    const [form, setForm] = useState(defaultForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [list, setList] = useState([...categories].sort((a, b) => a.sort_order - b.sort_order));

    const refresh = async () => {
        const { data } = await supabase.from(tableName).select('*').order('sort_order');
        if (data) {
            setList(data);
            onCategoryChange(data);
        }
    };

    const handleSave = async () => {
        if (!form.name_en.trim()) return showToast('English name is required.', 'info');
        setSaving(true);
        try {
            if (editingId) {
                const { error } = await supabase.from(tableName).update({
                    name_en: form.name_en.trim(),
                    name_fr: form.name_fr.trim(),
                    name_ar: form.name_ar.trim(),
                    sort_order: Number(form.sort_order),
                }).eq('id', editingId);
                if (error) throw error;
                showToast('Category updated.', 'success');
            } else {
                const { error } = await supabase.from(tableName).insert({
                    name_en: form.name_en.trim(),
                    name_fr: form.name_fr.trim(),
                    name_ar: form.name_ar.trim(),
                    sort_order: Number(form.sort_order),
                    icon_name: 'MapPin',
                });
                if (error) throw error;
                showToast('Category created.', 'success');
            }
            setForm(defaultForm);
            setEditingId(null);
            await refresh();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (cat) => {
        setForm({ name_en: cat.name_en, name_fr: cat.name_fr, name_ar: cat.name_ar, sort_order: cat.sort_order });
        setEditingId(cat.id);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category? This may affect items assigned to it.')) return;
        try {
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) throw error;
            showToast('Category deleted.', 'success');
            await refresh();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const moveUp = async (idx) => {
        if (idx === 0) return;
        const a = list[idx];
        const b = list[idx - 1];
        const { error: e1 } = await supabase.from(tableName).update({ sort_order: b.sort_order }).eq('id', a.id);
        const { error: e2 } = await supabase.from(tableName).update({ sort_order: a.sort_order }).eq('id', b.id);
        if (e1 || e2) return showToast('Reorder failed.', 'error');
        await refresh();
    };

    const moveDown = async (idx) => {
        if (idx === list.length - 1) return;
        const a = list[idx];
        const b = list[idx + 1];
        const { error: e1 } = await supabase.from(tableName).update({ sort_order: b.sort_order }).eq('id', a.id);
        const { error: e2 } = await supabase.from(tableName).update({ sort_order: a.sort_order }).eq('id', b.id);
        if (e1 || e2) return showToast('Reorder failed.', 'error');
        await refresh();
    };

    const cancelEdit = () => {
        setForm(defaultForm);
        setEditingId(null);
    };

    const catLabel = (tableName) => {
        if (tableName === 'site_categories') return 'Site';
        if (tableName === 'event_categories') return 'Event';
        if (tableName === 'accommodation_categories') return 'Accommodation';
        return '';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Manage {catLabel(tableName)} Categories</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {list.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No categories yet. Add one below.</p>
                    ) : (
                        <div className="space-y-2">
                            {list.map((cat, idx) => (
                                <div key={cat.id} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex flex-col gap-0.5">
                                        <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-20 p-0.5"><ArrowUp size={12} /></button>
                                        <button onClick={() => moveDown(idx)} disabled={idx === list.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-20 p-0.5"><ArrowDown size={12} /></button>
                                    </div>
                                    <div className="flex-1 min-w-0 grid grid-cols-3 gap-2 text-sm">
                                        <span className="truncate font-medium text-slate-800"><span className="text-[10px] uppercase text-slate-400">EN</span> {cat.name_en}</span>
                                        <span className="truncate text-slate-600"><span className="text-[10px] uppercase text-slate-400">FR</span> {cat.name_fr}</span>
                                        <span className="truncate text-slate-600" dir="rtl"><span className="text-[10px] uppercase text-slate-400">AR</span> {cat.name_ar}</span>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button onClick={() => handleEdit(cat)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Pencil size={14} /></button>
                                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-slate-100 pt-4">
                        <h4 className="text-sm font-bold text-slate-700 mb-3">{editingId ? 'Edit Category' : 'Add New Category'}</h4>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name (EN)</label>
                                <input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} placeholder="English" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name (FR)</label>
                                <input value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} placeholder="Français" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name (AR)</label>
                                <input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} placeholder="العربية" dir="rtl" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-32">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Order</label>
                                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <div className="flex gap-2 pt-5">
                                <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 flex items-center gap-1.5">
                                    {saving ? 'Saving...' : <>{editingId ? <Check size={14} /> : <Plus size={14} />} {editingId ? 'Update' : 'Add'}</>}
                                </button>
                                {editingId && (
                                    <button onClick={cancelEdit} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCategoriesModal;
