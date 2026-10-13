/**
 * Status kosong standar (list tanpa data, pencarian nihil, dsb).
 *
 * Props:
 *  - icon    : ikon lucide (opsional)
 *  - title   : judul pesan (wajib)
 *  - message : penjelas singkat (opsional)
 *  - children: aksi opsional (tombol dsb)
 */
export default function EmptyState({ icon, title, message, children }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '56px 24px',
        backgroundColor: '#ffffff',
        border: '1px dashed #cbd5e1',
        borderRadius: '16px',
      }}
    >
      {icon && (
        <div
          style={{
            color: '#94a3b8',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '14px',
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>{title}</h3>
      {message && (
        <p
          style={{
            fontSize: '0.9rem',
            color: '#64748b',
            marginTop: '8px',
            maxWidth: '46ch',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
      )}
      {children && <div style={{ marginTop: '18px' }}>{children}</div>}
    </div>
  );
}
