import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation dictionaries
const resources = {
    en: {
        translation: {
            "app": {
                "title": "ZibanGo",
                "tagline": "Discover Biskra",
                "login": "Login",
                "signup": "Sign Up",
            },
            "nav": {
                "home": "Explore",
                "map": "Map",
                "events": "Events",
                "gallery": "Gallery",
                "profile": "Profile"
            },
            "landing": {
                "hero_title": "ZibanGo",
                "hero_subtitle": "Smart Tourism Experience",
                "hero_desc": "Discover the authentic heritage and breathtaking oases of Biskra through an innovative, AI-driven digital platform.",
                "hero_cta_explore": "Explore Destinations",
                "hero_cta_app": "Get the App",
                "about_title": "Where Heritage Meets Innovation",
                "about_desc_1": "ZibanGo is a pioneering smart tourism platform that bridges Biskra's rich cultural heritage with cutting-edge digital technology.",
                "about_desc_2": "We empower travelers to explore the Queen of the Ziban through AI-powered audio guides, QR-based navigation, and an interactive map of over 50 curated points of interest.",
                "about_value_1_title": "Digital Transformation",
                "about_value_1_desc": "Bringing Biskra's tourism ecosystem into the digital age with smart tools for visitors, guides, and local businesses.",
                "about_value_2_title": "Sustainable Tourism",
                "about_value_2_desc": "Promoting responsible travel that preserves the oasis environment and supports the local economy through solidarity initiatives.",
                "about_value_3_title": "Youth Empowerment",
                "about_value_3_desc": "Creating opportunities for local youth through technology training, cultural exchange, and community-driven tourism projects.",
                "feature_1_title": "AI Audio Guides",
                "feature_1_desc": "Immersive multi-lingual audio tours powered by AI, bringing every monument, palm grove, and thermal spring to life.",
                "feature_2_title": "QR Smart Navigation",
                "feature_2_desc": "Scan QR codes at each location to unlock instant access to rich media content, historical insights, and curated itineraries.",
                "feature_3_title": "Interactive Maps",
                "feature_3_desc": "Navigate Biskra's hidden gems with our detailed interactive map, featuring real-time information and personalized recommendations.",
                "feature_4_title": "Solidarity Tourism",
                "feature_4_desc": "Join community-driven initiatives that make a real impact — from cultural exchanges to environmental conservation projects.",
                "cta_title": "Ready to Explore?",
                "cta_subtitle": "Start your journey through the heart of the Ziban — where heritage meets innovation.",
                "cta_button": "Start Exploring",
                "stats_sites": "Tourist Attractions",
                "stats_reviews": "Reviews",
                "stats_poi": "Points of Interest",
                "featured_title": "Featured Destinations",
                "map_title": "Explore Biskra",
                "reviews_title": "What Travelers Say"
            },
            "home": {
                "searchPlaceholder": "Search destinations, hotels, events...",
                "viewAll": "View all",
                "featuredPlaces": "Must-visit places",
                "upcomingEvents": "Upcoming Events",
                "discoverBiskra": "Discover Biskra",
                "heroSubtitle": "Discover the enchanting palm groves, therapeutic thermal springs, and rich history of Algeria's premier oasis destination.",
                "loadMore": "Load More"
            },
            "categories": {
                "all": "All",
                "historical": "Historical",
                "natural": "Natural",
                "cultural": "Cultural",
                "thermal": "Thermal/Spa",
                "accommodation": "Accommodation & Dining"
            },
            "accommodationTypes": {
                "hotel": "Hotel",
                "guesthouse": "Guesthouse",
                "hostel": "Hostel",
                "restaurant": "Restaurant",
                "cafe": "Café",
                "riad": "Riad",
                "apartment": "Apartment",
                "camping": "Camping"
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
                "goHome": "Go back home",
                "loginToReview": "Please log in to leave a review.",
                "alreadyReviewed": "✓ You've already reviewed this site. Thank you!",
                "stars": "{{count}} Stars",
                "selectRating": "Select Rating",
                "submitReview": "Submit Review",
                "submitting": "Submitting...",
                "locationLabel": "Location",
                "ratingLabel": "Rating",
                "noRatingsYet": "No ratings yet",
                "reviewsCount": "{{count}} reviews",
                "showLess": "Show less",
                "showAllReviews": "Show all {{count}} reviews",
                "audioNotSupported": "Your browser does not support the audio element.",
                "anonymous": "Anonymous",
                "reviewPlaceholder": "Share details of your own experience at this place"
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
                "title": "ZibanGo",
                "tagline": "Découvrez Biskra",
                "login": "Connexion",
                "signup": "S'inscrire",
            },
            "nav": {
                "home": "Explorer",
                "map": "Carte",
                "events": "Événements",
                "gallery": "Galerie",
                "profile": "Profil"
            },
            "landing": {
                "hero_title": "ZibanGo",
                "hero_subtitle": "Expérience de Tourisme Intelligent",
                "hero_desc": "Découvrez le patrimoine authentique et les oasis à couper le souffle de Biskra grâce à une plateforme numérique innovante et intelligente.",
                "hero_cta_explore": "Explorer les Destinations",
                "hero_cta_app": "Télécharger l'App",
                "about_title": "Là où le Patrimoine Rencontre l'Innovation",
                "about_desc_1": "ZibanGo est une plateforme de tourisme intelligent pionnière qui relie le riche patrimoine culturel de Biskra à la technologie numérique de pointe.",
                "about_desc_2": "Nous permettons aux voyageurs d'explorer la Reine des Ziban grâce à des guides audio alimentés par l'IA, une navigation par QR code et une carte interactive de plus de 50 points d'intérêt.",
                "about_value_1_title": "Transformation Numérique",
                "about_value_1_desc": "Apporter l'écosystème touristique de Biskra à l'ère numérique avec des outils intelligents pour les visiteurs, les guides et les entreprises locales.",
                "about_value_2_title": "Tourisme Durable",
                "about_value_2_desc": "Promouvoir un voyage responsable qui préserve l'environnement de l'oasis et soutient l'économie locale grâce à des initiatives solidaires.",
                "about_value_3_title": "Autonomisation des Jeunes",
                "about_value_3_desc": "Créer des opportunités pour les jeunes locaux grâce à la formation technologique, aux échanges culturels et aux projets touristiques communautaires.",
                "feature_1_title": "Guides Audio IA",
                "feature_1_desc": "Visites audio immersives multilingues propulsées par l'IA, donnant vie à chaque monument, palmeraie et source thermale.",
                "feature_2_title": "Navigation QR Intelligente",
                "feature_2_desc": "Scannez les codes QR à chaque endroit pour accéder instantanément à du contenu multimédia riche, des aperçus historiques et des itinéraires personnalisés.",
                "feature_3_title": "Cartes Interactives",
                "feature_3_desc": "Naviguez parmi les joyaux cachés de Biskra avec notre carte interactive détaillée, offrant des informations en temps réel et des recommandations personnalisées.",
                "feature_4_title": "Tourisme Solidaire",
                "feature_4_desc": "Rejoignez des initiatives communautaires qui ont un réel impact — des échanges culturels aux projets de conservation environnementale.",
                "cta_title": "Prêt à Explorer ?",
                "cta_subtitle": "Commencez votre voyage au cœur des Ziban — là où le patrimoine rencontre l'innovation.",
                "cta_button": "Commencer l'Exploration",
                "stats_sites": "Sites Touristiques",
                "stats_reviews": "Avis",
                "stats_poi": "Points d'Intérêt",
                "featured_title": "Destinations en Vedette",
                "map_title": "Explorez Biskra",
                "reviews_title": "Ce que disent les Voyageurs"
            },
            "home": {
                "searchPlaceholder": "Rechercher des destinations, hôtels, événements...",
                "viewAll": "Voir tout",
                "featuredPlaces": "Lieux incontournables",
                "upcomingEvents": "Tours et événements à venir",
                "discoverBiskra": "Découvrir Biskra",
                "heroSubtitle": "Découvrez les palmeraies enchanteresses, les sources thermales thérapeutiques et la riche histoire de la première destination oasienne d'Algérie.",
                "loadMore": "Voir Plus"
            },
            "categories": {
                "all": "Tout",
                "historical": "Historique",
                "natural": "Naturel",
                "cultural": "Culturel",
                "thermal": "Thermal/Spa",
                "accommodation": "Hébergement & Restauration"
            },
            "accommodationTypes": {
                "hotel": "Hôtel",
                "guesthouse": "Maison d'hôtes",
                "hostel": "Auberge",
                "restaurant": "Restaurant",
                "cafe": "Café",
                "riad": "Riad",
                "apartment": "Appartement",
                "camping": "Camping"
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
                "goHome": "Retour à l'accueil",
                "loginToReview": "Veuillez vous connecter pour laisser un avis.",
                "alreadyReviewed": "✓ Vous avez déjà évalué ce site. Merci !",
                "stars": "{{count}} étoiles",
                "selectRating": "Sélectionner une note",
                "submitReview": "Soumettre l'avis",
                "submitting": "Envoi en cours...",
                "locationLabel": "Localisation",
                "ratingLabel": "Note",
                "noRatingsYet": "Pas encore de note",
                "reviewsCount": "{{count}} avis",
                "showLess": "Voir moins",
                "showAllReviews": "Voir les {{count}} avis",
                "audioNotSupported": "Votre navigateur ne prend pas en charge l'élément audio.",
                "anonymous": "Anonyme",
                "reviewPlaceholder": "Partagez les détails de votre expérience dans ce lieu"
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
                "title": "ZibanGo",
                "tagline": "اكتشف بسكرة",
                "login": "تسجيل الدخول",
                "signup": "إنشاء حساب",
            },
            "nav": {
                "home": "استكشف",
                "map": "الخريطة",
                "events": "الفعاليات",
                "gallery": "المعرض",
                "profile": "حسابي"
            },
            "landing": {
                "hero_title": "ZibanGo",
                "hero_subtitle": "تجربة السياحة الذكية",
                "hero_desc": "اكتشف التراث الأصيل والواحات الخلابة في بسكرة من خلال منصة رقمية مبتكرة تعمل بالذكاء الاصطناعي.",
                "hero_cta_explore": "استكشف الوجهات",
                "hero_cta_app": "حمّل التطبيق",
                "about_title": "حيث يلتقي التراث بالابتكار",
                "about_desc_1": "ZibanGo هي منصة سياحة ذكية رائدة تربط التراث الثقافي الغني لمدينة بسكرة بأحدث التقنيات الرقمية.",
                "about_desc_2": "نمكن المسافرين من استكشاف ملكة الزيبان من خلال أدلة صوتية مدعومة بالذكاء الاصطناعي، والتنقل عبر رموز QR، وخريطة تفاعلية تضم أكثر من 50 نقطة اهتمام.",
                "about_value_1_title": "التحول الرقمي",
                "about_value_1_desc": "نقل النظام السياحي في بسكرة إلى العصر الرقمي بأدوات ذكية للزوار والمرشدين والشركات المحلية.",
                "about_value_2_title": "السياحة المستدامة",
                "about_value_2_desc": "تعزيز السفر المسؤول الذي يحافظ على بيئة الواحة ويدعم الاقتصاد المحلي من خلال مبادرات التضامن.",
                "about_value_3_title": "تمكين الشباب",
                "about_value_3_desc": "خلق فرص للشباب المحلي من خلال التدريب التكنولوجي والتبادل الثقافي والمشاريع السياحية المجتمعية.",
                "feature_1_title": "الأدلة الصوتية بالذكاء الاصطناعي",
                "feature_1_desc": "جولات صوتية غامرة متعددة اللغات مدعومة بالذكاء الاصطناعي، تضفي الحياة على كل معلم وبستان نخيل وينبوع حراري.",
                "feature_2_title": "التنقل الذكي برمز QR",
                "feature_2_desc": "امسح رموز QR في كل موقع للوصول الفوري إلى محتوى وسائط غني ورؤى تاريخية ومسارات مخصصة.",
                "feature_3_title": "خرائط تفاعلية",
                "feature_3_desc": "تنقل بين جواهر بسكرة المخفية مع خريطتنا التفاعلية المفصلة، التي توفر معلومات في الوقت الفعلي وتوصيات مخصصة.",
                "feature_4_title": "السياحة التضامنية",
                "feature_4_desc": "انضم إلى المبادرات المجتمعية التي تحدث تأثيراً حقيقياً — من التبادل الثقافي إلى مشاريع الحفاظ على البيئة.",
                "cta_title": "مستعد للاستكشاف؟",
                "cta_subtitle": "ابدأ رحلتك في قلب الزيبان — حيث يلتقي التراث بالابتكار.",
                "cta_button": "ابدأ الاستكشاف",
                "stats_sites": "المعالم السياحية",
                "stats_reviews": "التقييمات",
                "stats_poi": "نقاط الاهتمام",
                "featured_title": "الوجهات المميزة",
                "map_title": "استكشف بسكرة",
                "reviews_title": "ماذا يقول المسافرون"
            },
            "home": {
                "searchPlaceholder": "البحث عن الوجهات، الفنادق، الفعاليات...",
                "viewAll": "عرض الكل",
                "featuredPlaces": "أماكن لا بد من زيارتها",
                "upcomingEvents": "الجولات والفعاليات القادمة",
                "discoverBiskra": "اكتشف بسكرة",
                "heroSubtitle": "استمتع ببساتين النخيل الساحرة، والينابيع الحرارية العلاجية، والتاريخ الغني لأبرز واحة في الجزائر.",
                "loadMore": "عرض المزيد"
            },
            "categories": {
                "all": "الكل",
                "historical": "تاريخي",
                "natural": "طبيعي",
                "cultural": "ثقافي",
                "thermal": "حموي",
                "accommodation": "إقامة ومطاعم"
            },
            "accommodationTypes": {
                "hotel": "فندق",
                "guesthouse": "دار ضيافة",
                "hostel": "نزل",
                "restaurant": "مطعم",
                "cafe": "مقهى",
                "riad": "رياض",
                "apartment": "شقة",
                "camping": "تخييم"
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
                "goHome": "العودة للرئيسية",
                "loginToReview": "يرجى تسجيل الدخول لإضافة تقييم.",
                "alreadyReviewed": "✓ لقد قمت بتقييم هذا الموقع بالفعل. شكراً!",
                "stars": "{{count}} نجوم",
                "selectRating": "اختر تقييماً",
                "submitReview": "إرسال التقييم",
                "submitting": "جارٍ الإرسال...",
                "locationLabel": "الموقع",
                "ratingLabel": "التقييم",
                "noRatingsYet": "لا يوجد تقييم بعد",
                "reviewsCount": "{{count}} تقييم",
                "showLess": "عرض أقل",
                "showAllReviews": "عرض جميع التقييمات ({{count}})",
                "audioNotSupported": "متصفحك لا يدعم تشغيل الملفات الصوتية.",
                "anonymous": "مجهول",
                "reviewPlaceholder": "شارك تفاصيل تجربتك في هذا المكان"
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
