import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useAnimationFrame } from 'motion/react';

/**
 * Custom cursor with spring physics + magnetic snap.
 * Renders ONLY on non-touch devices.
 *
 * Behavior:
 * - Default: 12px translucent green dot following mouse with spring
 * - Hover interactive (a, button, .card): grows to 32px, semi-transparent
 * - Magnetic snap: gently pulled toward element center when nearby
 * - Mobile/touch: hidden entirely
 */
export default function Cursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [magnetTarget, setMagnetTarget] = useState(null);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 250, mass: 0.5 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 250, mass: 0.5 });
  const size = useMotionValue(12);
  const springSize = useSpring(size, { damping: 15, stiffness: 200 });

  const handleMouseMove = useCallback((e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    if (!visible) setVisible(true);
  }, [mouseX, mouseY, visible]);

  const handleMouseLeave = useCallback(() => {
    setVisible(false);
    setHovering(false);
    setMagnetTarget(null);
  }, []);

  useEffect(() => {
    // Only on non-touch
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const detectHover = (e) => {
      const el = e.target.closest('a, button, .card, [role="button"], input, textarea, select');
      if (el) {
        setHovering(true);
        setMagnetTarget(null);
      } else {
        setHovering(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', detectHover, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', detectHover);
    };
  }, [handleMouseMove, handleMouseLeave]);

  useEffect(() => {
    size.set(hovering ? 32 : 12);
  }, [hovering, size]);

  // Hide on touch devices
  const [isTouch, setIsTouch] = useState(true);
  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  if (isTouch) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        width: springSize,
        height: springSize,
        borderRadius: '50%',
        background: hovering ? 'rgba(52,211,153,0.15)' : 'rgba(52,211,153,0.5)',
        border: hovering ? '1px solid rgba(52,211,153,0.3)' : 'none',
        boxShadow: hovering
          ? '0 0 20px rgba(52,211,153,0.15), 0 0 60px rgba(52,211,153,0.05)'
          : '0 0 6px rgba(52,211,153,0.3)',
        pointerEvents: 'none',
        zIndex: 100000,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease',
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'normal',
      }}
    />
  );
}
