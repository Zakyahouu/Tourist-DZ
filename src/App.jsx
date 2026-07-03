import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { lazy, Suspense } from 'react';
import './i18n/config';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CmsProvider } from './context/CmsContext';
import ErrorBoundary from './components/ErrorBoundary';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './components/AdminLayout';
import TopNavbar from './components/TopNavbar';
import Footer from './components/Footer';

// Lazy-load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const SiteDetailsPage = lazy(() => import('./pages/SiteDetailsPage'));
const AccommodationDetailsPage = lazy(() => import('./pages/AccommodationDetailsPage'));
const SolidarityPage = lazy(() => import('./pages/SolidarityPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSites = lazy(() => import('./pages/admin/AdminSites'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminAccommodations = lazy(() => import('./pages/admin/AdminAccommodations'));
const AdminSolidarity = lazy(() => import('./pages/admin/AdminSolidarity'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Loading spinner for lazy chunks
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--color-brand-primary)]"></div>
  </div>
);

// Public Layout — shows/hides TopNavbar and Footer based on route
const PublicLayout = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const location = useLocation();

  const hideChrome = location.pathname === '/auth';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-[var(--color-brand-bg)] text-[var(--color-brand-text)] font-sans">
      {!hideChrome && <TopNavbar />}
      <main className="flex-grow w-full">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
};

// 404 page — translated
const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-8xl font-black text-[var(--color-brand-primary)] mb-4">404</h1>
      <p className="text-2xl font-bold text-[var(--color-brand-text)] mb-2">{t('page.notFound')}</p>
      <p className="text-[var(--color-brand-text-muted)] mb-8">{t('page.notFoundDesc')}</p>
      <Link to="/" className="px-6 py-3 bg-[var(--color-brand-primary)] text-white font-bold rounded-xl hover:bg-orange-500 transition-colors">
        {t('page.backHome')}
      </Link>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <CmsProvider>
        <Router>
          <Routes>
            {/* Admin Routes — separate layout, guarded by role */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="sites" element={<AdminSites />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="accommodations" element={<AdminAccommodations />} />
              <Route path="solidarity" element={<AdminSolidarity />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Public Routes — single flat route list with shared layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/site/:id" element={<SiteDetailsPage />} />
              <Route path="/accommodation/:id" element={<AccommodationDetailsPage />} />
              <Route path="/solidarity" element={<SolidarityPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
        </CmsProvider>
      </AuthProvider>
    </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
