import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';

/**
 * Halaman login admin CMS (route: /admin | /admin/login).
 *
 * Area member di web sudah dihapus sesuai sprint.md — member dilayani
 * penuh oleh Aplikasi Mobile Livora (Flutter). Tombol "Unduh Aplikasi"
 * tersedia di Navbar, Footer, Beranda, dan Tentang.
 */
export default function Login({ onNavigate, showToast }) {
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Sudah masuk sebagai admin -> langsung arahkan ke panel CMS.
  useEffect(() => {
    if (authLoading || !user) return;
    if (isAdmin) onNavigate('admin');
  }, [user, isAdmin, authLoading, onNavigate]);

  const handleSuccess = (loggedInUser) => {
    const loggedInAsAdmin = loggedInUser?.role === 'admin';

    if (!loggedInAsAdmin) {
      // Login member lewat halaman login admin -> tolak, tetap di halaman ini.
      if (showToast) {
        showToast(
          'Akun tersebut bukan Administrator Livora. Silakan gunakan akun admin.',
          'error'
        );
      }
      return;
    }

    if (showToast) {
      showToast('Selamat datang kembali, Admin Livora!', 'success');
    }
    onNavigate('admin');
  };

  // ---- Halaman login admin CMS: kartu "Portal Administrasi" (desain cms-livora) ----
  return (
    <div
      style={{
        backgroundColor: '#f0fdf4',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '22px',
        padding: '48px 20px 40px',
      }}
    >
      <div className="admin-login-card">
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <span
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              backgroundColor: '#14532d',
              color: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={24} />
          </span>
        </div>

        {/* Lencana portal */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: '#15803d',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '5px 12px',
            borderRadius: '999px',
          }}
        >
          Portal Administrasi
        </span>

        <h1
          style={{
            fontSize: '1.55rem',
            fontWeight: '800',
            color: '#0f172a',
            marginTop: '14px',
            letterSpacing: '-0.4px',
          }}
        >
          Masuk ke CMS Livora
        </h1>
        <p
          style={{
            fontSize: '0.88rem',
            color: '#64748b',
            marginTop: '8px',
            lineHeight: 1.6,
          }}
        >
          Panel khusus petugas untuk memverifikasi setoran, menerbitkan artikel,
          dan mengelola data bank sampah Livora.
        </p>

        {/* Catatan keamanan (jujur, tanpa klaim berlebihan) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '9px',
            marginTop: '18px',
            padding: '11px 14px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #dcfce7',
            borderRadius: '10px',
            textAlign: 'left',
          }}
        >
          <span style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }}>
            <ShieldCheck size={15} />
          </span>
          <span style={{ fontSize: '0.78rem', color: '#15803d', lineHeight: 1.55 }}>
            Sesi admin memakai token keamanan, dan seluruh tindakan pada panel ini
            tercatat di sistem.
          </span>
        </div>

        {/* Form username + password */}
        <div style={{ textAlign: 'left', marginTop: '22px' }}>
          <AuthForm initialMode="admin" onSuccess={handleSuccess} />
        </div>

        <p className="admin-login-note" style={{ marginTop: '16px' }}>
          Akun member tidak memiliki akses ke panel ini.
        </p>
      </div>

      <p
        style={{
          fontSize: '0.74rem',
          color: '#94a3b8',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Panel Administrasi Livora · Bank Sampah Offline Terpusat · Hak Cipta 2026
      </p>
    </div>
  );
}
