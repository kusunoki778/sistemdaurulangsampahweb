import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (message && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      text: '#15803d',
      icon: <CheckCircle2 size={20} color="#16a34a" />,
    },
    error: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#b91c1c',
      icon: <AlertCircle size={20} color="#ef4444" />,
    },
    info: {
      bg: '#f0f9ff',
      border: '#bae6fd',
      text: '#0369a1',
      icon: <Info size={20} color="#0284c7" />,
    },
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '14px',
        padding: '14px 20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div>{config.icon}</div>
      <div style={{ flex: 1, fontSize: '0.925rem', fontWeight: '500', color: config.text }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
