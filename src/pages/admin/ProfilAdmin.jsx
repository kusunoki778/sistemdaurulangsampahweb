import { useState, useEffect } from 'react';
import { ShieldCheck, User, Lock, AtSign, Hash } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { getMeApi, updateProfileApi } from '../../api/auth';
import AdminPageHeader from './AdminPageHeader';

/**
 * Profil & Pengaturan Admin — /admin/profil
 *
 * Perbarui nama & kata sandi akun admin yang sedang masuk.
 * Memakai endpoint yang sudah ada: POST /auth/profile dengan token admin
 * (tanpa perubahan backend). Username/email ditampilkan read-only karena
 * tidak tersedia perubahan pada endpoint tersebut.
 */
export default function ProfilAdmin({ showToast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    password: '',
    password_confirmation: '',
  });

  const loadProfile = () => {
    getMeApi('admin')
      .then((body) => {
        const u = body?.data?.user || body?.user || null;
        setProfile(u);
        setForm((prev) => ({ ...prev, name: u?.name || '' }));
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Nama lengkap tidak boleh kosong.');
      return;
    }
    if (form.password && form.password !== form.password_confirmation) {
      setError('Konfirmasi kata sandi baru tidak sama.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = { name: form.name.trim() };
      if (form.password) payload.password = form.password;

      await updateProfileApi(payload, 'admin');
      if (showToast) showToast('Profil admin berhasil diperbarui.', 'success');
      setForm((prev) => ({ ...prev, password: '', password_confirmation: '' }));
      loadProfile();
    } catch (err) {
      setError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile?.name || 'A')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div style={{ backgroundColor: '#f0fdf4', minHeight: '85vh', paddingBottom: '80px' }}>
      <AdminPageHeader
        badges={[{ text: 'Sistem', variant: 'green' }]}
        title="Profil Admin"
        subtitle="Perbarui nama dan kata sandi akun admin. Kata sandi baru dienkripsi otomatis oleh sistem."
      />

      <div className="container" style={{ marginTop: '24px', maxWidth: '680px' }}>
        <Card>
          {/* Ringkasan akun */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              paddingBottom: '20px',
              marginBottom: '22px',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: '#14532d',
                color: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.05rem',
                flexShrink: 0,
              }}
            >
              {loading ? '…' : initials}
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <strong style={{ fontSize: '1.02rem', color: '#0f172a' }}>
                  {loading ? 'Memuat profil…' : profile?.name || '—'}
                </strong>
                <Badge variant="green" size="sm">
                  Admin
                </Badge>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '14px',
                  flexWrap: 'wrap',
                  fontSize: '0.8rem',
                  color: '#64748b',
                  marginTop: '4px',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Hash size={12} />
                  {profile?.username || '—'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <AtSign size={12} />
                  {profile?.email || '—'}
                </span>
              </div>
            </div>
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

          <form onSubmit={handleSubmit}>
            <Input
              label="Nama Lengkap"
              name="name"
              value={form.name}
              onChange={handleChange}
              leftIcon={<User size={16} />}
              required
            />
            <Input
              label="Kata Sandi Baru"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              leftIcon={<Lock size={16} />}
              placeholder="Biarkan kosong jika tidak ingin mengganti"
              autoComplete="new-password"
            />
            <Input
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              leftIcon={<Lock size={16} />}
              placeholder="Ulangi kata sandi baru"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              disabled={saving || loading}
              leftIcon={<ShieldCheck size={16} />}
            >
              Simpan Perubahan
            </Button>
          </form>

          <p
            style={{
              marginTop: '18px',
              fontSize: '0.78rem',
              color: '#94a3b8',
              lineHeight: 1.6,
            }}
          >
            Username dan email ditetapkan saat akun dibuat dan tidak dapat diubah dari
            panel ini.
          </p>
        </Card>
      </div>
    </div>
  );
}
