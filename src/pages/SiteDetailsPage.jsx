import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Accessibility, Star, ArrowLeft, QrCode, Send, Headphones } from 'lucide-react';
import fallbackHistorical from '../assets/fallback_image_historical.webp';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SiteDetailsPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const { showToast } = useToast();
    const lang = i18n.language || 'fr';
    const navigate = useNavigate();

    const { user } = useAuth();
    const [site, setSite] = useState(null);
    const [loading, setLoading] = useState(true);

    // Review form state
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userAlreadyReviewed, setUserAlreadyReviewed] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);

    useEffect(() => {
        if (!id) { setLoading(false); return; }

        async function fetchDetails() {
            try {
                const { data, error } = await supabase
                    .from('tourist_sites')
                    .select('*, site_images(image_url), reviews(user_id, rating, comment, created_at, profiles(full_name, avatar_url))')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setSite(data);
                if (user && data?.reviews) {
                    setUserAlreadyReviewed(data.reviews.some(r => r.user_id === user.id));
                }
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/auth', { state: { from: `/site/${id}` } });
            return;
        }
        if (rating === 0) return showToast('Please select a rating.', 'info');

        setSubmittingReview(true);
        try {
            const { error } = await supabase.from('reviews').insert({
                site_id: id,
                user_id: user.id,
                rating,
                comment: comment.trim() || null
            });
            if (error) throw error;

            // Refetch to see new review
            setRating(0);
            setComment('');
            setUserAlreadyReviewed(true);
            const { data } = await supabase
                .from('tourist_sites')
                .select('*, site_images(image_url), reviews(user_id, rating, comment, created_at, profiles(full_name, avatar_url))')
                .eq('id', id)
                .single();
            if (data) setSite(data);
        } catch (error) {
            console.error('Error submitting review:', error);
            showToast('Could not submit review. Please try again.', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[var(--color-brand-bg)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-primary)]"></div>
        </div>
    );

    if (!site) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-brand-bg)] text-gray-500 p-8">
            <MapPin size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-bold mb-4">Site not found.</p>
            <button onClick={() => navigate('/')} className="text-[var(--color-brand-secondary)] font-bold hover:underline">Go back home</button>
        </div>
    );

    const FALLBACK_IMAGE = fallbackHistorical;
    const images = site.site_images?.map(img => img.image_url).filter(Boolean) || [];
    const coverImage = images[0] || FALLBACK_IMAGE;

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)]">
            {/* Hero */}
            <div className="relative w-full h-[40vh] lg:h-[50vh] bg-black overflow-hidden shadow-md">
                <img
                    src={coverImage}
                    alt={site.name?.[lang] || site.name?.fr}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-bg)] via-black/20 to-black/30"></div>

                <div className="absolute top-20 left-6 right-6 flex justify-between items-center z-10">
                    <button onClick={() => navigate(-1)} className="flex items-center text-[var(--color-brand-text)] font-bold bg-white/90 hover:bg-white backdrop-blur-md px-5 py-2.5 rounded-full transition-colors shadow-sm">
                        <ArrowLeft size={18} className="mr-2 rtl:rotate-180 rtl:ml-2 rtl:mr-0" /> Back
                    </button>
                    {/* Real Favorite Button */}
                    <FavoriteButton siteId={site.id} size={20} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 max-w-7xl mx-auto z-10 translate-y-4">
                    <div className="flex items-center mb-4 gap-3">
                        <span className="bg-white text-[var(--color-brand-primary)] px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-wider shadow-lg capitalize">
                            {site.category}
                        </span>
                        {site.avg_rating > 0 && (
                            <div className="flex items-center text-sm font-bold text-gray-800 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow-lg">
                                <Star size={14} className="text-yellow-500 mr-1.5 fill-yellow-500" />
                                {site.avg_rating?.toFixed(1)}
                                {site.review_count > 0 && <span className="text-gray-500 font-medium ml-1.5">({site.review_count})</span>}
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--color-brand-text)] drop-shadow-sm leading-tight">
                        {site.name?.[lang] || site.name?.fr}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Description */}
                        {(site.description?.[lang] || site.description?.fr) && (
                            <section className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                                <h2 className="text-2xl font-black text-[var(--color-brand-text)] mb-5 flex items-center">
                                    <span className="w-8 h-1.5 bg-[var(--color-brand-primary)] mr-3 rounded-full"></span> About
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                    {site.description[lang] || site.description.fr}
                                </p>
                            </section>
                        )}

                        {/* Gallery — real images only */}
                        {images.length > 1 && (
                            <section>
                                <h2 className="text-2xl font-black text-[var(--color-brand-text)] mb-6">Gallery</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map((url, idx) => (
                                        <div key={idx} className="h-48 rounded-2xl bg-gray-200 overflow-hidden shadow-sm">
                                            <img src={url} className="w-full h-full object-cover" alt={`Photo ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Reviews — real data */}
                        <section>
                            <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
                                <h2 className="text-2xl font-black text-[var(--color-brand-text)]">Visitor Reviews</h2>
                            </div>

                            {/* Write Review Form — hidden if user already reviewed */}
                            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-md mb-10">
                                <h3 className="text-lg font-bold text-[var(--color-brand-text)] mb-4">Leave a Review</h3>
                                {!user ? (
                                    <p className="text-sm text-gray-500">Please <button onClick={() => navigate('/auth', { state: { from: `/site/${id}` } })} className="text-[var(--color-brand-secondary)] font-bold hover:underline">log in</button> to leave a review.</p>
                                ) : userAlreadyReviewed ? (
                                    <p className="text-sm text-emerald-600 font-bold">✓ You've already reviewed this site. Thank you!</p>
                                ) : (<form onSubmit={handleReviewSubmit}>
                                    <div className="flex items-center mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star} type="button"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                <Star size={28} className={star <= (hoverRating || rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"} />
                                            </button>
                                        ))}
                                        <span className="ml-4 text-sm font-bold text-gray-400">
                                            {rating > 0 ? `${rating} Stars` : 'Select Rating'}
                                        </span>
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share details of your own experience at this place"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-secondary)] focus:border-transparent resize-none min-h-[100px] mb-4"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={submittingReview || rating === 0}
                                            className="flex items-center bg-[var(--color-brand-secondary)] hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-blue-900/20"
                                        >
                                            {submittingReview ? 'Submitting...' : <><Send size={16} className="mr-2 rtl:ml-2 rtl:mr-0" /> Submit Review</>}
                                        </button>
                                    </div>
                                </form>
                                    )}
                            </div>

                            {site.reviews?.length > 0 ? (
                                <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(showAllReviews ? site.reviews : site.reviews.slice(0, 6)).map((review, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs mr-3 flex-shrink-0">
                                                    {review.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-[var(--color-brand-text)]">{review.profiles?.full_name || 'Anonymous'}</h4>
                                                    <div className="flex mt-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} className={i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-sm text-gray-600 leading-relaxed">"{review.comment}"</p>}
                                        </div>
                                    ))}
                                </div>
                                {site.reviews.length > 6 && (
                                    <div className="text-center mt-6">
                                        <button
                                            onClick={() => setShowAllReviews(prev => !prev)}
                                            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            {showAllReviews ? 'Show less' : `Show all ${site.reviews.length} reviews`}
                                        </button>
                                    </div>
                                )}
                                </>
                            ) : (
                                <div className="py-12 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <p className="font-medium">No reviews yet.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            {/* Info Card */}
                            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-xl shadow-gray-200/50">
                                <h3 className="text-lg font-black text-[var(--color-brand-text)] mb-5 border-b border-gray-100 pb-3">Information</h3>
                                <ul className="space-y-5">
                                    {site.address && (
                                        <li className="flex items-start">
                                            <div className="bg-[var(--color-brand-secondary)]/10 p-2.5 rounded-xl mr-3 text-[var(--color-brand-secondary)] flex-shrink-0">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Location</p>
                                                <p className="text-sm text-[var(--color-brand-text)] font-semibold">{site.address}</p>
                                            </div>
                                        </li>
                                    )}
                                    <li className="flex items-start">
                                        <div className="bg-green-100 p-2 rounded-lg mr-3 text-green-600">
                                            <Accessibility size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('details.accessibility')}</p>
                                            <p className="text-sm font-bold text-gray-700">
                                                {site.wheelchair_accessible ? t('accessibility.accessible') : t('accessibility.limited')}
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-[var(--color-brand-primary)]/10 p-2.5 rounded-xl mr-3 text-[var(--color-brand-primary)] flex-shrink-0">
                                            <Star size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Rating</p>
                                            <p className="text-sm text-[var(--color-brand-text)] font-semibold">
                                                {site.avg_rating > 0 ? `${site.avg_rating.toFixed(1)} / 5 (${site.review_count || 0} reviews)` : 'No ratings yet'}
                                            </p>
                                        </div>
                                    </li>
                                </ul>

                                {/* Directions — opens Google Maps */}
                                {site.latitude && site.longitude && (
                                    <div className="mt-6 pt-5 border-t border-gray-100">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-[var(--color-brand-primary)] hover:bg-[#d6721d] text-white py-3.5 rounded-2xl font-bold flex justify-center items-center transition-colors shadow-lg shadow-orange-500/20 text-sm"
                                        >
                                            <MapPin size={16} className="mr-2" /> Get Directions
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* QR Code Card — from DB */}
                            {site.qr_code_url && (
                                <div className="bg-gradient-to-br from-[var(--color-brand-secondary)] to-blue-900 rounded-3xl p-7 border border-blue-800 shadow-xl overflow-hidden relative">
                                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="flex items-center mb-4 relative z-10">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl mr-4 border border-white/20">
                                            <QrCode size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-lg">{t('features.qrTitle')}</h4>
                                            <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-0.5">{t('features.availableIn')} {i18n.language?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-blue-100/90 leading-relaxed font-medium relative z-10 mb-4">
                                        {t('features.qrDesc')}
                                    </p>
                                    <div className="bg-white rounded-2xl p-4 inline-block relative z-10">
                                        <img src={site.qr_code_url} alt="QR Code" className="w-32 h-32 object-contain" />
                                    </div>
                                </div>
                            )}

                            {/* Audio Guide Card */}
                            {site.audio_url && (
                                <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-xl shadow-gray-200/50">
                                    <div className="flex items-center mb-5 border-b border-gray-100 pb-3">
                                        <div className="bg-orange-100 p-2.5 rounded-xl mr-4 text-orange-600">
                                            <Headphones size={20} />
                                        </div>
                                        <h3 className="text-lg font-black text-[var(--color-brand-text)]">{t('features.audioGuide')}</h3>
                                    </div>
                                    <audio controls className="w-full">
                                        <source src={site.audio_url} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                    <p className="text-xs text-slate-400 mt-4 leading-relaxed italic">
                                        {t('features.audioGuideDesc')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SiteDetailsPage;
