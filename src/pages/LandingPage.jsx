import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Headphones, QrCode, Map, HeartHandshake, ArrowRight, Smartphone } from 'lucide-react';

const HeroIllustration = () => (
    <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-lg mx-auto">
        {/* Sun */}
        <circle cx="380" cy="70" r="40" stroke="#D6A64C" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="380" cy="70" r="50" stroke="#D6A64C" strokeWidth="1" fill="none" opacity="0.3" />
        <circle cx="380" cy="70" r="60" stroke="#D6A64C" strokeWidth="0.5" fill="none" opacity="0.15" />

        {/* Dunes / landscape */}
        <path d="M0 320 Q80 260 160 300 Q240 340 320 280 Q400 220 500 270 L500 420 L0 420 Z" fill="#1F5B3A" opacity="0.06" />
        <path d="M0 350 Q100 300 200 330 Q300 360 400 310 Q450 290 500 310 L500 420 L0 420 Z" fill="#1F5B3A" opacity="0.04" />

        {/* Palm tree 1 */}
        <line x1="120" y1="360" x2="120" y2="200" stroke="#1F5B3A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M120 200 Q90 170 60 180" stroke="#1F5B3A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M120 200 Q150 170 180 180" stroke="#1F5B3A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M120 210 Q80 190 50 205" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M120 210 Q160 190 190 205" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M120 220 Q95 205 70 225" stroke="#1F5B3A" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M120 220 Q145 205 170 225" stroke="#1F5B3A" strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Palm tree 2 (smaller, behind) */}
        <line x1="200" y1="340" x2="200" y2="230" stroke="#1F5B3A" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M200 230 Q180 210 160 215" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M200 230 Q220 210 240 215" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* Smartphone device frame */}
        <rect x="310" y="140" width="100" height="180" rx="16" stroke="#1F5B3A" strokeWidth="2.5" fill="none" />
        <line x1="345" y1="145" x2="375" y2="145" stroke="#D6A64C" strokeWidth="2" strokeLinecap="round" />
        <rect x="320" y="158" width="80" height="50" rx="4" stroke="#D6A64C" strokeWidth="1.5" fill="none" opacity="0.5" />
        <line x1="320" y1="220" x2="400" y2="220" stroke="#1F5B3A" strokeWidth="1" opacity="0.3" />
        <line x1="320" y1="240" x2="390" y2="240" stroke="#1F5B3A" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="320" y1="255" x2="380" y2="255" stroke="#1F5B3A" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="320" y1="270" x2="395" y2="270" stroke="#1F5B3A" strokeWidth="1" opacity="0.3" />
        <circle cx="360" cy="300" r="6" stroke="#D6A64C" strokeWidth="1.5" fill="none" />

        {/* Map pin */}
        <path d="M420 310 Q420 290 430 290 Q440 290 440 310 Q430 325 430 335 Q430 325 420 310 Z" stroke="#D6A64C" strokeWidth="2" fill="none" />
        <circle cx="430" cy="305" r="3" fill="#D6A64C" opacity="0.6" />

        {/* Connection arcs (smart tourism) */}
        <path d="M260 250 Q290 200 320 230" stroke="#D6A64C" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="4 4" />
        <path d="M250 270 Q300 240 320 260" stroke="#D6A64C" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="3 3" />

        {/* Water reflection */}
        <line x1="60" y1="380" x2="180" y2="380" stroke="#1F5B3A" strokeWidth="0.5" opacity="0.2" />
        <line x1="80" y1="390" x2="160" y2="390" stroke="#1F5B3A" strokeWidth="0.5" opacity="0.15" />
        <line x1="100" y1="400" x2="140" y2="400" stroke="#1F5B3A" strokeWidth="0.5" opacity="0.1" />
    </svg>
);

const AboutIllustration = () => (
    <svg viewBox="0 0 900 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-4xl mx-auto">
        {/* Timeline-style scene */}
        <path d="M50 200 Q150 160 250 180 Q350 200 450 170 Q550 140 650 165 Q750 190 850 160" stroke="#1F5B3A" strokeWidth="1.5" fill="none" opacity="0.15" />

        {/* Palm 1 */}
        <line x1="100" y1="200" x2="100" y2="100" stroke="#1F5B3A" strokeWidth="2" strokeLinecap="round" />
        <path d="M100 100 Q75 80 55 90" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M100 100 Q125 80 145 90" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Palm 2 */}
        <line x1="350" y1="190" x2="350" y2="110" stroke="#1F5B3A" strokeWidth="2" strokeLinecap="round" />
        <path d="M350 110 Q325 95 310 105" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M350 110 Q375 95 390 105" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Palm 3 */}
        <line x1="700" y1="180" x2="700" y2="100" stroke="#1F5B3A" strokeWidth="2" strokeLinecap="round" />
        <path d="M700 100 Q675 85 660 95" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M700 100 Q725 85 740 95" stroke="#1F5B3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Digital nodes */}
        <circle cx="200" cy="160" r="8" stroke="#D6A64C" strokeWidth="2" fill="none" />
        <circle cx="450" cy="145" r="8" stroke="#D6A64C" strokeWidth="2" fill="none" />
        <circle cx="650" cy="155" r="8" stroke="#D6A64C" strokeWidth="2" fill="none" />

        {/* Node connections */}
        <path d="M200 160 Q250 150 300 155" stroke="#D6A64C" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
        <path d="M450 145 Q500 155 550 150" stroke="#D6A64C" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
        <path d="M650 155 Q680 160 700 165" stroke="#D6A64C" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />

        {/* Small building silhouettes */}
        <rect x="150" y="168" width="12" height="20" rx="1" stroke="#1F5B3A" strokeWidth="1" opacity="0.3" />
        <rect x="168" y="172" width="10" height="16" rx="1" stroke="#1F5B3A" strokeWidth="1" opacity="0.3" />
        <rect x="500" y="160" width="12" height="18" rx="1" stroke="#1F5B3A" strokeWidth="1" opacity="0.3" />
        <rect x="518" y="155" width="10" height="23" rx="1" stroke="#1F5B3A" strokeWidth="1" opacity="0.3" />

        {/* Smart device */}
        <rect x="780" y="120" width="40" height="60" rx="6" stroke="#1F5B3A" strokeWidth="1.5" fill="none" opacity="0.5" />
        <line x1="795" y1="123" x2="805" y2="123" stroke="#D6A64C" strokeWidth="1.5" strokeLinecap="round" />

        {/* Ground line */}
        <line x1="30" y1="200" x2="870" y2="200" stroke="#1F5B3A" strokeWidth="1" opacity="0.2" />
    </svg>
);

