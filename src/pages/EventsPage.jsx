import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, MapPin, Search, Accessibility } from 'lucide-react';
import eventsHeroImage from '../assets/events_hero_image.webp';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useCms } from '../context/CmsContext';

const EventsPage = () => {
    const { t, i18n } = useTranslation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [registeredEvents, setRegisteredEvents] = useState(new Set());
    const [registering, setRegistering] = useState(null);
    const lang = i18n.language || 'fr';
    const cms = useCms();

    useEffect(() => {
        supabase.from('event_categories').select('*').order('sort_order').then(({ data }) => {
            if (data) setCategories(data);
        });
    }, []);

    const fetchEvents = useCallback(async () => {
        try {
            let query = supabase
                .from('events')
                .select('*')
                .eq('is_active', true)
                .gte('end_date', new Date().toISOString())
                .order('start_date', { ascending: true });

            if (filter !== 'all') {
                query = query.eq('category_id', filter);
            }

            const { data } = await query;
            setEvents(data || []);

            if (user) {
                const { data: regData } = await supabase
                    .from('event_registrations')
                    .select('event_id')
                    .eq('user_id', user.id);
                if (regData) {
                    setRegisteredEvents(new Set(regData.map(r => r.event_id)));
                }
            }
        } catch (error) {
            logger.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, [filter, user]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleRegister = async (eventId) => {
        if (!user) {
            navigate('/auth', { state: { from: '/events' } });
            return;
        }

        setRegistering(eventId);
        try {
            const { error } = await supabase.from('event_registrations').insert({
                event_id: eventId,
                user_id: user.id
            });

            if (error) throw error;

            const registered = events.find(e => e.id === eventId);
            showToast('Successfully registered for ' + (registered?.title?.[lang] || registered?.title?.fr || ''), 'success');
            fetchEvents(); // Refresh counts
        } catch (error) {
            logger.error('Registration error:', error);
            showToast('Could not register. Please try again.', 'error');
        } finally {
            setRegistering(null);
        }
    };

    const filterCats = [
        { id: 'all', label: t('categories.all') },
        ...categories.map(c => ({ id: c.id, label: c[`name_${lang}`] || c.name_en })),
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)]">

            {/* Hero Section */}
            <div className="relative w-full h-[42vh] lg:h-[52vh] bg-gray-900 overflow-hidden">
                <img
                    src={eventsHeroImage}
                    alt="Biskra Events"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-bg)] via-black/40 to-black/50"></div>
                <div className="absolute inset-0 flex items-center justify-center px-4">
                    <div className="text-center max-w-3xl">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg mb-4">
                            {cms.events_hero_title || <>Discover &amp; <span className="text-[var(--color-brand-accent)]">Experience</span></>}
                        </h1>
                        <p className="text-sm sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
                            {cms.events_hero_subtitle || 'Join local festivals, guided tours, and community solidarity camps in Biskra.'}
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">

                {/* Controls Bar */}
                <div className="bg-white rounded-2xl p-4 md:p-6 mb-12 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative flex items-center w-full md:w-96 h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 focus-within:border-[var(--color-brand-secondary)] transition-colors">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search events, tours, or camps..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-[var(--color-brand-text)] focus:outline-none placeholder-gray-400 text-sm font-medium"
                        />
                    </div>

                    <div className="flex overflow-x-auto w-full md:w-auto space-x-3 space-x-reverse hide-scrollbar pb-2 md:pb-0">
                        {filterCats.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setFilter(cat.id)}
                                className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === cat.id
                                    ? 'bg-[var(--color-brand-secondary)] text-white shadow-md shadow-blue-900/20 transform scale-105'
                                    : 'bg-white hover:bg-gray-50 text-[var(--color-brand-text-muted)] border border-gray-200 hover:text-[var(--color-brand-secondary)]'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-3xl"></div>)}
                    </div>
                ) : events.filter(e => !searchQuery || e.title?.fr?.toLowerCase().includes(searchQuery.toLowerCase()) || e.title?.en?.toLowerCase().includes(searchQuery.toLowerCase()) || e.title?.ar?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                        No events found. Check back later or adjust filters.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.filter(e => !searchQuery || e.title?.fr?.toLowerCase().includes(searchQuery.toLowerCase()) || e.title?.en?.toLowerCase().includes(searchQuery.toLowerCase()) || e.title?.ar?.toLowerCase().includes(searchQuery.toLowerCase())).map((event) => {
                            const date = new Date(event.start_date);
                            const day = date.getDate();
                            const month = date.toLocaleString(lang, { month: 'short' });

                            return (
                                <div key={event.id} className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[var(--color-brand-secondary)]/30 p-6 shadow-lg shadow-gray-200/50 transition-all transform hover:-translate-y-1 hover:shadow-xl">

                                    <div className="flex items-start mb-6">
                                        {/* Date Block */}
                                        <div className="flex flex-col items-center justify-center w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm flex-shrink-0 group-hover:bg-[var(--color-brand-secondary)]/5 transition-colors">
                                            <span className="text-xs text-[var(--color-brand-primary)] uppercase font-bold tracking-wider">{month}</span>
                                            <span className="text-3xl font-black text-[var(--color-brand-secondary)] leading-none mt-1">{day}</span>
                                        </div>

                                        {/* Title & Tags */}
                                        <div className="ml-5 rtl:mr-5 rtl:ml-0 flex-1">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 px-2.5 py-1 rounded-lg">
                                                    {categories.find(c => c.id === event.category_id)?.[`name_${lang}`] || event.category_id || '—'}
                                                </span>
                                                {event.is_solidarity && (
                                                    <span title="Solidarity Tourism Event" className="bg-teal-50 text-teal-600 px-2.5 py-1 rounded-lg border border-teal-200 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                                                        <Accessibility size={10} /> Solidarity
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-xl text-[var(--color-brand-text)] leading-tight group-hover:text-[var(--color-brand-secondary)] transition-colors">
                                                {event.title[lang] || event.title.fr}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Event Details */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                                        {/* Location + Capacity row */}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center text-sm text-[var(--color-brand-text-muted)] font-medium min-w-0">
                                                <MapPin size={14} className="mr-1.5 text-[var(--color-brand-secondary)] flex-shrink-0" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {event.max_participants && (
                                                    <div className="flex items-center text-xs text-gray-500 font-bold bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                                                        <Users size={12} className="mr-1 text-[var(--color-brand-primary)]" />
                                                        {event.max_participants}
                                                    </div>
                                                )}
                                                <div className="flex items-center text-xs text-gray-500 font-bold bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                                                    <Clock size={12} className="mr-1 text-[var(--color-brand-secondary)]" />
                                                    {new Date(event.start_date).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Audio guide — only visible when event has audio */}
                                        {event.audio_url && (
                                            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                <p className="text-[10px] font-bold text-orange-600 uppercase mb-1.5 flex items-center gap-1">
                                                    <Headphones size={11} /> {t('features.audioGuide')}
                                                </p>
                                                <audio controls className="w-full h-8">
                                                    <source src={event.audio_url} type="audio/mpeg" />
                                                </audio>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleRegister(event.id)}
                                            disabled={registeredEvents.has(event.id) || registering === event.id}
                                            className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${registeredEvents.has(event.id)
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default flex items-center justify-center'
                                                : 'bg-[var(--color-brand-primary)] hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 hover:shadow-orange-500/30'
                                                }`}>
                                            {registering === event.id ? 'Registering...' :
                                                registeredEvents.has(event.id) ? <><CheckCircle size={16} className="mr-2" /> Registered</> : 'Register for Event'}
                                        </button>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div >
    );
};

export default EventsPage;
