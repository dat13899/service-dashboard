import { useEffect, useRef } from 'react';

/**
 * 3D wireframe sphere — pure Canvas 2D, rotates infinitely.
 * No Three.js needed. ~3KB, GPU-friendly.
 * Props: width, height, color, speed, opacity
 */
export default function WireframeSphere({ width = 400, height = 400, color = 'rgba(52,211,153,0.4)', speed = 0.005, opacity = 0.6 }) {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = width * dpr;
    c.height = height * dpr;
    ctx.scale(dpr, dpr);

    const cx = width / 2, cy = height / 2, r = Math.min(cx, cy) * 0.7;
    const rings = 14;
    const pointsPerRing = 32;
    let angle = 0;
    let animFrame;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = opacity;

      for (let i = 0; i < rings; i++) {
        const phi = (i / (rings - 1)) * Math.PI;
        ctx.beginPath();
        for (let j = 0; j <= pointsPerRing; j++) {
          const theta = (j / pointsPerRing) * Math.PI * 2;
          const x3 = r * Math.sin(phi) * Math.cos(theta);
          const y3 = r * Math.cos(phi);
          const z3 = r * Math.sin(phi) * Math.sin(theta);
          // Rotate around Y axis
          const rx = x3 * Math.cos(angle) - z3 * Math.sin(angle);
          const rz = x3 * Math.sin(angle) + z3 * Math.cos(angle);
          // Perspective projection
          const scale = 200 / (200 + rz);
          const px = cx + rx * scale;
          const py = cy + y3 * scale;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      angle += speed;
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [width, height, color, speed, opacity]);

  return <canvas ref={ref} style={{ width, height, pointerEvents: 'none' }} />;
}
