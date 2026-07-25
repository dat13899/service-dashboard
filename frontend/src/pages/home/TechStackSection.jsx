import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const BADGES = [
  { label: 'Cloudflare DNS · CDN · Tunnel', url: 'https://www.cloudflare.com' },
  { label: 'Node.js 24', url: 'https://nodejs.org' },
  { label: 'Nginx', url: 'https://nginx.org' },
  { label: 'React + Vite', url: null },
  { label: 'MongoDB', url: 'https://www.mongodb.com' },
  { label: 'Docker', url: 'https://www.docker.com' },
  { label: 'GitHub Actions', url: 'https://github.com/features/actions' },
  { label: 'RAG Pipeline', url: null },
];

const badgeBase = {
  background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)', padding: '0.35rem 0.9rem',
  borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500,
  color: 'var(--text)', display: 'inline-block', cursor: 'default',
};

export default function TechStackSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="stack-section" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 1200, margin: '0 auto' }}
      >
        <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--text-strong)', marginBottom: '1rem' }}>
          <span style={{ marginRight: 8 }}>🛠</span> Tech Stack
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', maxWidth: 600, margin: '0 auto' }}>
          {BADGES.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
              whileHover={{ y: -3, background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}
            >
              {badge.url ? (
                <a href={badge.url} target="_blank" rel="noopener"
                  style={{ ...badgeBase, textDecoration: 'none', cursor: 'pointer' }}
                >{badge.label}</a>
              ) : (
                <span style={badgeBase}>{badge.label}</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
