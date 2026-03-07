import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Plus, Edit2, Trash2, X, Hotel, Phone, Globe, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const TYPES = ['hotel', 'guesthouse', 'hostel'];

const AdminAccommodations = () => {
    const { showToast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [modal, setModal] = useState(null); // null | { mode: 'create' | 'edit', data }

    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedAccForImages, setSelectedAccForImages] = useState(null);
    const [accImages, setAccImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const emptyForm = { name: { fr: '', en: '', ar: '' }, description: { fr: '', en: '', ar: '' }, type: 'hotel', latitude: 0, longitude: 0, address: '', phone: '', website: '', price_range: '', rating: 0, is_active: true };

    useEffect(() => { fetchItems(); }, [filterType]);

    async function fetchItems() {
        setLoading(true);
        let q = supabase.from('accommodations').select('*').order('created_at', { ascending: false });
        if (filterType !== 'all') q = q.eq('type', filterType);
        const { data } = await q;
        setItems(data || []);
        setLoading(false);
    }

    const filtered = items.filter(i => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (i.name?.fr?.toLowerCase().includes(s) || i.name?.en?.toLowerCase().includes(s) || i.address?.toLowerCase().includes(s));
    });

    async function handleSave(formData) {
        let error;
        if (modal.mode === 'create') {
            ({ error } = await supabase.from('accommodations').insert(formData));
        } else {
            ({ error } = await supabase.from('accommodations').update(formData).eq('id', modal.data.id));
        }
        if (error) return showToast(error.message, 'error');
        showToast(`Accommodation ${modal.mode === 'create' ? 'created' : 'updated'} successfully!`, 'success');
        setModal(null);
        fetchItems();
    }

    async function handleDelete(id) {
        if (!confirm('Delete this accommodation?')) return;
        const { error } = await supabase.from('accommodations').delete().eq('id', id);
        if (error) return showToast(error.message, 'error');
        showToast('Accommodation deleted.', 'success');
        fetchItems();
    }

    async function toggleActive(item) {
        await supabase.from('accommodations').update({ is_active: !item.is_active }).eq('id', item.id);
        fetchItems();
    }

    const openImages = async (acc) => {
        setSelectedAccForImages(acc);
        setAccImages([]);
        setShowImageModal(true);
        setLoadingImages(true);
        await fetchAccImages(acc.id);
        setLoadingImages(false);
    };

    const fetchAccImages = async (accId) => {
        const { data, error } = await supabase.from('accommodation_images').select('*').eq('accommodation_id', accId).order('created_at', { ascending: false });
        if (error) return showToast('Could not load images: ' + error.message, 'error');
        setAccImages(data || []);
    };

    const handleAddImage = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        setUploadingImage(true);

        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${selectedAccForImages.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('accommodation-images')
            .upload(filePath, selectedFile);

        if (uploadError) {
            showToast('Upload failed: ' + uploadError.message, 'error');
            setUploadingImage(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('accommodation-images')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase.from('accommodation_images').insert({
            accommodation_id: selectedAccForImages.id,
            image_url: publicUrl,
            is_primary: accImages.length === 0
        });

        if (dbError) {
            showToast('Database save failed: ' + dbError.message, 'error');
        } else {
            setSelectedFile(null);
            if (document.getElementById('file-upload')) {
                document.getElementById('file-upload').value = '';
            }
            fetchAccImages(selectedAccForImages.id);
        }
        setUploadingImage(false);
    };

    const handleDeleteImage = async (imageId) => {
        if (!confirm('Delete this image?')) return;
        await supabase.from('accommodation_images').delete().eq('id', imageId);
        fetchAccImages(selectedAccForImages.id);
    };

    const handleSetPrimaryImage = async (imageId) => {
        await supabase.from('accommodation_images').update({ is_primary: false }).eq('accommodation_id', selectedAccForImages.id);
        await supabase.from('accommodation_images').update({ is_primary: true }).eq('id', imageId);
        fetchAccImages(selectedAccForImages.id);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Accommodations</h2>
                    <p className="text-sm text-slate-500">Manage hotels, guesthouses, and hostels.</p>
                </div>
                <button onClick={() => setModal({ mode: 'create', data: { ...emptyForm } })} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                    <Plus size={18} /> Add Accommodation
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or address..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-sky-500" />
                </div>
                <div className="flex gap-2">
                    {['all', ...TYPES].map(t => (
                        <button key={t} onClick={() => setFilterType(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filterType === t ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {t === 'all' ? 'All' : t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No accommodations found.</td></tr>
                            ) : filtered.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800">{item.name?.fr || item.name?.en || '—'}</td>
                                    <td className="px-6 py-4"><span className="capitalize bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{item.type}</span></td>
                                    <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{item.address || '—'}</td>
                                    <td className="px-6 py-4 text-slate-600">{item.phone || '—'}</td>
                                    <td className="px-6 py-4 text-slate-600">{item.price_range || '—'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleActive(item)} className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {item.is_active ? 'Active' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openImages(item)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><ImageIcon size={16} /></button>
                                            <button onClick={() => setModal({ mode: 'edit', data: { ...item } })} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal && <AccommodationModal modal={modal} onClose={() => setModal(null)} onSave={handleSave} />}

            {/* Images Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Manage Images</h3>
                                <p className="text-sm text-slate-500">{selectedAccForImages?.name?.en || selectedAccForImages?.name?.fr}</p>
                            </div>
                            <button onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={24} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                            {/* Upload Section */}
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-slate-700 mb-2">Upload New Image</h4>
                                <form onSubmit={handleAddImage} className="flex gap-2">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        accept="image/*"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={uploadingImage || !selectedFile}
                                        className="px-6 py-2 bg-sky-600 text-white font-bold rounded-lg text-sm hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {uploadingImage ? 'Uploading...' : 'Upload'}
                                    </button>
                                </form>
                            </div>

                            {/* Image Grid */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-4">Current Images ({accImages.length})</h4>
                                {accImages.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                        <ImageIcon size={48} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-500 font-medium">{loadingImages ? 'Loading images...' : 'No images uploaded yet.'}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {accImages.map((img) => (
                                            <div key={img.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                                                <div className="aspect-video relative overflow-hidden bg-slate-100">
                                                    <img src={img.image_url} alt="Site" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                </div>
                                                <div className="p-3">
                                                    <div className="flex justify-between items-center">
                                                        {img.is_primary ? (
                                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Primary</span>
                                                        ) : (
                                                            <button onClick={() => handleSetPrimaryImage(img.id)} className="text-xs font-bold text-slate-500 hover:text-sky-600 hover:bg-sky-50 px-2 py-1 rounded transition-colors">Set Primary</button>
                                                        )}
                                                        <button onClick={() => handleDeleteImage(img.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete Image">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AccommodationModal = ({ modal, onClose, onSave }) => {
    const [form, setForm] = useState(modal.data);
    const [saving, setSaving] = useState(false);
    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
    const setName = (lang, val) => setForm(prev => ({ ...prev, name: { ...prev.name, [lang]: val } }));
    const setDesc = (lang, val) => setForm(prev => ({ ...prev, description: { ...prev.description, [lang]: val } }));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800">{modal.mode === 'create' ? 'Add Accommodation' : 'Edit Accommodation'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                        {['fr', 'en', 'ar'].map(l => (
                            <div key={l}>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Name ({l})</label>
                                <input value={form.name?.[l] || ''} onChange={e => setName(l, e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" required={l === 'fr'} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {['fr', 'en', 'ar'].map(l => (
                            <div key={l}>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description ({l})</label>
                                <textarea value={form.description?.[l] || ''} onChange={e => setDesc(l, e.target.value)} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
                            <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Address</label>
                            <input value={form.address || ''} onChange={e => set('address', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Latitude</label>
                            <input type="number" step="any" value={form.latitude} onChange={e => set('latitude', parseFloat(e.target.value) || 0)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Longitude</label>
                            <input type="number" step="any" value={form.longitude} onChange={e => set('longitude', parseFloat(e.target.value) || 0)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                            <input value={form.phone || ''} onChange={e => set('phone', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Website</label>
                            <input value={form.website || ''} onChange={e => set('website', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Price Range</label>
                            <input value={form.price_range || ''} onChange={e => set('price_range', e.target.value)} placeholder="e.g. $$ or 3000-5000 DZD" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminAccommodations;
