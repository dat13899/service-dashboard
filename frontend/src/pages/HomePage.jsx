import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { fetchServices } from '../services/api';

/* ───────────────────────────────────────────────
   HOOK: Boot Sequence
   ─────────────────────────────────────────────── */
const BOOT_LINES = [
  { msg: '▸ SYSTEM INITIALIZATION...', delay: 200 },
  { msg: '  ✓ BIOS v3.0 RETRO EDITION', delay: 300 },
  { msg: '  ✓ CPU: CORE i7 / 16GB RAM', delay: 250 },
  { msg: '▸ LOADING KERNEL...', delay: 350 },
  { msg: '  ✓ Linux 6.8 x86_64', delay: 200 },
  { msg: '  ✓ Memory: OK', delay: 200 },
  { msg: '  ✓ Disks: OK', delay: 200 },
  { msg: '▸ NETWORK INIT...', delay: 300 },
  { msg: '  ✓ IPv4: 192.168.1.x', delay: 200 },
  { msg: '  ✓ Tunnel: CLOUDFLARED ACTIVE', delay: 300 },
  { msg: '▸ STARTING SERVICES...', delay: 400 },
];

const BOOT_COMPLETE = '✓ All systems nominal. Press any key to continue.';

/* ───────────────────────────────────────────────
   HOOK: Typing effect
   ─────────────────────────────────────────────── */
