import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-auto relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left rtl:md:text-right">
                <div>
                    <Link to="/" className="inline-block">
                        <span className="text-2xl font-black tracking-tight text-[var(--color-brand-secondary)]">
                            Tourist <span className="text-[var(--color-brand-primary)]">DZ</span>
                        </span>
                    </Link>
                    <p className="mt-4 text-[var(--color-brand-text-muted)] text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                        {t('footer.tagline')}
                    </p>
                </div>
                <div>
                    <h3 className="text-[var(--color-brand-text)] font-bold mb-4 uppercase tracking-wider text-sm">{t('footer.quickLinks')}</h3>
                    <ul className="space-y-2 text-[var(--color-brand-text-muted)] text-sm font-medium">
                        <li><Link to="/map" className="hover:text-[var(--color-brand-secondary)] transition-colors">{t('footer.interactiveMap')}</Link></li>
                        <li><Link to="/events" className="hover:text-[var(--color-brand-secondary)] transition-colors">{t('footer.upcomingEvents')}</Link></li>
                        <li><Link to="/solidarity" className="hover:text-[var(--color-brand-secondary)] transition-colors">{t('footer.solidarityTrips')}</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-[var(--color-brand-text)] font-bold mb-4 uppercase tracking-wider text-sm">{t('footer.legal')}</h3>
                    <ul className="space-y-2 text-[var(--color-brand-text-muted)] text-sm font-medium">
                        <li><span className="opacity-50 cursor-default">{t('footer.privacyPolicy')} <span className="italic text-xs">(Coming Soon)</span></span></li>
                        <li><span className="opacity-50 cursor-default">{t('footer.termsOfService')} <span className="italic text-xs">(Coming Soon)</span></span></li>
                        <li><a href="mailto:contact@touristdz.dz" className="hover:text-[var(--color-brand-secondary)] transition-colors">{t('footer.contactUs')}</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm font-medium">
                &copy; {new Date().getFullYear()} Tourist DZ. {t('footer.copyright')}
            </div>
        </footer>
    );
};

export default Footer;
