import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

/** Toast Provider — wraps app to provide toast context. */
const ToastCtx = createContext(null);
let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 250);
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
        position: 'fixed', top: '0.75rem', right: '0.75rem',
        zIndex: 3000, display: 'flex', flexDirection: 'column', gap: '0.5rem',
        pointerEvents: 'none', maxWidth: 'min(360px, 90vw)',
      }}>
        {toasts.map(t => (
          <div key={t.id} onClick={() => dismiss(t.id)}
            style={{
              pointerEvents: 'auto', cursor: 'pointer',
              padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500,
              color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              background: t.type === 'success' ? 'var(--green)' : t.type === 'error' ? 'var(--red)' : 'var(--accent)',
              animation: t.leaving ? 'slideInRight 0.2s ease reverse forwards' : 'slideInRight 0.25s ease',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <i className={`fas ${t.type === 'success' ? 'fa-check-circle' : t.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`} />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
