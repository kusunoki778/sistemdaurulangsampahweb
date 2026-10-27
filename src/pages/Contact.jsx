import { useState } from 'react';
import { MapPin, Mail, Clock, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PageHeader from '../components/common/PageHeader';
import { sendContactMessageApi } from '../api/contact';

// Info kontak resmi — sama dengan Footer & Home (satu sumber kebenaran).
const CONTACT_INFO = [
  {
    Icon: MapPin,
    label: 'Drop Point Livora',
    value: 'Gedung Livora Green Center, Jl. Kebon Jeruk No. 88, Jakarta Barat',
    bg: '#f0fdf4',
    color: '#16a34a',
  },
  {
    Icon: Mail,
    label: 'Email Resmi',
    value: 'support@livora.id',
    bg: '#f0f9ff',
    color: '#0284c7',
  },
  {
    Icon: Clock,
    label: 'Jam Operasional',
    value: 'Senin – Sabtu, 08.00 – 17.00 WIB',
    bg: '#fef3c7',
    color: '#d97706',
  },
];

const FAQS = [
  {
    q: 'Bagaimana cara mulai menyetor sampah?',
    a: 'Daftar akun Livora, lalu bawa sampah terpilah langsung ke drop point. Petugas menimbang di tempat dan admin memverifikasi sebelum koin masuk ke akun Anda.',
  },
  {
    q: 'Apakah ada biaya saat menukar koin?',
    a: 'Tidak ada. Koin yang Anda terima sesuai nilai sampah yang disetujui admin, tanpa potongan biaya apa pun.',
  },
];

export default function Contact({ showToast }) {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    subjek: '',
    pesan: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await sendContactMessageApi(formData);
      if (res.status === 'success') {
        setSuccess(true);
        setFormData({ nama: '', email: '', subjek: '', pesan: '' });
        if (showToast) {
          showToast('Pesan Anda berhasil dikirim! Tim Livora akan segera menghubungi Anda.', 'success');
        }
      } else {
        setError(res.message || 'Gagal mengirim pesan.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', paddingBottom: '80px' }}>
      {/* Header standar */}
      <PageHeader
        eyebrow="Pusat Bantuan"
        title={
          <>
            Hubungi <span style={{ color: '#16a34a' }}>Kami</span>
          </>
        }
        subtitle="Punya pertanyaan mengenai sistem koin, jenis sampah yang diterima, atau layanan Livora? Kirim pesan lewat formulir di bawah dan tim kami akan membalas lewat email."
      />

      {/* Layout 2 kolom: info & FAQ | formulir pesan */}
      <div className="container reveal stagger-deep" style={{ marginTop: '40px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.35fr',
            gap: '36px',
            alignItems: 'start',
          }}
          className="md-grid-cols-1"
        >
          {/* Kolom kiri: informasi kontak + FAQ */}
          <div>
            <Card
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid #e2e8f0',
                marginBottom: '24px',
              }}
            >
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Informasi Kantor & Kontak
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>
                Silakan hubungi kami melalui saluran resmi di bawah ini selama jam kerja operasional.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {CONTACT_INFO.map(({ Icon, label, value, bg, color }) => (
                  <div key={label} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: bg,
                        color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                        }}
                      >
                        {label}
                      </span>
                      <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Kotak FAQ */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h4
                style={{
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <HelpCircle size={18} color="#16a34a" /> Pertanyaan Sering Diajukan (FAQ)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                {FAQS.map((f, idx) => (
                  <div key={f.q} style={idx > 0 ? { borderTop: '1px solid #f1f5f9', paddingTop: '8px' } : undefined}>
                    <strong>{f.q}</strong>
                    <p style={{ color: '#64748b', marginTop: '2px' }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom kanan: formulir pesan */}
          <Card
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '36px',
              border: '1.5px solid #bbf7d0',
              boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.08)',
            }}
          >
            <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Kirim Pesan ke Tim Livora
            </h3>
            <p style={{ fontSize: '0.925rem', color: '#64748b', marginBottom: '28px' }}>
              Isi formulir di bawah ini dan kami akan menanggapi pesan Anda lewat email secepat mungkin.
            </p>

            {success ? (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#15803d', marginBottom: '8px' }}>
                  Pesan Anda Berhasil Terkirim!
                </h4>
                <p style={{ fontSize: '0.925rem', color: '#166534', marginBottom: '24px' }}>
                  Terima kasih telah menghubungi kami. Pesan Anda telah dicatat di sistem dan admin Livora akan
                  segera merespons lewat email Anda.
                </p>
                <Button variant="secondary" onClick={() => setSuccess(false)}>
                  Kirim Pesan Lainnya
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      color: '#b91c1c',
                      fontSize: '0.875rem',
                      marginBottom: '20px',
                    }}
                  >
                    {error}
                  </div>
                )}

                <Input
                  label="Nama Lengkap"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />

                <Input
                  label="Alamat Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  required
                />

                <Input
                  label="Subjek Pesan"
                  name="subjek"
                  value={formData.subjek}
                  onChange={handleChange}
                  placeholder="Contoh: Cara menghitung nilai setoran"
                  required
                />

                <Input
                  label="Isi Pesan"
                  type="textarea"
                  name="pesan"
                  rows={5}
                  value={formData.pesan}
                  onChange={handleChange}
                  placeholder="Tuliskan pertanyaan, saran, atau masukan Anda secara detail di sini..."
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  style={{ width: '100%', marginTop: '12px' }}
                  loading={loading}
                  rightIcon={<Send size={18} />}
                >
                  Kirim Pesan Sekarang
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
