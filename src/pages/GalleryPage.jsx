import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Heart, Trophy, X, Upload } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useCms } from '../context/CmsContext';

const isSafeUrl = (url) => /^https?:\/\//i.test(url);

const GalleryPage = () => {
    const { t, i18n } = useTranslation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 24;
    const [showUpload, setShowUpload] = useState(false);
    const [uploadUrl, setUploadUrl] = useState('');
    const [uploadCaption, setUploadCaption] = useState('');
    const [isCompetition, setIsCompetition] = useState(false);
    const [uploading, setUploading] = useState(false);
    const cms = useCms();
    const [likedPhotoIds, setLikedPhotoIds] = useState(new Set());

    useEffect(() => {
        setPage(0);
        setPhotos([]);
        fetchGallery(0, true);
    }, [filter]);

    useEffect(() => {
        if (user) fetchMyLikes();
        else setLikedPhotoIds(new Set());
    }, [user]);

    async function fetchMyLikes() {
        const { data } = await supabase
            .from('gallery_likes')
            .select('photo_id')
            .eq('user_id', user.id);
        if (data) setLikedPhotoIds(new Set(data.map(r => r.photo_id)));
    }

    async function fetchGallery(pageNum = 0, replace = false) {
        pageNum === 0 ? setLoading(true) : setLoadingMore(true);
        try {
            let query = supabase
                .from('gallery')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false })
                .range(pageNum * PAGE_SIZE, pageNum * PAGE_SIZE + PAGE_SIZE - 1);

            if (filter === 'competition') {
                query = query.eq('is_competition_entry', true);
            }

            const { data } = await query;
            const rows = data || [];
            setHasMore(rows.length === PAGE_SIZE);
            setPhotos(prev => replace ? rows : [...prev, ...rows]);
        } catch (error) {
            logger.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchGallery(next);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadUrl.trim()) return showToast('Please enter an image URL.', 'info');
        if (!isSafeUrl(uploadUrl.trim())) return showToast('Please enter a valid https:// image URL.', 'error');

        setUploading(true);
        try {
            const { error } = await supabase.from('gallery').insert({
                user_id: user.id,
                image_url: uploadUrl.trim(),
                caption: uploadCaption.trim() || null,
                is_competition_entry: isCompetition,
            });
            if (error) throw error;
            setShowUpload(false);
            setUploadUrl('');
            setUploadCaption('');
            setIsCompetition(false);
            showToast('Photo shared successfully!', 'success');
            setPage(0);
            fetchGallery(0, true);
        } catch (err) {
            logger.error(err);
            showToast('Error uploading. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    }

    async function handleLike(photoId) {
        if (!user) { navigate('/auth', { state: { from: '/gallery' } }); return; }
        // Optimistic update
        const alreadyLiked = likedPhotoIds.has(photoId);
        setLikedPhotoIds(prev => {
            const next = new Set(prev);
            alreadyLiked ? next.delete(photoId) : next.add(photoId);
            return next;
        });
        setPhotos(prev => prev.map(p => p.id === photoId
            ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) + (alreadyLiked ? -1 : 1)) }
            : p));
        // Atomic DB call
        const { error } = await supabase.rpc('toggle_gallery_like', { p_photo_id: photoId });
        if (error) {
            // Rollback optimistic update
            setLikedPhotoIds(prev => {
                const next = new Set(prev);
                alreadyLiked ? next.add(photoId) : next.delete(photoId);
                return next;
            });
            setPhotos(prev => prev.map(p => p.id === photoId
                ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) + (alreadyLiked ? 1 : -1)) }
                : p));
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)]">

            {/* Page Header — clean, no hero image */}
            <div className="pt-28 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                    <div>
                        <span className="text-[var(--color-brand-primary)] font-bold tracking-widest uppercase text-xs mb-2 block">
                            {t('nav.gallery')}
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-brand-text)] leading-tight">
                            Biskra <span className="text-[var(--color-brand-primary)]">Through Your Lens</span>
                        </h1>
                        <p className="text-[var(--color-brand-text-muted)] mt-2 max-w-lg text-sm sm:text-base">
                            Share your best shots or vote in the latest photo competition.
                        </p>
                    </div>
                    <button
                        onClick={() => user ? setShowUpload(true) : navigate('/auth', { state: { from: '/gallery' } })}
                        className="flex-shrink-0 flex items-center justify-center px-6 py-3 bg-[var(--color-brand-primary)] hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20 text-sm"
                    >
                        <Camera size={18} className="mr-2" /> Upload Photo
                    </button>
                </div>

                {/* Filter tabs */}
                <div className="flex space-x-2 bg-gray-100 rounded-xl p-1 w-fit">
                    <button onClick={() => setFilter('all')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-white text-[var(--color-brand-text)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        All Photos
                    </button>
                    <button onClick={() => setFilter('competition')} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 ${filter === 'competition' ? 'bg-white text-[var(--color-brand-text)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Trophy size={14} /> Competition
                    </button>
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">

                {/* Gallery Grid — proper CSS grid, no masonry */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                ) : photos.length === 0 ? (
                    <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Camera size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="font-bold text-lg mb-1">No photos yet.</p>
                        <p className="text-sm">Be the first to share a photo of Biskra!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer bg-gray-100">
                                <img
                                    src={photo.image_url}
                                    alt={photo.caption || 'Gallery item'}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                {/* Competition badge */}
                                {photo.is_competition_entry && (
                                    <div className="absolute top-2.5 left-2.5 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow uppercase tracking-wider z-10">
                                        <Trophy size={10} /> {photo.likes_count > 200 ? 'Winner' : 'Entry'}
                                    </div>
                                )}

                                {/* Bottom info — always visible */}
                                <div className="absolute bottom-0 inset-x-0 p-3 flex items-end justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        {photo.caption && (
                                            <p className="text-white text-xs line-clamp-1 drop-shadow font-medium mb-0.5">
                                                {photo.caption}
                                            </p>
                                        )}
                                        <p className="text-white/70 text-[11px] drop-shadow truncate">
                                            {photo.profiles?.full_name || 'Anonymous'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleLike(photo.id); }}
                                        className={`flex items-center gap-1 text-xs font-bold text-white px-2.5 py-1.5 rounded-lg transition-all flex-shrink-0 ${likedPhotoIds.has(photo.id)
                                            ? 'bg-pink-500'
                                            : 'bg-black/30 backdrop-blur-sm hover:bg-pink-500'
                                            }`}
                                    >
                                        <Heart size={12} className="fill-current" />
                                        {photo.likes_count || 0}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Load More */}
                {hasMore && (
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-8 py-3 bg-[var(--color-brand-secondary)] hover:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-60 text-sm"
                        >
                            {loadingMore ? 'Loading...' : 'Load More Photos'}
                        </button>
                    </div>
                )}
            </main>

            {/* Upload Modal */}
            {
                showUpload && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800">Upload a Photo</h3>
                                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleUpload} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                                    <input value={uploadUrl} onChange={e => setUploadUrl(e.target.value)} placeholder="https://example.com/your-photo.jpg" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-sky-500" required />
                                </div>
                                {uploadUrl && (
                                    <div className="rounded-xl overflow-hidden bg-gray-100 h-48">
                                        <img src={uploadUrl} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Caption (optional)</label>
                                    <input value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} placeholder="Describe your photo..." className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-sky-500" />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={isCompetition} onChange={e => setIsCompetition(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-sky-600" />
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Trophy size={14} /> Submit as competition entry</span>
                                </label>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" disabled={uploading} className="px-6 py-2.5 text-sm font-bold bg-[var(--color-brand-primary)] hover:bg-orange-500 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                                        {uploading ? 'Uploading...' : <><Upload size={16} /> Upload</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default GalleryPage;
