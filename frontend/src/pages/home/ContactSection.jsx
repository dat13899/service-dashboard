/* ── Contact Section ── */
const LINKS = [
  { icon: 'fab fa-github', url: 'https://github.com/btdat' },
  { icon: 'fas fa-envelope', url: 'mailto:datel1389@gmail.com' },
];

export default function ContactSection({ toast }) {
  return (
    <section id="contact-section" className="section home-section">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h2 className="section-title"><span>📫</span> Contact</h2>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          {LINKS.map(link => (
            <a key={link.url} href={link.url} target={link.icon === 'fab fa-github' ? '_blank' : undefined}
              rel={link.icon === 'fab fa-github' ? 'noopener' : undefined}
              className="contact-link">
              <i className={link.icon} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
