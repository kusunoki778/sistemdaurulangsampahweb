import { useState } from 'react';
import { Mail, MailCheck, ArrowLeft, Clock } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { forgotPasswordApi } from '../api/auth';

/**
 * Halaman Lupa Password (route: /lupa-password).
 * User memasukkan email terdaftar -> backend mengirim tautan atur ulang
 * (token berlaku 60 menit, sekali pakai). Respons backend selalu sukses
 * agar pihak ketiga tidak bisa menebak email mana yang terdaftar.
 */
export default function ForgotPassword({ onNavigate, showToast }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPasswordApi(email);
      setSent(true);
      if (showToast) {
        showToast('Tautan atur ulang password sudah dikirim. Periksa inbox dan folder spam Anda.', 'success');
      }
    } catch (err) {
      setError(err.message || 'Gagal mengirim tautan. Silakan coba lagi.');
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
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            {sent ? <MailCheck size={26} /> : <Mail size={26} />}
          </div>
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#16a34a',
              marginBottom: '8px',
            }}
          >
            Akun Livora
          </p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
            {sent ? 'Tautan Terkirim' : 'Lupa Password?'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '8px', lineHeight: 1.6 }}>
            {sent
              ? `Jika "${email}" terdaftar di Livora, tautan atur ulang password sudah kami kirim.`
              : 'Masukkan email yang terdaftar di akun Livora Anda. Kami akan mengirim tautan untuk mengatur ulang password.'}
          </p>
        </div>

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

        {sent ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '14px',
                color: '#15803d',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                marginBottom: '18px',
              }}
            >
              <Clock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                Tautan berlaku <strong>60 menit</strong> dan hanya bisa dipakai satu kali. Tidak
                menerima email? Tunggu 1 menit lalu kirim ulang, dan periksa folder spam.
              </span>
            </div>

            <Button
              variant="primary"
              style={{ width: '100%' }}
              onClick={() => onNavigate('login')}
            >
              Kembali ke Halaman Masuk
            </Button>
            <Button
              variant="ghost"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={() => {
                setSent(false);
                setError(null);
              }}
            >
              Kirim Ulang Tautan
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="Email Terdaftar"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="budi@example.com"
              required
              leftIcon={<Mail size={18} />}
            />

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginTop: '8px' }}
              loading={loading}
            >
              Kirim Tautan Atur Ulang
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={() => onNavigate('login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            margin: '18px auto 0',
            backgroundColor: 'none',
            border: 'none',
            padding: 0,
            color: '#64748b',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={15} />
          Kembali ke halaman masuk
        </button>
      </div>
    </div>
  );
}
