import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation dictionaries
const resources = {
    en: {
        translation: {
            "app": {
                "title": "ToursticDZ",
                "tagline": "Discover Biskra",
                "login": "Login",
                "signup": "Sign Up",
            },
            "nav": {
                "home": "Home",
                "map": "Map",
                "events": "Events",
                "gallery": "Gallery",
                "profile": "Profile"
            },
            "categories": {
                "all": "All",
                "historical": "Historical",
                "natural": "Natural",
                "cultural": "Cultural",
                "thermal": "Thermal/Spa"
            }
        }
    },
    fr: {
        translation: {
            "app": {
                "title": "ToursticDZ",
                "tagline": "Découvrez Biskra",
                "login": "Connexion",
                "signup": "S'inscrire",
            },
            "nav": {
                "home": "Accueil",
                "map": "Carte",
                "events": "Événements",
                "gallery": "Galerie",
                "profile": "Profil"
            },
            "categories": {
                "all": "Tout",
                "historical": "Historique",
                "natural": "Naturel",
                "cultural": "Culturel",
                "thermal": "Thermal/Spa"
            }
        }
    },
    ar: {
        translation: {
            "app": {
                "title": "ToursticDZ",
                "tagline": "اكتشف بسكرة",
                "login": "تسجيل الدخول",
                "signup": "إنشاء حساب",
            },
            "nav": {
                "home": "الرئيسية",
                "map": "الخريطة",
                "events": "الفعاليات",
                "gallery": "المعرض",
                "profile": "حسابي"
            },
            "categories": {
                "all": "الكل",
                "historical": "تاريخي",
                "natural": "طبيعي",
                "cultural": "ثقافي",
                "thermal": "حموي"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr', // Default to French if language not detected
        interpolation: {
            escapeValue: false // React already escapes by default
        }
    });

export default i18n;
