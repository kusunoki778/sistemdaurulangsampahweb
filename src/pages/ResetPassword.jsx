import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { KeyRound, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { resetPasswordApi } from '../api/auth';

/**
 * Halaman Atur Ulang Password (route: /atur-ulang-password).
 * Dibuka dari tautan di email: ?token=...&email=...
 * Token divalidasi backend; password baru langsung bisa dipakai untuk masuk.
 */
export default function ResetPassword({ onNavigate, showToast }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tokenValid = Boolean(token && email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPasswordApi({ email, token, password });
      if (showToast) {
        showToast('Password berhasil diatur ulang. Silakan masuk dengan password baru Anda.', 'success');
      }
      onNavigate('login');
    } catch (err) {
      setError(err.message || 'Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 18px 40px -24px rgba(0, 0, 0, 0.25)',
          padding: '36px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: tokenValid ? '#f0fdf4' : '#fef2f2',
              color: tokenValid ? '#16a34a' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            {tokenValid ? <KeyRound size={26} /> : <AlertCircle size={26} />}
          </div>
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: tokenValid ? '#16a34a' : '#dc2626',
              marginBottom: '8px',
            }}
          >
            Akun Livora
          </p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
            {tokenValid ? 'Atur Ulang Password' : 'Tautan Tidak Valid'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '8px', lineHeight: 1.6 }}>
            {tokenValid
              ? `Masukkan password baru untuk akun ${email}.`
              : 'Tautan atur ulang tidak lengkap atau sudah kedaluwarsa.'}
          </p>
        </div>

        {!tokenValid ? (
          <Button
            variant="primary"
            style={{ width: '100%' }}
            onClick={() => onNavigate('lupa-password')}
          >
            Minta Tautan Baru
          </Button>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            <Input
              label="Password Baru"
              type="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Masukkan password baru"
              required
              leftIcon={<Lock size={18} />}
              helperText="Gunakan password yang mudah Anda ingat."
            />

            <Input
              label="Konfirmasi Password Baru"
              type="password"
              name="password_confirmation"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
              placeholder="Ulangi password baru"
              required
              leftIcon={<Lock size={18} />}
            />

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginTop: '8px' }}
              loading={loading}
              leftIcon={<ShieldCheck size={18} />}
            >
              Simpan Password Baru
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
