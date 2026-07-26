/**
 * Haptic feedback hook for mobile.
 * Uses navigator.vibrate (Android) + safe fallback.
 *
 * Usage:
 *   const haptic = useHaptic();
 *   haptic.light(); // tap feedback
 *   haptic.success(); // action complete
 */
export function useHaptic() {
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = (pattern) => {
    if (canVibrate) {
      try { navigator.vibrate(pattern); } catch {}
    }
  };

  return {
    /** 10ms — subtle tap */
    light: () => vibrate(10),
    /** 20ms — standard press */
    medium: () => vibrate(20),
    /** 40ms — heavy action */
    heavy: () => vibrate(40),
    /** Double pulse — success */
    success: () => vibrate([10, 50, 20]),
    /** Triple pulse — error */
    error: () => vibrate([30, 50, 30, 50, 50]),
    /** Long vibration — warning */
    warning: () => vibrate([20, 80, 40]),
    /** Selection tick */
    selection: () => vibrate(15),
  };
}
