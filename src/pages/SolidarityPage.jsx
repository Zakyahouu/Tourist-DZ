import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabaseClient';
import { Accessibility, Users, Calendar, ArrowRight, CheckCircle, HeartHandshake, Map, Headset } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TRIP_TYPES = ['oasis_walk', 'museum_visit', 'thermal_bath', 'city_tour', 'desert_excursion'];

const SolidarityPage = () => {
    const { t, i18n } = useTranslation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        category: '',
        special_needs: '',
        preferred_trip_types: []
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const toggleTripType = (type) => {
        setFormData(prev => ({
            ...prev,
            preferred_trip_types: prev.preferred_trip_types.includes(type)
                ? prev.preferred_trip_types.filter(t => t !== type)
                : [...prev.preferred_trip_types, type]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('solidarity_applications')
                .insert([{
                    full_name: formData.full_name,
                    phone: formData.phone,
                    category: formData.category,
                    special_needs: formData.special_needs || null,
                    preferred_trip_types: formData.preferred_trip_types,
                    user_id: user?.id || null,
                }]);

            if (error) throw error;
            setSuccess(true);
            showToast('Application submitted successfully!', 'success');
        } catch (error) {
            console.error('Error submitting solidarity request:', error);
            showToast('Error submitting request. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)] items-center justify-center p-6 text-center">
                <div className="bg-white p-8 sm:p-12 lg:p-16 rounded-[3rem] border border-teal-100 max-w-xl w-full flex flex-col items-center animate-fade-in relative overflow-hidden shadow-2xl shadow-teal-900/10">
                    <div className="absolute inset-0 bg-teal-500/5 blur-3xl rounded-full"></div>
                    <div className="w-28 h-28 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-teal-500/30 relative z-10 border-8 border-teal-50">
                        <CheckCircle size={56} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-teal-800 mb-4 relative z-10 tracking-tight">Application Received!</h2>
                    <p className="text-gray-600 mb-10 leading-relaxed relative z-10 text-lg font-medium">
                        Thank you for applying to the Solidarity Tourism program. Our coordinating team will review your requirements and contact you shortly to plan the accessible trip.
                    </p>
                    <Link to="/" className="w-full bg-[var(--color-brand-secondary)] hover:bg-blue-800 transition-colors text-white font-black py-4 rounded-2xl shadow-lg relative z-10 text-lg block text-center">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)]">

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row">

                    {/* Left Side: Program Information */}
                    <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-16 bg-gradient-to-br from-teal-500 to-teal-700 relative border-b lg:border-b-0 lg:border-r border-teal-800/10 flex flex-col justify-center overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>

                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-10 border border-white/30 shadow-xl relative z-10">
                            <HeartHandshake size={44} className="text-white" />
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 relative z-10 leading-[1.1] tracking-tight">
                            Solidarity <br /><span className="text-teal-100">Tourism</span>
                        </h1>
                        <p className="text-xl text-teal-50 mb-12 leading-relaxed max-w-md relative z-10 font-medium">
                            We ensure that the beauty of Biskra is accessible to everyone. Our community-funded solidarity program covers all logistics for individuals with disabilities and low-income youth.
                        </p>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-start bg-teal-800/20 p-5 rounded-3xl border border-teal-400/20 backdrop-blur-sm">
                                <div className="bg-white/20 p-4 rounded-2xl mr-5 text-white shadow-inner">
                                    <Map size={28} />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-xl mb-1.5 leading-tight">Tailored Routes</h4>
                                    <p className="text-sm md:text-base text-teal-100/90 font-medium">Fully wheelchair-accessible natural oasis paths and museum access.</p>
                                </div>
                            </div>
                            <div className="flex items-start bg-teal-800/20 p-5 rounded-3xl border border-teal-400/20 backdrop-blur-sm">
                                <div className="bg-white/20 p-4 rounded-2xl mr-5 text-white shadow-inner">
                                    <Headset size={28} />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-xl mb-1.5 leading-tight">Assisted Experience</h4>
                                    <p className="text-sm md:text-base text-teal-100/90 font-medium">Specialized audio guides and trained volunteer escorts provided free of charge.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Application Form */}
                    <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-16 bg-white flex flex-col justify-center relative">
                        <h2 className="text-2xl sm:text-4xl font-black text-[var(--color-brand-text)] mb-3 tracking-tight">Request a Trip Spot</h2>
                        <p className="text-base text-gray-500 font-medium mb-10 pb-8 border-b border-gray-100">Fill out the details below. All fields are confidential and required to help us prepare.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-5">
                                    <Users size={20} className="text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Full Name"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold text-base rounded-2xl py-4 pt-5 pl-14 pr-5 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                                />
                            </div>

                            <div className="relative">
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Phone Number"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold text-base rounded-2xl py-4 pt-5 px-5 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold text-base rounded-2xl py-4 px-5 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 appearance-none shadow-sm"
                                >
                                    <option value="" disabled>Select Category</option>
                                    <option value="disability">Person with Disability</option>
                                    <option value="patient">Patient</option>
                                    <option value="low_income">Low Income / Youth</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 rtl:right-auto rtl:left-0">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>

                            {/* Preferred Trip Types */}
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-3">Preferred Trip Types</label>
                                <div className="flex flex-wrap gap-2">
                                    {TRIP_TYPES.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleTripType(type)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all border ${formData.preferred_trip_types.includes(type)
                                                ? 'bg-teal-500 text-white border-teal-500 shadow-md'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                                                }`}
                                        >
                                            {type.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative pt-3">
                                <textarea
                                    rows="4"
                                    value={formData.special_needs}
                                    onChange={(e) => setFormData({ ...formData, special_needs: e.target.value })}
                                    placeholder="Please describe any special medical, dietary, or mobility requirements (e.g. wheelchair access, guide dog, etc.)"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-medium text-base rounded-2xl p-6 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 resize-none transition-all shadow-sm"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-black text-xl rounded-2xl py-5 mt-10 shadow-xl shadow-teal-500/30 flex justify-center items-center hover:shadow-[0_15px_40px_rgba(20,184,166,0.5)] transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Submit Official Request
                                        <ArrowRight size={24} className="ml-3 rtl:rotate-180 rtl:mr-3 rtl:ml-0" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default SolidarityPage;
