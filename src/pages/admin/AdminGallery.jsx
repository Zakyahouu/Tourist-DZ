import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Trash2, Trophy, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminGallery = () => {
    const { showToast } = useToast();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchPhotos(); }, []);

    async function fetchPhotos() {
        setLoading(true);
        const { data, error } = await supabase
            .from('gallery')
            .select('*, profiles(full_name, email)')
            .order('created_at', { ascending: false })
            .limit(500);
        if (!error) setPhotos(data || []);
        setLoading(false);
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this photo?')) return;
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) return showToast(error.message, 'error');
        showToast('Photo deleted.', 'success');
        fetchPhotos();
    };

    const toggleCompetition = async (photo) => {
        const { error } = await supabase.from('gallery').update({ is_competition_entry: !photo.is_competition_entry }).eq('id', photo.id);
        if (error) return showToast(error.message, 'error');
        showToast(photo.is_competition_entry ? 'Removed from competition.' : 'Added to competition!', 'success');
        fetchPhotos();
    };

    const filteredPhotos = photos.filter(p => {
        const matchesSearch = (p.caption || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (filter === 'competition') return matchesSearch && p.is_competition_entry;
        if (filter === 'regular') return matchesSearch && !p.is_competition_entry;
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Gallery Management</h2>
                <p className="text-sm text-slate-500">{photos.length} photos uploaded</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search by caption or user..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                </div>
                <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white">
                    <option value="all">All Photos</option>
                    <option value="competition">Competition Entries</option>
                    <option value="regular">Regular Photos</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center p-12 text-slate-400">Loading...</div>
            ) : filteredPhotos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
                    <ImageIcon size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No photos found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPhotos.map(photo => (
                        <div key={photo.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
                            <div className="h-48 bg-slate-100 relative">
                                {photo.image_url ? (
                                    <img src={photo.image_url} alt={photo.caption || ''} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon size={40} />
                                    </div>
                                )}
                                {photo.is_competition_entry && (
                                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <Trophy size={12} /> Competition
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{photo.caption || 'No caption'}</p>
                                <p className="text-xs text-slate-400 mt-1">By {photo.profiles?.full_name || photo.profiles?.email || 'Unknown'}</p>
                                <p className="text-xs text-slate-400">{photo.likes_count || 0} likes · {new Date(photo.created_at).toLocaleDateString()}</p>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => toggleCompetition(photo)}
                                        className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${photo.is_competition_entry ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        <Trophy size={12} /> {photo.is_competition_entry ? 'In Competition' : 'Add to Competition'}
                                    </button>
                                    <button onClick={() => handleDelete(photo.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
