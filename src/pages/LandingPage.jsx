import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Star, MapPin, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';
import heroImage from '../assets/images/small_panner.jpg';
import oldHeroImage from '../assets/home_hero_image.webp';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const createMapMarker = () => {
    return new L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #D6A64C; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });
};

function useCountUp(target, duration = 2000) {
    const [count, setCount] = useState(0);
    const animRef = useRef(null);

    useEffect(() => {
        if (target === 0) return;
        const start = performance.now();
        const startVal = count;

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(startVal + (target - startVal) * eased));
            if (progress < 1) animRef.current = requestAnimationFrame(animate);
        };

        animRef.current = requestAnimationFrame(animate);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [target, duration]);

    return count;
}

const StatCard = ({ value, label }) => (
    <div className="text-center">
        <div className="text-4xl md:text-5xl font-black text-[var(--color-brand-secondary)] mb-2">
            {value.toLocaleString()}+
        </div>
        <div className="text-sm font-bold text-[var(--color-brand-primary)] uppercase tracking-wider">{label}</div>
    </div>
);

const FeaturedSiteCard = ({ site, lang }) => {
    const getImage = (s) => {
        if (s.site_images?.[0]?.image_url) return s.site_images[0].image_url;
        return heroImage;
    };

    return (
        <Link to={`/site/${site.id}`} className="group flex-shrink-0 w-64 md:w-72 rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="aspect-[4/3] bg-gray-200 overflow-hidden">
                <img
                    src={getImage(site)}
                    alt={site.name?.[lang] || site.name?.fr || ''}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-[var(--color-brand-primary)] transition-colors">
                    {site.name?.[lang] || site.name?.fr || ''}
                </h3>
                {site.address && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center">
                        <MapPin size={10} className="mr-1" /> {site.address}
                    </p>
                )}
                {site.avg_rating > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-slate-600">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        {site.avg_rating.toFixed(1)}
                    </div>
                )}
            </div>
        </Link>
    );
};

const ReviewCard = ({ review }) => {
    const { i18n } = useTranslation();
    const lang = i18n.language || 'fr';
    const siteName = review.tourist_sites?.name?.[lang] || review.tourist_sites?.name?.fr || '';
    const initials = (review.profiles?.full_name || 'A')[0].toUpperCase();

    return (
        <div className="flex-shrink-0 w-72 md:w-80 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center font-bold text-sm">
                    {initials}
                </div>
                <div>
                    <p className="font-bold text-sm text-slate-800">{review.profiles?.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-400">{siteName}</p>
                </div>
            </div>
            <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} className={i <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} />
                ))}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{review.comment}</p>
        </div>
    );
};

