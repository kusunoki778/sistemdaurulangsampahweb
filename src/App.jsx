import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import ConfirmProvider from './components/common/ConfirmProvider';
import Toast from './components/common/Toast';
import Login from './pages/Login';
import './App.css';

import Home from './pages/Home';
import WasteCatalog from './pages/WasteCatalog';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import AdminDashboard from './pages/admin/Dashboard';
import KelolaArtikel from './pages/admin/KelolaArtikel';
import AdminPesanKontak from './pages/admin/PesanKontak';
import VerifikasiSetor from './pages/admin/VerifikasiSetor';
import VerifikasiReward from './pages/admin/VerifikasiReward';
import MasterKategoriSampah from './pages/admin/MasterKategoriSampah';
import MasterJenisSampah from './pages/admin/MasterJenisSampah';
import MasterKatalogReward from './pages/admin/MasterKatalogReward';
import GamifikasiKuis from './pages/admin/GamifikasiKuis';
import GamifikasiMisi from './pages/admin/GamifikasiMisi';
import Pengguna from './pages/admin/Pengguna';
import NilaiTukarKoin from './pages/admin/NilaiTukarKoin';
import ProfilAdmin from './pages/admin/ProfilAdmin';

/**
 * Shell aplikasi Livora (react-router v7 style / v6 API).
 *
 * Routing sekarang berbasis URL (bukan state di memori), sehingga:
 *  - `/`                 -> landing public user
 *  - `/login` `/register`-> halaman login/register member
 *  - `/dashboard`        -> dashboard member (wajib sesi user)
 *  - `/admin` `/admin/login` -> HALAMAN LOGIN ADMIN (terpisah)
 *  - `/admin/dashboard`  -> panel CMS admin (wajib sesi admin)
 *
 * `onNavigate(pageId)` tetap didukung agar komponen lama tidak berubah;
 * pageId dipetakan ke path URL oleh pagePath().
 *
 * Catatan keamanan: guard di sini hanya untuk UX.
 * Proteksi sesungguhnya ada di backend (middleware auth:sanctum + role admin).
 */

/** Pemetaan pageId (dipakai komponen lama) -> path URL. */
function pagePath(pageId) {
  const map = {
    home: '/',
    'katalog-sampah': '/katalog-sampah',
    artikel: '/artikel',
    kontak: '/kontak',
    tentang: '/tentang',
    'admin-login': '/admin/login',
    admin: '/admin/dashboard',
  };
  return map[pageId] || '/';
}

/** Splash saat aplikasi masih memvalidasi sesi. */
function SessionLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        backgroundColor: '#f0fdf4',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          backgroundColor: '#16a34a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          fontWeight: '800',
          animation: 'pulseGlow 1.6s ease-in-out infinite',
        }}
      >
        L
      </div>
      <p style={{ color: '#15803d', fontWeight: '700', fontSize: '1.05rem' }}>
        Memuat Livora...
      </p>
    </div>
  );
}

/**
 * Guard halaman admin: wajib sesi admin aktif.
 * - Tidak ada sesi admin → lempar ke halaman login admin (/admin/login).
 * - Ada sesi admin tersimpan tapi tidak aktif → aktifkan dulu.
 */
function RequireAdmin({ children }) {
  const { loading, isAdmin, sessions, activateSession } = useAuth();

  useEffect(() => {
    if (!loading && !isAdmin && sessions.admin) activateSession('admin');
  }, [loading, isAdmin, sessions.admin, activateSession]);

  if (loading) return <SessionLoading />;
  if (isAdmin) return children;
  if (sessions.admin) return <SessionLoading />;

  return <Navigate to="/admin/login" replace />;
}

/**
 * Halaman login admin (/admin & /admin/login).
 * Sudah login sebagai admin → langsung ke panel CMS.
 */
function AdminLoginRoute({ onNavigate, showToast }) {
  const { loading, isAdmin, sessions, activateSession } = useAuth();

  useEffect(() => {
    if (!loading && !isAdmin && sessions.admin) activateSession('admin');
  }, [loading, isAdmin, sessions.admin, activateSession]);

  if (loading) return <SessionLoading />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (sessions.admin) return <SessionLoading />;

  return <Login mode="admin" onNavigate={onNavigate} showToast={showToast} />;
}

/** Detail artikel: slug diambil dari URL /artikel/:slug */
function ArticleDetailRoute(props) {
  const { slug } = useParams();
  return <ArticleDetail identifier={slug} {...props} />;
}

