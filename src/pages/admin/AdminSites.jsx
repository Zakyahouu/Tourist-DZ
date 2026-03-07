import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Pencil, Trash2, X, Search, MapPin, Eye, EyeOff, Image, Upload } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminSites = () => {
    const { showToast } = useToast();
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSite, setEditingSite] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedSiteForImages, setSelectedSiteForImages] = useState(null);
    const [siteImages, setSiteImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const emptySite = {
        name: { ar: '', fr: '', en: '' },
        description: { ar: '', fr: '', en: '' },
        category: 'historical',
        latitude: 34.8484,
        longitude: 5.7248,
        address: '',
        wheelchair_accessible: false,
        is_active: true,
        audio_url: '',
    };

    const [form, setForm] = useState(emptySite);

    useEffect(() => { fetchSites(); }, []);

    async function fetchSites() {
        setLoading(true);
        const { data, error } = await supabase.from('tourist_sites').select('*').order('created_at', { ascending: false });
        if (!error) setSites(data || []);
        setLoading(false);
    }

    const handleSave = async () => {
        if (!form.name.fr && !form.name.en) return showToast('Please enter at least a French or English name.', 'error');

        if (editingSite) {
            const { error } = await supabase.from('tourist_sites').update({
                name: form.name,
                description: form.description,
                category: form.category,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                address: form.address,
                wheelchair_accessible: form.wheelchair_accessible,
                is_active: form.is_active,
                audio_url: form.audio_url,
            }).eq('id', editingSite.id);
            if (error) return showToast(error.message, 'error');
        } else {
            const { error } = await supabase.from('tourist_sites').insert({
                name: form.name,
                description: form.description,
                category: form.category,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                address: form.address,
                wheelchair_accessible: form.wheelchair_accessible,
                is_active: form.is_active,
                audio_url: form.audio_url,
            });
            if (error) return showToast(error.message, 'error');
        }
        showToast(`Site ${editingSite ? 'updated' : 'created'} successfully!`, 'success');
        setShowModal(false);
        setEditingSite(null);
        setForm(emptySite);
        fetchSites();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this site permanently?')) return;
        const { error } = await supabase.from('tourist_sites').delete().eq('id', id);
        if (error) return showToast(error.message, 'error');
        showToast('Site deleted.', 'success');
        fetchSites();
    };

    const openEdit = (site) => {
        setEditingSite(site);
        setForm({
            name: site.name || { ar: '', fr: '', en: '' },
            description: site.description || { ar: '', fr: '', en: '' },
            category: site.category,
            latitude: site.latitude,
            longitude: site.longitude,
            address: site.address || '',
            wheelchair_accessible: site.wheelchair_accessible,
            is_active: site.is_active,
            audio_url: site.audio_url || ''
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingSite(null);
        setForm(emptySite);
        setShowModal(true);
    };

    const toggleActive = async (site) => {
        const { error } = await supabase.from('tourist_sites').update({ is_active: !site.is_active }).eq('id', site.id);
        if (error) return showToast('Could not update status: ' + error.message, 'error');
        fetchSites();
    };

    const openImages = async (site) => {
        setSelectedSiteForImages(site);
        setSiteImages([]);
        setShowImageModal(true);
        setLoadingImages(true);
        await fetchSiteImages(site.id);
        setLoadingImages(false);
    };

    const fetchSiteImages = async (siteId) => {
        const { data, error } = await supabase.from('site_images').select('*').eq('site_id', siteId).order('created_at', { ascending: false });
        if (error) return showToast('Could not load images: ' + error.message, 'error');
        setSiteImages(data || []);
    };

    const handleAddImage = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        setUploadingImage(true);

        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${selectedSiteForImages.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('site-images')
            .upload(filePath, selectedFile);

        if (uploadError) {
            showToast('Upload failed: ' + uploadError.message, 'error');
            setUploadingImage(false);
            return;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('site-images')
            .getPublicUrl(filePath);

        // 3. Save to Database
        const { error: dbError } = await supabase.from('site_images').insert({
            site_id: selectedSiteForImages.id,
            image_url: publicUrl,
            is_primary: siteImages.length === 0
        });

        if (dbError) {
            showToast('Database save failed: ' + dbError.message, 'error');
        } else {
            setSelectedFile(null);
            if (document.getElementById('site-file-upload')) {
                document.getElementById('site-file-upload').value = '';
            }
            fetchSiteImages(selectedSiteForImages.id);
            showToast('Image added successfully!', 'success');
        }
        setUploadingImage(false);
    };

    const handleDeleteImage = async (imageId) => {
        if (!confirm('Delete this image?')) return;
        await supabase.from('site_images').delete().eq('id', imageId);
        fetchSiteImages(selectedSiteForImages.id);
    };

    const handleSetPrimaryImage = async (imageId) => {
        const { error } = await supabase.rpc('set_primary_site_image', {
            p_image_id: imageId,
            p_site_id: selectedSiteForImages.id
        });
        if (error) return showToast('Could not set primary image: ' + error.message, 'error');
        fetchSiteImages(selectedSiteForImages.id);
    };

    const categories = ['historical', 'natural', 'cultural', 'thermal'];

    const filteredSites = sites.filter(s => {
        const matchesSearch = (s.name?.fr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.name?.en || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Tourist Sites</h2>
                    <p className="text-sm text-slate-500">{sites.length} sites in database</p>
                </div>
                <button onClick={openCreate} className="flex items-center px-5 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors shadow-sm self-start">
                    <Plus size={18} className="mr-2" /> Add Site
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search sites..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-sky-500"
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading...</div>
                ) : filteredSites.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <MapPin size={40} className="mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">No sites found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSites.map(site => (
                                    <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{site.name?.fr || site.name?.en || '—'}</div>
                                            <div className="text-xs text-slate-400">{site.address || 'No address'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${site.category === 'historical' ? 'bg-amber-100 text-amber-700'
                                                : site.category === 'natural' ? 'bg-green-100 text-green-700'
                                                    : site.category === 'cultural' ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>{site.category}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{site.avg_rating?.toFixed(1) || '0.0'}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleActive(site)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${site.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                                                {site.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                                                {site.is_active ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => openImages(site)} className="text-slate-400 hover:text-emerald-600 transition-colors p-1.5 hover:bg-emerald-50 rounded-lg" title="Manage Images"><Image size={16} /></button>
                                            <button onClick={() => openEdit(site)} className="text-slate-400 hover:text-sky-600 transition-colors p-1.5 hover:bg-sky-50 rounded-lg"><Pencil size={16} /></button>
                                            <button onClick={() => handleDelete(site.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">{editingSite ? 'Edit Site' : 'Add New Site'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Names */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['fr', 'en', 'ar'].map(lng => (
                                    <div key={lng}>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name ({lng})</label>
                                        <input
                                            type="text"
                                            value={form.name[lng]}
                                            onChange={e => setForm({ ...form, name: { ...form.name, [lng]: e.target.value } })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                                            dir={lng === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Descriptions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['fr', 'en', 'ar'].map(lng => (
                                    <div key={lng}>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description ({lng})</label>
                                        <textarea
                                            value={form.description[lng]}
                                            onChange={e => setForm({ ...form, description: { ...form.description, [lng]: e.target.value } })}
                                            rows={3}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 resize-none"
                                            dir={lng === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Category + Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-sky-500">
                                        {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                                    <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                                </div>
                            </div>
                            {/* Coordinates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Latitude</label>
                                    <input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Longitude</label>
                                    <input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                                </div>
                            </div>
                            {/* Audio Logic */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audio Guide URL (MP3)</label>
                                    <input
                                        type="text"
                                        value={form.audio_url}
                                        onChange={e => setForm({ ...form, audio_url: e.target.value })}
                                        placeholder="https://.../guide.mp3"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Link to an MP3 file that will be playable in the app.</p>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex flex-wrap gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.wheelchair_accessible} onChange={e => setForm({ ...form, wheelchair_accessible: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                                    <span className="text-sm font-medium text-slate-700">Wheelchair Accessible</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                                    <span className="text-sm font-medium text-slate-700">Active (Visible)</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm">
                                {editingSite ? 'Update Site' : 'Create Site'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Manage Images</h3>
                                <p className="text-sm text-slate-500">{selectedSiteForImages?.name?.fr || selectedSiteForImages?.name?.en}</p>
                            </div>
                            <button onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                            <form onSubmit={handleAddImage} className="space-y-4 mb-6 bg-white p-4 rounded-xl border border-slate-200">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Upload New Photo</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                id="site-file-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setSelectedFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 flex items-center gap-2 bg-slate-50">
                                                <Upload size={18} className="text-slate-400" />
                                                {selectedFile ? selectedFile.name : "Click to select a photo..."}
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={uploadingImage || !selectedFile}
                                            className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-2"
                                        >
                                            {uploadingImage ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {siteImages.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                    <Image size={32} className="mx-auto mb-2 text-slate-300" />
                                    {loadingImages ? 'Loading images...' : 'No images found. Add one above.'}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {siteImages.map(img => (
                                        <div key={img.id} className={`group relative rounded-xl overflow-hidden border-2 transition-all ${img.is_primary ? 'border-emerald-500 shadow-md transform scale-[1.02]' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <img src={img.image_url} alt="Site" className="w-full h-32 object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {!img.is_primary && (
                                                    <button onClick={() => handleSetPrimaryImage(img.id)} className="p-1.5 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50" title="Set as Primary">
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteImage(img.id)} className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            {img.is_primary && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
                                                    Primary
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSites;
