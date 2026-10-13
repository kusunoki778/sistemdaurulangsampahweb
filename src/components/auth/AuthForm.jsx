import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { User, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Form autentikasi tunggal untuk Login & Register.
 * - Member: tab segmented "Masuk | Daftar" (toggle lokal, atau navigasi route
 *   lewat onModeChange bila halaman induk menyediakannya).
 * - Admin: form masuk saja — tanpa tab, tanpa pendaftaran.
 * Tanpa chip demo login & tanpa batas panjang password (permintaan pemilik proyek).
 */
export default function AuthForm({
  initialMode = 'login',
  onSuccess,
  onModeChange,
  onForgotPassword,
  accentColor = '#16a34a',
}) {
  const { login, register } = useAuth();
  const isAdminMode = initialMode === 'admin';
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    no_hp: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const switchMode = (registerMode) => {
    if (registerMode === isRegister) return;
    setIsRegister(registerMode);
    setError(null);
    setShowPassword(false);
    if (onModeChange) onModeChange(registerMode ? 'register' : 'login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = isRegister
      ? await register({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
          no_hp: form.no_hp,
        })
      : await login(form.username, form.password);

    setLoading(false);

    if (result.success) {
      if (onSuccess) onSuccess(result.user);
    } else {
      setError(result.message || 'Terjadi kesalahan, silakan coba lagi.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Tab Masuk | Daftar — hanya untuk alur member */}
      {!isAdminMode && (
        <div className="auth-tab" role="tablist" aria-label="Pilih masuk atau daftar">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            className={isRegister ? undefined : 'auth-tab-active'}
            onClick={() => switchMode(false)}
          >
            Masuk
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            className={isRegister ? 'auth-tab-active' : undefined}
            onClick={() => switchMode(true)}
          >
            Daftar
          </button>
        </div>
      )}

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

      {isRegister && (
        <>
          <Input
            label="Nama Lengkap"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Contoh: Budi Santoso"
            required
            leftIcon={<User size={18} />}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="budi@example.com"
            required
            leftIcon={<Mail size={18} />}
          />
        </>
      )}

      <Input
        label="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Masukkan username"
        required
        leftIcon={<User size={18} />}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Masukkan password"
        required
        leftIcon={<Lock size={18} />}
        className="auth-password-input"
        helperText={isRegister ? 'Gunakan password yang mudah Anda ingat.' : undefined}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#16a34a';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />

      {/* Lupa password — hanya di mode masuk, bila halaman induk menyediakan navigasi */}
      {!isRegister && !isAdminMode && onForgotPassword && (
        <div style={{ marginTop: '-8px', marginBottom: '14px', textAlign: 'right' }}>
          <button
            type="button"
            onClick={onForgotPassword}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              color: '#16a34a',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Lupa password?
          </button>
        </div>
      )}

      {isRegister && (
        <Input
          label="Nomor WhatsApp / HP"
          name="no_hp"
          value={form.no_hp}
          onChange={handleChange}
          placeholder="08123456789"
          leftIcon={<Phone size={18} />}
        />
      )}

      <div style={{ textAlign: 'center' }}>
        <Button
          type="submit"
          variant="primary"
          style={{
            width: isAdminMode ? 'auto' : '100%',
            padding: isAdminMode ? '10px 44px' : undefined,
            display: isAdminMode ? 'inline-flex' : undefined,
            marginTop: '8px',
            backgroundColor: accentColor,
          }}
          loading={loading}
        >
          {isAdminMode
            ? 'Masuk'
            : isRegister
              ? 'Buat Akun Sekarang'
              : 'Masuk ke Akun'}
        </Button>
      </div>
    </form>
  );
}
