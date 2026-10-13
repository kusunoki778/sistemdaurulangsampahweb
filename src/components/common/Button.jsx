
export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'coin' | 'danger' | 'ghost' | 'outline'
  size = 'md',         // 'sm' | 'md' | 'lg'
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  leftIcon,
  rightIcon,
  style = {},
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '600',
    borderRadius: '12px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.65 : 1,
    border: '1px solid transparent',
    textDecoration: 'none',
    boxShadow: 'none',
  };

  const sizes = {
    sm: { padding: '6px 14px', fontSize: '0.85rem' },
    md: { padding: '10px 20px', fontSize: '0.95rem' },
    lg: { padding: '14px 28px', fontSize: '1.05rem', borderRadius: '14px' },
  };

  const variants = {
    primary: {
      backgroundColor: '#16a34a',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
    },
    secondary: {
      backgroundColor: '#f0fdf4',
      color: '#15803d',
      borderColor: '#bbf7d0',
    },
    coin: {
      backgroundColor: '#f59e0b',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(245, 158, 11, 0.25)',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#16a34a',
      borderColor: '#16a34a',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#475569',
    },
    white: {
      backgroundColor: '#ffffff',
      color: '#16a34a',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...baseStyles,
        ...currentSize,
        ...currentVariant,
        ...style,
      }}
      className={`livora-btn ${className}`}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      ) : (
        leftIcon && <span>{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
}
