/* ── Tech Stack Section (Telegram-style glass) ── */

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

const badgeStyle = {
  background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)', padding: '0.35rem 0.9rem',
  borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500,
  color: 'var(--text)', display: 'inline-block',
};

export default function TechStackSection() {
  return (
    <section id="stack-section" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--text-strong)', marginBottom: '1rem' }}>
          <span style={{ marginRight: 8 }}>🛠</span> Tech Stack
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', maxWidth: 600, margin: '0 auto' }}>
          {BADGES.map(badge => (
            badge.url ? (
              <a key={badge.label} href={badge.url} target="_blank" rel="noopener"
                style={{ ...badgeStyle, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >{badge.label}</a>
            ) : (
              <span key={badge.label} style={badgeStyle}>{badge.label}</span>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
