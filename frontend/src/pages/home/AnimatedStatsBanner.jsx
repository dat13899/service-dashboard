import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

function CountUp({ end, duration = 2, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / (duration * 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function AnimatedStatsBanner({ services }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const running = services.filter(s => s.status === 'running').length;

  const stats = [
    { value: running, label: 'Services Online', icon: '🟢', suffix: '' },
    { value: 24, label: 'Uptime (h)', icon: '⏱', suffix: 'h' },
    { value: 1428, label: 'AI Requests', icon: '🤖', suffix: '' },
    { value: 7, label: 'Microservices', icon: '⚡', suffix: '' },
  ];

  return (
    <section ref={ref} style={{ padding: '0 1.5rem 3rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
        }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
            className="card"
            style={{ textAlign: 'center', padding: '1.2rem 1rem', overflow: 'hidden' }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-strong)',
              background: 'linear-gradient(135deg, var(--text-strong), var(--accent))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              <CountUp end={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
