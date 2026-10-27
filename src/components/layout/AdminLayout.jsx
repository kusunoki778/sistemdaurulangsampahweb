import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Recycle,
  Gift,
  BookOpen,
  Mail,
  Menu,
  X,
  Folder,
  Layers,
  Package,
  HelpCircle,
  Target,
  Users,
  Bell,
  Scale,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAdminStatsApi } from '../../api/admin';

/**
 * Layout area admin (semua route /admin/*).
 *
 *  - Topbar putih: tombol menu (mobile) + breadcrumb halaman + status operasi
 *    + lonceng antrean + sesi admin + Keluar.
 *  - Sidebar hijau tua: brand Livora + menu CMS (badge angka antrean).
 *  - Konten halaman lewat <Outlet />; footer slim khusus admin.
 *
 * Navbar/Footer public TIDAK dirender untuk /admin/* (lihat App.jsx).
 * Daftar menu dikelola lewat array MENU di bawah ini.
 */

const MENU = [
  { type: 'link', to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'group', label: 'Verifikasi' },
  {
    type: 'link',
    to: '/admin/verifikasi/setor',
    label: 'Tukar Sampah',
    icon: Recycle,
    countKey: 'pending_setor',
  },
  {
    type: 'link',
    to: '/admin/verifikasi/reward',
    label: 'Tukar Reward',
    icon: Gift,
    countKey: 'pending_reward',
  },
  { type: 'group', label: 'Konten & Edukasi' },
  { type: 'link', to: '/admin/artikel', label: 'Artikel', icon: BookOpen },
  { type: 'link', to: '/admin/gamifikasi/kuis', label: 'Kuis Harian', icon: HelpCircle },
  { type: 'link', to: '/admin/gamifikasi/misi', label: 'Misi Member', icon: Target },
  { type: 'group', label: 'Master Data' },
  { type: 'link', to: '/admin/master/kategori', label: 'Kategori Sampah', icon: Folder },
  { type: 'link', to: '/admin/master/jenis', label: 'Jenis Sampah', icon: Layers },
  { type: 'link', to: '/admin/master/nilai-tukar', label: 'Nilai Tukar Koin', icon: Scale },
  { type: 'link', to: '/admin/master/reward', label: 'Katalog Reward', icon: Package },
  { type: 'group', label: 'Komunikasi & Sistem' },
  {
    type: 'link',
    to: '/admin/pesan',
    label: 'Pesan Kontak',
    icon: Mail,
    countKey: 'pesan_belum_dibaca',
  },
  { type: 'link', to: '/admin/pengguna', label: 'Pengguna / Member', icon: Users },
  { type: 'link', to: '/admin/profil', label: 'Profil Admin', icon: UserCog },
];

