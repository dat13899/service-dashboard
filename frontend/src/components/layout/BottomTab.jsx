import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useHaptic } from '../../hooks/useHaptic';
import BottomSheet from '../BottomSheet';

/**
 * Premium floating bottom nav — mobile only.
 * iOS 18-style centered floating pill, 4 tabs + "More" sheet.
 * Active tab shows icon glow + label, inactive = icon only.
 */
const MAIN_TABS = [
  { to: '/', icon: 'fa-house', label: 'Home' },
  { to: '/dashboard', icon: 'fa-gauge-high', label: 'Services' },
  { to: '/documents', icon: 'fa-file-lines', label: 'Docs' },
  { to: '/widgets', icon: 'fa-cubes', label: 'Widgets' },
];

export default function BottomTab() {
  const location = useLocation();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = useCallback((to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  }, [location.pathname]);

  const activeIndex = MAIN_TABS.findIndex(t => isActive(t.to));

  const moreActions = [
    {
      label: 'Utilities',
      icon: 'fas fa-toolbox',
      onClick: () => navigate('/utilities'),
    },
    {
      label: 'Hermes AI',
      icon: 'fas fa-robot',
      onClick: () => navigate('/hermes'),
    },
  ];

  const isMoreActive = isActive('/utilities') || isActive('/hermes');

  return (
    <>
      {/* Floating pill navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 'calc(14px + var(--safe-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 'var(--z-bottom-nav)',
          background: 'rgba(10, 14, 23, 0.88)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          padding: '4px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.05) inset',
          gap: '0',
        }}
      >
        {MAIN_TABS.map((tab, i) => {
          const active = i === activeIndex;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              onClick={() => haptic.light()}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                width: active ? '72px' : '56px',
                height: '50px',
                borderRadius: '26px',
                color: active ? '#fff' : 'rgba(148, 163, 184, 0.5)',
                textDecoration: 'none',
                position: 'relative',
                zIndex: 1,
                WebkitTapHighlightColor: 'transparent',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease',
              }}
            >
              {/* Active glow background */}
              {active && (
                <motion.div
                  layoutId="btab-bg"
                  style={{
                    position: 'absolute',
                    inset: '3px 4px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,168,224,0.1))',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}

              <motion.i
                className={`fas ${tab.icon}`}
                animate={{
                  scale: active ? 1.15 : 1,
                  y: active ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                style={{
                  fontSize: '1.25rem',
                  position: 'relative',
                  zIndex: 1,
                  filter: active ? 'drop-shadow(0 0 8px rgba(0,212,255,0.6))' : 'none',
                }}
              />

              {active && (
                <motion.span
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                    position: 'relative',
                    zIndex: 1,
                    textShadow: '0 0 10px rgba(0,212,255,0.4)',
                  }}
                >
                  {tab.label}
                </motion.span>
              )}
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => {
            haptic.medium();
            setMoreOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '50px',
            borderRadius: '26px',
            color: isMoreActive ? 'var(--accent)' : 'rgba(148, 163, 184, 0.5)',
            background: isMoreActive ? 'rgba(0, 212, 255, 0.08)' : 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1,
            WebkitTapHighlightColor: 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          <i
            className="fas fa-ellipsis"
            style={{ fontSize: '1.2rem' }}
          />
        </button>
      </nav>

      {/* More bottom sheet */}
      <BottomSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        mode="list"
        actions={moreActions}
      />
    </>
  );
}
