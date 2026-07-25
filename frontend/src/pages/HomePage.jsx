import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import BlobBackground from '../components/BlobBackground';
import { fetchServices, startService, stopService, fetchServiceHealth } from '../services/api';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';

const TAGLINES = [
  'Chạy home lab 24/7',
  'Tự động hóa với AI',
  'Minecraft server luôn online',
  'DevOps không cần ops',
];

const TECH_BADGES = [
  { label: 'Cloudflare DNS · CDN · Tunnel', url: 'https://www.cloudflare.com' },
  { label: 'Node.js 24', url: 'https://nodejs.org' },
  { label: 'Nginx', url: 'https://nginx.org' },
  { label: 'React + Vite', url: null },
  { label: 'MongoDB', url: 'https://www.mongodb.com' },
  { label: 'Docker', url: 'https://www.docker.com' },
  { label: 'GitHub Actions', url: 'https://github.com/features/actions' },
  { label: 'RAG Pipeline', url: null },
];

const SOCIAL_LINKS = [
  { icon: 'fab fa-github', url: 'https://github.com/btdat' },
  { icon: 'fas fa-envelope', url: 'mailto:datel1389@gmail.com' },
];

export default function HomePage() {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthMap, setHealthMap] = useState({});
  const [confirmSvc, setConfirmSvc] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState('');
  const healthTimers = useRef([]);

  // Typing effect
  const [displayedText, setDisplayedText] = useState('');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = TAGLINES[taglineIdx];
    let timeout;
    if (!isDeleting) {
      if (charIdx < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        }, 80);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        }, 40);
      } else {
        setIsDeleting(false);
        setTaglineIdx(i => (i + 1) % TAGLINES.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, taglineIdx]);

  // Fetch services
  const loadServices = useCallback(async () => {
    try {
      const data = await fetchServices();
      setServices(data);
    } catch {
      toast('Không thể tải services', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadServices(); }, [loadServices]);

  // Health pings
  useEffect(() => {
    if (services.length === 0) return;
    const timers = [];
    services.forEach(s => {
      const t = setInterval(async () => {
        try {
          const h = await fetchServiceHealth(s.id);
          setHealthMap(m => ({ ...m, [s.id]: h }));
        } catch {}
      }, 30000);
      timers.push(t);
    });
    healthTimers.current = timers;
    return () => timers.forEach(clearInterval);
  }, [services]);

  // Stats
  const runningCount = services.filter(s => s.status === 'running').length;
  const stoppedCount = services.filter(s => s.status !== 'running').length;

  // Confirm
  const handleToggle = async (svc, action) => {
    if (action === 'stop' || action === 'restart') {
      setConfirmSvc(svc);
      setConfirmAction(action);
      setConfirmMsg(`⚠️ ${action === 'stop' ? 'Stop' : 'Restart'} service <strong>${svc.name || svc.id}</strong>?`);
    } else {
      try {
        await startService(svc.id);
        toast(`Đã khởi động ${svc.name || svc.id}`, 'success');
        loadServices();
      } catch {
        toast(`Không thể khởi động ${svc.name || svc.id}`, 'error');
      }
    }
  };

  const confirmToggleAction = async () => {
    if (!confirmSvc) return;
    try {
      if (confirmAction === 'stop') {
        await stopService(confirmSvc.id);
        toast(`Đã dừng ${confirmSvc.name || confirmSvc.id}`, 'info');
      } else if (confirmAction === 'restart') {
        await stopService(confirmSvc.id);
        await startService(confirmSvc.id);
        toast(`Đã restart ${confirmSvc.name || confirmSvc.id}`, 'info');
      }
      loadServices();
    } catch {
      toast('Thao tác thất bại', 'error');
    }
    setConfirmSvc(null);
    setConfirmAction(null);
  };

  // Helpers
  const uptime = (s) => {
    if (!s.startedAt) return null;
    const sec = Math.floor((Date.now() - s.startedAt) / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  const statusColor = (s) => {
    if (s.status === 'running') return '#22c55e';
    if (s.status === 'error') return '#ef4444';
    return '#6b7280';
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <BlobBackground />
      <Navbar active="/" />

      {/* Hero Section */}
      <section className="hero is-fullheight-with-navbar" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', position: 'relative', paddingTop: '3rem',
      }}>
        <div className="container" style={{ maxWidth: '700px', padding: '0 1.5rem' }}>
          {/* Greeting */}
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            <span style={{
              background: 'linear-gradient(135deg, var(--text-strong), var(--accent))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              👋 BT Dat
            </span>
          </div>

          {/* Typing tagline */}
          <div style={{ minHeight: '2rem', marginBottom: '0.5rem' }}>
            <span className="subtitle is-5" style={{
              color: 'var(--text-dim)', fontFamily: 'monospace', fontSize: '1.05rem',
            }}>
              {displayedText}
              <span className="typing-cursor" style={{ animation: 'blink 0.8s step-end infinite' }}></span>
            </span>
          </div>

          <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Minecraft server, AI tool, và các self-hosted service chạy 24/7.
          </p>

          {/* Tag badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {['Node.js', 'Cloudflare', 'Minecraft', 'RAG', 'AI'].map(t => (
              <span key={t} style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: '999px', padding: '0.15rem 0.7rem', fontSize: '0.7rem',
                fontWeight: 500,
              }}>{t}</span>
            ))}
          </div>

          <a href="/dashboard" className="button is-link is-medium"
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '0.6rem 1.5rem',
              fontWeight: 600, textDecoration: 'none', display: 'inline-block',
            }}
          >
            Dashboard <span style={{ marginLeft: '6px' }}>→</span>
          </a>

          {/* Nav anchors */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {[
              { label: 'Services', target: 'services-section' },
              { label: 'Stack', target: 'stack-section' },
              { label: 'Contact', target: 'contact-section' },
            ].map(link => (
              <button key={link.target} onClick={() => scrollTo(link.target)}
                className="button is-small is-ghost"
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-dim)',
                  fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline',
                  textUnderlineOffset: '3px', opacity: 0.7,
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" id="services-section" style={{ padding: '2.5rem 1.25rem' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <h2 className="title is-4" style={{ color: 'var(--text-strong)', marginBottom: '1rem' }}>
            <span style={{ marginRight: '8px' }}>📦</span> Services
          </h2>

          {/* Status bar */}
          <div style={{
            display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', padding: '0.75rem 1.2rem',
            background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)', borderRadius: '999px',
            marginBottom: '1rem', fontSize: '0.8rem',
            boxShadow: '0 4px 24px var(--glass-shadow)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }}></span>
              <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{runningCount}</span> running
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b7280', display: 'inline-block' }}></span>
              <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{stoppedCount}</span> stopped
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              🟢 <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>—</span> uptime
            </div>
          </div>

          {/* Services grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[1, 2].map(i => (
                <div key={i} className="card glass-card" style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
                  <div className="card-content">
                    <div className="skeleton skel-d1" style={{ height: '80px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="card glass-card" style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
              <div className="card-content has-text-centered" style={{ color: 'var(--text-dim)' }}>
                <small>Chưa có service</small>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {services.map((s, i) => {
                const h = healthMap[s.id];
                return (
                  <div key={s.id} className="card glass-card" style={{
                    background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 16px var(--glass-shadow)', overflow: 'hidden',
                  }}>
                    <div className="card-content">
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(s), boxShadow: s.status === 'running' ? `0 0 6px ${statusColor(s)}` : 'none', display: 'inline-block' }}></span>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-strong)' }}>{s.name || s.id}</strong>
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block', marginLeft: '4px',
                            background: h?.status === 'ok' ? '#22c55e' : h?.status === 'error' ? '#ef4444' : '#6b7280',
                            animation: h?.status === 'ok' ? 'pulse 2s infinite' : 'none',
                          }}></span>
                        </div>
                        <span className="tag is-info is-light" style={{
                          background: 'var(--surface-2)', color: 'var(--text-dim)',
                          border: '1px solid var(--glass-border)', borderRadius: '6px',
                          fontSize: '0.68rem', padding: '0.1rem 0.5rem',
                        }}>
                          {s.port ? `:${s.port}` : '—'}
                        </span>
                      </div>

                      {/* Description */}
                      {s.description && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: '1.4', marginBottom: '0.4rem' }}>
                          {s.description}
                        </p>
                      )}

                      {/* Status */}
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                        {s.status === 'running' ? '🟢 Running' : s.status === 'error' ? '🔴 Error' : '⚪ Stopped'}
                        {s.status === 'running' && uptime(s) ? ` ⏱ ${uptime(s)}` : ''}
                      </p>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <button onClick={() => handleToggle(s, 'start')} disabled={s.status === 'running'}
                          style={{
                            background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                            border: '1px solid var(--glass-border)', borderRadius: '5px',
                            color: s.status === 'running' ? 'var(--text-dim)' : 'var(--text)',
                            padding: '0.2rem 0.5rem', fontSize: '0.7rem', cursor: s.status === 'running' ? 'not-allowed' : 'pointer',
                            opacity: s.status === 'running' ? 0.3 : 1, transition: 'all .15s',
                          }}
                        >▶ Start</button>
                        <button onClick={() => handleToggle(s, 'stop')} disabled={s.status !== 'running'}
                          style={{
                            background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                            border: '1px solid var(--glass-border)', borderRadius: '5px',
                            color: s.status === 'running' ? 'var(--red)' : 'var(--text-dim)',
                            padding: '0.2rem 0.5rem', fontSize: '0.7rem', cursor: s.status === 'running' ? 'pointer' : 'not-allowed',
                            opacity: s.status === 'running' ? 1 : 0.3, transition: 'all .15s',
                          }}
                        >■ Stop</button>
                        <button onClick={() => handleToggle(s, 'restart')} disabled={s.status !== 'running'}
                          style={{
                            background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                            border: '1px solid var(--glass-border)', borderRadius: '5px',
                            color: s.status === 'running' ? 'var(--text)' : 'var(--text-dim)',
                            padding: '0.2rem 0.5rem', fontSize: '0.7rem', cursor: s.status === 'running' ? 'pointer' : 'not-allowed',
                            opacity: s.status === 'running' ? 1 : 0.3, transition: 'all .15s',
                          }}
                        >↻ Restart</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section" id="stack-section" style={{ padding: '2.5rem 1.25rem' }}>
        <div className="container has-text-centered">
          <h2 className="title is-4" style={{ color: 'var(--text-strong)', marginBottom: '1rem' }}>
            <span style={{ marginRight: '8px' }}>🛠</span> Tech Stack
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
            {TECH_BADGES.map(badge => (
              badge.url ? (
                <a key={badge.label} href={badge.url} target="_blank" rel="noopener"
                  style={{
                    background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid var(--glass-border)', padding: '0.35rem 0.9rem',
                    borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
                    color: 'var(--text)', textDecoration: 'none',
                    transition: 'all .2s', cursor: 'pointer',
                    display: 'inline-block',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'var(--accent)'; e.target.style.color = '#fff'; e.target.style.borderColor = 'var(--accent)'; e.target.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.target.style.background = 'var(--glass-bg)'; e.target.style.color = 'var(--text)'; e.target.style.borderColor = 'var(--glass-border)'; e.target.style.transform = 'none'; }}
                >
                  {badge.label}
                </a>
              ) : (
                <span key={badge.label}
                  style={{
                    background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid var(--glass-border)', padding: '0.35rem 0.9rem',
                    borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
                    color: 'var(--text)',
                    display: 'inline-block',
                  }}
                >
                  {badge.label}
                </span>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section" id="contact-section" style={{ padding: '2.5rem 1.25rem' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 className="title is-4" style={{ color: 'var(--text-strong)', marginBottom: '1rem' }}>
            <span style={{ marginRight: '8px' }}>📫</span> Contact
          </h2>
          <div className="card glass-card" style={{
            background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
          }}>
            <div className="card-content has-text-centered" style={{ padding: '1.5rem' }}>
              {SOCIAL_LINKS.map(link => (
                <a key={link.url} href={link.url} target={link.icon === 'fab fa-github' ? '_blank' : undefined}
                  rel={link.icon === 'fab fa-github' ? 'noopener' : undefined}
                  style={{ fontSize: '1.15rem', margin: '0 0.5rem', color: 'var(--text-dim)', transition: 'color .15s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
                >
                  <i className={link.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '1.5rem', textAlign: 'center',
        borderTop: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
          BT Dat · 2026 ·
          <span style={{ marginLeft: '0.25rem' }}>⏻ checking...</span>
          <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>·</span>
          <button onClick={() => {
            if ('caches' in window) {
              caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))));
            }
            toast('🧹 Cache cleared', 'success');
          }}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            🧹 clear cache
          </button>
        </div>
      </footer>

      <ConfirmModal
        show={confirmSvc !== null}
        title={confirmAction === 'stop' ? 'Dừng service' : confirmAction === 'restart' ? 'Restart service' : 'Xác nhận'}
        message={confirmMsg}
        confirmLabel={confirmAction === 'stop' ? 'Dừng' : confirmAction === 'restart' ? 'Restart' : 'OK'}
        danger={confirmAction !== 'start'}
        onConfirm={confirmToggleAction}
        onCancel={() => { setConfirmSvc(null); setConfirmAction(null); }}
      />
    </>
  );
}
