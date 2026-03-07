import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Star, Calendar, LogOut, MapPin, Image as ImageIcon, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import fallbackHistorical from '../assets/fallback_image_historical.webp';

const ProfilePage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, profile, isAdmin, signOut, loading: authLoading } = useAuth();

    const [stats, setStats] = useState({ favorites: 0, reviews: 0, events: 0, photos: 0 });
    const [recentReviews, setRecentReviews] = useState([]);
    const [favoriteSites, setFavoriteSites] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, favorites, events
    const [statsLoading, setStatsLoading] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth', { state: { from: '/profile' } });
        }
    }, [authLoading, user, navigate]);

    // Fetch real stats
    useEffect(() => {
        if (!user) return;
        async function fetchStats() {
            try {
                const [favRes, revRes, evtRes, galRes] = await Promise.all([
                    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('event_registrations').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('gallery').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                ]);
                setStats({
                    favorites: favRes.count || 0,
                    reviews: revRes.count || 0,
                    events: evtRes.count || 0,
                    photos: galRes.count || 0,
                });

                const { data: reviews } = await supabase
                    .from('reviews')
                    .select('id, rating, comment, created_at, tourist_sites(name)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);
                setRecentReviews(reviews || []);

                const { data: favs } = await supabase
                    .from('favorites')
                    .select('id, tourist_sites(id, name, category, site_images(image_url))')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                setFavoriteSites(favs || []);

                const { data: events } = await supabase
                    .from('event_registrations')
                    .select('id, status, registered_at, events(id, title, type, start_date, location)')
                    .eq('user_id', user.id)
                    .order('registered_at', { ascending: false });
                setMyEvents(events || []);

            } catch (error) {
                console.error('Error fetching profile stats:', error);
            } finally {
                setStatsLoading(false);
            }
        }
        fetchStats();
    }, [user]);

    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleCancelEvent = async (registrationId) => {
        if (!confirm('Cancel your registration for this event?')) return;
        setStatsLoading(true);
        try {
            await supabase.from('event_registrations').delete().eq('id', registrationId);
            setMyEvents(prev => prev.filter(e => e.id !== registrationId));
            setStats(prev => ({ ...prev, events: Math.max(0, prev.events - 1) }));
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--color-brand-bg)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-secondary)]"></div>
            </div>
        );
    }

    if (!user) return null;

    const safeProfile = profile || {};
    const displayName = safeProfile.full_name || user.email?.split('@')[0] || 'Explorer';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const statCards = [
        { label: 'Favorites', value: stats.favorites, icon: Heart, color: 'text-pink-500 bg-pink-50' },
        { label: 'Events', value: stats.events, icon: Calendar, color: 'text-blue-500 bg-blue-50' },
        { label: 'Reviews', value: stats.reviews, icon: Star, color: 'text-yellow-600 bg-yellow-50' },
        { label: 'Photos', value: stats.photos, icon: ImageIcon, color: 'text-purple-500 bg-purple-50' },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-brand-bg)] pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* Profile Header — Clean & Centered */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex-shrink-0">
                            {safeProfile.avatar_url ? (
                                <img src={safeProfile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--color-brand-secondary)] to-blue-800 flex items-center justify-center text-white text-2xl font-black">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                                <h1 className="text-2xl font-black text-[var(--color-brand-text)]">{displayName}</h1>
                                {isAdmin && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-sky-200">
                                        <Shield size={12} className="fill-current" /> Admin
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 font-medium mb-3">{user.email}</p>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] capitalize">
                                    {safeProfile.role || 'tourist'}
                                </span>
                                {isAdmin && (
                                    <Link to="/admin" className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 transition-colors">
                                        Access Admin Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                                {['en', 'fr', 'ar'].map(lng => (
                                    <button key={lng} onClick={() => changeLanguage(lng)} className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${i18n.language === lng ? 'bg-white text-[var(--color-brand-secondary)] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                                        {lng.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleSignOut} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Log Out">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
                    {['overview', 'favorites', 'events'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <>
                        {/* Stats — All Real */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {statCards.map(stat => (
                                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center hover:shadow-md transition-shadow">
                                    <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                                        <stat.icon size={18} className={stat.label === 'Reviews' ? 'fill-current' : ''} />
                                    </div>
                                    <div className="text-2xl font-black text-gray-800">{statsLoading ? '—' : stat.value}</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Reviews — Real Data */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-[var(--color-brand-text)]">Recent Reviews</h3>
                            </div>
                            {recentReviews.length === 0 ? (
                                <div className="px-6 py-10 text-center text-gray-400">
                                    <Star size={32} className="mx-auto mb-3 text-gray-200" />
                                    <p className="font-medium">No reviews yet.</p>
                                    <p className="text-sm mt-1">Visit tourist sites and share your experience!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {recentReviews.map((review) => (
                                        <div key={review.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="w-9 h-9 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Star size={16} className="fill-current" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-[var(--color-brand-text)]">
                                                    {review.tourist_sites?.name?.[i18n.language] || review.tourist_sites?.name?.fr || 'A site'}
                                                </p>
                                                <div className="flex items-center gap-0.5 mt-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} size={10} className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'} />
                                                    ))}
                                                </div>
                                                {review.comment && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{review.comment}</p>}
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap mt-1">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'favorites' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {favoriteSites.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
                                <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="font-bold text-lg mb-1">No favorites yet</p>
                                <p className="text-sm">Explore the map and save your favorite places!</p>
                            </div>
                        ) : (
                            favoriteSites.map((fav) => {
                                const site = fav.tourist_sites;
                                if (!site) return null;
                                const imgUrl = site.site_images?.[0]?.image_url || fallbackHistorical;

                                return (
                                    <Link key={fav.id} to={`/site/${site.id}`} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col">
                                        <div className="h-48 overflow-hidden relative">
                                            <img
                                                src={imgUrl}
                                                alt={site.name?.[i18n.language] || site.name?.fr}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.target.src = fallbackHistorical; }}
                                            />
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded text-[10px] font-black uppercase text-[var(--color-brand-primary)] tracking-wider">
                                                {site.category}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-black text-lg text-gray-800 leading-tight mb-2 group-hover:text-[var(--color-brand-primary)] transition-colors">
                                                {site.name?.[i18n.language] || site.name?.fr || 'Unknown Site'}
                                            </h3>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="space-y-4 animate-fade-in">
                        {myEvents.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
                                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="font-bold text-lg mb-1">No events scheduled</p>
                                <p className="text-sm">Check the events page and join local activities.</p>
                            </div>
                        ) : (
                            myEvents.map((reg) => {
                                const evt = reg.events;
                                if (!evt) return null;

                                return (
                                    <div key={reg.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2.5 py-1 text-[10px] uppercase font-black rounded tracking-wider ${reg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {reg.status}
                                                </span>
                                                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded uppercase tracking-wider">{evt.type}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-gray-800 mb-1">{evt.title?.[i18n.language] || evt.title?.fr || 'Event'}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                                                <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {new Date(evt.start_date).toLocaleDateString()}</span>
                                                <span className="flex items-center text-gray-400"><MapPin size={14} className="mr-1.5" /> {evt.location}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancelEvent(reg.id)}
                                            className="w-full sm:w-auto px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProfilePage;
