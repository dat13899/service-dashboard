import { Link, useLocation } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: 'fa-house' },
  { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
];

export default function Navbar({ active: forcedActive }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const active = forcedActive || location.pathname;

  return (
    <nav className="navbar is-fixed-top" role="navigation" aria-label="main navigation"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        transition: 'background .3s, border .3s',
        minHeight: '52px',
      }}
    >
      <div className="navbar-brand" style={{ alignItems: 'center', gap: '0.5rem', marginLeft: '0.75rem' }}>
        <Link to="/" className="navbar-item" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-strong)', padding: '0', gap: '0.35rem' }}>
          <span style={{ color: 'var(--accent)' }}>&#9670;</span>
          <span>btdat.io.vn</span>
        </Link>
      </div>

      <div className="navbar-menu" style={{ flexGrow: 1, justifyContent: 'center' }}>
        <div className="navbar-start" style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-item ${active === link.to ? 'is-active' : ''}`}
              style={{
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: active === link.to ? 600 : 400,
                color: active === link.to ? 'var(--accent)' : 'var(--text-dim)',
                background: active === link.to ? 'rgba(99,102,241,0.08)' : 'transparent',
                transition: 'all .15s',
              }}
            >
              <i className={`fas ${link.icon}`} style={{ marginRight: '0.35rem', fontSize: '0.75rem' }}></i>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

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
          }}
          title={theme === 'dark' ? 'Sang chế độ sáng' : 'Sang chế độ tối'}
        >
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
      </div>
    </nav>
  );
}
