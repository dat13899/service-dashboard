import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Pull-to-refresh hook for mobile.
 * Usage: const { containerRef, refreshing, indicatorStyle } = usePullToRefresh(onRefresh);
 */
export function usePullToRefresh(onRefresh) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullState, setPullState] = useState('idle'); // idle | pulling | ready | refreshing
  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0 || startY.current === 0) return;

    const delta = e.touches[0].clientY - startY.current;
    if (delta > 50) {
      setPullState('ready');
    } else if (delta > 10) {
      setPullState('pulling');
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    startY.current = 0;
    if (pullState === 'ready' && !refreshing) {
      setRefreshing(true);
      setPullState('refreshing');
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullState('idle');
      }
    } else {
      setPullState('idle');
    }
  }, [pullState, refreshing, onRefresh]);

  const indicatorStyle = {
    pulling: 'pulling',
    ready: 'pulling',
    refreshing: 'refreshing',
    idle: '',
  }[pullState];

  return {
    containerRef,
    refreshing,
    indicatorStyle,
    listeners: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
