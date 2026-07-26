import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useHaptic } from '../../hooks/useHaptic';

const TABS = [
  { to: '/', icon: 'fa-house', label: 'Home' },
  { to: '/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
  { to: '/documents', icon: 'fa-file-lines', label: 'Docs' },
  { to: '/widgets', icon: 'fa-cubes', label: 'Widget' },
  { to: '/utilities', icon: 'fa-toolbox', label: 'Tools' },
];

/**
 * iOS-style bottom tab bar — mobile only.
 * - Animated active pill slide
 * - Haptic feedback on tap
 * - Safe-area aware
 * - Glass blur backdrop
 */
export default function BottomTab() {
  const location = useLocation();
  const haptic = useHaptic();

  const handleTap = useCallback(() => {
    haptic.light();
  }, [haptic]);

  const activeIndex = TABS.findIndex(t => t.to === location.pathname);
  const isHome = location.pathname === '/';

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-bottom-nav)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        borderTop: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.3rem 0.25rem',
        paddingBottom: 'var(--safe-bottom)',
        boxShadow: '0 -1px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Active pill background — slides with CSS */}
      <div style={{
        position: 'absolute',
        top: '4px',
        height: 'calc(100% - 8px - var(--safe-bottom))',
        width: `${100 / TABS.length}%`,
        transform: `translateX(${activeIndex * 100}%)`,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: 'calc(100% - 16px)',
          height: '100%',
          background: 'rgba(0, 212, 255, 0.08)',
          borderRadius: '16px',
        }} />
      </div>

      {TABS.map((tab, i) => {
        const active = i === activeIndex;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            onClick={handleTap}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '0.3rem 0.4rem',
              minWidth: '56px',
              minHeight: '48px',
              justifyContent: 'center',
              color: active ? 'var(--accent)' : 'var(--text-dim)',
              textDecoration: 'none',
              position: 'relative',
              zIndex: 1,
              WebkitTapHighlightColor: 'transparent',
              transition: 'color 0.2s ease',
            }}
          >
            {/* Icon with scale bounce */}
            <motion.i
              className={`fas ${tab.icon}`}
              animate={{
                scale: active ? 1.15 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              style={{
                fontSize: '1.35rem',
                lineHeight: 1,
              }}
            />

            {/* Label */}
            <motion.span
              animate={{
                opacity: active ? 1 : 0.65,
                fontWeight: active ? 600 : 400,
              }}
              style={{
                fontSize: '0.58rem',
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {tab.label}
            </motion.span>

            {/* Active dot — only show for non-Home tabs as subtle indicator */}
            {active && !isHome && (
              <motion.div
                layoutId="bottom-tab-dot"
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  position: 'absolute',
                  bottom: '-2px',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
