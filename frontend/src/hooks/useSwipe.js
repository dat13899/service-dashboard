import { useState, useRef, useCallback } from 'react';

/**
 * Swipe-to-dismiss hook for mobile cards.
 * Usage: const { handlers, style, swiped } = useSwipe({ onSwipeLeft, onSwipeRight });
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 80 }) {
  const [swiping, setSwiping] = useState(false);
  const [swipeDir, setSwipeDir] = useState(null);
  const [swiped, setSwiped] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!swiping) return;
    currentX.current = e.touches[0].clientX - startX.current;
    if (Math.abs(currentX.current) > 10) {
      setSwipeDir(currentX.current > 0 ? 'right' : 'left');
    }
  }, [swiping]);

  const handleTouchEnd = useCallback(() => {
    setSwiping(false);
    if (Math.abs(currentX.current) > threshold) {
      setSwiped(true);
      if (currentX.current > 0 && onSwipeRight) onSwipeRight();
      if (currentX.current < 0 && onSwipeLeft) onSwipeLeft();
    }
    setSwipeDir(null);
    currentX.current = 0;
  }, [threshold, onSwipeLeft, onSwipeRight]);

  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  const style = swiping
    ? { transform: `translateX(${currentX.current}px) rotate(${currentX.current * 0.03}deg)` }
    : {};

  const activeAction = swipeDir === 'left' ? 'right' : swipeDir === 'right' ? 'left' : null;

  return { handlers, style, swiped, activeAction };
}
