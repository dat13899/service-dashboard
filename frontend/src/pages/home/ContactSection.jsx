/* ── Contact Section (Telegram-style glass) ── */

const LINKS = [
  { icon: 'fab fa-github', url: 'https://github.com/dat13899' },
  { icon: 'fas fa-envelope', url: 'mailto:datel1389@gmail.com' },
];

export default function ContactSection({ toast }) {
  return (
    <section id="contact-section" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--text-strong)', marginBottom: '1rem' }}>
          <span style={{ marginRight: 8 }}>📫</span> Contact
        </h2>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {LINKS.map(link => (
            <a key={link.url} href={link.url}
              target={link.icon.includes('github') ? '_blank' : undefined}
              rel={link.icon.includes('github') ? 'noopener' : undefined}
              style={{
                fontSize: '1.15rem', color: 'var(--text-dim)', transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; }}
            >
              <i className={link.icon} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
