/**
 * Header standar halaman public & member (judul + sub + aksi opsional).
 * Dipakai agar Katalog/Reward/Artikel/Kontak/Tentang seirama tampilannya.
 *
 * Props:
 *  - eyebrow   : label kecil opsional di atas judul
 *  - title     : judul halaman (wajib)
 *  - subtitle  : kalimat penjelas opsional
 *  - children  : slot aksi/filter opsional di bawah teks
 */
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '32px' }}>
        {eyebrow && (
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
            {eyebrow}
          </p>
        )}
        <h1
          style={{
            fontSize: '1.9rem',
            fontWeight: '800',
            color: '#0f172a',
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '0.95rem',
              color: '#64748b',
              marginTop: '10px',
              maxWidth: '62ch',
              lineHeight: 1.65,
            }}
          >
            {subtitle}
          </p>
        )}
        {children && <div style={{ marginTop: '20px' }}>{children}</div>}
      </div>
    </div>
  );
}
