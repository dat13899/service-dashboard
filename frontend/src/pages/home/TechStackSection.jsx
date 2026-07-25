/* ── Tech Stack Section ── */
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

export default function TechStackSection() {
  return (
    <section id="stack-section" className="section home-section text-center">
      <div className="container">
        <h2 className="section-title"><span>🛠</span> Tech Stack</h2>
        <div className="tech-badges">
          {BADGES.map(badge => (
            badge.url ? (
              <a key={badge.label} href={badge.url} target="_blank" rel="noopener" className="tech-badge tech-badge-link">
                {badge.label}
              </a>
            ) : (
              <span key={badge.label} className="tech-badge">{badge.label}</span>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
