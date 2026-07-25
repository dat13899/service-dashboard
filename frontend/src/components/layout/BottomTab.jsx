import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/', icon: 'fa-house', label: 'Home', badge: false },
  { to: '/dashboard', icon: 'fa-gauge-high', label: 'Dashboard', badge: true },
  { to: '/documents', icon: 'fa-file-lines', label: 'Docs', badge: false },
  { to: '/widgets', icon: 'fa-cubes', label: 'Widget', badge: false },
  { to: '/utilities', icon: 'fa-toolbox', label: 'Tools', badge: false },
];

/** Telegram-style bottom tab bar — mobile only */
export default function BottomTab() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: '0.5rem',
      left: '0.5rem',
      right: '0.5rem',
      zIndex: 500,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid var(--glass-border)',
      borderRadius: '20px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.35rem 0.25rem',
      paddingBottom: 'calc(0.35rem + env(safe-area-inset-bottom, 0px))',
      boxShadow: '0 -2px 20px rgba(0,0,0,0.08)',
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
              gap: '1px',
              padding: '0.25rem 0.4rem',
              minWidth: '52px',
              justifyContent: 'center',
              color: active ? 'var(--accent)' : 'var(--text-dim)',
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
              position: 'relative',
              borderRadius: '14px',
              background: active ? 'rgba(129,140,248,0.08)' : 'transparent',
            }}
          >
            {/* Badge notification dot */}
            {tab.badge && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '6px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--red)',
                boxShadow: '0 0 4px var(--red)',
                zIndex: 1,
                animation: 'badgePulse 2s ease-in-out infinite',
              }} />
            )}

            <i className={`fas ${tab.icon}`} style={{
              fontSize: '1.25rem',
              transition: 'transform 0.2s cubic-bezier(.4,0,.2,1)',
              transform: active ? 'scale(1.1)' : 'scale(1)',
            }} />

            <span style={{
              fontSize: '0.55rem',
              fontWeight: active ? 600 : 400,
              letterSpacing: '0.02em',
              opacity: active ? 1 : 0.7,
            }}>
              {tab.label}
            </span>

            {/* Active pill — subtle */}
            {active && (
              <span style={{
                position: 'absolute',
                bottom: '1px',
                width: '20px',
                height: '2.5px',
                borderRadius: '999px',
                background: 'var(--accent)',
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
