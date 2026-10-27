import { useState, useEffect } from 'react';
import {
  Sprout,
  Leaf,
  Eye,
  Target,
  Recycle,
  TriangleAlert,
  BookOpen,
  ChartColumn,
  Tag,
  Smartphone,
  Globe,
  CircleCheck,
  Wrench,
  Handshake,
  ArrowRight,
  Download,
  Info,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { formatNumber } from '../utils/helpers';
import { getPublicStatsApi } from '../api/stats';
import { getNilaiTukarApi } from '../api/waste';

const APK_URL = 'https://drive.google.com/file/d/1LIVORA_APK_PLACEHOLDER/view?usp=sharing';

const overlineStyle = {
  fontSize: '0.7rem',
  fontWeight: '700',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#16a34a',
  marginBottom: '12px',
};

const sectionTitleStyle = {
  fontSize: '2rem',
  fontWeight: '800',
  color: '#0f172a',
  lineHeight: 1.25,
  letterSpacing: '-0.5px',
};

const bodyTextStyle = {
  fontSize: '0.95rem',
  color: '#64748b',
  lineHeight: 1.75,
  marginTop: '14px',
};

const tantanganList = [
  {
    no: '01',
    icon: <TriangleAlert size={20} />,
    title: 'Tumpukan Residu TPA Akibat Sampah Tercampur dan Kotor',
    text: 'Ketika sisa makanan basah dicampur dengan kardus atau botol plastik dalam satu kantong yang sama, terjadi degradasi anaerobik yang menghasilkan cairan lindi pekat. Akibatnya, material yang secara teknis dapat didaur ulang menjadi rusak secara fisik, mengeluarkan bau menyengat, dan ditolak oleh fasilitas sortir. Beban akhir jatuh kembali pada gunungan TPA regional seperti Bantar Gebang, Sarimulut, maupun Piyungan.',
  },
  {
    no: '02',
    icon: <BookOpen size={20} />,
    title: 'Kesenjangan Informasi: Niat Baik Tanpa Standar Pabrik',
    text: 'Riset perilaku menunjukkan sebagian besar masyarakat perkotaan memiliki dorongan moral untuk memilah sampah. Namun, petunjuk yang ada sering kali terlalu umum seperti sekadar membedakan komposisi organik dan anorganik. Pabrik pencacah plastik membutuhkan botol yang telah dipilah bersih, tanpa label, dan tanpa tutup. Ketidakcocokan pedoman presisi membuat upaya mandiri warga kerap sia-sia di mata pengepul.',
  },
];

const komposisiTpa = [
  { label: 'Organik Basah', value: 54, color: '#16a34a' },
  { label: 'Anorganik Tercampur', value: 26, color: '#f59e0b' },
  { label: 'Residu', value: 22, color: '#475569' },
];

const pilarList = [
  {
    no: 1,
    title: 'Edukasi Terbuka Standar Industri',
    desc: 'Menyediakan modul dan panduan klasifikasi material terbuka yang mengacu pada standar SNI serta kebutuhan riil pasar daur ulang, bukan sekadar simbol teori.',
    footer: 'Kurikulum Terbuka',
    footerIcon: <BookOpen size={13} />,
  },
  {
    no: 2,
    title: 'Transparansi Valuasi Material',
    desc: 'Menghadirkan transparansi harga pasar dan estimasi valuasi sampah anorganik agar setiap individu memahami bahwa setoran pemilahan memiliki nilai jual yang jelas.',
    footer: 'Kalkulasi Jujur',
    footerIcon: <Tag size={13} />,
  },
  {
    no: 3,
    title: 'Integrasi Instrumen Pemantauan',
    desc: 'Mengembangkan integrasi pemantauan digital melalui aplikasi seluler yang praktis untuk memantau partisipasi harian, melacak progres setoran, dan menjaga konsistensi warga.',
    footer: 'Alat Bantu Harian',
    footerIcon: <Smartphone size={13} />,
  },
];

const kanalList = [
  {
    type: 'web',
    badge: 'Kanal 1',
    badgeIcon: <Globe size={13} />,
    meta: 'Akses Publik Tanpa Login',
    title: 'Website Publik Livora',
    desc: 'Dirancang sebagai arsip komprehensif yang dapat diakses siapa saja, mulai dari pelajar, pengurus RT/RW, hingga pegiat komunitas lingkungan tanpa hambatan autentikasi.',
    role: 'Peran Utama: Pembelajaran & Transparansi',
    features: [
      {
        title: 'Direktori Katalog Sampah',
        desc: 'Eksplorasi jenis polimer plastik, kertas, kaca, dan logam beserta cara penerimanya.',
      },
      {
        title: 'Kalkulasi Nilai Publik',
        desc: 'Simulasi perhitungan koin dan Rupiah berdasarkan berat material secara transparan.',
      },
      {
        title: 'Artikel & Riset Komparatif',
        desc: 'Panduan pemilahan rumah tangga, studi kasus penggunaan logam, dan informasi regulasi.',
      },
      {
        title: 'Kanal Komunitas',
        desc: 'Ruang komunikasi bagi bank sampah mandiri, sekolah, dan institusi wilayah lokal.',
      },
    ],
  },
  {
    type: 'mobile',
    badge: 'Aplikasi Seluler',
    badgeIcon: <Smartphone size={13} />,
    meta: 'Android & iOS',
    title: 'Aplikasi Mobile Livora',
    desc: 'Instrumen praktis bagi individu untuk mencatat aktivitas pemilahan setiap kali menyetorkan sampah ke drop point terpusat Livora terdekat.',
    role: 'Peran Utama: Partisipasi Lapangan & Insentif',
    features: [
      {
        title: 'Verifikasi Timbangan Digital',
        desc: 'Pemindaian kode QR timbangan di drop point untuk pencatatan berat yang tervalidasi.',
      },
      {
        title: 'Dompet Koin Digital',
        desc: 'Akumulasi setoran bersih hasil pemilahan menjadi saldo dompet digital atau token listrik.',
      },
      {
        title: 'Misi & Kuis Harian',
        desc: 'Pengingat jadwal setoran mingguan dan kuis pengetahuan tentang kebiasaan bebas plastik sekali pakai.',
      },
      {
        title: 'Informasi Lokasi Drop Point',
        desc: 'Petunjuk alamat dan jam operasional drop point terpusat Livora yang resmi di wilayah Anda.',
      },
    ],
  },
];

const prinsipList = [
  {
    icon: <Eye size={22} />,
    title: 'Transparansi Tanpa Gimmick',
    desc: 'Kami menjelaskan data pasar apa adanya. Jika suatu jenis plastik multilayer (seperti sachet kecil) sulit didaur ulang dan bernilai sangat rendah, kami menyebutnya secara jujur agar warga tidak membangun ekspektasi daur ulang yang keliru.',
  },
  {
    icon: <Wrench size={22} />,
    title: 'Pendekatan Edukasi Praktis',
    desc: 'Instruksi Livora dirancang untuk dapur dan tempat sampah rumah tangga Indonesia yang nyata: singkat, jelas, tanpa istilah kimia yang rumit, dan dapat diterapkan tanpa perlu membeli wadah pilah mewah.',
  },
  {
    icon: <Handshake size={22} />,
    title: 'Sinergi dengan Bank Sampah & Pengolah Lokal',
    desc: 'Livora tidak menggantikan bank sampah unit maupun pekerja kebersihan yang telah beroperasi bertahun-tahun. Kami bekerja sama secara teknis dan memastikan material yang dikirim sudah bersih agar margin kerja para pengolah lokal meningkat secara adil.',
  },
];

const externalLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '14px 28px',
  fontSize: '1.05rem',
  fontWeight: '600',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.7)',
  color: '#ffffff',
  backgroundColor: 'transparent',
  textDecoration: 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
};

const cardLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  fontSize: '0.85rem',
  fontWeight: '600',
  borderRadius: '12px',
  border: '1px solid #bbf7d0',
  backgroundColor: '#f0fdf4',
  color: '#15803d',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

export default function About({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [jenisList, setJenisList] = useState([]);

  useEffect(() => {
    async function loadAboutData() {
      try {
        const [publicStats, wasteTypes] = await Promise.all([
          getPublicStatsApi(),
          getNilaiTukarApi(),
        ]);
        setStats(publicStats);
        setJenisList(wasteTypes);
      } catch (err) {
        console.error('Failed to load about stats:', err);
      }
    }
    loadAboutData();
  }, []);

  // Angka hero diambil dari data asli (GET /stats + master jenis sampah).
  const heroStats = [
    { value: stats ? formatNumber(stats.total_members) : '—', label: 'Anggota Terdaftar' },
    { value: stats ? `${formatNumber(stats.total_sampah_kg)} kg` : '—', label: 'Sampah Terkumpul' },
    { value: stats ? formatNumber(stats.total_koin_beredar) : '—', label: 'Koin Beredar' },
    { value: jenisList.length > 0 ? String(jenisList.length) : '—', label: 'Jenis Sampah Diterima' },
  ];

  const jenisNames = jenisList
    .map((t) => t.jenis_sampah || t.nama_jenis)
    .filter(Boolean);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh' }}>
      {/* Hero */}
      <section className="reveal stagger" style={{ backgroundColor: '#ffffff', paddingTop: '64px', paddingBottom: '56px' }}>
        <div className="container">
          <div className="grid grid-cols-2 md-grid-cols-1 gap-8" style={{ alignItems: 'center' }}>
            <div>
              <Badge
                variant="green"
                size="sm"
                style={{ marginBottom: '20px' }}
                icon={<Sprout size={13} />}
              >
                Inisiatif &amp; Visi Lingkungan
              </Badge>
              <h1
                style={{
                  fontSize: '2.75rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  letterSpacing: '-1.5px',
                  lineHeight: 1.12,
                }}
              >
                Membangun Kesadaran Pemilahan Sampah dari Sumber Rumah Tangga
              </h1>
              <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '20px', lineHeight: 1.75 }}>
                Livora hadir sebagai jembatan edukatif antara kebiasaan harian masyarakat
                Indonesia dengan rantai pasok industri daur ulang yang transparan, terukur,
                dan bermartabat.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '18px',
                padding: '26px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#16a34a',
                  }}
                >
                  Fokus Utama
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#15803d' }}>
                  Inisiatif Terbuka
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.75 }}>
                Menghilangkan jurang pengetahuan teknis agar setiap gram plastik, kertas, dan
                logam yang dipilah dari rumah memiliki kepastian serap di fasilitas pengolahan
                nasional.
              </p>
              <div
                style={{
                  borderTop: '1px solid #bbf7d0',
                  marginTop: '18px',
                  paddingTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#15803d',
                }}
              >
                <Leaf size={16} />
                Berjalan untuk Indonesia Lestari
              </div>
            </div>
          </div>

          {/* Statistik Livora (data langsung dari API) */}
          <div className="grid grid-cols-4 md-grid-cols-2 gap-4" style={{ marginTop: '44px' }}>
            {heroStats.map((s) => (
              <div
                key={s.label}
                style={{
                  backgroundColor: '#f0fdf4',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  textAlign: 'center',
                  border: '1px solid #dcfce7',
                }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#16a34a' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '48px' }}>
        {/* Visi & Misi */}
        <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
          <Card style={{ boxShadow: '0 18px 40px -24px rgba(0,0,0,0.25)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Eye size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
              Visi Kami
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.75 }}>
              Menjadi ekosistem bank sampah digital terdepan di Indonesia yang menjadikan pemilahan
              sampah sebagai kebiasaan harian, sekaligus menciptakan nilai ekonomi baru dari limbah
              rumah tangga.
            </p>
          </Card>

          <Card style={{ boxShadow: '0 18px 40px -24px rgba(0,0,0,0.25)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
              Misi Kami
            </h3>
            <ul
              style={{
                fontSize: '0.95rem',
                color: '#475569',
                lineHeight: 1.75,
                paddingLeft: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>Menyediakan kanal setor sampah yang mudah, cepat, dan terverifikasi.</li>
              <li>Memberi apresiasi nyata berupa koin bagi kontribusi member — penukaran dilakukan lewat Aplikasi Mobile Livora.</li>
              <li>Edukasi masyarakat tentang pemilahan sampah melalui artikel berkualitas.</li>
              <li>Melayani setor sampah offline di drop point terpusat — warga cukup datang ke lokasi Livora untuk ditimbang dan diverifikasi admin.</li>
            </ul>
          </Card>
        </div>

        {/* Cerita */}
        <Card style={{ marginTop: '28px' }}>
          <div className="grid grid-cols-2 md-grid-cols-1 gap-6" style={{ alignItems: 'center' }}>
            <div>
              <Badge variant="green" size="sm" style={{ marginBottom: '12px' }} icon={<Recycle size={13} />}>
                Cerita Livora
              </Badge>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                Dari Tumpukan Sampah Menjadi Dampak Berharga
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.75, marginBottom: '12px' }}>
                Livora lahir dari keresahan atas tingginya sampah rumah tangga yang tidak terpilah
                serta minimnya apresiasi bagi warga yang sudah berusaha memilah. Kami membangun
                sistem bank sampah digital: setiap setoran tercatat, setiap koin transparan, dan
                penukaran koin tinggal diajukan dari Aplikasi Mobile Livora lalu hadiahnya
                diambil di drop point Livora.
              </p>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.75 }}>
                Mulai dari minyak jelantah, botol plastik, kardus, kaleng, hingga kertas bekas —
                semuanya kami hargai. Karena tidak ada sampah yang benar-benar &quot;sampah&quot;, hanya
                sumber daya yang belum dikelola dengan tepat.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '18px',
                padding: '32px',
                border: '1px solid #bbf7d0',
                textAlign: 'center',
              }}
            >
              <Recycle size={54} color="#16a34a" style={{ margin: '0 auto 14px' }} />
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#15803d' }}>
                {jenisList.length > 0 ? `${jenisList.length} Jenis` : '—'}
              </div>
              <div style={{ fontSize: '0.95rem', color: '#166534', marginTop: '6px', lineHeight: 1.6 }}>
                {jenisNames.length > 0
                  ? jenisNames.join(' • ')
                  : 'Minyak Jelantah • Botol Plastik • Kardus • Kaleng • Kertas'}
                <br />
                semuanya bernilai koin di Livora.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Konteks & Urgensi */}
      <section className="reveal stagger" style={{ backgroundColor: '#f0fdf4', padding: '72px 0', marginTop: '56px' }}>
        <div className="container">
          <div className="grid grid-cols-2 md-grid-cols-1 gap-8" style={{ alignItems: 'start' }}>
            <div>
              <div style={overlineStyle}>Konteks &amp; Urgensi</div>
              <h2 style={sectionTitleStyle}>
                Realitas Krisis Sampah Bukan Sekadar Kurangnya Bak Sampah
              </h2>
              <p style={bodyTextStyle}>
                Tumpukan sampah di tempat pemrosesan akhir (TPA) nasional bukan sekadar persoalan
                volume, melainkan kegagalan sistematis dalam pemisahan kualitas material saat
                pertama kali dilepas oleh konsumen.
              </p>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  marginTop: '28px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                  }}
                >
                  <ChartColumn size={15} color="#16a34a" />
                  Komposisi Sampah TPA
                </div>
                <div
                  style={{
                    display: 'flex',
                    height: '10px',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    backgroundColor: '#e2e8f0',
                  }}
                >
                  {komposisiTpa.map((s) => (
                    <div
                      key={s.label}
                      style={{ width: `${s.value}%`, backgroundColor: s.color }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2" style={{ marginTop: '14px' }}>
                  {komposisiTpa.map((s) => (
                    <div key={s.label}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: s.color }}>
                        {s.value}%
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {tantanganList.map((t) => (
                <Card key={t.no}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        flexShrink: 0,
                        borderRadius: '12px',
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {t.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#64748b',
                          marginBottom: '8px',
                        }}
                      >
                        Tantangan {t.no}
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                        {t.title}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.7 }}>{t.text}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tiga Pilar Misi */}
      <section className="reveal stagger" style={{ backgroundColor: '#ffffff', padding: '72px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '36px' }}>
            <div style={overlineStyle}>Tiga Pilar Misi</div>
            <h2 style={sectionTitleStyle}>Langkah Konkret Mewujudkan Transformasi Pemilahan</h2>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
            {pilarList.map((p) => (
              <div
                key={p.no}
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #dcfce7',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                  }}
                >
                  {p.no}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{p.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, flex: 1 }}>{p.desc}</p>
                <div
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #bbf7d0',
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#15803d',
                  }}
                >
                  {p.footerIcon}
                  {p.footer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sinergi Dua Kanal */}
      <section className="reveal stagger" style={{ backgroundColor: '#f0fdf4', padding: '72px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '36px' }}>
            <div style={overlineStyle}>Arsitektur Ekosistem</div>
            <h2 style={{ ...sectionTitleStyle, maxWidth: '760px' }}>
              Sinergi Dua Kanal: Portal Informasi Publik &amp; Aplikasi Operasional
            </h2>
            <p style={{ ...bodyTextStyle, maxWidth: '760px' }}>
              Livora membagi perannya secara tegas demi kejelasan interaksi publik: portal web
              berfungsi sebagai perpustakaan referensi, sementara aplikasi seluler menjalankan
              fungsi interaksi lapangan.
            </p>
          </div>

          <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
            {kanalList.map((k) => (
              <Card key={k.type} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <Badge variant="green" size="sm" icon={k.badgeIcon}>
                    {k.badge}
                  </Badge>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{k.meta}</span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                  {k.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.7, marginBottom: '18px' }}>
                  {k.desc}
                </p>

                <ul
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '20px',
                    flex: 1,
                  }}
                >
                  {k.features.map((f) => (
                    <li key={f.title} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CircleCheck size={16} color="#16a34a" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.87rem', color: '#475569', lineHeight: 1.65 }}>
                        <strong style={{ color: '#0f172a', fontWeight: '700' }}>{f.title}</strong>
                        {': '}
                        {f.desc}
                      </span>
                    </li>
                  ))}
                </ul>

                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#64748b',
                    }}
                  >
                    {k.role}
                  </span>
                  {k.type === 'web' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onNavigate('katalog-sampah')}
                      rightIcon={<ArrowRight size={14} />}
                    >
                      Buka Katalog
                    </Button>
                  ) : (
                    <a href={APK_URL} target="_blank" rel="noopener noreferrer" style={cardLinkStyle}>
                      Unduh Aplikasi
                      <Download size={14} />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prinsip Kami Bekerja */}
      <section className="reveal stagger" style={{ backgroundColor: '#ffffff', padding: '72px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '36px' }}>
            <div style={overlineStyle}>Fondasi Etis</div>
            <h2 style={sectionTitleStyle}>Prinsip Kami Bekerja</h2>
            <p style={{ ...bodyTextStyle, maxWidth: '720px' }}>
              Kami menolak retorika keberlanjutan yang sekadar kosmetik. Tiga prinsip ini memandu
              setiap halaman panduan dan kerja sama operasional yang kami bangun.
            </p>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
            {prinsipList.map((p) => (
              <div
                key={p.title}
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #dcfce7',
                  borderRadius: '16px',
                  padding: '24px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #bbf7d0',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  {p.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kolaborasi di Lapangan */}
      <section className="reveal stagger" style={{ backgroundColor: '#f0fdf4', padding: '72px 0' }}>
        <div className="container">
          <div className="grid grid-cols-2 md-grid-cols-1 gap-8" style={{ alignItems: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80"
              alt="Warga memilah sampah daur ulang bersama di lingkungan rumah"
              loading="lazy"
              style={{
                width: '100%',
                height: '320px',
                objectFit: 'cover',
                borderRadius: '18px',
                border: '1px solid #dcfce7',
                display: 'block',
              }}
            />
            <div>
              <div style={overlineStyle}>Kolaborasi di Lapangan</div>
              <h2 style={sectionTitleStyle}>
                Mendukung Rantai Sirkular Grassroots di Tingkat Rukun Warga
              </h2>
              <p style={bodyTextStyle}>
                Keberhasilan pemilahan sampah tidak ditentukan oleh teknologi semata, melainkan
                oleh ketekunan kader lingkungan, petugas kebersihan, dan kesadaran keluarga di
                tingkat RT/RW. Livora mendedikasikan materi edukasi ini sebagai panduan lapangan
                bebas biaya bagi siapa saja yang ingin memulai bank sampah di lingkungannya.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '22px' }}>
                <span
                  style={{
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                  }}
                >
                  Standar Pemilahan Terpadu
                </span>
                <span
                  style={{
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                  }}
                >
                  Akses Edukasi Bebas Biaya
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Penutup */}
      <section
        style={{
          backgroundColor: '#16a34a',
          color: '#ffffff',
          padding: '72px 0',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '820px' }}>
          <Badge
            variant="green"
            size="sm"
            style={{
              marginBottom: '22px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              borderColor: 'rgba(255,255,255,0.35)',
            }}
            icon={<Sprout size={13} />}
          >
            Mulai Dari Rumah Hari Ini
          </Badge>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: '800',
              letterSpacing: '-1px',
              lineHeight: 1.25,
            }}
          >
            Langkah Kecil Pemilahan Anda Menyelamatkan Rantai Daur Ulang Indonesia
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.88)',
              maxWidth: '620px',
              margin: '18px auto 30px',
              lineHeight: 1.75,
              fontSize: '1rem',
            }}
          >
            Pelajari klasifikasi material yang tepat melalui katalog kami atau gunakan aplikasi
            seluler Livora untuk mulai menyetorkan sampah terpilah Anda ke drop point terpusat
            Livora terdekat.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="white"
              size="lg"
              onClick={() => onNavigate('katalog-sampah')}
              leftIcon={<Sprout size={18} />}
            >
              Jelajahi Katalog Sampah
            </Button>
            <a href={APK_URL} target="_blank" rel="noopener noreferrer" style={externalLinkStyle}>
              <Download size={18} />
              Download Aplikasi Mobile
            </a>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              marginTop: '26px',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            <Info size={14} />
            Akses web dapat digunakan bebas tanpa pendaftaran akun.
          </div>
        </div>
      </section>
    </div>
  );
}
