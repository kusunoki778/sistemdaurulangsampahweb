import { useState, useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ChevronDown,
  Clock,
  Coins,
  Download,
  Droplets,
  Globe,
  Info,
  Leaf,
  ListChecks,
  MapPin,
  Package,
  Phone,
  QrCode,
  Recycle,
  RefreshCw,
  Search,
  Smartphone,
  Users,
} from 'lucide-react';
import Button from '../components/common/Button';
import { formatCoins, formatNumber } from '../utils/helpers';
import { getPublicStatsApi } from '../api/stats';
import { getNilaiTukarApi } from '../api/waste';

/**
 * Landing page public (route: /).
 * Urutan: Hero -> Mengapa Livora -> Cara Kerja -> Dampak -> Pratinjau Katalog
 *         -> Drop Point -> FAQ -> CTA penutup (aplikasi pendamping).
 * Semua angka dari API publik; klaim dampak non-literal diberi label "Estimasi".
 */
export default function Home({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [jenisList, setJenisList] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    getPublicStatsApi()
      .then((data) => setStats(data))
      .catch((err) => console.warn('Statistik publik tidak tersedia:', err));
    getNilaiTukarApi()
      .then((data) => setJenisList(data))
      .catch(() => setJenisList([]));
  }, []);

  // Helper judul section (eyebrow + judul + sub, rata tengah)
  const sectionHead = (eyebrow, title, subtitle) => (
    <div style={{ textAlign: 'center', maxWidth: '660px', margin: '0 auto 48px' }}>
      <p
        style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#16a34a',
          marginBottom: '10px',
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: '#0f172a',
          letterSpacing: '-0.5px',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '12px', lineHeight: 1.65 }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '22px',
  };

  const steps = [
    {
      step: '01',
      Icon: Search,
      title: 'Pelajari Jenis Sampah',
      description:
        'Kenali jenis sampah lewat artikel dan katalog nilai tukar di web ini.',
    },
    {
      step: '02',
      Icon: Package,
      title: 'Pilih Sampah',
      description:
        'Kumpulkan dan bersihkan barang yang layak didaur ulang, seperti botol plastik, kardus kering, dan botol minyak bekas.',
    },
    {
      step: '03',
      Icon: Smartphone,
      title: 'Bawa ke Drop Point',
      description:
        'Bawa sampah terpilah ke drop point Livora — ditimbang langsung di tempat.',
    },
    {
      step: '04',
      Icon: Coins,
      title: 'Dapatkan Koin Valid',
      description:
        'Koin masuk ke aplikasi setelah admin memvalidasi jenis dan berat sampah.',
    },
  ];

  const dropPointItems = [
    { Icon: MapPin, label: 'Alamat', value: 'Gedung Livora Green Center, Jl. Kebon Jeruk No. 88, Jakarta Barat' },
    { Icon: Clock, label: 'Jam Operasional', value: 'Senin – Sabtu, 08.00 – 17.00 WIB' },
    { Icon: Phone, label: 'Telepon / WA', value: '+62 812-3456-7890' },
    { Icon: Recycle, label: 'Minimal Setor', value: '5 kg sampah anorganik atau 3 liter minyak jelantah' },
  ];

  const faqs = [
    {
      q: 'Apa itu Livora?',
      a: 'Livora adalah bank sampah offline: warga membawa sampah terpilah ke drop point kami, menimbang di tempat, lalu menerima koin digital yang tercatat rapi di akun.',
    },
    {
      q: 'Apakah ada layanan jemput sampah?',
      a: 'Tidak. Livora beroperasi sebagai satu titik drop point terpusat yang dikelola admin — semua setoran dilakukan langsung di tempat, tanpa layanan jemput.',
    },
    {
      q: 'Bagaimana cara mendapatkan koin?',
      a: 'Daftar akun, bawa sampah ke drop point, admin menimbang dan menyetujui setoran, lalu koin otomatis masuk ke saldo akun Anda.',
    },
    {
      q: 'Koin bisa ditukar dengan apa?',
      a: 'Saldo e-wallet (disetujui lewat alur admin), tumbler, totebag, bibit tanaman, dan hadiah lainnya. Lihat katalog hadiah lengkap serta ajukan penukaran lewat Aplikasi Mobile Livora.',
    },
    {
      q: 'Berapa minimal setor?',
      a: 'Minimal 5 kg untuk sampah anorganik atau 3 liter untuk minyak jelantah.',
    },
    {
      q: 'Di mana drop point dan kapan bukanya?',
      a: 'Livora Green Center, Jl. Kebon Jeruk No. 88, Jakarta Barat. Buka Senin–Sabtu pukul 08.00–17.00 WIB.',
    },
  ];

  const jenisPreview = jenisList.slice(0, 6);

  const totalSampah = stats ? formatNumber(stats.total_sampah_kg) : '…';
  const totalMinyak = stats ? formatNumber(stats.total_minyak_liter) : '…';
  const totalAnggota = stats ? formatNumber(stats.total_members) : '…';
  const totalKoin = stats ? formatCoins(stats.total_koin_beredar) : '…';

  const heroStats = [
    { label: 'Anggota terdaftar', value: totalAnggota },
    { label: 'Sampah terkumpul', value: `${totalSampah} kg` },
    { label: 'Koin beredar', value: totalKoin },
  ];

  const mengapaCards = [
    {
      badge: 'PILAR 01',
      Icon: BookOpen,
      title: 'Edukasi yang Praktis',
      desc: 'Panduan langkah demi langkah memilah sampah rumah tangga, mudah diterapkan di rumah.',
    },
    {
      badge: 'PILAR 02',
      Icon: Coins,
      title: 'Transparansi Nilai Sampah',
      desc: 'Lihat estimasi koin dan nilai rupiah dari botol plastik, kardus, kaleng, dan lainnya sebelum setor.',
    },
    {
      badge: 'PILAR 03',
      Icon: Recycle,
      title: 'Memilah dari Rumah',
      desc: 'Sampah terpilah langsung menuju pabrik daur ulang, bukan menumpuk di TPA.',
    },
    {
      badge: 'PILAR 04',
      Icon: Users,
      title: 'Kebiasaan yang Terjaga',
      desc: 'Aplikasi mobile mencatat rutinitas setor, misi, dan koin Anda dari waktu ke waktu.',
    },
  ];

  const dampakStats = [
    { value: '~60%', label: 'Residu Berkurang di TPA' },
    { value: '1.8 kg', label: 'CO2e Hemat / kg Plastik' },
    { value: '100%', label: 'Tertimbang & Terverifikasi' },
  ];

  const dampakCards = [
    {
      Icon: Droplets,
      title: 'Pengurangan Residu TPA',
      desc: 'Mengurangi sisa sampah bernilai dari rumah tangga agar tidak terkirim ke tumpukan di TPA, menjadikan bahan langsung ke pabrik daur ulang resmi.',
    },
    {
      Icon: Leaf,
      title: 'Konservasi Sumber Daya',
      desc: 'Setiap kilogram plastik dan kertas yang didaur ulang secara nyata menghemat konsumsi energi fosil serta ratusan liter air baku industri.',
    },
    {
      Icon: BarChart3,
      title: 'Peningkatan Literasi Warga',
      desc: 'Mengubah kebiasaan membuang campur aduk menjadi budaya memilah teratur yang menjaga kebersihan turun-temurun di lingkungan komunitas lokal.',
    },
  ];

  const ctaFeatures = [
    {
      Icon: Brain,
      title: 'Kuis Harian Daur Ulang',
      desc: 'Uji pengetahuan lingkungan dan raih poin tambahan tiap hari.',
    },
    {
      Icon: ListChecks,
      title: 'Misi Mingguan Terarah',
      desc: 'Tantangan memilah botol dan kardus dengan koin berjenjang.',
    },
    {
      Icon: QrCode,
      title: 'Pindai QR Drop Point',
      desc: 'Verifikasi penyerahan sampah cepat di drop point Livora.',
    },
    {
      Icon: RefreshCw,
      title: 'Penukaran Koin Fleksibel',
      desc: 'Konversikan koin hasil pemilahan sampah menjadi saldo digital.',
    },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* =====================================================================
          1. HERO — proposisi utama + statistik publik nyata
         ===================================================================== */}
      <section className="reveal stagger-deep" style={{ backgroundColor: '#f0fdf4', padding: '64px 0 72px' }}>
        <div className="container">
          <div
            className="md-grid-cols-1"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            {/* Konten kiri */}
            <div>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#15803d',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Leaf size={14} />
                Pemilahan Sampah dari Rumah
              </p>
              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 4.4vw, 3.2rem)',
                  fontWeight: '800',
                  lineHeight: 1.18,
                  color: '#0f172a',
                  letterSpacing: '-1px',
                  marginBottom: '18px',
                }}
              >
                Setor Sampah Terpilah, <br /> Terima Koin.
              </h1>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#475569',
                  marginBottom: '30px',
                  maxWidth: '560px',
                }}
              >
                Belajar memilah sampah dari rumah, lalu setor ke drop point
                Livora. Sampah terpilah ditimbang dan dihitung jadi koin.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => onNavigate('katalog-sampah')}
                  leftIcon={<Package size={18} />}
                >
                  Jelajahi Katalog Sampah
                </Button>
                <Button
                  size="lg"
                  variant="white"
                  onClick={() => onNavigate('artikel')}
                  leftIcon={<BookOpen size={18} />}
                >
                  Baca Artikel Edukasi
                </Button>
              </div>

              {/* Statistik publik (angka asli dari database) */}
              <div
                style={{
                  marginTop: '36px',
                  display: 'flex',
                  gap: '32px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #bbf7d0',
                  paddingTop: '20px',
                }}
              >
                {heroStats.map((s) => (
                  <div key={s.label}>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {s.value}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom kanan: foto drop point + kartu jam operasional */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '4px solid #ffffff',
                  boxShadow: '0 20px 35px -12px rgba(15, 23, 42, 0.18)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80"
                  alt="Kegiatan daur ulang sampah Livora"
                  style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                />
              </div>
              {/* Overlay atas: label motivasi */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '9999px',
                  padding: '8px 14px',
                  boxShadow: '0 8px 18px -6px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: '#0f172a',
                }}
              >
                <Leaf size={15} color="#16a34a" />
                Langkah Kecil untuk Bumi
              </div>
              {/* Overlay bawah: status kesiapan setor */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <span
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Recycle size={20} />
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                    Pilah Dulu, Setor Kemudian
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>
                    Kering • Bersih • Terpilah
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. MENGAPA LIVORA — 4 pilar edukasi (desain Figma)
         ===================================================================== */}
      <section className="section-py reveal stagger" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ maxWidth: '720px', marginBottom: '44px' }}>
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#16a34a',
                marginBottom: '10px',
              }}
            >
              Mengapa Pemilahan
            </p>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#0f172a',
                letterSpacing: '-0.5px',
              }}
            >
              Mengapa Livora?
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '12px', lineHeight: 1.65 }}>
              Edukasi dulu, praktik kemudian — kebiasaan memilah yang konsisten
              adalah dasar semuanya.
            </p>
          </div>

          <div className="grid grid-cols-4 md-grid-cols-1 gap-5">
            {mengapaCards.map((card) => {
              const { Icon } = card;
              return (
                <div
                  key={card.badge}
                  className="hover-lift"
                  style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: '16px',
                    padding: '24px 22px',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '14px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        letterSpacing: '0.1em',
                        color: '#16a34a',
                      }}
                    >
                      {card.badge}
                    </span>
                    <span
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: '#ffffff',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={17} />
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      marginBottom: '8px',
                      lineHeight: 1.35,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.65 }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. CARA KERJA — 4 langkah alur sirkular (desain Figma)
         ===================================================================== */}
      <section className="section-py reveal stagger" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '24px',
              flexWrap: 'wrap',
              marginBottom: '44px',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#16a34a',
                  marginBottom: '10px',
                }}
              >
                Alur Setor Sampah
              </p>
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  letterSpacing: '-0.5px',
                }}
              >
                Cara Kerja Livora
              </h2>
              <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '12px', lineHeight: 1.65 }}>
                Empat langkah dari sampah menumpuk di rumah jadi koin di akun Anda.
              </p>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '9999px',
                padding: '9px 16px',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#15803d',
              }}
            >
              <Globe size={15} />
              Web Edukatif & Aplikasi Pendukung
            </span>
          </div>

          <div className="grid grid-cols-4 md-grid-cols-1 gap-6">
            {steps.map((step) => {
              const { Icon } = step;
              return (
                <div
                  key={step.step}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '26px 22px',
                    border: '1px solid #e2e8f0',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '14px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: '800',
                        color: '#16a34a',
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1,
                      }}
                    >
                      {step.step}
                    </span>
                    <span style={{ color: '#94a3b8' }}>
                      <Icon size={18} />
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      marginBottom: '8px',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.65 }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Catatan platform */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              marginTop: '32px',
              backgroundColor: '#ffffff',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '14px 18px',
            }}
          >
            <Info size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.65 }}>
              <strong>Catatan Platform:</strong> Web edukasi ini berfungsi sebagai pusat
              edukasi, direktori material, dan katalog informasi. Seluruh proses
              penyetoran, verifikasi, dan penimbangan dilakukan langsung di drop point
              Livora oleh admin.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. DAMPAK — dampak positif lingkungan (desain Figma) + catatan jujur
         ===================================================================== */}
      <section className="section-py reveal stagger-deep" style={{ backgroundColor: '#ecfdf5' }}>
        <div className="container">
          <div
            className="md-grid-cols-1"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: '40px',
              alignItems: 'center',
              marginBottom: '44px',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#16a34a',
                  marginBottom: '10px',
                }}
              >
                Tolak Ukur Nyata
              </p>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.3rem)',
                  fontWeight: '800',
                  color: '#0f172a',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                }}
              >
                Dampak Positif Lingkungan
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#475569',
                  lineHeight: 1.7,
                  marginTop: '14px',
                  maxWidth: '52ch',
                }}
              >
                Pendekatan pemilahan yang terukur bukan sekadar retorika. Pemilahan
                harian yang tepat mengubah beban limbah menjadi pasokan sekunder
                bermakna.
              </p>
            </div>
            <div className="grid grid-cols-3 md-grid-cols-1 gap-4">
              {dampakStats.map((s) => (
                <div
                  key={s.value}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 14px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: '600',
                      color: '#64748b',
                      marginTop: '6px',
                      lineHeight: 1.45,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
            {dampakCards.map((card) => {
              const { Icon } = card;
              return (
                <div key={card.title} className="hover-lift" style={{ ...cardStyle, padding: '26px 24px' }}>
                  <span
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <Icon size={22} />
                  </span>
                  <div
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      marginBottom: '8px',
                    }}
                  >
                    {card.title}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.65 }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <p
            style={{
              fontSize: '0.78rem',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '24px',
              lineHeight: 1.6,
              maxWidth: '740px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Angka ~60% dan 1,8 kg adalah estimasi umum industri daur ulang; angka 100%
            merujuk seluruh setoran Livora yang selalu ditimbang dan diverifikasi admin.
            Total tercatat saat ini: {totalSampah} kg sampah dan {totalMinyak} liter
            minyak jelantah.
          </p>
        </div>
      </section>

      {/* =====================================================================
          5. PRATINJAU KATALOG SAMPAH — data asli /jenis-sampah
         ===================================================================== */}
      <section className="section-py reveal stagger" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          {sectionHead(
            'Nilai Setiap Sampah',
            'Berapa Koin dari Sampah Anda?',
            'Sebagian kecil katalog jenis sampah Livora beserta nilai koin per satuannya.'
          )}

          {jenisPreview.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
              Katalog sampah belum tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-3 md-grid-cols-1 gap-5">
              {jenisPreview.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                      {item.nama_jenis}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        color: '#15803d',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '9999px',
                        padding: '3px 9px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {item.kategori?.nama_kategori || 'Umum'}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: '#64748b',
                      lineHeight: 1.55,
                      marginTop: '8px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.5em',
                    }}
                  >
                    {item.deskripsi || 'Sampah anorganik yang bernilai untuk didaur ulang.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px' }}>
                    <Coins size={16} color="#d97706" />
                    <span
                      style={{
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        color: '#0f172a',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCoins(item.koin_per_satuan)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      koin / {item.satuan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Button
              variant="secondary"
              onClick={() => onNavigate('katalog-sampah')}
              rightIcon={<ArrowRight size={16} />}
            >
              Lihat Semua Katalog & Kalkulator
            </Button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. DROP POINT — informasi operasional offline
         ===================================================================== */}
      <section className="reveal stagger-deep" style={{ backgroundColor: '#f0fdf4', padding: '64px 0' }}>
        <div className="container">
          <div
            className="md-grid-cols-1"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#15803d',
                  marginBottom: '10px',
                }}
              >
                Drop Point Terpusat
              </p>
              <h2
                style={{
                  fontSize: '1.9rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.25,
                }}
              >
                Datang langsung, timbang di tempat.
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#475569',
                  lineHeight: 1.7,
                  marginTop: '14px',
                  maxWidth: '52ch',
                }}
              >
                Livora beroperasi sebagai bank sampah offline dengan satu titik layanan
                yang dikelola admin. Tidak ada layanan penjemputan — Anda datang, sampah
                ditimbang, dan koin masuk setelah verifikasi.
              </p>
              <div style={{ marginTop: '26px' }}>
                <Button
                  variant="primary"
                  onClick={() => onNavigate('kontak')}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Hubungi Kami
                </Button>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: '28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {dropPointItems.map((item) => {
                  const { Icon } = item;
                  return (
                    <div key={item.label} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <span
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: '#f0fdf4',
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} />
                      </span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: '600', lineHeight: 1.5 }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. FAQ — accordion
         ===================================================================== */}
      <section className="section-py reveal stagger" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          {sectionHead(
            'Pertanyaan Umum',
            'Yang Sering Ditanyakan',
            'Jawaban singkat seputar aturan setor, koin, dan drop point Livora.'
          )}

          <div style={{ maxWidth: '760px', margin: '0 auto', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.q} style={{ borderBottom: idx === faqs.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      padding: '18px 22px',
                      backgroundColor: isOpen ? '#f8fafc' : '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.98rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      color="#64748b"
                      style={{
                        flexShrink: 0,
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <p
                      style={{
                        padding: '0 22px 18px',
                        fontSize: '0.9rem',
                        color: '#475569',
                        lineHeight: 1.7,
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. CTA PENUTUP — aplikasi pendamping (desain Figma, tanpa Play Store)
         ===================================================================== */}
      <section style={{ backgroundColor: '#1c3527', color: '#ffffff', padding: '72px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div>
              <span
                className="reveal"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(134, 239, 172, 0.5)',
                  borderRadius: '9999px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: '#86efac',
                  marginBottom: '20px',
                }}
              >
                <Smartphone size={14} />
                Aplikasi Pendamping Resmi
              </span>
              <h2
                className="reveal"
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
                  fontWeight: '800',
                  lineHeight: 1.2,
                  letterSpacing: '-0.5px',
                  marginBottom: '16px',
                  color: '#ffffff',
                  transitionDelay: '0.09s',
                }}
              >
                Mulai Catat & Kumpulkan{' '}
                <span style={{ color: '#86efac' }}>Koin Daur Ulang</span> di Ponsel
                Anda
              </h2>
              <p
                className="reveal"
                style={{
                  fontSize: '1rem',
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                  marginBottom: '28px',
                  maxWidth: '56ch',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  transitionDelay: '0.18s',
                }}
              >
                Setor sampah, kumpulkan koin, tukar jadi hadiah — saldo digital,
                tumbler, bibit tanaman, dan lainnya. Semua tercatat di Aplikasi
                Mobile Livora.
              </p>

              <div
                className="reveal grid grid-cols-2 md-grid-cols-1 gap-5"
                style={{ marginBottom: '32px', textAlign: 'left', transitionDelay: '0.27s' }}
              >
                {ctaFeatures.map((f) => {
                  const { Icon } = f;
                  return (
                    <div
                      key={f.title}
                      style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                    >
                      <span
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '9px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          color: '#86efac',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={17} />
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: '0.92rem',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '4px',
                          }}
                        >
                          {f.title}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#a7f3d0', lineHeight: 1.55 }}>
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="reveal" style={{ transitionDelay: '0.36s' }}>
              <Button
                size="lg"
                variant="primary"
                onClick={() =>
                  window.open(
                    'https://drive.google.com/file/d/1LIVORA_APK_PLACEHOLDER/view?usp=sharing',
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
                leftIcon={<Download size={18} />}
              >
                <span
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    lineHeight: 1.25,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: '700',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      opacity: 0.9,
                    }}
                  >
                    Unduh Berkas
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: '800' }}>
                    Direct APK (Android)
                  </span>
                </span>
              </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