function useTypewriter(text, speed = 30, onDone) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed('');
    setDone(false);
    const interval = setInterval(() => {
      if (idxRef.current < text.length) {
        setDisplayed(text.slice(0, idxRef.current + 1));
        idxRef.current++;
      } else {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

/* ───────────────────────────────────────────────
   Boot Sequence Overlay
   ─────────────────────────────────────────────── */
function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [current, setCurrent] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (current >= BOOT_LINES.length) {
      setTimeout(() => setTypingComplete(true), 300);
      return;
    }
    const t = setTimeout(() => {
      setVisibleLines(prev => [...prev, current]);
      setCurrent(c => c + 1);
    }, BOOT_LINES[current].delay);
    return () => clearTimeout(t);
  }, [current]);

  const { displayed: lastLine } = useTypewriter(
    typingComplete ? BOOT_COMPLETE : '',
    20,
    () => {
      setTimeout(() => {
        setFinished(true);
        setTimeout(onComplete, 300);
      }, 1000);
    }
  );

  if (finished) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#050805',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div style={{ maxWidth: 600, width: '100%' }}>
        <pre style={{ color: '#00ff41', fontSize: '0.55rem', lineHeight: 1.1, marginBottom: '1.5rem', textAlign: 'center' }}>
{`╔══╗╔═══╗╔══╗╔═══╗╔═══╗╔══╗╔═══╗
║  ║║   ║║  ║║   ║║   ║║  ║║   ║
║  ║║   ║║  ║║   ║║   ║║  ║║   ║
║  ║║   ║║  ║║   ║║   ║║  ║║   ║
╚══╝╚═══╝╚══╝╚═══╝╚═══╝╚══╝╚═══╝`}
        </pre>

        <div style={{ fontSize: '0.78rem', lineHeight: 1.7, color: '#00ff41' }}>
          {visibleLines.map((idx) => (
            <div key={idx}>{BOOT_LINES[idx].msg}</div>
          ))}
          {typingComplete && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>{lastLine}</span>
              {lastLine.length < BOOT_COMPLETE.length && (
                <span className="terminal-cursor" />
              )}
            </div>
          )}
          {!typingComplete && current >= BOOT_LINES.length && (
            <div><span className="terminal-cursor" style={{ width: 6, height: 14 }} /></div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   ASCII Logo
   ─────────────────────────────────────────────── */
function AsciiLogo() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <pre className="ascii-line" style={{ fontSize: 'clamp(0.35rem, 1.2vw, 0.55rem)', lineHeight: 1.1, textAlign: 'center', marginBottom: '0.5rem' }}>
{`╔══╗╔═══╗╔══╗╔═══╗╔═══╗╔══╗╔═══╗
║  ║║   ║║  ║║   ║║   ║║  ║║   ║
║  ║║   ║║  ║║   ║║   ║║  ║║   ║
║  ║║   ║║  ║║   ║║   ║║  ║║   ║
╚══╝╚═══╝╚══╝╚═══╝╚═══╝╚══╝╚═══╝`}
      </pre>
      <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
        Home Lab v3.0 / RETRO TERMINAL MODE
        <span style={{ marginLeft: '0.5rem' }}>|</span>
        <span style={{ marginLeft: '0.5rem' }}>UPTIME: <span id="uptime-display" className="terminal-glow">—</span></span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {'─'.repeat(40)}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   Interactive Prompt
   ─────────────────────────────────────────────── */
function TerminalPrompt({ onCommand }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [showCursor, setShowCursor] = useState(true);
  const inputRef = useRef(null);

  const COMMANDS = {
    help: 'Available commands: whoami, uptime, services, stack, contact, date, clear, neofetch, help',
    whoami: 'dat — developer / homelab operator / AI enthusiast',
    date: () => new Date().toLocaleString('vi-VN'),
    neofetch: `OS: Windows 10 x86_64
Kernel: NT 10.0
Uptime: 24/7 since 2023
Shell: Hermes Agent v3
Resolution: 1920x1080
Theme: CRT Terminal`,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    const response = COMMANDS[cmd]
      ? (typeof COMMANDS[cmd] === 'function' ? COMMANDS[cmd]() : COMMANDS[cmd])
      : `bash: ${input}: command not found`;
    setHistory(prev => [...prev, { input, response }]);
    setInput('');
    onCommand?.(cmd);
  };

  useEffect(() => {
    if (history.length > 0) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [history]);

  return (
    <div style={{
      background: 'rgba(0,5,0,0.6)',
      border: '1px solid rgba(0,255,65,0.15)',
      padding: '0.75rem 1rem',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.78rem',
      marginBottom: '1.5rem',
    }}>
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
        <span style={{ color: '#ff3355', fontSize: '0.6rem' }}>●</span>
        <span style={{ color: '#ffb000', fontSize: '0.6rem' }}>●</span>
        <span style={{ color: '#00ff41', fontSize: '0.6rem' }}>●</span>
        <span style={{ marginLeft: '0.5rem', color: 'var(--text-dim)', fontSize: '0.65rem' }}>btdat@home-lab:~ — ▯</span>
      </div>

      {/* History */}
      {history.map((h, i) => (
        <div key={i} style={{ marginBottom: '0.3rem', lineHeight: 1.5 }}>
          <div style={{ color: 'var(--text-dim)' }}>
            <span style={{ color: '#00ff41' }}>$ </span>{h.input}
          </div>
          <div style={{ color: 'var(--accent)', paddingLeft: '0.8rem', whiteSpace: 'pre-wrap' }}>
            {h.response}
          </div>
        </div>
      ))}

      {/* Input line */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <span style={{ color: '#00ff41' }}>$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--accent)', fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem', outline: 'none', caretColor: '#00ff41',
          }}
        />
      </form>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Services Section (terminal style)
   ─────────────────────────────────────────────── */
function TerminalServices() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices().then(d => setServices(d || [])).catch(() => {});
  }, []);

  const fmtUptime = (s) => {
    if (!s.uptime || s.uptime <= 0) return '';
    const h = Math.floor(s.uptime / 3600);
    const m = Math.floor((s.uptime % 3600) / 60);
    return `${h}h ${m}m`;
  };

  if (services.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ marginBottom: '1.5rem' }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
        ── SERVICES ──────────────────────────
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', lineHeight: 1.8 }}>
        {services.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.15rem 0' }}>
            <span className={`term-dot ${s.status === 'running' ? 'on' : s.status === 'error' ? 'err' : 'off'} ${s.status === 'running' ? 'terminal-pulse' : ''}`} />
            <span style={{ color: 'var(--text)', minWidth: '16ch' }}>{s.name || s.id}</span>
            <span style={{ color: s.status === 'running' ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              [{s.status === 'running' ? 'RUNNING' : s.status === 'error' ? 'ERROR' : 'STOPPED'}]
            </span>
            {s.status === 'running' && fmtUptime(s) && (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
                {fmtUptime(s)}
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   Tech Stack
   ─────────────────────────────────────────────── */
function TerminalTechStack() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ marginBottom: '1.5rem' }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
        ── TECH STACK ─────────────────────────
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1rem',
        color: 'var(--text)',
      }}>
        {['Node.js 24', 'React 19', 'Vite', 'Three.js', 'MongoDB', 'Docker', 'Cloudflare', 'Hermes AI', 'Bulma'].map(t => (
          <span key={t} style={{ padding: '0.1rem 0', borderBottom: '1px solid rgba(0,255,65,0.15)' }}>
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   Contact / Terminal Contact
   ─────────────────────────────────────────────── */
function TerminalContact() {
  const [showConnecting, setShowConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typed, setTyped] = useState('');
  const SSH_CMD = 'ssh btdat@home-lab';
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleSsh = () => {
    setShowConnecting(true);
    setConnected(false);
    setTyped('');
    let i = 0;
    const typeInt = setInterval(() => {
      if (i <= SSH_CMD.length) {
        setTyped(SSH_CMD.slice(0, i));
        i++;
      } else {
        clearInterval(typeInt);
        timeoutRef.current = setTimeout(() => setConnected(true), 600);
      }
    }, 40);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ marginBottom: '1.5rem' }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
        ── CONTACT ────────────────────────────
      </div>

      <div style={{
        background: 'rgba(0,5,0,0.6)',
        border: '1px solid rgba(0,255,65,0.12)',
        padding: '0.75rem 1rem',
        fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
      }}>
        {!showConnecting ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)' }}>$</span>
            <button
              onClick={handleSsh}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem', cursor: 'pointer', padding: '0.2rem 0',
                textDecoration: 'underline', textUnderlineOffset: '2px',
              }}
            >
              ssh btdat@home-lab
            </button>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}># or</span>
            {[
              { label: 'github', url: 'https://github.com/dat13899' },
              { label: 'email', action: () => navigator.clipboard?.writeText('dat@btdat.io.vn') },
              { label: 'telegram', url: 'https://t.me/tiendat' },
            ].map(btn => (
              btn.url ? (
                <a key={btn.label} href={btn.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  {btn.label}
                </a>
              ) : (
                <button key={btn.label} onClick={btn.action}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'var(--font-mono)' }}>
                  {btn.label}
                </button>
              )
            ))}
          </div>
        ) : (
          <div style={{ lineHeight: 1.7 }}>
            <div style={{ color: 'var(--text-dim)' }}>
              <span style={{ color: 'var(--accent)' }}>$</span> {typed}
              {!connected && typed.length === SSH_CMD.length && <span className="terminal-cursor" style={{ width: 6, height: 12 }} />}
            </div>
            {connected && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <div style={{ color: 'var(--accent)' }}>  ✓ Connected to btdat.io.vn</div>
                <div style={{ color: 'var(--text-dim)', marginTop: '0.4rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a href="https://github.com/dat13899" target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>github</a>
                  <a href="https://t.me/tiendat" target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>telegram</a>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
                    email: dat@btdat.io.vn
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   Footer
   ─────────────────────────────────────────────── */
function TerminalFooter() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)',
      textAlign: 'center', padding: '1.5rem 1rem',
      borderTop: '1px solid rgba(0,255,65,0.1)',
      marginTop: '1rem',
    }}>
      {'─'.repeat(40)}
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <span>[BT Dat]</span>
        <span>[2026]</span>
        <span>[v3.0-RETRO]</span>
        <span>[<span className="terminal-pulse" style={{ display: 'inline-block' }}>●</span> {time}]</span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   MAIN: HomePage
   ─────────────────────────────────────────────── */
export default function HomePage() {
  const [bootDone, setBootDone] = useState(
    () => sessionStorage.getItem('crts_boot') === '1'
  );
  const [showHints, setShowHints] = useState(false);

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem('crts_boot', '1');
    setBootDone(true);
  }, []);

  // Show "type help" hint after a delay
  useEffect(() => {
    if (bootDone) {
      const t = setTimeout(() => setShowHints(true), 2000);
      return () => clearTimeout(t);
    }
  }, [bootDone]);

  return (
    <>
      {/* CRT Overlay */}
      <div className="crt-overlay crt-flicker" />
      <div className="crt-curve" />

      {/* Boot Sequence */}
      <AnimatePresence>
        {!bootDone && (
          <BootSequence onComplete={handleBootComplete} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '2rem 1rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <AsciiLogo />

        <TerminalPrompt onCommand={(cmd) => cmd === 'clear' && setShowHints(false)} />

        {showHints && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textAlign: 'center' }}
          >
            Try: <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>whoami</span> · <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>uptime</span> · <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>services</span> · <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>stack</span> · <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>contact</span> · <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>neofetch</span> · <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>help</span>
          </motion.p>
        )}

        {/* Auto sections — visible immediately */}
        <TerminalServices />
        <TerminalTechStack />
        <TerminalContact />

        {/* Links to other pages */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {[
            { to: '/dashboard', label: 'dashboard' },
            { to: '/documents', label: 'documents' },
            { to: '/widgets', label: 'widgets' },
            { to: '/utilities', label: 'utilities' },
            { to: '/hermes', label: 'hermes' },
          ].map(link => (
            <a key={link.to} href={link.to}
              style={{
                color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem', textDecoration: 'none',
                border: '1px solid rgba(0,255,65,0.2)',
                padding: '0.3rem 0.7rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,255,65,0.1)';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)';
              }}
            >
              [{link.label}]
            </a>
          ))}
        </div>

        <TerminalFooter />
      </div>
    </>
  );
}
