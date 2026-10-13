
export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
      className={`livora-tabs ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              fontWeight: isActive ? '700' : '600',
              fontSize: '0.95rem',
              color: isActive ? '#16a34a' : '#64748b',
              backgroundColor: isActive ? 'rgba(22, 163, 74, 0.06)' : 'transparent',
              border: 'none',
              borderBottom: isActive ? '3px solid #16a34a' : '3px solid transparent',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? '#dcfce7' : '#f1f5f9',
                  color: isActive ? '#15803d' : '#475569',
                  fontWeight: '700',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
