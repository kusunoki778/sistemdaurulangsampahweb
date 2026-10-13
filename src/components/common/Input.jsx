
export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  rows = 4,
  options = [], // for select: [{ label: '', value: '' }]
  disabled = false,
  leftIcon,
  rightElement,
  className = '',
  ...props
}) {
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';

  const baseInputStyle = {
    width: '100%',
    padding: leftIcon ? '10px 14px 10px 38px' : '10px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${error ? '#ef4444' : '#cbd5e1'}`,
    backgroundColor: disabled ? '#f8fafc' : '#ffffff',
    color: '#0f172a',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ marginBottom: '16px', textAlign: 'left' }} className={className}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '6px',
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {leftIcon}
          </div>
        )}

        {isTextarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            disabled={disabled}
            style={{ ...baseInputStyle, resize: 'vertical' }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = '#16a34a';
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = '#cbd5e1';
            }}
            {...props}
          />
        ) : isSelect ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            style={baseInputStyle}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = '#16a34a';
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = '#cbd5e1';
            }}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            style={baseInputStyle}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = '#16a34a';
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = '#cbd5e1';
            }}
            {...props}
          />
        )}

        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', fontWeight: '500' }}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{helperText}</p>
      )}
    </div>
  );
}