const MapAutoFit = ({ sites }) => {
    const map = useMap();
    useEffect(() => {
        if (sites.length > 0) {
            const bounds = L.latLngBounds(sites.map(s => [s.latitude, s.longitude]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
    }, [sites, map]);
    return null;
};

const LandingPage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const lang = i18n.language || 'fr';

    const [stats, setStats] = useState({ sites: 0, reviews: 0 });
    const [featuredSites, setFeaturedSites] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLandingData() {
            try {
                const [sitesCountRes, reviewsCountRes, sitesRes, reviewsRes] = await Promise.all([
                    supabase.from('tourist_sites').select('*', { count: 'exact', head: true }),
                    supabase.from('reviews').select('*', { count: 'exact', head: true }),
                    supabase.from('tourist_sites')
                        .select('id, name, category_id, avg_rating, address, latitude, longitude, site_images(image_url)')
                        .eq('is_active', true)
                        .not('avg_rating', 'is', null)
                        .order('avg_rating', { ascending: false })
                        .limit(4),
                    supabase.from('reviews')
                        .select('*, profiles(full_name, avatar_url), tourist_sites(name)')
                        .not('comment', 'is', null)
                        .order('created_at', { ascending: false })
                        .limit(5),
                ]);

                setStats({
                    sites: sitesCountRes.count || 0,
                    reviews: reviewsCountRes.count || 0,
                });
                setFeaturedSites(sitesRes.data || []);
                setRecentReviews(reviewsRes.data || []);
            } catch (error) {
                logger.error('Error fetching landing page data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLandingData();
    }, []);

    const siteCount = useCountUp(stats.sites);
    const reviewCount = useCountUp(stats.reviews);
    const poiCount = useCountUp(stats.sites > 50 ? stats.sites + 20 : 50);

    const sitesWithCoords = featuredSites.filter(s => s.latitude != null && s.longitude != null);

    return (
        <div className="bg-[var(--color-brand-bg)] min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* ── HERO ── */}
            <section className="relative py-28 lg:py-36 bg-[var(--color-brand-bg)] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--color-brand-text)] leading-[1.1]">
                                {t('landing.hero_title')}
                            </h1>
                            <p className="mt-4 text-lg sm:text-xl font-bold tracking-[0.15em] uppercase text-[var(--color-brand-secondary)]">
                                {t('landing.hero_subtitle')}
                            </p>
                            <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
                                {t('landing.hero_desc')}
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                                <Link
                                    to="/explore"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-brand-primary)] text-white font-bold text-sm rounded-full hover:bg-[var(--color-brand-primary)]/90 transition-all shadow-lg shadow-[var(--color-brand-primary)]/20 hover:-translate-y-0.5"
                                >
                                    {t('landing.hero_cta_explore')}
                                    <ArrowRight size={16} strokeWidth={2} className={isRTL ? 'rotate-180' : ''} />
                                </Link>
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[var(--color-brand-secondary)] text-[var(--color-brand-secondary)] font-bold text-sm rounded-full hover:bg-[var(--color-brand-secondary)] hover:text-white transition-all"
                                    onClick={(e) => { e.preventDefault(); }}
                                >
                                    <Smartphone size={16} strokeWidth={1.5} />
                                    {t('landing.hero_cta_app')}
                                </a>
                            </div>
                        </div>
                        <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-xl">
                            <img
                                src={heroImage}
                                alt="Biskra"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section className="py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--color-brand-text)] tracking-tight leading-tight">
                                {t('landing.about_title')}
                            </h2>
                            <div className="mt-6 space-y-4 text-base sm:text-lg text-slate-500 leading-relaxed">
                                <p>{t('landing.about_desc_1')}</p>
                                <p>{t('landing.about_desc_2')}</p>
                            </div>
                        </div>
                        <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-xl">
                            <img
                                src={oldHeroImage}
                                alt="Biskra"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── EDITORIAL BANNER ──
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                <div className="rounded-2xl overflow-hidden shadow-md">
                    <img
                        src={oldHeroImage}
                        alt=""
                        className="w-full h-auto object-contain"
                    />
                </div>
            </div> */}

            {/* ── STATS ── */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 gap-8 md:gap-16">
                        <StatCard value={siteCount} label={t('landing.stats_sites')} />
                        <StatCard value={reviewCount} label={t('landing.stats_reviews')} />
                        <StatCard value={poiCount} label={t('landing.stats_poi')} />
                    </div>
                </div>
            </section>

            {/* ── FEATURED SITES ── */}
            <section className="py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--color-brand-text)] tracking-tight">
                            {t('landing.featured_title')}
                        </h2>
                        <Link to="/explore" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-secondary)]/80 transition-colors">
                            {t('home.viewAll')} <ChevronRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex gap-6 overflow-x-auto pb-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex-shrink-0 w-64 md:w-72 h-72 bg-gray-200 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : featuredSites.length === 0 ? (
                        <p className="text-slate-400 text-center py-12">No featured sites yet.</p>
                    ) : (
                        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                            {featuredSites.map(site => (
                                <FeaturedSiteCard key={site.id} site={site} lang={lang} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── MAP PREVIEW ── */}
            {sitesWithCoords.length > 0 && (
                <section className="py-16 lg:py-24 bg-white/40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--color-brand-text)] tracking-tight">
                                {t('landing.map_title')}
                            </h2>
                        </div>
                        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 h-[400px]">
                            <MapContainer
                                center={[34.8480, 5.7286]}
                                zoom={11}
                                zoomControl={true}
                                className="w-full h-full"
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {sitesWithCoords.map(site => (
                                    <Marker
                                        key={site.id}
                                        position={[site.latitude, site.longitude]}
                                        icon={createMapMarker()}
                                    />
                                ))}
                                <MapAutoFit sites={sitesWithCoords} />
                            </MapContainer>
                        </div>
                    </div>
                </section>
            )}

            {/* ── REVIEWS ── */}
            {recentReviews.length > 0 && (
                <section className="py-24 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--color-brand-text)] tracking-tight">
                                {t('landing.reviews_title')}
                            </h2>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                            {recentReviews.map(r => (
                                <ReviewCard key={r.id} review={r} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA ── */}
            <section className="py-28 lg:py-36 bg-[var(--color-brand-primary)]/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--color-brand-text)] tracking-tight">
                        {t('landing.cta_title')}
                    </h2>
                    <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                        {t('landing.cta_subtitle')}
                    </p>
                    <div className="mt-10">
                        <Link
                            to="/explore"
                            className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--color-brand-primary)] text-white font-bold text-sm rounded-full hover:bg-[var(--color-brand-primary)]/90 transition-all shadow-lg shadow-[var(--color-brand-primary)]/20 hover:-translate-y-0.5"
                        >
                            {t('landing.cta_button')}
                            <ArrowRight size={16} strokeWidth={2} className={isRTL ? 'rotate-180' : ''} />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
