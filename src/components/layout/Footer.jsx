import { Recycle, Phone, Mail, MapPin } from 'lucide-react';

/**
 * Footer public — tata letak mengikuti desain Figma (4 kolom):
 * identitas · Navigasi Cepat · Kategori Sampah Populer · Kontak & Informasi.
 * Tanpa emoji; link "Unduh Aplikasi" mengarah ke berkas APK (Google Drive).
 */
export default function Footer({ onNavigate }) {
  const handleNav = (pageId) => {
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLink = (pageId) => {
    if (pageId === '__apk') {
      window.open(
        'https://drive.google.com/file/d/1LIVORA_APK_PLACEHOLDER/view?usp=sharing',
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }
    handleNav(pageId);
  };

  const navLinks = [
    { id: 'home', label: 'Beranda' },
    { id: 'artikel', label: 'Artikel Edukasi' },
    { id: 'katalog-sampah', label: 'Katalog Sampah' },
    { id: 'kontak', label: 'Hubungi Kami' },
    { id: 'tentang', label: 'Tentang Kami' },
    { id: '__apk', label: 'Unduh Aplikasi' },
  ];

  const kategoriPopuler = [
    'Plastik PET (Polyethylene Terephthalate)',
    'Kertas & Karton Duplex',
    'Logam & Kaleng Aluminium',
    'Kaca Bening & Botol Kaca',
  ];

  const contactItems = [
    { Icon: Mail, text: 'support@livora.id' },
    { Icon: Phone, text: '+62 812-3456-7890 (Call & WA)' },
    {
      Icon: MapPin,
      text: 'Gedung Livora Green Center, Jl. Kebon Jeruk No. 88, Jakarta Barat',
    },
  ];

  const headingStyle = {
    color: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '16px',
  };

  const linkBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#cbd5e1',
    fontSize: '0.9rem',
    padding: 0,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
  };

  return (
    <footer
      style={{
        backgroundColor: '#1c3527',
        color: '#a7f3d0',
        paddingTop: '64px',
        paddingBottom: '32px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="container">
        <div
          className="grid md-grid-cols-1 gap-8"
          style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1.1fr', marginBottom: '48px' }}
        >
          {/* Kolom 1: identitas */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '18px',
              }}
            >
              <span
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Recycle size={20} />
              </span>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff' }}>
                Livora<span style={{ color: '#4ade80' }}>.</span>
              </span>
            </div>

            <p
              style={{
                fontSize: '0.9rem',
                lineHeight: 1.65,
                color: '#a7f3d0',
                marginBottom: '18px',
              }}
            >
              Bank sampah offline di Jakarta Barat. Setor langsung ke drop point — koin
              tercatat rapi di akun Anda.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#86efac',
                border: '1px solid rgba(134, 239, 172, 0.4)',
                borderRadius: '9999px',
                padding: '7px 14px',
              }}
            >
              <Recycle size={14} />
              Inisiatif Sirkular Terpadu Indonesia
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <h4 style={headingStyle}>Navigasi Cepat</h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => handleLink(link.id)}
                    style={linkBtnStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#4ade80';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#cbd5e1';
                    }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Kategori Sampah Populer */}
          <div>
            <h4 style={headingStyle}>Kategori Sampah Populer</h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {kategoriPopuler.map((kat) => (
                <li key={kat} style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                  {kat}
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Kontak & Informasi */}
          <div>
            <h4 style={headingStyle}>Kontak & Informasi</h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                fontSize: '0.875rem',
              }}
            >
              {contactItems.map((item) => {
                const { Icon } = item;
                return (
                  <div
                    key={item.text}
                    style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
                  >
                    <Icon
                      size={16}
                      color="#4ade80"
                      style={{ flexShrink: 0, marginTop: '3px' }}
                    />
                    <span style={{ color: '#cbd5e1', lineHeight: 1.55 }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ color: '#cbd5e1' }}>
            Copyright {new Date().getFullYear()} Livora Indonesia. Seluruh hak cipta
            dilindungi.
          </div>
          <div style={{ color: '#86efac', textAlign: 'right', maxWidth: '520px', lineHeight: 1.6 }}>
            Catatan: Platform web publik informatif & edukatif; transaksi dan penukaran
            koin berjalan melalui Aplikasi Mobile Livora.
          </div>
        </div>
      </div>
    </footer>
  );
}
