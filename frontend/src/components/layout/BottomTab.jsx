import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/', icon: 'fa-house', label: 'Home' },
  { to: '/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
  { to: '/documents', icon: 'fa-file-lines', label: 'Docs' },
  { to: '/random-widget', icon: 'fa-cubes', label: 'Widget' },
  { to: '/hermes', icon: 'fa-cube', label: 'Hermes' },
];

/** iOS-style bottom tab bar — mobile only */
export default function BottomTab() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 500,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid var(--glass-border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.3rem 0',
      paddingBottom: 'env(safe-area-inset-bottom, 0.3rem)',
    }}>
      {TABS.map(tab => {
        const active = location.pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '0.3rem 0.5rem',
              minWidth: '56px',
              minHeight: '48px',
              justifyContent: 'center',
              color: active ? 'var(--accent)' : 'var(--text-dim)',
              textDecoration: 'none',
              transition: 'color 0.15s',
              position: 'relative',
            }}
          >
            <i className={`fas ${tab.icon}`} style={{ fontSize: '1.1rem' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: active ? 600 : 400 }}>
              {tab.label}
            </span>
            {active && (
              <span style={{
                position: 'absolute',
                top: 0,
                width: '24px',
                height: '3px',
                borderRadius: '0 0 2px 2px',
                background: 'var(--accent)',
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