const FeatureCard = ({ icon: Icon, title, desc, index }) => (
    <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-[var(--color-brand-primary)]/10">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 ${index % 2 === 0 ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]' : 'bg-[var(--color-brand-secondary)]/10 text-[var(--color-brand-secondary)]'}`}>
            <Icon size={28} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

const LandingPage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const features = [
        { icon: Headphones, title: t('landing.feature_1_title'), desc: t('landing.feature_1_desc') },
        { icon: QrCode, title: t('landing.feature_2_title'), desc: t('landing.feature_2_desc') },
        { icon: Map, title: t('landing.feature_3_title'), desc: t('landing.feature_3_desc') },
        { icon: HeartHandshake, title: t('landing.feature_4_title'), desc: t('landing.feature_4_desc') },
    ];

    const values = [
        { title: t('landing.about_value_1_title'), desc: t('landing.about_value_1_desc') },
        { title: t('landing.about_value_2_title'), desc: t('landing.about_value_2_desc') },
        { title: t('landing.about_value_3_title'), desc: t('landing.about_value_3_desc') },
    ];

    return (
        <div className="bg-[var(--color-brand-bg)] min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* ── HERO ── */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        {/* Left: Text */}
                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--color-brand-text)] leading-[1.1]">
                                {t('landing.hero_title')}
                            </h1>
                            <p className="mt-4 text-lg sm:text-xl font-bold tracking-[0.15em] uppercase text-[var(--color-brand-secondary)]">
                                {t('landing.hero_subtitle')}
                            </p>
                            <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
                                {t('landing.hero_desc')}
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/explore"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-brand-primary)] text-white font-bold text-sm rounded-full hover:bg-[var(--color-brand-primary)]/90 transition-all shadow-lg shadow-[var(--color-brand-primary)]/20 hover:-translate-y-0.5"
                                >
                                    {t('landing.hero_cta_explore')}
                                    <ArrowRight size={16} strokeWidth={2} className={isRTL ? 'rotate-180' : ''} />
                                </Link>
                                <Link
                                    to="/explore"
                                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[var(--color-brand-secondary)] text-[var(--color-brand-secondary)] font-bold text-sm rounded-full hover:bg-[var(--color-brand-secondary)] hover:text-white transition-all"
                                >
                                    <Smartphone size={16} strokeWidth={1.5} />
                                    {t('landing.hero_cta_app')}
                                </Link>
                            </div>
                        </div>

                        {/* Right: Illustration */}
                        <div className="flex-1 w-full max-w-lg lg:max-w-none">
                            <HeroIllustration />
                        </div>
                    </div>
                </div>
                {/* Subtle bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-brand-bg)] to-transparent pointer-events-none" />
            </section>

            {/* ── ABOUT / VISION ── */}
            <section className="py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--color-brand-text)] tracking-tight">
                            {t('landing.about_title')}
                        </h2>
                        <div className="mt-6 space-y-4 text-base sm:text-lg text-slate-500 leading-relaxed">
                            <p>{t('landing.about_desc_1')}</p>
                            <p>{t('landing.about_desc_2')}</p>
                        </div>
                    </div>

                    {/* Values grid */}
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-20">
                        {values.map((v, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black mb-5 ${i === 1 ? 'bg-[var(--color-brand-secondary)]/10 text-[var(--color-brand-secondary)]' : 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'}`}>
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3">{v.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Wide illustration */}
                    <div className="bg-white/50 rounded-3xl p-8 lg:p-12 shadow-sm border border-slate-100">
                        <AboutIllustration />
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-24 lg:py-32 bg-white/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-brand-secondary)]">
                            {t('landing.hero_subtitle')}
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[var(--color-brand-text)] tracking-tight">
                            {t('landing.feature_1_title').split(' ')[0]} &amp; Beyond
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {features.map((f, i) => (
                            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-28 lg:py-36">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--color-brand-text)] tracking-tight">
                        {t('landing.cta_title')}
                    </h2>
                    <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                        {t('landing.cta_subtitle')}
                    </p>
                    <div className="mt-10">
                        <Link
                            to="/explore"
                            className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--color-brand-primary)] text-white font-bold text-sm rounded-full hover:bg-[var(--color-brand-primary)]/90 transition-all shadow-lg shadow-[var(--color-brand-primary)]/20 hover:-translate-y-0.5"
                        >
                            {t('landing.cta_button')}
                            <ArrowRight size={16} strokeWidth={2} className={isRTL ? 'rotate-180' : ''} />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
