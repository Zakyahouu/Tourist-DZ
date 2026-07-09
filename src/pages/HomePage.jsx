import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, ArrowRight, Star, Globe } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';
import fallbackNatural from '../assets/fallback_image_natural.webp';
import { Link, useNavigate } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton';
import { useCms } from '../context/CmsContext';

const PAGE_SIZE = 6;

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const [allSites, setAllSites] = useState([]);
    const [siteCategories, setSiteCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    const lang = i18n.language || 'fr';
    const cms = useCms();

    useEffect(() => {
        supabase.from('site_categories').select('*').order('sort_order').then(({ data }) => {
            if (data) setSiteCategories(data);
        });
    }, []);

    // Reset and debounce on filter change
    useEffect(() => {
        setPage(1);
        setAllSites([]);
        setHasMore(true);
        const timer = setTimeout(() => fetchSites(1, true), 300);
        return () => clearTimeout(timer);
    }, [lang, activeCategory, searchQuery]);

    async function fetchSites(pageNum, replace) {
        setLoading(true);
        try {
            const from = (pageNum - 1) * PAGE_SIZE;
            const to = pageNum * PAGE_SIZE - 1;

            let query = supabase
                .from('tourist_sites')
                .select('id, name, category_id, avg_rating, address, site_images(image_url)', { count: 'exact' })
                .eq('is_active', true)
                .range(from, to);

            if (activeCategory !== 'all') {
                query = query.eq('category_id', activeCategory);
            }

            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                query = query.or(`name->>fr.ilike.%${q}%,name->>en.ilike.%${q}%,name->>ar.ilike.%${q}%,address.ilike.%${q}%`);
            }

            const { data, count } = await query;

            setHasMore(from + PAGE_SIZE < (count || 0));
            if (replace) setAllSites(data || []);
            else setAllSites(prev => [...prev, ...(data || [])]);
        } catch (error) {
            logger.error('Error fetching sites:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleLoadMore() {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchSites(nextPage, false);
    }

    const categories = [
        { id: 'all', label: t('categories.all'), Icon: Globe },
        ...siteCategories.map(c => ({ id: c.id, label: c[`name_${lang}`] || c.name_en, Icon: Globe })),
    ];

    const siteCatName = (site) => {
        const c = siteCategories.find(c => c.id === site.category_id);
        return c?.[`name_${lang}`] || c?.name_en || '—';
    };

    const getSiteImage = (site) => {
        if (site.site_images?.[0]?.image_url) return site.site_images[0].image_url;
        return fallbackNatural;
    };

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)]">

            {/* Typography Header */}
            <section className="py-16 bg-[var(--color-brand-bg)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] font-bold tracking-widest uppercase text-xs mb-4">
                        {cms.home_hero_badge || t('app.tagline')}
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--color-brand-text)] mb-4">
                        {cms.home_hero_title || t('home.discoverBiskra').split(' ')[0]} <span className="text-[var(--color-brand-accent)]">{t('home.discoverBiskra').split(' ')[1] || 'Biskra'}</span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-xl mx-auto">
                        {cms.home_hero_subtitle || t('home.heroSubtitle')}
                    </p>

                    {/* Global Search Bar */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                navigate('/map', { state: { searchQuery: searchQuery.trim() } });
                            }
                        }}
                        className="bg-white rounded-full p-2 max-w-2xl mx-auto flex items-center shadow-lg border border-gray-200"
                    >
                        <div className="pl-5 pr-3 text-[var(--color-brand-secondary)]">
                            <Search size={24} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('home.searchPlaceholder')}
                            className="w-full bg-transparent text-gray-800 focus:outline-none placeholder-gray-400 py-2 sm:py-3 text-base sm:text-lg font-medium"
                        />
                        <button
                            type="submit"
                            className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white px-5 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-[var(--color-brand-primary)]/20 flex items-center gap-2 flex-shrink-0"
                        >
                            Search <ArrowRight size={16} className="rtl:rotate-180" />
                        </button>
                    </form>
                </div>
            </section>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 relative z-20">

                {/* Category Filter */}
                <div className="bg-white rounded-2xl p-4 md:p-6 mb-8 md:mb-12 shadow-xl border border-gray-100 flex overflow-x-auto lg:overflow-visible lg:justify-center space-x-4 hide-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat.id
                                ? 'bg-[var(--color-brand-secondary)] text-white shadow-md'
                                : 'bg-transparent hover:bg-[var(--color-brand-primary)]/5 text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-primary)]'
                            }`}
                        >
                            <cat.Icon size={16} className="flex-shrink-0" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Sites Grid */}
                <section className="mb-24">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
                        <div>
                            <span className="text-[var(--color-brand-primary)] font-bold tracking-widest uppercase text-xs mb-2 block">{t('home.featuredPlaces')}</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-brand-text)]">
                                {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'all' ? t('home.discoverBiskra') : `${categories.find(c => c.id === activeCategory)?.label || ''} Sites`}
                            </h2>
                        </div>
                        <Link to="/map" className="inline-flex items-center text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-secondary)]/80 font-bold transition-colors bg-[var(--color-brand-secondary)]/5 hover:bg-[var(--color-brand-secondary)]/10 px-5 py-2.5 rounded-xl">
                            {t('home.viewAll')} <ArrowRight size={20} className="ml-2 rtl:rotate-180" />
                        </Link>
                    </div>

                    {loading && allSites.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-3xl"></div>)}
                        </div>
                    ) : allSites.length === 0 ? (
                        <div className="text-center text-gray-400 py-16 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="font-medium text-lg">
                                {searchQuery ? `No sites matching "${searchQuery}"` : `No sites found${activeCategory !== 'all' ? ` in this category` : ''}.`}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {allSites.map((site) => (
                                    <Link to={`/site/${site.id}`} key={site.id} className="group flex flex-col rounded-3xl overflow-hidden bg-white shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                        <div className="aspect-[4/3] bg-gray-200 relative w-full overflow-hidden">
                                            <img
                                                src={getSiteImage(site)}
                                                alt={site.name?.[lang] || site.name?.fr || ''}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => { e.target.src = fallbackNatural; }}
                                            />
                                            <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10">
                                                <FavoriteButton siteId={site.id} size={18} />
                                            </div>
                                            {(site.avg_rating > 0) && (
                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-gray-800 flex items-center shadow rtl:left-auto rtl:right-4">
                                                    <Star size={14} className="mr-1 text-yellow-500 fill-yellow-500" /> {site.avg_rating?.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex flex-col gap-3">
                                            <div>
                                                <div className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/15 px-2 py-0.5 rounded mb-2 capitalize">
                                                    {siteCatName(site)}
                                                </div>
                                                <h3 className="font-bold text-lg text-[var(--color-brand-text)] line-clamp-2 leading-snug group-hover:text-[var(--color-brand-primary)] transition-colors">
                                                    {site.name?.[lang] || site.name?.fr || 'Unnamed Site'}
                                                </h3>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                {site.address ? (
                                                    <p className="text-xs text-[var(--color-brand-text-muted)] flex items-center min-w-0 mr-2">
                                                        <MapPin size={12} className="mr-1 text-[var(--color-brand-secondary)] flex-shrink-0" />
                                                        <span className="truncate">{site.address}</span>
                                                    </p>
                                                ) : <span />}
                                                <span className="text-xs font-bold text-[var(--color-brand-secondary)] flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                                                    View <ArrowRight size={13} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <div className="flex justify-center mt-12">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-10 py-4 bg-white border-2 border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] font-bold text-sm rounded-full hover:bg-[var(--color-brand-primary)] hover:text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                                    >
                                        {loading ? 'Loading...' : t('home.loadMore')}
                                        {!loading && <ArrowRight size={16} className={i18n.language === 'ar' ? 'rotate-180' : ''} />}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

export default HomePage;
