import { useEffect, useRef, useState } from 'react';

/**
 * Glitch text effect — RGB shift + skew jitter, cyberpunk vibe.
 * Props: text, className, as (tag), active (default true)
 */
export default function GlitchText({ text, className = '', as: Tag = 'h1', active = true, style = {} }) {
  const [glitching, setGlitching] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!active) return;
    const trigger = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
      timer.current = setTimeout(trigger, 3000 + Math.random() * 4000);
    };
    timer.current = setTimeout(trigger, 2000);
    return () => clearTimeout(timer.current);
  }, [active]);

  const base = {
    position: 'relative',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
    ...style,
  };

  if (!glitching || !active) {
    return <Tag className={className} style={base}>{text}</Tag>;
  }

  return (
    <Tag className={className} style={{ ...base, position: 'relative' }}>
      <span aria-hidden="true" style={{
        position: 'absolute', inset: 0, color: '#ff006e',
        clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
        transform: 'translate(-2px, 1px)',
        opacity: 0.9,
      }}>{text}</span>
      <span aria-hidden="true" style={{
        position: 'absolute', inset: 0, color: '#00f0ff',
        clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
        transform: 'translate(2px, -1px)',
        opacity: 0.8,
      }}>{text}</span>
      <span style={{
        background: 'linear-gradient(135deg, var(--text-strong) 30%, var(--accent) 70%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'blur(0.3px)',
      }}>{text}</span>
    </Tag>
  );
}
