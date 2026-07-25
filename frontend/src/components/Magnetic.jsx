import { useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';

/**
 * Magnetic wrapper — child element gently follows the cursor when hovered.
 * Props: strength (0–1, default 0.3), children
 *
 * Usage:
 * <Magnetic><button>Click me</button></Magnetic>
 * <Magnetic strength={0.5}><div className="card">...</div></Magnetic>
 */
export default function Magnetic({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const maxDistance = 40 * strength; // max pixels of pull

  const handleMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < 150) {
      const pull = Math.max(0, 1 - distance / 150);
      setPosition({
        x: distX * pull * strength * 1.5,
        y: distY * pull * strength * 1.5,
      });
    }
  }, [strength]);

  const handleLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', damping: 15, stiffness: 200, mass: 0.1 }}
      style={{ display: 'inline-block' }}
    >
      {children}
    </motion.div>
  );
}
