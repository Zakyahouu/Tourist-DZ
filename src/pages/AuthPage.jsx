import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import authPanelImage from '../assets/home_hero_image.webp';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmMessage, setShowConfirmMessage] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);

    // Where to go after login — use the page the user came from, or fallback to home
    const from = location.state?.from || '/';

    // If already logged in, redirect away
    useEffect(() => {
        if (!authLoading && user) {
            navigate(from, { replace: true });
        }
    }, [authLoading, user, navigate, from]);
    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate(from, { replace: true });
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth`,
                        data: {
                            full_name: fullName,
                            preferred_language: i18n.language
                        }
                    }
                });
                if (error) throw error;
                setShowConfirmMessage(true);
                return;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setError(null);
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
            redirectTo: `${window.location.origin}/auth`,
        });
        setForgotLoading(false);
        if (error) setError(error.message);
        else setForgotSent(true);
    };

    return (
        <div className="flex min-h-screen bg-[var(--color-brand-bg)] w-full font-sans">

            {/* Left Side: Image/Branding (Hidden on small screens) */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-16 overflow-hidden bg-[var(--color-brand-secondary)] border-r border-gray-200">
                <img
                    src={authPanelImage}
                    alt="Biskra"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-secondary)] via-[var(--color-brand-secondary)]/50 to-transparent"></div>

                <div className="relative z-10 w-full max-w-lg">
                    <div className="mb-8 inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl">
                        <span className="text-4xl font-black text-[var(--color-brand-primary)]">DZ</span>
                    </div>
                    <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight mb-6 drop-shadow-md">
                        {t('app.tagline')}
                    </h1>
                    <p className="text-xl text-blue-100 font-medium leading-relaxed">
                        Join Tourist DZ to unlock hidden gems, organize your itinerary, and connect with the community.
                    </p>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col pt-16 lg:pt-0 bg-white lg:bg-[var(--color-brand-bg)]">

                <div className="p-8 lg:p-12">
                    <button onClick={() => navigate('/')} className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-full text-sm font-bold text-gray-600 hover:text-[var(--color-brand-secondary)] hover:bg-gray-100 border border-gray-200 shadow-sm transition-all">
                        <ArrowLeft size={16} className="mr-2 rtl:rotate-180" /> Back to Home
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-28 max-w-2xl mx-auto w-full pb-20">

                    {/* Mobile Branding Fallback */}
                    <div className="lg:hidden flex flex-col items-center justify-center mb-10 mt-8">
                        <div className="w-20 h-20 bg-[var(--color-brand-bg)] rounded-3xl flex items-center justify-center shadow-lg mb-6 border border-gray-100">
                            <span className="text-4xl font-black text-[var(--color-brand-secondary)]">
                                T<span className="text-[var(--color-brand-primary)]">DZ</span>
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-[var(--color-brand-text)] text-center mb-3 tracking-tight">{t('app.title')}</h1>
                        <p className="text-[var(--color-brand-text-muted)] text-base font-medium text-center">{t('app.tagline')}</p>
                    </div>

                    {/* Email confirmation screen */}
                    {showConfirmMessage ? (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail size={36} className="text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-black text-[var(--color-brand-text)] mb-3">Check your inbox</h2>
                            <p className="text-[var(--color-brand-text-muted)] text-lg mb-6">
                                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account then come back to log in.
                            </p>
                            <button
                                onClick={() => { setShowConfirmMessage(false); setIsLogin(true); }}
                                className="px-6 py-3 bg-[var(--color-brand-primary)] text-white font-bold rounded-2xl hover:bg-orange-500 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : showForgotPassword ? (
                        /* Forgot password screen */
                        <div>
                            <button onClick={() => { setShowForgotPassword(false); setForgotSent(false); setError(null); }} className="flex items-center text-sm font-bold text-gray-500 hover:text-[var(--color-brand-secondary)] mb-8 transition-colors">
                                <ArrowLeft size={16} className="mr-1.5" /> Back to login
                            </button>
                            {forgotSent ? (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Mail size={36} className="text-blue-600" />
                                    </div>
                                    <h2 className="text-3xl font-black text-[var(--color-brand-text)] mb-3">Email sent!</h2>
                                    <p className="text-[var(--color-brand-text-muted)] text-lg">Check your inbox for a password reset link.</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-4xl font-black text-[var(--color-brand-text)] mb-3 tracking-tight">Reset Password</h2>
                                    <p className="text-[var(--color-brand-text-muted)] text-lg font-medium mb-8">Enter your email and we'll send you a reset link.</p>
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 flex items-center shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-red-500 mr-3 flex-shrink-0"></div>
                                            {error}
                                        </div>
                                    )}
                                    <form onSubmit={handleForgotPassword} className="space-y-5">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <Mail size={20} className="text-gray-400 group-focus-within:text-[var(--color-brand-primary)] transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                placeholder="Email Address"
                                                className="w-full bg-white border border-gray-200 text-[var(--color-brand-text)] font-medium text-base rounded-2xl py-4 pt-5 pl-14 pr-5 focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={forgotLoading}
                                            className="w-full bg-[var(--color-brand-primary)] hover:bg-[#d6721d] text-white font-black text-lg rounded-2xl py-4 mt-4 shadow-xl shadow-orange-500/30 flex justify-center items-center transition-all disabled:opacity-50"
                                        >
                                            {forgotLoading ? <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Send Reset Link'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Normal login / signup form */
                        <>
                        <div className="mb-10 text-center lg:text-left rtl:lg:text-right">
                            <h2 className="text-4xl font-black text-[var(--color-brand-text)] mb-3 tracking-tight">
                                {isLogin ? 'Welcome Back' : 'Create an Account'}
                            </h2>
                            <p className="text-[var(--color-brand-text-muted)] text-lg font-medium">
                                {isLogin ? 'Sign in to access your itinerary and favorites.' : 'Sign up to start planning your Biskra journey.'}
                            </p>
                        </div>

                    {/* Auth Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-2xl p-1.5 border border-gray-200 mb-8 shadow-inner">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setError(null); }}
                            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider rounded-xl transition-all ${isLogin ? 'bg-white text-[var(--color-brand-primary)] shadow-md' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {t('app.login')}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setError(null); }}
                            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider rounded-xl transition-all ${!isLogin ? 'bg-white text-[var(--color-brand-primary)] shadow-md' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {t('app.signup')}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 animate-fade-in flex items-center shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-red-500 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"></div>
                            {error}
                        </div>
                    )}

                    {/* Auth Form */}
                    <form onSubmit={handleAuth} className="space-y-5">

                        {!isLogin && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-5">
                                    <User size={20} className="text-gray-400 group-focus-within:text-[var(--color-brand-primary)] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full bg-white border border-gray-200 text-[var(--color-brand-text)] font-medium text-base rounded-2xl py-4 pt-5 pl-14 pr-5 focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-4 focus:ring-orange-500/10 rtl:pl-5 rtl:pr-14 transition-all shadow-sm"
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-5">
                                <Mail size={20} className="text-gray-400 group-focus-within:text-[var(--color-brand-primary)] transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full bg-white border border-gray-200 text-[var(--color-brand-text)] font-medium text-base rounded-2xl py-4 pt-5 pl-14 pr-5 focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-4 focus:ring-orange-500/10 rtl:pl-5 rtl:pr-14 transition-all shadow-sm"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-5">
                                <Lock size={20} className="text-gray-400 group-focus-within:text-[var(--color-brand-primary)] transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-white border border-gray-200 text-[var(--color-brand-text)] font-medium text-base rounded-2xl py-4 pt-5 pl-14 pr-5 focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-4 focus:ring-orange-500/10 rtl:pl-5 rtl:pr-14 transition-all shadow-sm"
                            />
                        </div>

                        {isLogin && (
                            <div className="flex justify-end pt-1">
                                <button type="button" onClick={() => { setShowForgotPassword(true); setError(null); }} className="text-sm font-bold text-[var(--color-brand-secondary)] hover:text-blue-800 transition-colors">Forgot password?</button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-brand-primary)] hover:bg-[#d6721d] text-white font-black text-lg rounded-2xl py-4 mt-8 shadow-xl shadow-orange-500/30 flex justify-center items-center hover:shadow-orange-500/40 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                        >
                            {loading ? (
                                <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    {isLogin ? t('app.login') : t('app.signup')}
                                    <ArrowRight size={22} className="ml-2 rtl:rotate-180 rtl:mr-2 rtl:ml-0" />
                                </>
                            )}
                        </button>
                    </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
