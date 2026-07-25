import { useCallback } from 'react';

/**
 * Touch ripple hook — Material-style ripple on press.
 * Usage: <div {...rippleHandlers()} className="ripple-container">...</div>
 */
export function useRipple() {
  const createRipple = useCallback((e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left - size / 2;
    const y = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, []);

  return {
    onMouseDown: createRipple,
    onTouchStart: createRipple,
  };
}
