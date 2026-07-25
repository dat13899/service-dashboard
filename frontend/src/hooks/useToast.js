import { useState, useEffect, useCallback, useRef } from 'react';

let toastId = 0;

/** Standalone toast hook — use when NOT inside ToastProvider context.
 *  Returns toast(msg, type?, duration?) function.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 250);
  }, []);

  const toast = useCallback((msg, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts(t => [...t, { id, msg, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  return toast;
}
