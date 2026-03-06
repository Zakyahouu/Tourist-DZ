import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Search, Filter, Image as ImageIcon, MapPin, Star, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Link, useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet blank marker issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Custom colored icons for categories
const createIcon = (color) => {
    return new L.DivIcon({
        className: 'custom-icon',
        html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });
};

const colors = {
    historical: '#eab308', // Gold
    natural: '#22c55e',    // Green
    cultural: '#a855f7',   // Purple
    thermal: '#3b82f6',    // Blue
    accommodation: '#ef4444', // Red
    default: '#e67e22'     // Terracotta
};

const MapPage = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [sites, setSites] = useState([]);
    const [cms, setCms] = useState({});
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
    const [selectedSite, setSelectedSite] = useState(null);
    const lang = i18n.language || 'fr';

    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545805553-c454eef7dd45?auto=format&fit=crop&q=80&w=800';

    useEffect(() => {
        async function fetchMapData() {
            try {
                const { data: sitesData } = await supabase
                    .from('tourist_sites')
                    .select('*, site_images(image_url)')
                    .eq('is_active', true);

                const { data: accData } = await supabase
                    .from('accommodations')
                    .select('*, accommodation_images(image_url)')
                    .eq('is_active', true);

                const mappedAccs = (accData || []).map(acc => ({
                    id: acc.id,
                    name: acc.name,
                    category: 'accommodation',
                    address: acc.address || '',
                    description: acc.description || { fr: '', en: '', ar: '' },
                    latitude: acc.latitude,
                    longitude: acc.longitude,
                    avg_rating: acc.rating || 0,
                    is_active: acc.is_active,
                    site_images: acc.accommodation_images || [],
                    is_accommodation: true,
                    type: acc.type
                }));

                const allSites = [...(sitesData || []), ...mappedAccs];
                setSites(allSites);
            } catch (err) {
                console.error("Map fetch error:", err);
            }
        }
        async function fetchCms() {
            try {
                const { data } = await supabase.from('site_content').select('key, value');
                if (data) setCms(Object.fromEntries(data.map(d => [d.key, d.value])));
            } catch (e) { console.error('CMS fetch error', e); }
        }
        fetchMapData();
        fetchCms();
    }, []);

    const filteredSites = sites.filter(site => {
        const matchesCategory = filter === 'all' || site.category === filter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (site.name?.fr?.toLowerCase().includes(searchLower)) ||
            (site.name?.en?.toLowerCase().includes(searchLower)) ||
            (site.name?.ar?.toLowerCase().includes(searchLower));
        return matchesCategory && matchesSearch;
    });

    // Focus component to re-center map
    const MapUpdater = ({ center }) => {
        const map = useMap();
        useEffect(() => {
            if (center) map.flyTo(center, 14, { animate: true, duration: 1.5 });
        }, [center, map]);
        return null;
    };

    const categories = [
        { id: 'all', label: t('categories.all') || 'All' },
        { id: 'historical', label: t('categories.historical') || 'Historical' },
        { id: 'natural', label: t('categories.natural') || 'Natural' },
        { id: 'cultural', label: t('categories.cultural') || 'Cultural' },
        { id: 'thermal', label: t('categories.thermal') || 'Thermal' },
        { id: 'accommodation', label: 'Accommodation' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] w-full overflow-hidden bg-[var(--color-brand-bg)]">

            {/* Left Sidebar */}
            <div className="w-full md:w-1/3 lg:w-[400px] h-1/2 md:h-full flex flex-col bg-white border-r border-gray-200 shadow-2xl z-20 order-2 md:order-1 relative">

                {/* Search & Filters Header */}
                <div className="p-4 border-b border-gray-100 bg-white/90 backdrop-blur-md">
                    <div className="flex items-center w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 mb-4 focus-within:border-[var(--color-brand-secondary)] transition-colors shadow-inner">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-[var(--color-brand-text)] focus:outline-none placeholder-gray-400 text-sm font-medium"
                        />
                        <Filter size={18} className="text-[var(--color-brand-primary)] ml-2 cursor-pointer" />
                    </div>

                    <div className="flex overflow-x-auto space-x-2 space-x-reverse hide-scrollbar pb-1">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setFilter(cat.id);
                                    setSelectedSite(null);
                                }}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === cat.id
                                    ? 'bg-[var(--color-brand-primary)] text-white shadow-md shadow-orange-500/30'
                                    : 'bg-white text-gray-600 hover:text-[var(--color-brand-secondary)] hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar Content Area (List or Selected Site Details) */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
                    {selectedSite ? (
                        // Detailed View
                        <div className="animate-fade-in bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <button
                                onClick={() => setSelectedSite(null)}
                                className="flex items-center text-sm font-bold text-gray-500 hover:text-[var(--color-brand-secondary)] mb-4 transition-colors p-1"
                            >
                                <ArrowLeft size={16} className="mr-2 rtl:rotate-180" /> Back to list
                            </button>

                            <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-5 border border-gray-200 relative shadow-inner">
                                {selectedSite.site_images?.[0] ? (
                                    <img src={selectedSite.site_images[0].image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <img
                                        src={`https://images.unsplash.com/photo-1545805553-c454eef7dd45?auto=format&fit=crop&q=80&w=600`}
                                        alt=""
                                        className="w-full h-full object-cover opacity-90"
                                    />
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-black text-[var(--color-brand-primary)] uppercase tracking-wider shadow-sm">
                                    {selectedSite.category}
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-[var(--color-brand-text)] mb-3 leading-tight">
                                {selectedSite.name[lang] || selectedSite.name.fr}
                            </h2>

                            <div className="flex items-center text-sm text-[var(--color-brand-text-muted)] mb-5 font-medium">
                                <span className="flex items-center text-yellow-500 mr-4">
                                    <Star size={16} className="mr-1 fill-current" /> <span className="text-gray-700">{selectedSite.avg_rating?.toFixed(1) || '0.0'}</span>
                                </span>
                                <span className="flex items-center">
                                    <MapPin size={16} className="mr-1 text-[var(--color-brand-secondary)]" /> Biskra
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                                "{selectedSite.description?.[lang] || selectedSite.description?.fr || 'Discover the wonders of this beautiful location in the heart of Biskra oasis.'}"
                            </p>

                            {!selectedSite.is_accommodation ? (
                                <Link
                                    to={`/site/${selectedSite.id}`}
                                    className="w-full block text-center bg-[var(--color-brand-secondary)] hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                                >
                                    View Full Details
                                </Link>
                            ) : (
                                <Link
                                    to={`/accommodation/${selectedSite.id}`}
                                    className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                                >
                                    View Hotel Details
                                </Link>
                            )}
                        </div>
                    ) : (
                        // List View
                        <div className="space-y-3">
                            {filteredSites.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                                    No sites found for this category.
                                </div>
                            ) : (
                                filteredSites.map((site) => (
                                    <div
                                        key={site.id}
                                        onClick={() => setSelectedSite(site)}
                                        className="flex gap-4 p-3 bg-white hover:bg-gray-50 rounded-2xl cursor-pointer transition-all border border-gray-100 hover:border-[var(--color-brand-secondary)]/30 hover:shadow-md group"
                                    >
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-200">
                                            <img
                                                src={site.site_images?.[0]?.image_url || cms.home_hero_image || FALLBACK_IMAGE}
                                                onError={(e) => { e.target.src = FALLBACK_IMAGE }}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex flex-col flex-1 justify-center">
                                            <div className="text-[10px] uppercase font-black text-[var(--color-brand-primary)] mb-1 tracking-wider">
                                                {t(`categories.${site.category}`)}
                                            </div>
                                            <h3 className="font-bold text-[var(--color-brand-text)] text-sm leading-tight mb-1.5 group-hover:text-[var(--color-brand-secondary)] transition-colors">
                                                {site.name[lang] || site.name.fr}
                                            </h3>
                                            <div className="flex items-center text-xs font-bold text-[var(--color-brand-text-muted)]">
                                                <Star size={12} className="text-yellow-500 mr-1" /> {site.avg_rating?.toFixed(1) || '0.0'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="w-full md:w-2/3 lg:flex-1 h-1/2 md:h-full bg-gray-100 z-10 order-1 md:order-2 relative">
                <MapContainer
                    center={[34.8480, 5.7286]} // Biskra center
                    zoom={12}
                    zoomControl={true}
                    className="w-full h-full"
                >
                    {/* Light clear touristic map tiles (Voyager) */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {selectedSite && <MapUpdater center={[selectedSite.latitude, selectedSite.longitude]} />}

                    {filteredSites.map((site) => (
                        <Marker
                            key={site.id}
                            position={[site.latitude, site.longitude]}
                            icon={createIcon(colors[site.category] || colors.default)}
                            eventHandlers={{
                                click: () => setSelectedSite(site),
                            }}
                        />
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;
