import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import BlobBackground from '../components/BlobBackground';
import { fetchServices, startService, stopService, fetchServiceHealth } from '../services/api';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';

export default function HomePage() {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthMap, setHealthMap] = useState({});
  const [confirmSvc, setConfirmSvc] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const healthTimers = useRef([]);

  // Typing effect
  const taglines = [
    'Service Dashboard • btdat.io.vn',
    'Giám sát • Quản lý • Tiện ích',
    'Node.js • React • Three.js',
  ];
  const [displayedText, setDisplayedText] = useState('');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = taglines[taglineIdx];
    let timeout;
    if (!isDeleting) {
      if (charIdx < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        }, 40);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        }, 20);
      } else {
        setIsDeleting(false);
        setTaglineIdx(i => (i + 1) % taglines.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, taglineIdx, taglines]);

  // Fetch services
  const loadServices = useCallback(async () => {
    try {
      const data = await fetchServices();
      setServices(data);
    } catch (e) {
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

  // Start/stop handler
  const handleToggle = async (svc) => {
    if (svc.status === 'running') {
      setConfirmSvc(svc);
      setConfirmAction('stop');
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

  const confirmToggle = async () => {
    if (!confirmSvc) return;
    try {
      if (confirmAction === 'stop') {
        await stopService(confirmSvc.id);
        toast(`Đã dừng ${confirmSvc.name || confirmSvc.id}`, 'info');
      }
      loadServices();
    } catch {
      toast(`Thao tác thất bại`, 'error');
    }
    setConfirmSvc(null);
    setConfirmAction(null);
  };

  const statusColor = (s) => {
    if (s.status === 'running') return '#22c55e';
    if (s.status === 'error') return '#ef4444';
    return '#6b7280';
  };

  const uptime = (s) => {
    if (!s.startedAt) return null;
    const sec = Math.floor((Date.now() - s.startedAt) / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <>
      <BlobBackground />
      <Navbar active="/" />

      {/* Hero */}
      <section className="hero is-fullheight-with-navbar" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', position: 'relative',
      }}>
        <div className="container" style={{ maxWidth: '700px', padding: '0 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            <span style={{
              background: 'linear-gradient(135deg, var(--text-strong), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 800,
            }}>
              btdat.io.vn
            </span>
          </div>

          <div style={{ minHeight: '2.2rem', marginBottom: '2rem' }}>
            <span style={{
              fontSize: '1.05rem', color: 'var(--text-dim)',
              fontFamily: 'monospace', letterSpacing: '0.05em',
            }}>
              {displayedText}
              <span style={{ animation: 'blink 0.8s step-end infinite', opacity: 1 }}>▌</span>
            </span>
          </div>

          {/* Services grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card glass-card" style={{
                  width: '200px', padding: '1.2rem',
                  background: 'var(--glass-bg)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div className="skeleton-load">
                    <div className="skel skel-txt" style={{ height: '0.8rem', marginBottom: '0.5rem' }}></div>
                    <div className="skel skel-txt2" style={{ height: '0.6rem', width: '60%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '0.75rem',
              flexWrap: 'wrap', marginBottom: '2rem',
            }}>
              {services.map(s => {
                const h = healthMap[s.id];
                return (
                  <div key={s.id} className="card glass-card" style={{
                    width: '200px', padding: '1.2rem', textAlign: 'center',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform .2s, box-shadow .2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: statusColor(s),
                        display: 'inline-block',
                        boxShadow: `0 0 8px ${statusColor(s)}`,
                      }}></span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-strong)' }}>
                        {s.name || s.id}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                      {s.status === 'running' ? (
                        <span>🟢 Online {uptime(s) ? `• ${uptime(s)}` : ''}</span>
                      ) : s.status === 'error' ? '🔴 Error' : '⏸ Stopped'}
                      {s.port && <span> • :{s.port}</span>}
                    </div>
                    {h && (
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                        {h.status === 'ok' ? '✓ OK' : `⚠ ${h.status || '?'}`}
                      </div>
                    )}
                    <button onClick={() => handleToggle(s)}
                      className="button is-small"
                      style={{
                        background: s.status === 'running' ? 'rgba(239,68,68,0.1)' : 'var(--accent)',
                        color: s.status === 'running' ? '#ef4444' : '#fff',
                        border: s.status === 'running' ? '1px solid rgba(239,68,68,0.2)' : 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.8rem',
                        cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                    >
                      {s.status === 'running' ? '⏹ Stop' : '▶ Start'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tech badges */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '0.5rem',
            flexWrap: 'wrap', marginTop: '0.5rem', opacity: 0.6,
          }}>
            {['Node.js', 'Express', 'Three.js', 'React', 'Vite'].map(tech => (
              <span key={tech} className="tag" style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                fontSize: '0.7rem',
                color: 'var(--text-dim)',
              }}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: '1.5rem',
          animation: 'bounce 2s infinite',
          color: 'var(--text-dim)', fontSize: '0.72rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
        }}>
          <span>Dashboard & Tools</span>
          <i className="fas fa-chevron-down" style={{ fontSize: '0.8rem' }}></i>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '1rem',
        fontSize: '0.72rem', color: 'var(--text-dim)',
        borderTop: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
      }}>
        <p>
          <span>© 2026 btdat.io.vn</span>
          <span style={{ margin: '0 0.5rem' }}>·</span>
          <a href="/assets/global.css?v=3" style={{ color: 'var(--text-dim)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Cache</a>
        </p>
      </footer>

      <ConfirmModal
        show={confirmSvc !== null}
        title={confirmAction === 'stop' ? 'Dừng service' : 'Khởi động service'}
        message={`Bạn có chắc muốn ${confirmAction === 'stop' ? 'dừng' : 'khởi động'} "${confirmSvc?.name || confirmSvc?.id}"?`}
        confirmLabel={confirmAction === 'stop' ? 'Dừng' : 'Khởi động'}
        danger={confirmAction === 'stop'}
        onConfirm={confirmToggle}
        onCancel={() => { setConfirmSvc(null); setConfirmAction(null); }}
      />
    </>
  );
}
