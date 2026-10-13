
export default function Badge({
  children,
  variant = 'green', // 'green' | 'coin' | 'blue' | 'danger' | 'gray' | 'purple'
  size = 'md',        // 'sm' | 'md'
  icon,
  className = '',
  style = {},
}) {
  const variants = {
    green: {
      backgroundColor: '#f0fdf4',
      color: '#15803d',
      borderColor: '#bbf7d0',
    },
    coin: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      borderColor: '#fde68a',
    },
    blue: {
      backgroundColor: '#f0f9ff',
      color: '#0369a1',
      borderColor: '#bae6fd',
    },
    danger: {
      backgroundColor: '#fef2f2',
      color: '#b91c1c',
      borderColor: '#fecaca',
    },
    gray: {
      backgroundColor: '#f1f5f9',
      color: '#475569',
      borderColor: '#e2e8f0',
    },
    purple: {
      backgroundColor: '#faf5ff',
      color: '#7e22ce',
      borderColor: '#e9d5ff',
    },
  };

  const sizes = {
    sm: { padding: '2px 8px', fontSize: '0.75rem' },
    md: { padding: '4px 12px', fontSize: '0.825rem' },
  };

  const currentVariant = variants[variant] || variants.green;
  const currentSize = sizes[size] || sizes.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        borderRadius: '9999px',
        fontWeight: '600',
        border: '1px solid',
        lineHeight: 1.2,
        ...currentSize,
        ...currentVariant,
        ...style,
      }}
      className={`livora-badge ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}
