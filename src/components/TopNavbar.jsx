import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TopNavbar = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const { user, profile, isAdmin } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const navItems = [
        { path: '/', label: t('nav.home') },
        { path: '/map', label: t('nav.map') },
        { path: '/events', label: t('nav.events') },
        { path: '/gallery', label: t('nav.gallery') },
    ];

    const displayName = profile?.full_name || user?.email?.split('@')[0] || '';
    const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

    return (
        <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-1' : 'bg-transparent py-3'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 relative">

                    {/* Left: Logo */}
                    <div className="flex items-center flex-shrink-0 z-10 basis-1/4">
                        <Link to="/" className="flex items-center">
                            <span className={`text-2xl font-black tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900 drop-shadow-sm'}`}>
                                Tourstic<span className="text-[var(--color-brand-primary)]">DZ</span>
                            </span>
                        </Link>
                    </div>

                    {/* Center: Desktop Menu */}
                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-0">
                        <div className={`flex items-baseline space-x-2 rtl:space-x-reverse px-2 py-1.5 rounded-full transition-all duration-300 ${scrolled ? 'bg-gray-100/80 border border-transparent' : 'bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm'}`}>
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive
                                            ? 'text-white bg-[var(--color-brand-primary)] shadow-md'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Language + Profile/Login */}
                    <div className="hidden md:flex items-center justify-end space-x-3 rtl:space-x-reverse z-10 basis-1/4">
                        <div className={`flex items-center space-x-1 rtl:space-x-reverse rounded-full p-1 transition-colors ${scrolled ? 'bg-gray-100 border-transparent text-gray-600' : 'bg-white/90 border-gray-200 shadow-sm text-gray-700'}`}>
                            <button onClick={() => changeLanguage('en')} className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${i18n.language === 'en' ? 'bg-[var(--color-brand-secondary)] text-white shadow-sm' : 'hover:bg-gray-200 hover:text-gray-900'}`}>EN</button>
                            <button onClick={() => changeLanguage('fr')} className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${i18n.language === 'fr' ? 'bg-[var(--color-brand-secondary)] text-white shadow-sm' : 'hover:bg-gray-200 hover:text-gray-900'}`}>FR</button>
                            <button onClick={() => changeLanguage('ar')} className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${i18n.language === 'ar' ? 'bg-[var(--color-brand-secondary)] text-white shadow-sm' : 'hover:bg-gray-200 hover:text-gray-900'}`}>AR</button>
                        </div>

                        {isAdmin && (
                            <Link to="/admin" className="flex items-center justify-center p-2 rounded-full bg-slate-800 text-yellow-400 hover:bg-slate-700 transition-colors shadow-md" title="Admin Dashboard">
                                <Shield size={16} />
                            </Link>
                        )}

                        {user ? (
                            <Link to="/profile" className="flex items-center justify-center rounded-full bg-[var(--color-brand-secondary)] text-white hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 transform overflow-hidden" title={displayName}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt={displayName} className="w-10 h-10 object-cover rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 flex items-center justify-center text-sm font-black">
                                        {initials || <User size={18} />}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <Link to="/auth" className="flex items-center px-5 py-2.5 rounded-full bg-[var(--color-brand-primary)] text-white font-bold text-sm hover:bg-[#d6721d] transition-colors shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transform">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex items-center md:hidden z-10">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`inline-flex items-center justify-center p-2.5 rounded-full focus:outline-none transition-colors ${scrolled ? 'text-gray-800 bg-gray-100' : 'text-gray-900 bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200'}`}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 absolute w-full shadow-[0_20px_40px_rgba(0,0,0,0.1)] origin-top animate-fade-in pb-6 pt-2 rounded-b-3xl">
                    <div className="px-5 space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-5 py-4 rounded-2xl text-base font-black transition-colors ${isActive ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}

                        {isAdmin && (
                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-5 py-4 rounded-2xl text-base font-black text-slate-800 hover:bg-slate-50 flex items-center gap-2">
                                <Shield size={18} className="text-yellow-500" /> Admin Panel
                            </Link>
                        )}

                        <div className="py-6 border-t border-gray-100 flex justify-between items-center px-2 mt-4">
                            <div className="flex space-x-2 rtl:space-x-reverse bg-gray-50 p-1.5 rounded-full border border-gray-100">
                                <button onClick={() => { changeLanguage('en'); setIsMenuOpen(false); }} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${i18n.language === 'en' ? 'bg-[var(--color-brand-secondary)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>EN</button>
                                <button onClick={() => { changeLanguage('fr'); setIsMenuOpen(false); }} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${i18n.language === 'fr' ? 'bg-[var(--color-brand-secondary)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>FR</button>
                                <button onClick={() => { changeLanguage('ar'); setIsMenuOpen(false); }} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${i18n.language === 'ar' ? 'bg-[var(--color-brand-secondary)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>AR</button>
                            </div>

                            {user ? (
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-white bg-[var(--color-brand-secondary)] p-3 rounded-full shadow-lg shadow-blue-900/20">
                                    {initials ? <span className="text-sm font-black">{initials}</span> : <User size={22} />}
                                </Link>
                            ) : (
                                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="text-white bg-[var(--color-brand-primary)] px-5 py-3 rounded-full shadow-lg font-bold text-sm">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default TopNavbar;
