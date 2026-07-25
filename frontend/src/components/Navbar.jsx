import { useState, useEffect } from 'react';
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

export default function Navbar({ active: forcedActive }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const active = forcedActive || location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) document.body.classList.add('menu-open');
    else document.body.classList.remove('menu-open');
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const linkClass = (to) =>
    active === to ? 'is-active' : '';

  const linkStyle = {
    borderRadius: '10px',
    padding: '0.4rem 0.7rem',
    fontSize: '0.82rem',
    fontWeight: 500,
    color: 'var(--text-dim)',
    transition: 'all .15s',
    whiteSpace: 'nowrap',
  };

  const activeLinkStyle = {
    fontWeight: 700,
    color: 'var(--accent)',
    background: 'rgba(99,102,241,0.1)',
  };

  return (
    <>
      <nav className="navbar is-fixed-top" role="navigation" aria-label="main navigation"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
          minHeight: '56px',
          zIndex: 9999,
        }}
      >
        <div className="navbar-brand" style={{
          display: 'flex', alignItems: 'center', width: '100%', padding: '0 0.75rem',
        }}>
          <Link to="/" className="navbar-item" onClick={() => setMenuOpen(false)}
            style={{
              fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-strong)',
              padding: '0', gap: '0.35rem', display: 'flex', alignItems: 'center',
              marginRight: 'auto',
            }}
          >
            <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>&#9670;</span>
            <span>btdat.io.vn</span>
          </Link>

          {/* Desktop links */}
          <div className="navbar-start desktop-nav" style={{
            display: 'flex', gap: '0.15rem', alignItems: 'center', margin: '0 auto',
          }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-item ${linkClass(link.to)}`}
                style={{
                  ...linkStyle,
                  ...(active === link.to ? activeLinkStyle : {}),
                }}
              >
                <i className={`fas ${link.icon}`} style={{ marginRight: '0.35rem', fontSize: '0.78rem' }}></i>
                <span className="nav-label">{link.label}</span>
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
            <button onClick={toggleTheme}
              className="button is-small"
              style={{
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '10px', color: 'var(--text-dim)',
                padding: '0.4rem 0.6rem', fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                transition: 'all .15s', flexShrink: 0,
              }}
              title={theme === 'dark' ? 'Sang chế độ sáng' : 'Sang chế độ tối'}
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            {/* Hamburger */}
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(p => !p)}
              aria-label="menu"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'none', flexDirection: 'column', gap: '5px',
                padding: '0.4rem', borderRadius: '8px',
                transition: 'background .15s',
              }}
            >
              <span className="ham-line"
                style={{
                  display: 'block', width: '22px', height: '2.5px',
                  background: 'var(--text)', borderRadius: '3px',
                  transition: 'all .25s cubic-bezier(.4,0,.2,1)',
                  transform: menuOpen ? 'rotate(45deg) translate(5.5px, 5.5px)' : 'none',
                }}
              />
              <span className="ham-line"
                style={{
                  display: 'block', width: '22px', height: '2.5px',
                  background: 'var(--text)', borderRadius: '3px',
                  transition: 'all .2s',
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span className="ham-line"
                style={{
                  display: 'block', width: '22px', height: '2.5px',
                  background: 'var(--text)', borderRadius: '3px',
                  transition: 'all .25s cubic-bezier(.4,0,.2,1)',
                  transform: menuOpen ? 'rotate(-45deg) translate(5.5px, -5.5px)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay + dropdown */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'fadeIn .15s ease',
          }}
        >
          <div
            className="mobile-menu-panel"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', top: '56px', left: 0, right: 0,
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderBottom: '1px solid var(--glass-border)',
              padding: '0.75rem',
              animation: 'slideDown .2s cubic-bezier(.4,0,.2,1)',
              display: 'flex', flexDirection: 'column', gap: '0.2rem',
              maxHeight: 'calc(100vh - 70px)',
              overflowY: 'auto',
            }}
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`navbar-item ${linkClass(link.to)}`}
                style={{
                  ...linkStyle,
                  ...(active === link.to ? activeLinkStyle : {}),
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  borderRadius: '12px',
                }}
              >
                <i className={`fas ${link.icon}`} style={{
                  fontSize: '0.95rem', width: '24px', textAlign: 'center',
                  color: active === link.to ? 'var(--accent)' : 'var(--text-dim)',
                }}></i>
                <span>{link.label}</span>
                {active === link.to && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--accent)' }}>
                    ●
                  </span>
                )}
              </Link>
            ))}
            <div style={{
              marginTop: '0.5rem', paddingTop: '0.5rem',
              borderTop: '1px solid var(--glass-border)',
              display: 'flex', justifyContent: 'center', gap: '0.5rem',
            }}>
              <button onClick={() => { toggleTheme(); }}
                style={{
                  background: 'var(--surface-2)', border: '1px solid var(--glass-border)',
                  borderRadius: '10px', color: 'var(--text-dim)',
                  padding: '0.5rem 1.2rem', fontSize: '0.85rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
              >
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                {theme === 'dark' ? 'Sáng' : 'Tối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
