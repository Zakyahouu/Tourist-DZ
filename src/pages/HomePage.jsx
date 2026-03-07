import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar as CalendarIcon, ArrowRight, Star } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton';

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const [featuredSites, setFeaturedSites] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cms, setCms] = useState({});
    const [heroSearch, setHeroSearch] = useState('');
    const navigate = useNavigate();

    const lang = i18n.language || 'fr';

    // Load CMS content once
    useEffect(() => {
        supabase.from('site_content').select('key, value').then(({ data }) => {
            if (data) setCms(Object.fromEntries(data.map(d => [d.key, d.value])));
        }).catch(() => { });
    }, []);

    // Debounced fetch
    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(timer);
    }, [lang, activeCategory, searchQuery]);

    async function fetchData() {
        setLoading(true);
        try {
            let sitesQuery = supabase
                .from('tourist_sites')
                .select('id, name, category, avg_rating, address, site_images(image_url)')
                .eq('is_active', true)
                .limit(6);

            if (activeCategory !== 'all') {
                sitesQuery = sitesQuery.eq('category', activeCategory);
            }

            // Real search: uses Supabase text search on the JSONB name field
            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                sitesQuery = sitesQuery.or(`name->>fr.ilike.%${q}%,name->>en.ilike.%${q}%,name->>ar.ilike.%${q}%,address.ilike.%${q}%`);
            }

            const { data: sitesData } = await sitesQuery;

            const { data: eventsData } = await supabase
                .from('events')
                .select('id, title, start_date, type, location')
                .eq('is_active', true)
                .gte('start_date', new Date().toISOString())
                .order('start_date', { ascending: true })
                .limit(4);

            setFeaturedSites(sitesData || []);
            setEvents(eventsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    const categories = [
        { id: 'all', label: t('categories.all'), icon: '🌍' },
        { id: 'historical', label: t('categories.historical'), icon: '🏛️' },
        { id: 'natural', label: t('categories.natural'), icon: '🌴' },
        { id: 'cultural', label: t('categories.cultural'), icon: '🏺' },
        { id: 'thermal', label: t('categories.thermal'), icon: '♨️' },
    ];

    const getSiteImage = (site) => {
        if (site.site_images?.[0]?.image_url) return site.site_images[0].image_url;
        const fallbacks = {
            natural: cms.fallback_image_natural || 'https://images.unsplash.com/photo-1545805553-c454eef7dd45?auto=format&fit=crop&q=80&w=800',
            historical: cms.fallback_image_historical || 'https://images.unsplash.com/photo-1549487535-61df1f822aa7?auto=format&fit=crop&q=80&w=800',
            cultural: cms.fallback_image_cultural || 'https://images.unsplash.com/photo-1534065406-8d6263567705?auto=format&fit=crop&q=80&w=800',
            thermal: cms.fallback_image_thermal || 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=800',
        };
        return fallbacks[site.category] || fallbacks.natural;
    };

    const HERO_FALLBACK = 'https://images.unsplash.com/photo-1545805553-c454eef7dd45?auto=format&fit=crop&q=80&w=2670';

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)]">
            {/* Hero */}
            <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={cms.home_hero_image || HERO_FALLBACK}
                        alt="Biskra Oasis"
                        className="w-full h-full object-cover transition-opacity duration-500"
                        onLoad={(e) => e.target.style.opacity = 1}
                        style={{ opacity: 0 }}
                        onError={(e) => {
                            if (e.target.src !== HERO_FALLBACK) {
                                e.target.src = HERO_FALLBACK;
                            } else {
                                e.target.parentElement.style.background = 'linear-gradient(to bottom, #2c3e50, #000000)'; // Final emergency background
                                e.target.style.display = 'none';
                            }
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-bg)] via-[var(--color-brand-bg)]/40 to-black/50"></div>
                </div>

                <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto mt-16 md:mt-0">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-white/90 text-[var(--color-brand-primary)] font-bold tracking-widest uppercase text-xs mb-6 shadow-md backdrop-blur-sm">
                        {cms.home_hero_badge || t('app.tagline')}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        {cms.home_hero_title || t('home.discoverBiskra').split(' ')[0]} <span className="text-[var(--color-brand-accent)]">{t('home.discoverBiskra').split(' ')[1] || 'Biskra'}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white font-medium mb-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-2xl mx-auto">
                        {cms.home_hero_subtitle || t('home.heroSubtitle')}
                    </p>

                    {/* Global Hero Search Bar */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                navigate('/map', { state: { searchQuery: searchQuery.trim() } });
                            }
                        }}
                        className="bg-white rounded-full p-2 max-w-2xl mx-auto flex items-center shadow-2xl border border-white/50 ring-4 ring-white/10"
                    >
                        <div className="pl-5 pr-3 text-[var(--color-brand-secondary)]">
                            <Search size={24} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('home.searchPlaceholder')}
                            className="w-full bg-transparent text-gray-800 focus:outline-none placeholder-gray-400 py-3 text-lg font-medium"
                        />
                        <button
                            type="submit"
                            className="bg-[var(--color-brand-primary)] hover:bg-[#c74c1a] text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/30 flex items-center gap-2 flex-shrink-0"
                        >
                            Search <ArrowRight size={16} className="rtl:rotate-180" />
                        </button>
                    </form>
                </div>
            </section>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {/* Category Filter */}
                <div className="bg-white rounded-2xl p-4 md:p-6 mb-20 shadow-xl border border-gray-100 flex overflow-x-auto lg:overflow-visible lg:justify-center space-x-4 hide-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex-shrink-0 flex items-center px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat.id
                                ? 'bg-[var(--color-brand-secondary)] text-white shadow-md'
                                : 'bg-transparent hover:bg-gray-50 text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-secondary)]'
                                }`}
                        >
                            <span className="mr-2 text-xl">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Featured Sites */}
                <section className="mb-24">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
                        <div>
                            <span className="text-[var(--color-brand-primary)] font-bold tracking-widest uppercase text-xs mb-2 block">{t('home.featuredPlaces')}</span>
                            <h2 className="text-4xl font-bold text-[var(--color-brand-text)]">
                                {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'all' ? t('home.discoverBiskra') : `${categories.find(c => c.id === activeCategory)?.label || ''} Sites`}
                            </h2>
                        </div>
                        <Link to="/map" className="inline-flex items-center text-[var(--color-brand-secondary)] hover:text-blue-800 font-bold transition-colors bg-[var(--color-brand-secondary)]/5 hover:bg-[var(--color-brand-secondary)]/10 px-5 py-2.5 rounded-xl">
                            {t('home.viewAll')} <ArrowRight size={20} className="ml-2 rtl:rotate-180" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-3xl"></div>)}
                        </div>
                    ) : featuredSites.length === 0 ? (
                        <div className="text-center text-gray-400 py-16 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="font-medium text-lg">
                                {searchQuery ? `No sites matching "${searchQuery}"` : `No sites found${activeCategory !== 'all' ? ` in "${activeCategory}"` : ''}.`}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredSites.map((site) => (
                                <Link to={`/site/${site.id}`} key={site.id} className="group flex flex-col rounded-3xl overflow-hidden bg-white shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                    <div className="h-56 bg-gray-200 relative w-full overflow-hidden">
                                        <img
                                            src={getSiteImage(site)}
                                            alt={site.name?.[lang] || site.name?.fr || ''}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                const fallback = 'https://images.unsplash.com/photo-1545805553-c454eef7dd45?auto=format&fit=crop&q=80&w=800';
                                                if (e.target.src !== fallback) {
                                                    e.target.src = fallback;
                                                }
                                            }}
                                        />
                                        {/* Real Favorite Button */}
                                        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10">
                                            <FavoriteButton siteId={site.id} size={18} />
                                        </div>
                                        {(site.avg_rating > 0) && (
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-gray-800 flex items-center shadow rtl:left-auto rtl:right-4">
                                                <Star size={14} className="mr-1 text-yellow-500 fill-yellow-500" /> {site.avg_rating?.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-brand-primary)] mb-2 capitalize">
                                                {site.category}
                                            </div>
                                            <h3 className="font-bold text-xl text-[var(--color-brand-text)] mb-2 line-clamp-1 group-hover:text-[var(--color-brand-primary)] transition-colors">
                                                {site.name?.[lang] || site.name?.fr || 'Unnamed Site'}
                                            </h3>
                                            {site.address && (
                                                <p className="text-sm text-[var(--color-brand-text-muted)] flex items-center">
                                                    <MapPin size={14} className="mr-1 text-[var(--color-brand-secondary)] flex-shrink-0" /> {site.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Upcoming Events */}
                <section className="mb-24 pb-12">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
                        <div>
                            <span className="text-[var(--color-brand-primary)] font-bold tracking-widest uppercase text-xs mb-2 block">{t('details.events')}</span>
                            <h2 className="text-4xl font-bold text-[var(--color-brand-text)]">{t('home.upcomingEvents')}</h2>
                        </div>
                        <Link to="/events" className="inline-flex items-center text-[var(--color-brand-secondary)] hover:text-blue-800 font-bold transition-colors bg-[var(--color-brand-secondary)]/5 hover:bg-[var(--color-brand-secondary)]/10 px-5 py-2.5 rounded-xl">
                            {t('home.viewAll')} <ArrowRight size={20} className="ml-2 rtl:rotate-180" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-3xl"></div>)}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center text-gray-400 py-12 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                            <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="font-medium text-lg">No upcoming events.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {events.map((event) => {
                                const date = new Date(event.start_date);
                                const day = date.getDate();
                                const month = date.toLocaleString(lang, { month: 'short' });

                                return (
                                    <div key={event.id} className="group flex bg-white rounded-3xl overflow-hidden shadow-md shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:border-[var(--color-brand-secondary)]/30 transition-all hover:-translate-y-1">
                                        <div className="flex flex-col w-24 md:w-28 bg-gray-50 justify-center items-center p-4 border-r border-gray-100 rtl:border-l rtl:border-r-0 group-hover:bg-[var(--color-brand-secondary)]/5 transition-colors">
                                            <span className="text-sm text-[var(--color-brand-primary)] uppercase font-bold tracking-wider">{month}</span>
                                            <span className="text-4xl font-black text-[var(--color-brand-secondary)] leading-none mt-1">{day}</span>
                                        </div>
                                        <div className="p-5 md:p-6 flex-1 flex flex-col justify-center">
                                            <div className="flex items-center text-xs text-[var(--color-brand-text-muted)] mb-1.5 uppercase tracking-wider font-bold">
                                                <CalendarIcon size={12} className="mr-1.5" /> {event.type}
                                            </div>
                                            <h3 className="font-bold text-lg text-[var(--color-brand-text)] line-clamp-1 group-hover:text-[var(--color-brand-secondary)] transition-colors">
                                                {event.title?.[lang] || event.title?.fr || 'Untitled Event'}
                                            </h3>
                                            {event.location && (
                                                <p className="text-xs text-slate-400 mt-1 flex items-center">
                                                    <MapPin size={12} className="mr-1" /> {event.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default HomePage;
