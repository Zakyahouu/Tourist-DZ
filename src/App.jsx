import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n/config';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './components/AdminLayout';
import TopNavbar from './components/TopNavbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import SiteDetailsPage from './pages/SiteDetailsPage';
import AccommodationDetailsPage from './pages/AccommodationDetailsPage';
import SolidarityPage from './pages/SolidarityPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSites from './pages/admin/AdminSites';
import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';
import AdminGallery from './pages/admin/AdminGallery';
import AdminAccommodations from './pages/admin/AdminAccommodations';
import AdminSolidarity from './pages/admin/AdminSolidarity';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';

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
        <Outlet />
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
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
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/site/:id" element={<SiteDetailsPage />} />
              <Route path="/accommodation/:id" element={<AccommodationDetailsPage />} />
              <Route path="/solidarity" element={<SolidarityPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
