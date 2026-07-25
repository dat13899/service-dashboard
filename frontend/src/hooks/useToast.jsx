import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = useCallback((msg, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts(t => [...t, { id, msg, type }]);
    timers.current[id] = setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}
            onClick={() => remove(t.id)}
            style={{
              pointerEvents: 'auto', cursor: 'pointer',
              animation: 'slideIn .25s ease',
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
