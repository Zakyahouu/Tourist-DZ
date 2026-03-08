import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Heart, Trophy, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';
import galleryHeroImage from '../assets/gallery_hero_image.webp';
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

    const HERO_FALLBACK = galleryHeroImage;

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)] relative">
            {/* Hero */}
            <div className="relative w-full h-[42vh] lg:h-[52vh] bg-black overflow-hidden flex flex-col items-center justify-center">
                <img
                    src={galleryHeroImage}
                    alt="Biskra Gallery"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-bg)] via-[var(--color-brand-bg)]/40 to-black/50"></div>
                <div className="relative z-10 text-center px-4 mt-8">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2">
                        {cms.gallery_hero_title || <> Biskra <span className="text-[var(--color-brand-accent)]">Through Your Lens</span></>}
                    </h1>
                    <p className="text-gray-100 max-w-xl mx-auto drop-shadow-md font-medium">
                        {cms.gallery_hero_subtitle || 'Share your best shots of the oasis or vote in the latest photo competition.'}
                    </p>
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-20">
                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <div className="flex space-x-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-200 w-full md:w-auto mb-4 md:mb-0">
                        <button onClick={() => setFilter('all')} className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${filter === 'all' ? 'bg-white text-[var(--color-brand-secondary)] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                            All Discoveries
                        </button>
                        <button onClick={() => setFilter('competition')} className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${filter === 'competition' ? 'bg-white text-[var(--color-brand-secondary)] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                            <Trophy size={14} /> Competition
                        </button>
                    </div>
                    <button onClick={() => user ? setShowUpload(true) : navigate('/auth', { state: { from: '/gallery' } })} className="w-full md:w-auto flex items-center justify-center px-8 py-3.5 bg-[var(--color-brand-primary)] hover:bg-orange-500 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-orange-500/30">
                        <Camera size={18} className="mr-2" /> Upload Photo
                    </button>
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-3xl break-inside-avoid"></div>)}
                    </div>
                ) : photos.length === 0 ? (
                    <div className="text-center py-24 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                        <Camera size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="font-bold text-lg mb-2">No photos yet.</p>
                        <p className="text-sm">Be the first to share a photo of Biskra!</p>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative rounded-2xl overflow-hidden shadow-md border border-gray-100 break-inside-avoid group cursor-pointer">
                                <img src={photo.image_url} alt={photo.caption || 'Gallery item'} className="w-full object-cover transition-transform duration-700 group-hover:scale-105 block" />

                                {/* Always-visible bottom gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent pointer-events-none"></div>

                                {/* Extra dimming on hover */}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                                {photo.is_competition_entry && (
                                    <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg uppercase tracking-wider z-10">
                                        <Trophy size={10} /> {photo.likes_count > 200 ? 'Winner' : 'Entry'}
                                    </div>
                                )}

                                {/* Bottom bar — always visible */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end gap-2">
                                    <div className="flex-1 min-w-0">
                                        {photo.caption && (
                                            <p className="text-white/90 text-xs leading-snug line-clamp-2 mb-1.5 drop-shadow font-medium">
                                                {photo.caption}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(photo.profiles?.full_name || 'U')}&background=random&color=555`}
                                                className="w-5 h-5 rounded-full border border-white/60 shadow-sm flex-shrink-0"
                                                alt="User"
                                            />
                                            <span className="text-xs font-bold text-white drop-shadow truncate">
                                                {photo.profiles?.full_name || 'Anonymous'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleLike(photo.id)}
                                        className={`flex items-center gap-1 text-xs font-bold text-white backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/30 transition-all shadow-md flex-shrink-0 ${likedPhotoIds.has(photo.id) ? 'bg-pink-500 border-pink-400' : 'bg-black/30 hover:bg-pink-500'}`}
                                    >
                                        <Heart size={13} className="fill-current" />
                                        {photo.likes_count || 0}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div >
                )}

                {/* Load More */}
                {hasMore && (
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-8 py-3.5 bg-[var(--color-brand-secondary)] hover:bg-blue-800 text-white font-bold rounded-2xl transition-colors shadow-lg disabled:opacity-60"
                        >
                            {loadingMore ? 'Loading...' : 'Load More Photos'}
                        </button>
                    </div>
                )}
            </main >

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
