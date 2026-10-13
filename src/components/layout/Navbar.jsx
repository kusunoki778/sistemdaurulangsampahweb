import { useState } from 'react';
import { 
  Recycle, 
  Coins, 
  Menu, 
  X, 
  BookOpen,
  Phone,
  Home,
  Info
} from 'lucide-react';
import Button from '../common/Button';

export default function Navbar({ activePage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Menu publik saja — tanpa fitur member
  const navItems = [
    { id: 'home', label: 'Beranda', icon: <Home size={18} /> },
    { id: 'katalog-sampah', label: 'Katalog Sampah', icon: <Recycle size={18} /> },
    { id: 'artikel', label: 'Artikel', icon: <BookOpen size={18} /> },
    { id: 'tentang', label: 'Tentang', icon: <Info size={18} /> },
    { id: 'kontak', label: 'Kontak', icon: <Phone size={18} /> },
  ];

  const handleNav = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '74px',
          }}
        >
          {/* Logo Brand */}
          <div
            onClick={() => handleNav('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
              }}
            >
              <Recycle size={24} />
            </div>
            <div>
              <span
                style={{
                  fontSize: '1.45rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  letterSpacing: '-0.5px',
                }}
              >
                Livora<span style={{ color: '#16a34a' }}>.</span>
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  color: '#16a34a',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginTop: '-4px',
                }}
              >
                Bank Sampah Digital
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="md-hidden"
          >
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? '#15803d' : '#475569',
                    backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #16a34a' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#16a34a';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Admin CMS Direct Link - hanya untuk akun admin */}
            {/* Note: isAdmin check removed since public navbar shouldn't know about admin sessions */}
          </nav>

          {/* Right Action: Download APK Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => window.open('https://drive.google.com/file/d/1LIVORA_APK_PLACEHOLDER/view?usp=sharing', '_blank', 'noopener,noreferrer')}
              leftIcon={<Coins size={16} />}
            >
              Unduh Aplikasi
            </Button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 0 20px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontWeight: activePage === item.id ? '700' : '500',
                  color: activePage === item.id ? '#15803d' : '#334155',
                  backgroundColor: activePage === item.id ? '#f0fdf4' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <a
              href="https://drive.google.com/file/d/1LIVORA_APK_PLACEHOLDER/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                fontWeight: '700',
                color: '#15803d',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                textAlign: 'left',
                textDecoration: 'none',
              }}
            >
              <Coins size={18} />
              <span>Unduh Aplikasi (APK)</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
