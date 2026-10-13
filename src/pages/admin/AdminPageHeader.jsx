import Badge from '../../components/common/Badge';

/**
 * Header halaman admin (lencana + judul + aksi kanan).
 * Dipakai bersama oleh semua halaman di src/pages/admin/.
 */
export default function AdminPageHeader({ badges = [], title, subtitle, actions }) {
  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        paddingTop: '32px',
        paddingBottom: '22px',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            {badges.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                {badges.map((b) => (
                  <Badge key={b.text} variant={b.variant || 'blue'} size="md">
                    {b.text}
                  </Badge>
                ))}
              </div>
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
                  fontSize: '0.9rem',
                  color: '#64748b',
                  marginTop: '6px',
                  maxWidth: '660px',
                  lineHeight: 1.6,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{actions}</div>
          )}
        </div>
      </div>
    </section>
  );
}
