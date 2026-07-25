/* ── Home Hero Section (Telegram-style glass) ── */

export default function HeroSection({ displayedText, scrollTo }) {
  return (
    <section style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '4rem 1.5rem 2.5rem', minHeight: '100dvh',
    }}>
      <div style={{ maxWidth: 700, padding: '0 1rem' }}>
        {/* Gradient greeting */}
        <div style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 800, marginBottom: '0.25rem' }}>
          <span style={{
            background: 'linear-gradient(135deg, var(--text-strong), var(--accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>👋 BT Dat</span>
        </div>

        {/* Typing tagline */}
        <div style={{ minHeight: '2rem', marginBottom: '0.5rem' }}>
          <span style={{
            color: 'var(--text-dim)', fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)',
          }}>
            {displayedText}
            <span style={{
              display: 'inline-block', width: 2, height: '1.1em',
              background: 'var(--accent)', marginLeft: 2, verticalAlign: 'text-bottom',
              animation: 'blink 0.8s steps(1) infinite',
            }} />
          </span>
        </div>

        {/* Subtitle */}
        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
          Minecraft server, AI tool, và các self-hosted service chạy 24/7.
        </p>

        {/* Hero tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {['Node.js', 'Cloudflare', 'Minecraft', 'RAG', 'AI'].map(t => (
            <span key={t} style={{
              background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-full)',
              padding: '0.15rem 0.7rem', fontSize: '0.7rem', fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>

        {/* CTA */}
        <a href="/dashboard" style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: 'var(--radius-sm)', padding: '0.6rem 1.5rem',
          fontWeight: 600, textDecoration: 'none', display: 'inline-block',
          fontSize: '0.9rem', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(129,140,248,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Dashboard <span style={{ marginLeft: 6 }}>→</span>
        </a>

        {/* Anchor links */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {[
            { label: 'Services', target: 'services-section' },
            { label: 'Stack', target: 'stack-section' },
            { label: 'Contact', target: 'contact-section' },
          ].map(link => (
            <button key={link.target} onClick={() => scrollTo(link.target)} style={{
              background: 'transparent', border: 'none', color: 'var(--text-dim)',
              fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline',
              textUnderlineOffset: 3, opacity: 0.7,
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.opacity = '0.7'; }}
            >{link.label}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
