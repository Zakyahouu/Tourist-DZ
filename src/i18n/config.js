import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation dictionaries
const resources = {
    en: {
        translation: {
            "app": {
                "title": "Tourist DZ",
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
                "thermal": "Thermal/Spa",
                "accommodation": "Accommodation"
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
                "reviews": "Reviews",
                "accessibility": "Accessibility"
            },
            "events": {
                "types": {
                    "tour": "Tours",
                    "camp": "Camps",
                    "competition": "Competitions",
                    "volunteer": "Volunteer"
                }
            },
            "site": {
                "about": "About",
                "gallery": "Gallery",
                "visitorReviews": "Visitor Reviews",
                "leaveReview": "Leave a Review",
                "information": "Information",
                "getDirections": "Get Directions",
                "noReviews": "No reviews yet.",
                "back": "Back",
                "notFound": "Site not found.",
                "goHome": "Go back home"
            },
            "profile": {
                "favorites": "Favorites",
                "events": "Events",
                "reviews": "Reviews",
                "photos": "Photos"
            },
            "footer": {
                "tagline": "Discover the breathtaking oasis of Biskra. Connect with local culture, explore historical monuments, and participate in community-driven solidarity tourism.",
                "quickLinks": "Quick Links",
                "interactiveMap": "Interactive Map",
                "upcomingEvents": "Upcoming Events",
                "solidarityTrips": "Solidarity Trips",
                "legal": "Legal",
                "privacyPolicy": "Privacy Policy",
                "termsOfService": "Terms of Service",
                "contactUs": "Contact Us",
                "copyright": "Built for Biskra. All rights reserved."
            },
            "page": {
                "notFound": "Page not found",
                "notFoundDesc": "The page you're looking for doesn't exist.",
                "backHome": "Back to Home"
            }
        }
    },
    fr: {
        translation: {
            "app": {
                "title": "Tourist DZ",
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
                "thermal": "Thermal/Spa",
                "accommodation": "Hébergement"
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
                "reviews": "Avis",
                "accessibility": "Accessibilité"
            },
            "events": {
                "types": {
                    "tour": "Randonnées",
                    "camp": "Camps",
                    "competition": "Compétitions",
                    "volunteer": "Bénévolat"
                }
            },
            "site": {
                "about": "À propos",
                "gallery": "Galerie",
                "visitorReviews": "Avis des visiteurs",
                "leaveReview": "Laisser un avis",
                "information": "Informations",
                "getDirections": "Obtenir l'itinéraire",
                "noReviews": "Aucun avis pour le moment.",
                "back": "Retour",
                "notFound": "Site introuvable.",
                "goHome": "Retour à l'accueil"
            },
            "profile": {
                "favorites": "Favoris",
                "events": "Événements",
                "reviews": "Avis",
                "photos": "Photos"
            },
            "footer": {
                "tagline": "Découvrez la splendide oasis de Biskra. Connectez-vous à la culture locale, explorez des monuments historiques et participez au tourisme solidaire.",
                "quickLinks": "Liens rapides",
                "interactiveMap": "Carte interactive",
                "upcomingEvents": "Événements à venir",
                "solidarityTrips": "Voyages solidaires",
                "legal": "Légal",
                "privacyPolicy": "Politique de confidentialité",
                "termsOfService": "Conditions d'utilisation",
                "contactUs": "Nous contacter",
                "copyright": "Construit pour Biskra. Tous droits réservés."
            },
            "page": {
                "notFound": "Page introuvable",
                "notFoundDesc": "La page que vous recherchez n'existe pas.",
                "backHome": "Retour à l'accueil"
            }
        }
    },
    ar: {
        translation: {
            "app": {
                "title": "Tourist DZ",
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
                "thermal": "حموي",
                "accommodation": "إقامة"
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
                "reviews": "التقييمات",
                "accessibility": "إمكانية الوصول"
            },
            "events": {
                "types": {
                    "tour": "جولات",
                    "camp": "مخيمات",
                    "competition": "مسابقات",
                    "volunteer": "تطوع"
                }
            },
            "site": {
                "about": "نبذة",
                "gallery": "معرض الصور",
                "visitorReviews": "آراء الزوار",
                "leaveReview": "أضف تقييمك",
                "information": "معلومات",
                "getDirections": "احصل على الاتجاهات",
                "noReviews": "لا توجد تقييمات بعد.",
                "back": "رجوع",
                "notFound": "الموقع غير موجود.",
                "goHome": "العودة للرئيسية"
            },
            "profile": {
                "favorites": "المفضلة",
                "events": "الفعاليات",
                "reviews": "التقييمات",
                "photos": "الصور"
            },
            "footer": {
                "tagline": "اكتشف واحة بسكرة الرائعة. تواصل مع الثقافة المحلية، واستكشف المعالم التاريخية، وشارك في السياحة التضامنية.",
                "quickLinks": "روابط سريعة",
                "interactiveMap": "خريطة تفاعلية",
                "upcomingEvents": "الفعاليات القادمة",
                "solidarityTrips": "رحلات التضامن",
                "legal": "قانوني",
                "privacyPolicy": "سياسة الخصوصية",
                "termsOfService": "شروط الخدمة",
                "contactUs": "اتصل بنا",
                "copyright": "صُنع لبسكرة. جميع الحقوق محفوظة."
            },
            "page": {
                "notFound": "الصفحة غير موجودة",
                "notFoundDesc": "الصفحة التي تبحث عنها غير موجودة.",
                "backHome": "العودة للرئيسية"
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