function AppShell() {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const handleNavigate = useCallback(
    (pageId) => {
      navigate(pagePath(pageId));
    },
    [navigate]
  );

  const handleSelectArticle = useCallback(
    (identifier) => {
      navigate(`/artikel/${identifier}`);
    },
    [navigate]
  );

  const handleBackToArticles = useCallback(() => {
    navigate('/artikel');
  }, [navigate]);

  // Highlight navbar menyesuaikan URL saat ini.
  const pathname = location.pathname;
  const activePage = pathname.startsWith('/artikel')
    ? 'artikel'
    : pathname.startsWith('/admin')
      ? 'admin'
      : pathname === '/'
        ? 'home'
        : pathname.split('/')[1]
          ? pathname.split('/')[1]
          : 'home';

  // Area admin (/admin/*) memakai AdminLayout sendiri (topbar gelap + footer
  // admin), jadi Navbar/Footer public tidak ikut dirender di sana.
  const isAdminArea = pathname.startsWith('/admin');

  // Scroll ke atas setiap pindah halaman (kecuali saat pertama buka).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Reveal bertahap: amati elemen .reveal pada halaman yang baru dirender.
  // Berjalan setelah DOM commit (perubahan loading & pathname).
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('reveal-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname, loading]);

  if (loading) {
    return <SessionLoading />;
  }

  return (
    <>
      {!isAdminArea && (
        <Navbar
          activePage={activePage}
          onNavigate={handleNavigate}
        />
      )}

      <main key={pathname} className="page-enter">
        <Routes>
          <Route
            path="/"
            element={
              <Home onNavigate={handleNavigate} />
            }
          />
          <Route
            path="/katalog-sampah"
            element={
              <WasteCatalog
                onRedeemNavigate={() => handleNavigate('kontak')}
                showToast={showToast}
              />
            }
          />
          <Route path="/artikel" element={<Articles onSelectArticle={handleSelectArticle} />} />
          <Route
            path="/artikel/:slug"
            element={
              <ArticleDetailRoute
                onBack={handleBackToArticles}
                onSelectArticle={handleSelectArticle}
              />
            }
          />
          <Route path="/kontak" element={<Contact showToast={showToast} />} />
          <Route path="/tentang" element={<About onNavigate={handleNavigate} />} />

          {/* Area admin: AdminLayout (topbar + sidebar), login di /admin & /admin/login */}
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={
                <AdminLoginRoute onNavigate={handleNavigate} showToast={showToast} />
              }
            />
            <Route
              path="/admin/login"
              element={
                <AdminLoginRoute onNavigate={handleNavigate} showToast={showToast} />
              }
            />

            {/* Halaman CMS — wajib sesi admin (guard dipakai sekali untuk grup ini) */}
            <Route element={<RequireAdmin><Outlet /></RequireAdmin>}>
              <Route path="/admin/dashboard" element={<AdminDashboard showToast={showToast} />} />
              <Route
                path="/admin/verifikasi/setor"
                element={<VerifikasiSetor showToast={showToast} />}
              />
              <Route
                path="/admin/verifikasi/reward"
                element={<VerifikasiReward showToast={showToast} />}
              />
              <Route path="/admin/artikel" element={<KelolaArtikel showToast={showToast} />} />
              <Route path="/admin/pesan" element={<AdminPesanKontak showToast={showToast} />} />

              {/* Master Data */}
              <Route
                path="/admin/master/kategori"
                element={<MasterKategoriSampah showToast={showToast} />}
              />
              <Route
                path="/admin/master/jenis"
                element={<MasterJenisSampah showToast={showToast} />}
              />
              <Route
                path="/admin/master/reward"
                element={<MasterKatalogReward showToast={showToast} />}
              />
              <Route
                path="/admin/master/nilai-tukar"
                element={<NilaiTukarKoin showToast={showToast} />}
              />

              {/* Gamifikasi */}
              <Route
                path="/admin/gamifikasi/kuis"
                element={<GamifikasiKuis showToast={showToast} />}
              />
              <Route
                path="/admin/gamifikasi/misi"
                element={<GamifikasiMisi showToast={showToast} />}
              />

              {/* Sistem */}
              <Route path="/admin/pengguna" element={<Pengguna showToast={showToast} />} />
              <Route path="/admin/profil" element={<ProfilAdmin showToast={showToast} />} />
            </Route>

            {/* /admin/xxx yang tidak dikenal -> dashboard (guard yang arahkan) */}
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Path tidak dikenal -> landing public */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminArea && (
        <Footer onNavigate={handleNavigate} onSelectArticle={handleSelectArticle} />
      )}

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ConfirmProvider>
          <AppShell />
        </ConfirmProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
