/**
 * Baris chip filter (kategori/tipe) — dipakai Katalog & Artikel.
 *
 * Props:
 *  - options : [{ id, label }]
 *  - value   : id aktif ('semua' bila memakai allLabel)
 *  - onChange: callback(id)
 *  - allLabel: label chip "semua" (default 'Semua')
 */
export default function ChipFilter({ options, value, onChange, allLabel = 'Semua' }) {
  const items = [{ id: 'semua', label: allLabel }, ...options];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {items.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: active ? '1px solid #16a34a' : '1px solid #e2e8f0',
              backgroundColor: active ? '#f0fdf4' : '#ffffff',
              color: active ? '#15803d' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
