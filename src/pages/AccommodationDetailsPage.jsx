import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, ArrowLeft, Hotel, Phone, Globe, DollarSign } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';

const AccommodationDetailsPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'fr';
    const navigate = useNavigate();

    const [accommodation, setAccommodation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) { setLoading(false); return; }

        async function fetchDetails() {
            try {
                const { data, error } = await supabase
                    .from('accommodations')
                    .select('*, accommodation_images(image_url, is_primary)')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setAccommodation(data);
            } catch (error) {
                console.error('Error fetching accommodation details:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();
    }, [id]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[var(--color-brand-bg)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-primary)]"></div>
        </div>
    );

    if (!accommodation) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-brand-bg)] text-gray-500 p-8">
            <Hotel size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-bold mb-4">Accommodation not found.</p>
            <button onClick={() => navigate(-1)} className="text-[var(--color-brand-secondary)] font-bold hover:underline">Go back</button>
        </div>
    );

    // Sort images so primary is first
    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2670';
    const images = (accommodation.accommodation_images || [])
        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        .map(img => img.image_url)
        .filter(Boolean); // Ensure no null/undefined URLs
    const coverImage = images[0] || FALLBACK_IMAGE;
    const galleryImages = images.slice(1);

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)] pb-24">
            {/* Hero Section */}
            <div className="relative w-full h-[45vh] md:h-[55vh] bg-black overflow-hidden shadow-md">
                <img
                    src={coverImage}
                    alt={accommodation.name?.[lang] || accommodation.name?.fr || 'Accommodation image'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = FALLBACK_IMAGE }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-bg)] via-black/20 to-black/40"></div>

                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                    <button
                        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/map')}
                        className="flex items-center text-[var(--color-brand-text)] font-bold bg-white/90 hover:bg-white backdrop-blur-md px-5 py-2.5 rounded-full transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} className="mr-2 rtl:rotate-180 rtl:ml-2 rtl:mr-0" /> Back
                    </button>
                    <span className="bg-white text-[var(--color-brand-primary)] px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-wider shadow-lg capitalize">
                        {accommodation.type}
                    </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto z-10 translate-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg leading-tight mb-3">
                        {accommodation.name?.[lang] || accommodation.name?.fr}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-white drop-shadow-md font-medium">
                        {accommodation.rating > 0 && (
                            <div className="flex items-center text-sm font-bold text-gray-800 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow-lg">
                                <Star size={14} className="text-yellow-500 mr-1.5 fill-yellow-500" />
                                {accommodation.rating?.toFixed(1)}
                            </div>
                        )}
                        {accommodation.address && (
                            <div className="flex items-center text-sm">
                                <MapPin size={16} className="text-red-400 mr-1.5" />
                                {accommodation.address}
                            </div>
                        )}
                        {accommodation.price_range && (
                            <div className="flex items-center text-sm">
                                <DollarSign size={16} className="text-green-400 mr-1" />
                                <span className="uppercase tracking-widest">{accommodation.price_range}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column (Main Details) */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        {(accommodation.description?.[lang] || accommodation.description?.fr) && (
                            <section className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                                <h2 className="text-2xl font-black text-[var(--color-brand-text)] mb-5 flex items-center">
                                    <span className="w-8 h-1.5 bg-[var(--color-brand-primary)] mr-3 rounded-full"></span> Details
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                    {accommodation.description[lang] || accommodation.description.fr}
                                </p>
                            </section>
                        )}

                        {/* Photo Gallery (if more than 1 image) */}
                        {galleryImages.length > 0 && (
                            <section className="space-y-6">
                                <h2 className="text-2xl font-black text-[var(--color-brand-text)] flex items-center">
                                    <span className="w-8 h-1.5 bg-[var(--color-brand-secondary)] mr-3 rounded-full"></span> Gallery
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {galleryImages.map((url, idx) => (
                                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-md group">
                                            <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-24">
                            <h3 className="text-xl font-black text-[var(--color-brand-text)] mb-6 flex items-center">
                                <Phone size={20} className="mr-2 text-[var(--color-brand-primary)]" /> Contact Information
                            </h3>

                            <div className="space-y-4">
                                {accommodation.address && (
                                    <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="bg-white p-2.5 shadow-sm rounded-full text-red-500 flex-shrink-0 self-start"><MapPin size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Location</p>
                                            <p className="font-bold text-gray-800 leading-tight">{accommodation.address}</p>
                                        </div>
                                    </div>
                                )}

                                {accommodation.phone && (
                                    <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="bg-white p-2.5 shadow-sm rounded-full text-emerald-500 flex-shrink-0 self-start"><Phone size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Phone</p>
                                            <a href={`tel:${accommodation.phone}`} className="font-bold text-gray-800 hover:text-[var(--color-brand-primary)] transition-colors">{accommodation.phone}</a>
                                        </div>
                                    </div>
                                )}

                                {accommodation.website && (
                                    <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="bg-white p-2.5 shadow-sm rounded-full text-blue-500 flex-shrink-0 self-start"><Globe size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Website</p>
                                            <a href={accommodation.website} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--color-brand-primary)] hover:underline break-all">
                                                {accommodation.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {!accommodation.address && !accommodation.phone && !accommodation.website && (
                                    <p className="text-sm text-gray-400 italic text-center py-4">No contact information provided.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AccommodationDetailsPage;
