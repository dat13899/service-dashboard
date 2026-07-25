import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

/**
 * Terminal Contact — fake SSH terminal UI with typing effect.
 */
const COMMANDS = [
  { input: 'ssh btdat@home-lab', output: 'Connecting to btdat.io.vn... ✓' },
  { input: 'whoami', output: 'dat — developer / homelab operator' },
  { input: 'uptime', output: '24/7 since 2023. Zero major outages.' },
  { input: 'cat /etc/contact', output: 'Email: dat@btdat.io.vn | GitHub: dat13899 | Telegram: @tiendat' },
];

export default function TerminalContact({ toast }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentCmd, setCurrentCmd] = useState(0);
  const [typing, setTyping] = useState('');
  const [charIdx, setCharIdx] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const containerRef = useRef(null);
  const done = visibleLines.length >= COMMANDS.length;

  useEffect(() => {
    if (currentCmd >= COMMANDS.length) return;
    const cmd = COMMANDS[currentCmd];

    if (charIdx < cmd.input.length) {
      const t = setTimeout(() => {
        setTyping(cmd.input.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 50);
      return () => clearTimeout(t);
    }

    if (!showOutput) {
      const t = setTimeout(() => setShowOutput(true), 300);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setVisibleLines(v => [...v, currentCmd]);
      setCurrentCmd(c => c + 1);
      setTyping('');
      setCharIdx(0);
      setShowOutput(false);
    }, 500);
    return () => clearTimeout(t);
  }, [currentCmd, charIdx, showOutput]);

  const copyEmail = (email) => {
    navigator.clipboard?.writeText(email);
    toast?.('Đã copy email!', 'success');
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      style={{
        maxWidth: 650, margin: '0 auto', padding: '1.5rem',
        background: 'rgba(10,14,23,0.85)',
        border: '1px solid rgba(52,211,153,0.15)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
        backdropFilter: 'blur(12px)', position: 'relative',
        boxShadow: '0 0 40px rgba(52,211,153,0.05)',
      }}
    >
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem',
        paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ccff' }} />
        <span style={{ marginLeft: '0.5rem', color: 'var(--text-dim)', fontSize: '0.65rem' }}>
          dat@home-lab:~/
        </span>
      </div>

      {/* Terminal lines */}
      {visibleLines.map((idx) => (
        <div key={idx} style={{ marginBottom: '0.5rem', lineHeight: 1.6 }}>
          <div style={{ color: '#00d4ff' }}>
            <span style={{ color: 'var(--text-dim)' }}>$ </span>
            {COMMANDS[idx].input}
          </div>
          <div style={{ color: 'var(--text-dim)', paddingLeft: '0.8rem' }}>
            {COMMANDS[idx].output}
          </div>
        </div>
      ))}

      {/* Current typing line */}
      {currentCmd < COMMANDS.length && (
        <div style={{ marginBottom: '0.5rem', lineHeight: 1.6 }}>
          <div style={{ color: '#00d4ff' }}>
            <span style={{ color: 'var(--text-dim)' }}>$ </span>
            {typing}
            <span style={{
              display: 'inline-block', width: 7, height: 14,
              background: 'var(--accent)', marginLeft: 1,
              animation: 'blink 0.7s steps(1) infinite',
            }} />
          </div>
          {showOutput && (
            <div style={{ color: 'var(--text-dim)', paddingLeft: '0.8rem', animation: 'fadeIn 0.3s ease' }}>
              {COMMANDS[currentCmd].output}
            </div>
          )}
        </div>
      )}

      {/* Done — show contact actions */}
      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginBottom: '0.5rem' }}>
            # Quick connect:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'GitHub', url: 'https://github.com/dat13899' },
              { label: 'Email', action: () => copyEmail('dat@btdat.io.vn') },
              { label: 'Telegram', url: 'https://t.me/tiendat' },
            ].map(btn => (
              btn.url ? (
                <a
                  key={btn.label}
                  href={btn.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent)', textDecoration: 'none',
                    fontSize: '0.7rem', padding: '0.3rem 0.7rem',
                    border: '1px solid rgba(52,211,153,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(52,211,153,0.1)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(52,211,153,0.2)';
                  }}
                >
                  {btn.label}
                </a>
              ) : (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  style={{
                    background: 'transparent', border: '1px solid rgba(52,211,153,0.2)',
                    color: 'var(--accent)', fontSize: '0.7rem', padding: '0.3rem 0.7rem',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(52,211,153,0.1)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(52,211,153,0.2)';
                  }}
                >
                  {btn.label}
                </button>
              )
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
