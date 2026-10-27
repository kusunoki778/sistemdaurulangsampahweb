import { useEffect } from 'react';
import { Recycle, Coins, Gift, ShieldCheck } from 'lucide-react';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';

/**
 * Halaman Login & Register (route: /login | /register)
 * Dua panel: merek hijau solid berpola grid (kiri) + form bertab Masuk/Daftar (kanan).
 * mode='admin' tetap dipakai halaman login admin CMS.
 */
export default function Login({ mode = 'login', onNavigate, showToast }) {
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Jika sudah masuk, langsung arahkan ke halaman sesuai role.
  // mode='admin' hanya redirect kalau yang login memang admin —
  // login member di halaman admin TIDAK diteruskan ke dashboard member.
  useEffect(() => {
    if (authLoading || !user) return;
    if (mode === 'admin') {
      if (isAdmin) onNavigate('admin');
      return;
    }
    if (mode === 'login') {
      onNavigate(isAdmin ? 'admin' : 'dashboard');
    }
  }, [user, isAdmin, authLoading, mode, onNavigate]);

  const handleSuccess = (loggedInUser) => {
    const loggedInAsAdmin = loggedInUser?.role === 'admin';

    if (mode === 'admin' && !loggedInAsAdmin) {
      // Login member lewat halaman login admin → tolak, tetap di halaman ini.
      if (showToast) {
        showToast(
          'Akun tersebut bukan Administrator Livora. Silakan gunakan akun admin.',
          'error'
        );
      }
      return;
    }

    if (showToast) {
      showToast(
        loggedInAsAdmin
          ? 'Selamat datang kembali, Admin Livora!'
          : 'Berhasil masuk ke akun Livora!',
        'success'
      );
    }
    onNavigate(loggedInAsAdmin ? 'admin' : 'dashboard');
  };

  // ---- Halaman login admin CMS: kartu "Portal Administrasi" (desain cms-livora) ----
  if (mode === 'admin') {
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

  const benefits = [
    {
      icon: <Coins size={20} />,
      title: 'Koin Daur Ulang',
      desc: 'Setiap kilogram sampah yang disetor dikonversi menjadi koin digital.',
    },
    {
      icon: <Gift size={20} />,
      title: 'Reward Nyata',
      desc: 'Tukar koin dengan voucher e-wallet, tumbler, totebag, hingga bibit tanaman lewat Aplikasi Mobile Livora.',
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'Tercatat & Transparan',
      desc: 'Riwayat setor, mutasi koin, dan penukaran tercatat rapi di akun Anda.',
    },
  ];

  return (
    <div className="reveal stagger-deep" style={{ backgroundColor: '#f8fafc', minHeight: '85vh', paddingBottom: '60px' }}>
      <div className="container" style={{ paddingTop: '56px' }}>
        <div className="member-login">
          {/* Panel merek: hijau solid berpola grid (tanpa gradasi) */}
          <aside className="member-login-side">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Recycle size={18} />
                </span>
                <span style={{ fontSize: '0.98rem', fontWeight: '800', letterSpacing: '0.14em' }}>
                  LIVORA
                </span>
                <span
                  className="admin-login-mono"
                  style={{ color: 'rgba(255, 255, 255, 0.75)' }}
                >
                  / Member
                </span>
              </div>

              <p className="member-login-eyebrow">Bank Sampah Offline</p>
              <h1
                style={{
                  fontSize: '1.9rem',
                  fontWeight: '800',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                  marginTop: '10px',
                }}
              >
                Setor sampah, dapat koin, tukar hadiah.
              </h1>
              <p
                style={{
                  fontSize: '0.94rem',
                  color: 'rgba(255, 255, 255, 0.88)',
                  marginTop: '12px',
                  lineHeight: 1.7,
                  maxWidth: '38ch',
                }}
              >
                Datang ke drop point Livora, timbang sampah Anda, lalu terima koin digital
                setelah diverifikasi admin — tanpa layanan jemput.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginTop: '28px',
                }}
              >
                {benefits.map((b) => (
                  <div
                    key={b.title}
                    style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                  >
                    <span style={{ marginTop: '2px', flexShrink: 0 }}>{b.icon}</span>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{b.title}</div>
                      <div
                        style={{
                          fontSize: '0.84rem',
                          color: 'rgba(255, 255, 255, 0.8)',
                          lineHeight: 1.5,
                        }}
                      >
                        {b.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <dl className="member-login-meta">
              <div>
                <dt>Drop Point</dt>
                <dd>Jl. Kebon Jeruk No. 88, Jakarta Barat</dd>
              </div>
              <div>
                <dt>Jam</dt>
                <dd>Senin–Sabtu, 08.00–17.00 WIB</dd>
              </div>
              <div>
                <dt>Sistem</dt>
                <dd>Setor offline di tempat, koin masuk setelah verifikasi</dd>
              </div>
            </dl>
          </aside>

          {/* Panel form */}
          <section className="member-login-form">
            <span className="admin-login-eyebrow-dark">Akun Member</span>
            <h2
              style={{
                fontSize: '1.45rem',
                fontWeight: '800',
                color: '#0f172a',
                marginTop: '8px',
                letterSpacing: '-0.3px',
              }}
            >
              {mode === 'register' ? 'Daftar Akun Baru' : 'Masuk ke Akun Livora'}
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: '#64748b',
                marginTop: '8px',
                marginBottom: '22px',
                lineHeight: 1.6,
              }}
            >
              {mode === 'admin'
                ? 'Kelola artikel, verifikasi setoran, master data, dan gamifikasi Livora.'
                : mode === 'register'
                  ? 'Isi data diri Anda — koin dari setoran sampah akan tercatat di akun ini.'
                  : 'Masuk untuk mengajukan setor sampah dan mencatat koin dari setoran Anda.'}
            </p>

            {/* key={mode} memaksa remount saat route login <-> register berubah */}
            <AuthForm
              key={mode}
              initialMode={mode}
              onSuccess={handleSuccess}
              onModeChange={onNavigate}
              onForgotPassword={() => onNavigate('lupa-password')}
            />

            <p className="admin-login-note">
              Setor sampah dilakukan langsung di drop point Livora.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