/** Judul breadcrumb per rute CMS. */
const BREADCRUMBS = {
  '/admin/dashboard': 'Konsol Utama',
  '/admin/verifikasi/setor': 'Verifikasi Tukar Sampah',
  '/admin/verifikasi/reward': 'Verifikasi Tukar Reward',
  '/admin/artikel': 'Manajemen Artikel',
  '/admin/pesan': 'Pesan Kontak',
  '/admin/master/kategori': 'Master Kategori Sampah',
  '/admin/master/jenis': 'Master Jenis Sampah',
  '/admin/master/nilai-tukar': 'Nilai Tukar Koin',
  '/admin/master/reward': 'Katalog Reward',
  '/admin/gamifikasi/kuis': 'Kuis Harian',
  '/admin/gamifikasi/misi': 'Misi Member',
  '/admin/pengguna': 'Pengguna / Member',
  '/admin/profil': 'Profil Admin',
};

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [counts, setCounts] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadCounts = () =>
    getAdminStatsApi()
      .then((data) => {
        setCounts(data);
        return data;
      })
      .catch(() => null);

  // Badge angka diperbarui tiap pindah halaman...
  useEffect(() => {
    if (!isAdmin) return;
    loadCounts();
  }, [isAdmin, location.pathname]);

  // ...dan saat ada aksi verifikasi/baca pesan (event dari sub-halaman).
  useEffect(() => {
    if (!isAdmin) return;
    const refresh = () => loadCounts();
    window.addEventListener('livora:stats-changed', refresh);
    return () => window.removeEventListener('livora:stats-changed', refresh);
  }, [isAdmin]);

  const handleLogout = () => {
    // Logout selektif: hanya sesi admin yang dihapus (AuthContext).
    // Sesi member (kalau ada) tetap utuh.
    logout();
    navigate('/admin/login');
  };

  const totalPending =
    (counts?.pending_setor ?? 0) + (counts?.pending_reward ?? 0) + (counts?.pesan_belum_dibaca ?? 0);

  const breadcrumbTitle = BREADCRUMBS[location.pathname] || 'Panel Admin';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f0fdf4',
      }}
    >
      {/* ---------------- Topbar admin ---------------- */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(20, 83, 45, 0.06)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            height: '64px',
          }}
        >
          {/* Kiri: tombol menu (mobile) + breadcrumb + status operasi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {isAdmin && (
              <button
                type="button"
                className="admin-menu-btn"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-label="Buka/tutup menu admin"
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}

            <nav
              aria-label="Breadcrumb admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#0f172a',
                minWidth: 0,
              }}
            >
              <span style={{ color: '#64748b', fontWeight: 700 }}>Livora Admin</span>
              <span style={{ color: '#94a3b8' }}>/</span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {isAdmin ? breadcrumbTitle : 'Masuk'}
              </span>
            </nav>

            {isAdmin && (
              <span
                className="md-hidden"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#15803d',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '999px',
                    backgroundColor: '#16a34a',
                  }}
                />
                Titik Kumpul Terpusat
              </span>
            )}
          </div>

          {/* Kanan: lonceng antrean + sesi admin + Keluar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/admin/verifikasi/setor')}
                  aria-label={`Antrean menunggu verifikasi: ${totalPending}`}
                  style={{
                    position: 'relative',
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Bell size={17} />
                  {totalPending > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        minWidth: '17px',
                        height: '17px',
                        padding: '0 4px',
                        borderRadius: '999px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {totalPending}
                    </span>
                  )}
                </button>

                <span
                  className="md-hidden"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    fontSize: '0.82rem',
                    color: '#334155',
                  }}
                >
                  <span
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '999px',
                      backgroundColor: '#14532d',
                      color: '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                    }}
                  >
                    {(user?.name || 'A')
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                    <strong style={{ fontWeight: 700, color: '#0f172a' }}>
                      {user?.name || 'Administrator'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Admin</span>
                  </span>
                </span>

                <button
                  type="button"
                  className="admin-topbar-btn"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#b91c1c',
                    backgroundColor: '#ffffff',
                    border: '1px solid #fecaca',
                    padding: '8px 15px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <LogOut size={14} />
                  Keluar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- Area: sidebar + konten ---------------- */}
      <div style={{ display: 'flex', flex: 1 }}>
        {isAdmin && (
          <>
            <aside
              className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}
              aria-label="Menu admin CMS"
            >
              {/* Brand di dalam sidebar */}
              <Link
                to="/admin/dashboard"
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  padding: '4px 8px 2px',
                }}
              >
                <span
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#dcfce7',
                    color: '#14532d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={20} />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <strong
                    style={{
                      color: '#ffffff',
                      fontSize: '1.02rem',
                      fontWeight: '800',
                      letterSpacing: '-0.3px',
                    }}
                  >
                    Livora
                  </strong>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      color: '#a7f3d0',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Admin Panel
                  </span>
                </span>
              </Link>

              <nav
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  marginTop: '16px',
                }}
              >
                {MENU.map((item, index) => {
                  if (item.type === 'group') {
                    return (
                      <div key={`group-${index}`} className="admin-menu-group">
                        {item.label}
                      </div>
                    );
                  }

                  const Icon = item.icon;
                  const active = location.pathname === item.to;
                  const count = item.countKey ? counts?.[item.countKey] ?? 0 : null;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`admin-menu-item${active ? ' active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                      {count !== null && count > 0 && (
                        <span className="admin-menu-badge">{count}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div
                style={{
                  marginTop: '26px',
                  paddingTop: '16px',
                  borderTop: '1px solid #166534',
                  fontSize: '0.72rem',
                  color: '#86efac',
                  lineHeight: 1.7,
                }}
              >
                <div style={{ fontWeight: '700', color: '#dcfce7' }}>Livora CMS</div>
                Bank sampah offline — satu titik kumpul
                <br />
                yang dikelola admin.
              </div>
            </aside>

            {sidebarOpen && (
              <div
                className="admin-sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
          </>
        )}

        {/* Kolom kanan: konten + footer */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="admin-content" style={{ flex: '1 0 auto' }}>
            <Outlet />
          </div>

          <footer
            style={{
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              padding: '16px 0',
            }}
          >
            <div
              className="container"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.78rem',
                color: '#94a3b8',
              }}
            >
              <span>Hak Cipta 2026 Livora — Panel Administrator CMS</span>
              <span>Bank Sampah Offline · Daur Ulang Digital</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
