import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
  { to: '/documents', label: 'Documents', icon: 'fa-file-lines' },
  { to: '/utilities', label: 'Utilities', icon: 'fa-wrench' },
  { to: '/random-widget', label: 'Widget', icon: 'fa-cubes' },
  { to: '/hermes', label: 'Hermes', icon: 'fa-cube' },
];

const navbarStyle = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid var(--glass-border)',
  transition: 'background .3s, border .3s',
  minHeight: '52px',
};

const linkStyle = (active) => ({
  borderRadius: '8px',
  padding: '0.35rem 0.65rem',
  fontSize: '0.8rem',
  fontWeight: active ? 600 : 400,
  color: active ? 'var(--accent)' : 'var(--text-dim)',
  background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
  transition: 'all .15s',
  whiteSpace: 'nowrap',
});

export default function Navbar({ active: forcedActive }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const active = forcedActive || location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar is-fixed-top" role="navigation" aria-label="main navigation" style={navbarStyle}>
      <div className="navbar-brand" style={{ alignItems: 'center', gap: '0.5rem', marginLeft: '0.75rem', display: 'flex' }}>
        <Link to="/" className="navbar-item" onClick={() => setMenuOpen(false)}
          style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-strong)', padding: '0', gap: '0.35rem' }}
        >
          <span style={{ color: 'var(--accent)' }}>&#9670;</span>
          <span>btdat.io.vn</span>
        </Link>

        {/* Hamburger for mobile */}
        <button
          className={`navbar-burger ${menuOpen ? 'is-active' : ''}`}
          onClick={() => setMenuOpen(p => !p)}
          aria-label="menu"
          aria-expanded={menuOpen}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: '4px',
            padding: '0.5rem', marginLeft: 'auto', zIndex: 100,
          }}
        >
          <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all .2s' }}></span>
          <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all .2s' }}></span>
          <span style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all .2s' }}></span>
        </button>
      </div>

      {/* Desktop nav */}
      <div className="navbar-menu" style={{
        flexGrow: 1, justifyContent: 'center',
        display: 'flex',
      }}>
        <div className="navbar-start" style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-item ${active === link.to ? 'is-active' : ''}`}
              style={linkStyle(active === link.to)}
            >
              <i className={`fas ${link.icon}`} style={{ marginRight: '0.35rem', fontSize: '0.75rem' }}></i>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/** Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '52px', left: 0, right: 0,
          background: 'var(--glass-bg)', backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--glass-border)',
          padding: '0.5rem 0.75rem', zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
          animation: 'slideDown .15s ease',
        }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                ...linkStyle(active === link.to),
                padding: '0.5rem 0.75rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <i className={`fas ${link.icon}`} style={{ fontSize: '0.85rem', width: '20px' }}></i>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div className="navbar-end" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.75rem' }}>
        <button onClick={toggleTheme}
          className="button is-small"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            color: 'var(--text-dim)',
            padding: '0.3rem 0.6rem',
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all .15s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            flexShrink: 0,
          }}
          title={theme === 'dark' ? 'Sang chế độ sáng' : 'Sang chế độ tối'}
        >
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
      </div>
    </nav>
  );
}
