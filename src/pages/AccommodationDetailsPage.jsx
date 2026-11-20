import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, ArrowLeft, Hotel, Phone, Globe, DollarSign, Calendar, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';
import fallbackNatural from '../assets/fallback_image_natural.webp';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const isSafeUrl = (url) => /^https?:\/\//i.test(url);

const AccommodationDetailsPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'fr';
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [accommodation, setAccommodation] = useState(null);
    const [accCategories, setAccCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [existingRequest, setExistingRequest] = useState(null);
    const [bookingForm, setBookingForm] = useState({ check_in: '', check_out: '', guests: 1, message: '' });
    const [submittingBooking, setSubmittingBooking] = useState(false);

    useEffect(() => {
        if (!id) { setLoading(false); return; }

        async function fetchDetails() {
            try {
                const [accRes, catRes] = await Promise.all([
                    supabase
                        .from('accommodations')
                        .select('*, accommodation_images(image_url, is_primary)')
                        .eq('id', id)
                        .single(),
                    supabase.from('accommodation_categories').select('*').order('sort_order'),
                ]);

                if (accRes.error) throw accRes.error;
                setAccommodation(accRes.data);
                if (catRes.data) setAccCategories(catRes.data);

                if (user) {
                    const { data: reqData } = await supabase
                        .from('accommodation_requests')
                        .select('*')
                        .eq('accommodation_id', id)
                        .eq('user_id', user.id)
                        .maybeSingle();
                    setExistingRequest(reqData || null);
                }
            } catch (error) {
                logger.error('Error fetching accommodation details:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();
    }, [id, user]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/auth', { state: { from: `/accommodation/${id}` } });
            return;
        }
        if (bookingForm.check_in && bookingForm.check_out && bookingForm.check_out < bookingForm.check_in) {
            return showToast('Check-out date must be after check-in date.', 'error');
        }
        setSubmittingBooking(true);
        try {
            const payload = {
                user_id: user.id,
                accommodation_id: id,
                check_in: bookingForm.check_in || null,
                check_out: bookingForm.check_out || null,
                guests: Math.max(1, parseInt(bookingForm.guests) || 1),
                message: bookingForm.message.trim() || null,
                status: 'pending',
                rejection_reason: null,
            };
            const { data, error } = await supabase
                .from('accommodation_requests')
                .upsert(payload, { onConflict: 'user_id,accommodation_id' })
                .select()
                .single();
            if (error) throw error;
            setExistingRequest(data);
            showToast('Booking request sent!', 'success');
        } catch (err) {
            logger.error('Error submitting booking request:', err);
            showToast('Could not submit request. Please try again.', 'error');
        } finally {
            setSubmittingBooking(false);
        }
    };

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
    const FALLBACK_IMAGE = fallbackNatural;
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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-bg)] via-black/20 to-black/40"></div>

                <div className="absolute top-20 left-6 right-6 flex justify-between items-center z-10">
                    <button
                        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/map')}
                        className="flex items-center text-[var(--color-brand-text)] font-bold bg-white/90 hover:bg-white backdrop-blur-md px-5 py-2.5 rounded-full transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} className="mr-2 rtl:rotate-180 rtl:ml-2 rtl:mr-0" /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="bg-white text-[var(--color-brand-primary)] px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-wider shadow-lg capitalize">
                            {accCategories.find(c => c.id === accommodation.category_id)?.[`name_${lang}`] || accCategories.find(c => c.id === accommodation.category_id)?.name_en || '—'}
                        </span>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 max-w-7xl mx-auto z-10 translate-y-4">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg leading-tight mb-3">
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

                                {isSafeUrl(accommodation.website) && (
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

                                {accommodation.latitude != null && accommodation.longitude != null && (
                                    <div className="pt-2">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${accommodation.latitude},${accommodation.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-[var(--color-brand-secondary)] hover:bg-blue-800 text-white py-3.5 rounded-2xl font-bold flex justify-center items-center transition-colors shadow-lg shadow-blue-900/20 text-sm"
                                        >
                                            <MapPin size={16} className="mr-2" /> {t('site.getDirections')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Request Booking Card */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                            <h3 className="text-xl font-black text-[var(--color-brand-text)] mb-4 flex items-center">
                                <Calendar size={20} className="mr-2 text-[var(--color-brand-primary)]" /> Request Booking
                            </h3>

                            {existingRequest && existingRequest.status !== 'cancelled' && existingRequest.status !== 'rejected' ? (
                                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-700 font-black text-sm uppercase tracking-wider">
                                        {existingRequest.status === 'accepted' ? <CheckCircle size={18} /> : <Clock size={18} />}
                                        Request {existingRequest.status}
                                    </div>
                                    <p className="text-xs text-emerald-600 font-medium">
                                        {existingRequest.guests} {existingRequest.guests === 1 ? 'Guest' : 'Guests'}
                                        {existingRequest.check_in ? ` · ${existingRequest.check_in}` : ''}
                                        {existingRequest.check_out ? ` → ${existingRequest.check_out}` : ''}
                                    </p>
                                    <p className="text-xs text-gray-500 pt-1">
                                        You can track or cancel this request in your Profile under Bookings.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleBookingSubmit} className="space-y-4">
                                    {existingRequest?.status === 'rejected' && (
                                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium flex items-start gap-2">
                                            <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold">Previous request declined.</span>
                                                {existingRequest.rejection_reason && <p>Reason: {existingRequest.rejection_reason}</p>}
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Check-in</label>
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={bookingForm.check_in}
                                                onChange={e => setBookingForm(prev => ({ ...prev, check_in: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[var(--color-brand-primary)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Check-out</label>
                                            <input
                                                type="date"
                                                required
                                                min={bookingForm.check_in || new Date().toISOString().split('T')[0]}
                                                value={bookingForm.check_out}
                                                onChange={e => setBookingForm(prev => ({ ...prev, check_out: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[var(--color-brand-primary)]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1 flex items-center gap-1">
                                            <Users size={12} /> Guests
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            required
                                            value={bookingForm.guests}
                                            onChange={e => setBookingForm(prev => ({ ...prev, guests: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[var(--color-brand-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Message (Optional)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Special requests, arrival time..."
                                            value={bookingForm.message}
                                            onChange={e => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[var(--color-brand-primary)] resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submittingBooking}
                                        className="w-full bg-[var(--color-brand-primary)] hover:bg-orange-600 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 text-sm disabled:opacity-50"
                                    >
                                        {submittingBooking ? 'Sending Request...' : 'Send Booking Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AccommodationDetailsPage;
