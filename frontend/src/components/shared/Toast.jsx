import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const ToastCtx = createContext(null);
let _id = 0;

const ICONS = {
  success: 'fa-check-circle',
  error: 'fa-circle-exclamation',
  info: 'fa-info-circle',
  warning: 'fa-triangle-exclamation',
};

const COLORS = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#00d4ff',
  warning: '#f59e0b',
};

/**
 * Liquid-glass toast provider. Renders floating glass toasts top-right.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 300);
  }, []);

  const toast = useCallback((msg, type = 'info', duration = 3500) => {
    const id = ++_id;
    setToasts(t => [...t, { id, msg, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', top: 'calc(var(--navbar-height) + 0.5rem)', right: '0.75rem',
        zIndex: 3000, display: 'flex', flexDirection: 'column', gap: '0.5rem',
        pointerEvents: 'none', maxWidth: 'min(360px, 90vw)',
      }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={() => dismiss(t.id)}
              className="liquid-panel"
              style={{
                pointerEvents: 'auto', cursor: 'pointer',
                padding: '0.65rem 0.9rem',
                fontSize: '0.82rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${COLORS[t.type]}20 inset`,
              }}
            >
              <span style={{
                width: '24px', height: '24px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${COLORS[t.type]}18`,
                flexShrink: 0,
              }}>
                <i className={`fas ${ICONS[t.type] || ICONS.info}`} style={{ color: COLORS[t.type], fontSize: '0.75rem' }} />
              </span>
              <span style={{ color: 'var(--text)', lineHeight: 1.3 }}>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
