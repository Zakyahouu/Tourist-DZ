import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Trash2, Star, MessageSquare } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminReviews = () => {
    const { showToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRating, setFilterRating] = useState('all');

    useEffect(() => { fetchReviews(); }, [filterRating]);

    async function fetchReviews() {
        setLoading(true);
        let q = supabase.from('reviews').select('*, profiles(full_name, email), tourist_sites(name)').order('created_at', { ascending: false });
        if (filterRating !== 'all') q = q.eq('rating', parseInt(filterRating));
        const { data } = await q;
        setReviews(data || []);
        setLoading(false);
    }

    const filtered = reviews.filter(r => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            r.profiles?.full_name?.toLowerCase().includes(s) ||
            r.profiles?.email?.toLowerCase().includes(s) ||
            r.tourist_sites?.name?.fr?.toLowerCase().includes(s) ||
            r.tourist_sites?.name?.en?.toLowerCase().includes(s) ||
            r.comment?.toLowerCase().includes(s)
        );
    });

    async function handleDelete(id) {
        if (!confirm('Delete this review? This action cannot be undone.')) return;
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) return showToast(error.message, 'error');
        showToast('Review deleted.', 'success');
        fetchReviews();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Reviews Moderation</h2>
                <p className="text-sm text-slate-500">Monitor and moderate user reviews across all sites.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, site name, or comment..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-sky-500" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setFilterRating('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filterRating === 'all' ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        All
                    </button>
                    {[5, 4, 3, 2, 1].map(r => (
                        <button key={r} onClick={() => setFilterRating(String(r))} className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors ${filterRating === String(r) ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {r} <Star size={12} className={filterRating === String(r) ? 'fill-white' : 'fill-yellow-500 text-yellow-500'} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-sm text-slate-500 font-medium">{filtered.length} review{filtered.length !== 1 ? 's' : ''}</div>

            {/* Reviews List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                        <MessageSquare size={32} className="mx-auto mb-2 text-slate-300" />
                        No reviews found.
                    </div>
                ) : filtered.map(review => (
                    <div key={review.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {review.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <p className="font-semibold text-slate-800">{review.profiles?.full_name || 'Unknown User'}</p>
                                        <span className="text-xs text-slate-400">{review.profiles?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-200'} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-400">·</span>
                                        <span className="text-xs text-sky-600 font-semibold">{review.tourist_sites?.name?.fr || review.tourist_sites?.name?.en || '—'}</span>
                                        <span className="text-xs text-slate-400">·</span>
                                        <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-slate-600 mt-2 bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
                                            "{review.comment}"
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(review.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0" title="Delete review">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminReviews;
