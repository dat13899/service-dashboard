import { useRef, useMemo } from 'react';
import { useInView, motion } from 'motion/react';

/**
 * NeuralNodes — hiển thị services như nodes trong AI neural network.
 * Props: services (array), loading, healthMap, statusColor, uptime, onToggle
 */
export default function NeuralNodes({ services = [], loading, healthMap, statusColor, uptime, onToggle }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const running = services.filter(s => s.status === 'running').length;
  const total = services.length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: '3px solid var(--accent)', borderTopColor: 'transparent',
          animation: 'spin 0.6s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800,
          color: 'var(--text-strong)', marginBottom: '0.25rem',
        }}>
          <span style={{ color: 'var(--accent)' }}>●</span> Live Services
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          {running}/{total} nodes active
        </p>
      </div>

      {/* Neural grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem', maxWidth: 1100, margin: '0 auto',
        padding: '0 1rem', position: 'relative', zIndex: 1,
      }}>
        {services.map((svc, i) => (
          <motion.div
            key={svc.id}
            className="liquid-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.08 * i, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: svc.status === 'running'
                ? 'rgba(34,197,94,0.08)'
                : undefined,
              border: svc.status === 'running'
                ? '1px solid rgba(34,197,94,0.2)'
                : undefined,
              cursor: 'default',
              position: 'relative', overflow: 'hidden',
              padding: '1rem',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Pulse ring for running services */}
            {svc.status === 'running' && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 10, height: 10, borderRadius: '50%',
                background: '#00ccff',
                boxShadow: '0 0 8px rgba(34,197,94,0.5), 0 0 16px rgba(34,197,94,0.2)',
                animation: 'aiPulse 2s ease-in-out infinite',
              }} />
            )}

            <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>
              {svc.status === 'running' ? '🟢' : '⚫'}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-strong)', marginBottom: '0.15rem' }}>
              {svc.name || svc.id}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
              {svc.status === 'running' && uptime?.(svc)
                ? `Uptime: ${uptime(svc)}`
                : svc.status === 'running' ? 'Running...' : 'Stopped'}
            </div>

            {/* Health bar */}
            {healthMap[svc.id] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                <div style={{
                  flex: 1, height: 3, background: 'rgba(255,255,255,0.1)',
                  borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${healthMap[svc.id].cpu || 0}%`,
                    background: 'var(--accent)', borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                CPU {healthMap[svc.id].cpu ?? '?'}%
              </div>
            )}

            {/* Toggle button */}
            <button
              className={`liquid-btn sm ${svc.status === 'running' ? 'danger' : 'primary'}`}
              onClick={(e) => { e.stopPropagation(); onToggle?.(svc, svc.status === 'running' ? 'stop' : 'start'); }}
              style={{ marginTop: '0.6rem', width: '100%' }}
            >
              {svc.status === 'running' ? 'Stop' : 'Start'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Connection lines SVG */}
      <svg style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0, opacity: 0.08,
      }}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00d4ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {services.length > 1 && Array.from({ length: Math.min(services.length * 2, 12) }).map((_, i) => (
          <line
            key={i}
            x1={`${15 + Math.sin(i * 1.7) * 35}%`}
            y1={`${20 + Math.cos(i * 2.1) * 30}%`}
            x2={`${55 + Math.cos(i * 1.3) * 35}%`}
            y2={`${40 + Math.sin(i * 2.5) * 30}%`}
            stroke="url(#lineGrad)"
            strokeWidth="0.5"
          />
        ))}
      </svg>
    </div>
  );
}
