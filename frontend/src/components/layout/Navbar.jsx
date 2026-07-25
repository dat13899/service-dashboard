import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';
import useScrollNav from '../../hooks/useScrollNav';

/** Nav links — shown in desktop nav + mobile hamburger dropdown. */
const NAV_LINKS = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
  { to: '/documents', label: 'Documents', icon: 'fa-file-lines' },
  { to: '/widgets', label: 'Widgets', icon: 'fa-cubes' },
  { to: '/utilities', label: 'Utilities', icon: 'fa-toolbox' },
  { to: '/hermes', label: 'Hermes', icon: 'fa-galaxy' },
];

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = location.pathname;
  const scrolled = useScrollNav(60);

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

  // ── Dynamic navbar style ──
  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0,
    zIndex: 500, height: '56px',
    background: scrolled ? 'var(--glass-bg)' : 'rgba(17,24,39,0.2)',
    backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(8px) saturate(100%)',
    WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(8px) saturate(100%)',
    borderBottom: '1px solid transparent',
    backgroundImage: scrolled
      ? `linear-gradient(var(--glass-bg), var(--glass-bg)), 
         linear-gradient(90deg, transparent, var(--accent), rgba(6,182,212,0.6), rgba(168,85,247,0.6), transparent)`
      : 'none',
    backgroundOrigin: 'border-box',
    backgroundClip: scrolled ? 'padding-box, border-box' : 'padding-box',
    boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.15)' : 'none',
    display: 'flex', alignItems: 'center',
    padding: '0 0.75rem',
    gap: '0.5rem',
    transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
  };

  return (
    <>
      {/* Fixed top navbar */}
      <nav style={navStyle}>
        {/* ── Brand ── */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--text-strong)', fontWeight: 800, fontSize: '1rem',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px', height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), var(--green))',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 900,
            animation: 'logoPulse 3s ease-in-out infinite',
            boxShadow: '0 0 12px rgba(129,140,248,0.35)',
          }}>
            ⚡
          </span>
          <span className="mobile:hidden" style={{
            background: 'linear-gradient(135deg, var(--text-strong) 30%, var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>btdat.io.vn</span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="desktop-nav flex items-center gap-xs" style={{ flex: 1, justifyContent: 'center' }}>
          {NAV_LINKS.map(link => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.4rem 0.75rem', borderRadius: '10px',
                  fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                  color: active ? 'var(--text-strong)' : 'var(--text-dim)',
                  background: active ? 'rgba(129,140,248,0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-dim)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <i className={`fas ${link.icon}`} style={{
                  fontSize: '0.78rem',
                  transition: 'transform 0.2s cubic-bezier(.4,0,.2,1)',
                  transform: active ? 'scale(1.15)' : 'scale(1)',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.transform = 'scale(1)'; }}
                />
                <span className="nav-label">{link.label}</span>
                {/* Active pill */}
                {active && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: '2.5px',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, var(--accent), var(--green))',
                    animation: 'pillSlide 0.3s cubic-bezier(.4,0,.2,1)',
                    boxShadow: '0 0 8px rgba(52,211,153,0.4)',
                  }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right: theme toggle + hamburger ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, marginLeft: 'auto' }}>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Sáng' : 'Tối'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-dim)',
              cursor: 'pointer', fontSize: '0.85rem',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--amber)';
              e.currentTarget.style.borderColor = 'var(--amber)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-dim)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>

          {/* ── Hamburger ── */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Menu"
            style={{
              display: 'none',
              flexDirection: 'column', gap: '5px',
              padding: '0.45rem',
              borderRadius: '10px',
              border: menuOpen ? '1px solid var(--accent)' : '1px solid transparent',
              background: menuOpen ? 'rgba(129,140,248,0.1)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
              outline: 'none',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: '20px', height: '2px',
                borderRadius: '2px',
                background: menuOpen ? 'var(--accent)' : 'var(--text)',
                transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                ...(menuOpen && i === 0 ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}),
                ...(menuOpen && i === 1 ? { opacity: 0, transform: 'scaleX(0)' } : {}),
                ...(menuOpen && i === 2 ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}),
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
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
            {NAV_LINKS.map(link => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    padding: '0.65rem 0.85rem', borderRadius: '12px',
                    fontSize: '0.95rem', fontWeight: active ? 700 : 500,
                    color: active ? 'var(--text-strong)' : 'var(--text-dim)',
                    background: active ? 'rgba(129,140,248,0.1)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                >
                  <i className={`fas ${link.icon}`} style={{
                    fontSize: '0.95rem', width: '24px', textAlign: 'center',
                    color: active ? 'var(--accent)' : 'var(--text-dim)',
                  }} />
                  {link.label}
                  {active && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '0.75rem' }}>◆</span>}
                </Link>
              );
            })}
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
              <button onClick={toggleTheme}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.6rem', borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-dim)', cursor: 'pointer',
                  fontSize: '0.9rem', transition: 'all 0.15s',
                }}
              >
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
