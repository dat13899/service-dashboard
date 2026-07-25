/**
 * AI Active badge — pulsing green dot with ripple + label.
 * Props: pulse (default true), size (sm/md/lg)
 */
export default function AIBadge({ pulse = true, size = 'md' }) {
  const sizes = { sm: 6, md: 8, lg: 10 };
  const fontSize = { sm: '0.6rem', md: '0.7rem', lg: '0.8rem' };
  const d = sizes[size];

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
      borderRadius: 'var(--radius-full)', padding: '0.2rem 0.7rem',
      fontSize: fontSize[size], fontWeight: 600, color: 'var(--green)',
    }}>
      <span style={{
        position: 'relative', display: 'inline-flex',
      }}>
        <span style={{
          width: d, height: d, borderRadius: '50%', background: 'var(--green)',
          display: 'inline-block',
          animation: pulse ? 'aiPulse 2s ease-in-out infinite' : 'none',
        }} />
        {pulse && <span style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%', background: 'var(--green)',
          animation: 'aiRipple 2s ease-out infinite',
          opacity: 0,
        }} />}
      </span>
      AI Active
    </div>
  );
}
