import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import useTheme from '../../hooks/useTheme';
import useScrollNav from '../../hooks/useScrollNav';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
  { to: '/documents', label: 'Documents', icon: 'fa-file-lines' },
  { to: '/widgets', label: 'Widgets', icon: 'fa-cubes' },
  { to: '/utilities', label: 'Utilities', icon: 'fa-toolbox' },
  { to: '/hermes', label: 'Hermes', icon: 'fa-galaxy' },
];

/* ───── SVG gradient logo — hardcoded hex for cross-browser compat ───── */
function Logomark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none"
      style={{ display: 'block', filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.35))' }}
    >
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="26" height="26" rx="7" fill="url(#lg)" className="logo-rect" />
      <path d="M16 5 L9 15 H13 L11 25 L20 13 H15 L18 5 Z" fill="white" />
    </svg>
  );
}

/* ───── Theme toggle (animated sun ↔ moon) ───── */
function ThemeToggle({ theme, toggle }) {
  return (
    <motion.button
      onClick={toggle}
      className="liquid-btn"
      title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
      whileTap={{ scale: 0.9 }}
      style={{ width: '36px', height: '36px', padding: 0, minWidth: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ display: 'flex' }}
        >
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}
            style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = location.pathname;
  const scrolled = useScrollNav(60);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);
  useEffect(() => { setMenuOpen(false); }, [currentPath]);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);
  const isActive = useCallback((to) => currentPath === to, [currentPath]);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, height: '56px',
        background: scrolled ? 'var(--glass-bg)' : 'rgba(17,24,39,0.15)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(8px) saturate(100%)',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(8px) saturate(100%)',
        borderBottom: scrolled ? '1px solid var(--liquid-border)' : '1px solid rgba(255,255,255,0.03)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.12), 0 1px 0 rgba(0,212,255,0.04) inset' : 'none',
        display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem',
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
          <Logomark />
          <span className="desktop-only" style={{
            fontWeight: 800, fontSize: '0.95rem',
            background: 'linear-gradient(135deg, var(--text-strong) 20%, var(--accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>btdat.io.vn</span>
        </Link>

        <div className="desktop-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.15rem' }}>
          {NAV_LINKS.map(link => {
            const active = isActive(link.to);
            return (
              <Link key={link.to} to={link.to}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.38rem 0.7rem', borderRadius: '10px', fontSize: '0.8rem',
                  fontWeight: active ? 600 : 500, textDecoration: 'none', whiteSpace: 'nowrap',
                  color: active ? 'var(--text-strong)' : 'var(--text-dim)',
                  background: active ? 'rgba(0,212,255,0.06)' : 'transparent',
                  border: active ? '1px solid rgba(0,212,255,0.12)' : '1px solid transparent',
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.background = 'rgba(0,212,255,0.03)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-dim)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <i className={`fas ${link.icon}`} style={{
                  fontSize: '0.75rem', transition: 'transform 0.2s cubic-bezier(.4,0,.2,1)',
                  transform: active ? 'scale(1.15)' : 'scale(1)',
                  color: active ? '#00d4ff' : undefined,
                }} />
                <span>{link.label}</span>
                {active && (
                  <motion.span layoutId="nav-pill"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                      position: 'absolute', bottom: '-2px', left: '50%', width: '55%', height: '2.5px',
                      borderRadius: '999px',
                      background: 'linear-gradient(90deg, #00d4ff, #34d399)',
                      boxShadow: '0 0 8px rgba(0,212,255,0.4)',
                    }} />
                )}
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, marginLeft: 'auto' }}>
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          <button
            className="hamburger-btn liquid-btn" aria-label="Menu"
            onClick={() => setMenuOpen(p => !p)}
            style={{
              width: '36px', height: '36px', padding: 0,
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px',
              borderRadius: '10px', minWidth: '36px',
              border: menuOpen ? '1px solid #00d4ff' : '1px solid transparent',
              background: menuOpen ? 'rgba(0,212,255,0.08)' : 'transparent',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: '18px', height: '2px', borderRadius: '2px',
                background: menuOpen ? '#00d4ff' : 'var(--text-dim)',
                transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                ...(menuOpen && i === 0 ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}),
                ...(menuOpen && i === 1 ? { opacity: 0 } : {}),
                ...(menuOpen && i === 2 ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}),
              }} />
            ))}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 499, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="liquid-panel"
              style={{ position: 'fixed', top: '56px', left: '0.5rem', right: '0.5rem', padding: '0.5rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.15rem', maxHeight: 'calc(100dvh - 70px)', overflowY: 'auto', border: '1px solid var(--liquid-border)' }}
            >
              {NAV_LINKS.map(link => {
                const active = isActive(link.to);
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.85rem', borderRadius: '12px', fontSize: '0.92rem', fontWeight: active ? 600 : 500, textDecoration: 'none', transition: 'all 0.15s', color: active ? 'var(--text-strong)' : 'var(--text-dim)', background: active ? 'rgba(0,212,255,0.08)' : 'transparent', borderLeft: active ? '3px solid #00d4ff' : '3px solid transparent' }}
                  >
                    <i className={`fas ${link.icon}`} style={{ fontSize: '0.9rem', width: '24px', textAlign: 'center', color: active ? '#00d4ff' : 'var(--text-dim)' }} />
                    {link.label}
                    {active && <span style={{ marginLeft: 'auto', color: '#00d4ff', fontSize: '0.7rem' }}>◆</span>}
                  </Link>
                );
              })}
              <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--liquid-border)' }}>
                <button onClick={toggleTheme} className="liquid-btn"
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} style={{ color: '#f59e0b' }} />
                  {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
