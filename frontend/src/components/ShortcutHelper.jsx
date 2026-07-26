import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], desc: 'Open command palette' },
  { keys: ['?'], desc: 'Show keyboard shortcuts (this menu)' },
  { keys: ['Esc'], desc: 'Close any overlay' },
  { keys: ['↑', '↓'], desc: 'Navigate command palette / shortcuts' },
  { keys: ['Enter'], desc: 'Select command / confirm' },
];

/**
 * Hook to bind `?` key to show keyboard shortcuts.
 */
export function useShortcutHelper() {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(p => !p);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, close: () => setOpen(false) };
}

export default function ShortcutHelper({ open, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 5100,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="liquid-panel"
          style={{ width: '100%', maxWidth: '420px', padding: 0, overflow: 'hidden', margin: '0 1rem' }}
        >
          <div style={{
            padding: '0.75rem 1rem', borderBottom: '1px solid var(--liquid-border)',
            fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-strong)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <i className="fas fa-keyboard" style={{ color: 'var(--accent)' }} />
            Keyboard Shortcuts
          </div>
          <div style={{ padding: '0.5rem' }}>
            {SHORTCUTS.map(sc => (
              <div key={sc.desc} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)',
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{sc.desc}</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {sc.keys.map(k => (
                    <kbd key={k} style={{
                      background: 'rgba(255,255,255,0.08)', borderRadius: '4px',
                      padding: '0.1rem 0.4rem', fontSize: '0.65rem',
                      color: 'var(--text-dim)', fontFamily: 'var(--font-mono)',
                    }}>{k}</kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
