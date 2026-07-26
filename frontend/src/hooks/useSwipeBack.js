import { useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Swipe-back navigation for mobile.
 * Swipe right from left edge → go back.
 *
 * Usage: const { containerRef } = useSwipeBack({ enabled: true });
 * Attach containerRef to page wrapper.
 */
export function useSwipeBack({ enabled = true, threshold = 80, edgeWidth = 30 } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const indicatorRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    // Only trigger from left edge
    if (touch.clientX > edgeWidth) return;
    // Don't swipe on homepage
    if (location.pathname === '/') return;

    startX.current = touch.clientX;
    startY.current = touch.clientY;
    swiping.current = true;
  }, [edgeWidth, location.pathname]);

  const handleTouchMove = useCallback((e) => {
    if (!swiping.current) return;
    const touch = e.touches[0];
    currentX.current = touch.clientX - startX.current;
    const deltaY = Math.abs(touch.clientY - startY.current);

    // Cancel if vertical scroll dominates
    if (deltaY > Math.abs(currentX.current) * 1.5) {
      swiping.current = false;
      return;
    }

    // Only right swipe
    if (currentX.current > 0) {
      if (indicatorRef.current) {
        const progress = Math.min(currentX.current / threshold, 1);
        indicatorRef.current.style.opacity = progress;
        indicatorRef.current.style.transform = `translateY(-50%) translateX(${Math.min(currentX.current - 16, 40)}px)`;
      }
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!swiping.current) return;
    swiping.current = false;

    if (currentX.current > threshold) {
      navigate(-1);
    }

    // Reset indicator
    if (indicatorRef.current) {
      indicatorRef.current.style.opacity = '0';
      indicatorRef.current.style.transform = 'translateY(-50%) translateX(-16px)';
    }
    currentX.current = 0;
  }, [navigate, threshold]);

  // Create and mount indicator element
  useEffect(() => {
    if (!enabled) return;

    // Don't create on homepage
    if (location.pathname === '/') return;

    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      left: 0;
      top: 50%;
      transform: translateY(-50%) translateX(-16px);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--glass-bg);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-dim);
      font-size: 1rem;
      opacity: 0;
      z-index: 600;
      pointer-events: none;
      transition: opacity 0.15s ease;
    `;
    el.textContent = '←';
    document.body.appendChild(el);
    indicatorRef.current = el;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.remove();
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, location.pathname, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isSupported: true };
}
