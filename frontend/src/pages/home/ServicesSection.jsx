import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

function ServiceCard3D({ svc: s, health: h, statusColor, uptime, onToggle }) {
  const ref = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState(false);
  const running = s.status === 'running';

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * 8, y: x * 8 });
    setGlow(true);
  };

  const handleLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlow(false);
  };

  return (
    <motion.div
      ref={ref}
      className="card rotating-border"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        overflow: 'hidden',
        transform: `perspective(600px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 0.1s ease, box-shadow 0.3s ease',
      }}
      whileHover={{ y: -4 }}
    >
      <div style={{ padding: '1rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: statusColor(s),
              boxShadow: running ? `0 0 10px ${statusColor(s)}` : 'none',
              animation: running ? 'aiPulse 2s ease-in-out infinite' : 'none',
            }} />
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-strong)' }}>{s.name || s.id}</strong>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: h?.status === 'ok' ? 'var(--green)' : h?.status === 'error' ? 'var(--red)' : 'var(--text-dim)',
              animation: h?.status === 'ok' ? 'aiPulse 2s infinite' : 'none',
            }} />
          </div>
          <span style={{
            fontSize: '0.68rem', padding: '0.1rem 0.5rem', borderRadius: 6,
            background: 'var(--surface-2)', color: 'var(--text-dim)',
            border: '1px solid var(--glass-border)',
          }}>{s.port ? `:${s.port}` : '—'}</span>
        </div>

        {s.description && <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.4, marginBottom: '0.4rem' }}>{s.description}</p>}

        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
          {running ? '🟢 Running' : s.status === 'error' ? '🔴 Error' : '⚪ Stopped'}
          {running && uptime(s) ? ` ⏱ ${uptime(s)}` : ''}
        </p>

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button onClick={() => onToggle(s, 'start')} disabled={running} className="btn btn-primary btn-sm">▶ Start</button>
          <button onClick={() => onToggle(s, 'stop')} disabled={!running} className="btn btn-glass btn-sm"
            style={running ? { color: 'var(--red)' } : undefined}>■ Stop</button>
          <button onClick={() => onToggle(s, 'restart')} disabled={!running} className="btn btn-glass btn-sm">↻ Restart</button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesSection({ services, loading, healthMap, statusColor, uptime, onToggle }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const running = services.filter(s => s.status === 'running').length;
  const stopped = services.filter(s => s.status !== 'running').length;

  return (
    <section ref={ref} id="services-section" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--text-strong)', marginBottom: '1rem' }}
        >
          <span style={{ marginRight: 8 }}>📦</span> Services
        </motion.h2>

        {/* Status bar pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', padding: '0.75rem 1.2rem', marginBottom: '1rem',
            background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem', boxShadow: '0 4px 24px var(--glass-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{running}</span> running
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-dim)' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{stopped}</span> stopped
          </div>
        </motion.div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[1, 2].map(i => (
              <div key={i} className="card"><div style={{ padding: '1rem' }}><div className="skeleton" style={{ height: 80 }} /></div></div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <motion.div
            className="card"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>Chưa có service</div>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
              >
                <ServiceCard3D svc={s} health={healthMap[s.id]} statusColor={statusColor} uptime={uptime} onToggle={onToggle} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
