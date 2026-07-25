import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';

/** Nav links — shown in desktop nav + mobile hamburger dropdown. */
const NAV_LINKS = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
  { to: '/documents', label: 'Documents', icon: 'fa-file-lines' },
  { to: '/random-widget', label: 'Widgets', icon: 'fa-cubes' },
  { to: '/hermes', label: 'Hermes', icon: 'fa-cube' },
];

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = location.pathname;

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [currentPath]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const isActive = useCallback((to) => currentPath === to, [currentPath]);

  return (
    <>
      {/* Fixed top navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 500, height: '56px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 0.75rem',
        gap: '0.5rem',
      }}>
        {/* Brand */}
        <Link to="/" className="flex items-center gap-sm" style={{ color: 'var(--text-strong)', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>◆</span>
          <span className="mobile:hidden">btdat.io.vn</span>
        </Link>

        {/* Desktop nav links */}
        <div className="desktop-nav flex items-center gap-xs" style={{ flex: 1, justifyContent: 'center' }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.7rem', borderRadius: '10px',
                fontSize: '0.82rem', fontWeight: isActive(link.to) ? 700 : 500,
                color: isActive(link.to) ? 'var(--accent)' : 'var(--text-dim)',
                background: isActive(link.to) ? 'rgba(129,140,248,0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              <i className={`fas ${link.icon}`} style={{ fontSize: '0.78rem' }} />
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right: theme toggle + hamburger */}
        <div className="flex items-center gap-sm" style={{ flexShrink: 0, marginLeft: 'auto' }}>
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={theme === 'dark' ? 'Sáng' : 'Tối'}
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>
          <button
            className="hamburger-btn btn-icon"
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Menu"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 499,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', top: '56px', left: 0, right: 0,
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderBottom: '1px solid var(--glass-border)',
              padding: '0.75rem',
              animation: 'slideDown 0.25s cubic-bezier(.4,0,.2,1)',
              display: 'flex', flexDirection: 'column', gap: '0.2rem',
              maxHeight: 'calc(100dvh - 70px)',
              overflowY: 'auto',
            }}
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.65rem 0.85rem', borderRadius: '12px',
                  fontSize: '0.95rem', fontWeight: isActive(link.to) ? 700 : 500,
                  color: isActive(link.to) ? 'var(--accent)' : 'var(--text-dim)',
                  background: isActive(link.to) ? 'rgba(129,140,248,0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <i className={`fas ${link.icon}`} style={{ fontSize: '0.95rem', width: '24px', textAlign: 'center' }} />
                {link.label}
                {isActive(link.to) && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>●</span>}
              </Link>
            ))}
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
              <button onClick={toggleTheme} className="btn btn-glass w-full text-center">
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
                {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
