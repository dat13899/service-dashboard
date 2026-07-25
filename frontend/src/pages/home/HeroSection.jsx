/* ── Home Hero Section ── */

const TAGLINES = [
  'Chạy home lab 24/7',
  'Tự động hóa với AI',
  'Minecraft server luôn online',
  'DevOps không cần ops',
];

export default function HeroSection({ displayedText, scrollTo }) {
  return (
    <section className="hero home-hero">
      <div className="hero-container">
        <div className="hero-greeting">
          <span className="hero-gradient-text">👋 BT Dat</span>
        </div>

        <div className="hero-tagline">
          <span className="hero-tagline-text">
            {displayedText}
            <span className="typing-cursor" />
          </span>
        </div>

        <p className="hero-subtitle">
          Minecraft server, AI tool, và các self-hosted service chạy 24/7.
        </p>

        <div className="hero-tags">
          {['Node.js', 'Cloudflare', 'Minecraft', 'RAG', 'AI'].map(t => (
            <span key={t} className="hero-tag">{t}</span>
          ))}
        </div>

        <a href="/dashboard" className="hero-cta">
          Dashboard <span>→</span>
        </a>

        <div className="hero-nav-anchors">
          {[
            { label: 'Services', target: 'services-section' },
            { label: 'Stack', target: 'stack-section' },
            { label: 'Contact', target: 'contact-section' },
          ].map(link => (
            <button key={link.target} onClick={() => scrollTo(link.target)} className="hero-nav-link">
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
