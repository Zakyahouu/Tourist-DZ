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
                "map": "Explore",
                "events": "Events",
                "gallery": "Gallery",
                "profile": "Profile"
            },
            "home": {
                "searchPlaceholder": "Search destinations, hotels, events...",
                "viewAll": "View All",
                "featuredPlaces": "Featured Places",
                "upcomingEvents": "Upcoming Tours & Events",
                "discoverBiskra": "Discover Biskra",
                "heroSubtitle": "Experience the enchanting palm groves, therapeutic hot springs, and rich history of Algeria's premier oasis destination."
            },
            "categories": {
                "all": "All",
                "historical": "Historical",
                "natural": "Natural",
                "cultural": "Cultural",
                "thermal": "Thermal/Spa"
            },
            "features": {
                "audioGuide": "Audio Guide",
                "audioGuideTitle": "Interactive Audio Guide",
                "audioGuideDesc": "Listen to the history and secrets narrated by our local guides.",
                "listenNow": "Listen Now",
                "qrTitle": "Smart Audio QR",
                "qrDesc": "Scan the QR code at the entrance for a multi-lingual tour.",
                "availableIn": "Available in"
            },
            "accessibility": {
                "accessible": "Wheelchair Accessible",
                "limited": "Limited Access"
            },
            "details": {
                "events": "Events & Activities",
                "registrations": "Registrations",
                "reviews": "Reviews"
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
                "map": "Explorer",
                "events": "Événements",
                "gallery": "Galerie",
                "profile": "Profil"
            },
            "home": {
                "searchPlaceholder": "Rechercher des destinations, hôtels, événements...",
                "viewAll": "Voir tout",
                "featuredPlaces": "Lieux incontournables",
                "upcomingEvents": "Tours et événements à venir",
                "discoverBiskra": "Découvrir Biskra",
                "heroSubtitle": "Découvrez les palmeraies enchanteresses, les sources thermales thérapeutiques et la riche histoire de la première destination oasienne d'Algérie."
            },
            "categories": {
                "all": "Tout",
                "historical": "Historique",
                "natural": "Naturel",
                "cultural": "Culturel",
                "thermal": "Thermal/Spa"
            },
            "features": {
                "audioGuide": "Guide Audio",
                "audioGuideTitle": "Guide Audio Interactif",
                "audioGuideDesc": "Écoutez l'histoire et les secrets racontés par nos guides locaux.",
                "listenNow": "Écouter maintenant",
                "qrTitle": "Code QR Intelligent",
                "qrDesc": "Scannez le code QR à l'entrée pour une visite multilingue.",
                "availableIn": "Disponible en"
            },
            "accessibility": {
                "accessible": "Accessible aux fauteuils",
                "limited": "Accès limité"
            },
            "details": {
                "events": "Événements & Activités",
                "registrations": "Inscriptions",
                "reviews": "Avis"
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
                "map": "استكشف",
                "events": "الفعاليات",
                "gallery": "المعرض",
                "profile": "حسابي"
            },
            "home": {
                "searchPlaceholder": "البحث عن الوجهات، الفنادق، الفعاليات...",
                "viewAll": "عرض الكل",
                "featuredPlaces": "أماكن لا بد من زيارتها",
                "upcomingEvents": "الجولات والفعاليات القادمة",
                "discoverBiskra": "اكتشف بسكرة",
                "heroSubtitle": "استمتع ببساتين النخيل الساحرة، والينابيع الحرارية العلاجية، والتاريخ الغني لأبرز واحة في الجزائر."
            },
            "categories": {
                "all": "الكل",
                "historical": "تاريخي",
                "natural": "طبيعي",
                "cultural": "ثقافي",
                "thermal": "حموي"
            },
            "features": {
                "audioGuide": "دليل صوتي",
                "audioGuideTitle": "دليل صوتي تفاعلي",
                "audioGuideDesc": "استمع إلى التاريخ والأسرار التي يرويها مرشدونا المحليون.",
                "listenNow": "استمع الآن",
                "qrTitle": "رمز QR الذكي",
                "qrDesc": "امسح رمز QR عند المدخل للحصول على جولة بعدة لغات.",
                "availableIn": "متاح بـ"
            },
            "accessibility": {
                "accessible": "مناسب للكراسي المتحركة",
                "limited": "وصول محدود"
            },
            "details": {
                "events": "الفعاليات والأنشطة",
                "registrations": "التسجيلات",
                "reviews": "التقييمات"
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
