
export default function Card({
  children,
  className = '',
  hover = false,
  border = true,
  padding = '24px',
  onClick,
  style = {},
  ...props
}) {
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: padding,
    border: border ? '1px solid #e2e8f0' : 'none',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return (
    <div
      style={cardStyle}
      className={`livora-card ${hover ? 'hover-card' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
