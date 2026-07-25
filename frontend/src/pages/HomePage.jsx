import { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { fetchServices, startService, stopService, fetchServiceHealth } from '../services/api';
import { useToastContext } from '../components/shared/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Scene3D from '../components/Scene3D';
import NeuralNodes from '../components/NeuralNodes';
import TerminalContact from '../components/TerminalContact';

/* ===================================================================
   🎬 SECTION 1 — Cinematic Hero
   =================================================================== */
function HeroSection() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const sphereOpacity = useTransform(scrollY, [0, 300], [0.15, 0]);

  // Split "BT DAT" into individual chars for stagger
  const chars = 'BT DAT'.split('');

  return (
    <section style={{
      height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 3D Background */}
      <Scene3D />

      <motion.div style={{ y: heroY, opacity: heroOpacity, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Stagger title */}
        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', gap: 'clamp(0.2rem, 1vw, 0.5rem)' }}>
          {chars.map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60, rotateX: 90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: 0.2 + i * 0.06,
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                fontSize: 'clamp(3rem, 10vw, 7rem)',
                fontWeight: 900,
                color: ch === ' ' ? 'transparent' : 'var(--text-strong)',
                letterSpacing: ch === ' ' ? '0.5em' : '0',
                WebkitBackgroundClip: ch !== ' ' ? 'text' : undefined,
                WebkitTextFillColor: ch !== ' ' ? 'transparent' : undefined,
                backgroundImage: ch !== ' '
                  ? 'linear-gradient(135deg, #fff 20%, #34d399 50%, #fff 80%)'
                  : undefined,
                backgroundSize: '200% auto',
                animation: ch !== ' ' ? 'shimmer 3s ease-in-out infinite' : undefined,
              }}
            >
              {ch === ' ' ? '\u00A0' : ch}
            </motion.span>
          ))}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          style={{
            fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
            color: 'var(--text-dim)', maxWidth: 500, margin: '0 auto',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Home lab • AI Agent • Minecraft • 24/7
        </motion.p>

        {/* CTA */}
        <motion.a
          href="/dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          style={{
            display: 'inline-block', marginTop: '2rem',
            background: 'linear-gradient(135deg, #34d399, #10b981)',
            color: '#fff', padding: '0.7rem 2rem', borderRadius: 'var(--radius-sm)',
            fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem',
            boxShadow: '0 0 30px rgba(52,211,153,0.25)',
          }}
          whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(52,211,153,0.4)' }}
          whileTap={{ scale: 0.97 }}
        >
          View Dashboard →
        </motion.a>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
          style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)' }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ width: 24, height: 40, border: '2px solid var(--text-dim)', borderRadius: 12, display: 'flex', justifyContent: 'center', paddingTop: 6 }}
          >
            <div style={{ width: 4, height: 8, background: 'var(--text-dim)', borderRadius: 2 }} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ===================================================================
   📊 SECTION 2 — Stats Dashboard
   =================================================================== */
function StatsDashboard({ services = [] }) {
  const running = services.filter(s => s.status === 'running').length;
  const total = services.length;
  const stats = [
    { label: 'Services Online', value: running, suffix: `/${total}` },
    { label: 'Uptime', value: 99.9, suffix: '%' },
    { label: 'AI Models', value: 3, suffix: ' active' },
    { label: 'Requests/Day', value: '12K', suffix: '' },
  ];

  return (
    <section style={{ padding: '4rem 1rem', position: 'relative', zIndex: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '1.5rem' }}
      >
        <h2 style={{
          fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800,
          color: 'var(--text-strong)',
        }}>
          System Status
        </h2>
      </motion.div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.8rem', maxWidth: 900, margin: '0 auto', padding: '0 1rem',
      }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            style={{
              background: 'rgba(10,14,23,0.6)', borderRadius: 'var(--radius-md)',
              padding: '1.2rem', textAlign: 'center',
              border: '1px solid rgba(52,211,153,0.1)',
              backdropFilter: 'blur(8px)',
            }}
            whileHover={{ borderColor: 'rgba(52,211,153,0.25)', scale: 1.02 }}
          >
            <div style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800,
              color: 'var(--accent)', fontFamily: 'var(--font-mono)',
            }}>
              {s.value}<span style={{ fontSize: '0.5em', fontWeight: 500, opacity: 0.6 }}>{s.suffix}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ===================================================================
   🧠 SECTION 3 — AI Features
   =================================================================== */
function AISection() {
  const features = [
    {
      title: 'Hermes Agent',
      desc: 'AI agent tự động giám sát, deploy, xử lý sự cố 24/7. Tích hợp Telegram & memory.',
      tags: ['LLM', 'RAG', 'Cron Jobs'],
    },
    {
      title: 'Knowledge Base',
      desc: 'RAG system lưu trữ tài liệu, codebase. Truy vấn bằng ngôn ngữ tự nhiên.',
      tags: ['Vector DB', 'Embedding', 'Search'],
    },
    {
      title: 'AI Tools',
      desc: 'Multi-modal: text gen, image analysis, code review, data processing.',
      tags: ['Vision', 'Code Gen', 'Analytics'],
    },
  ];

  return (
    <section style={{ padding: '3rem 1rem', position: 'relative', zIndex: 1 }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ textAlign: 'center', marginBottom: '1.5rem' }}
      >
        <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, color: 'var(--text-strong)' }}>
          🧠 AI-Powered
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
          Everything runs on your own hardware
        </p>
      </motion.div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem', maxWidth: 1000, margin: '0 auto', padding: '0 1rem',
      }}>
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 * i, duration: 0.5 }}
            style={{
              background: 'rgba(10,14,23,0.5)', borderRadius: 'var(--radius-md)',
              padding: '1.3rem', border: '1px solid rgba(52,211,153,0.08)',
              backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden',
            }}
            whileHover={{
              y: -4,
              borderColor: 'rgba(52,211,153,0.2)',
              boxShadow: '0 8px 30px rgba(52,211,153,0.06)',
            }}
          >
            {/* Gradient accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
              opacity: 0.6,
            }} />

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '0.4rem' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '0.8rem' }}>
              {f.desc}
            </p>
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
              {f.tags.map(t => (
                <span key={t} style={{
                  fontSize: '0.6rem', padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)', background: 'rgba(52,211,153,0.08)',
                  color: 'var(--accent)', border: '1px solid rgba(52,211,153,0.1)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ===================================================================
   🏠 HomePage — Main Export
   =================================================================== */
export default function HomePage() {
  const toast = useToastContext();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthMap, setHealthMap] = useState({});
  const [confirmSvc, setConfirmSvc] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const loadServices = useCallback(async () => {
    try { setServices(await fetchServices()); } catch { toast('Không thể tải services', 'error'); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { loadServices(); }, [loadServices]);

  useEffect(() => {
    if (!services.length) return;
    const timers = services.map(s => setInterval(() => {
      fetchServiceHealth(s.id).then(h => setHealthMap(m => ({ ...m, [s.id]: h }))).catch(() => {});
    }, 30000));
    return () => timers.forEach(clearInterval);
  }, [services]);

  const handleToggle = async (svc, action) => {
    if (action === 'stop' || action === 'restart') {
      setConfirmSvc(svc); setConfirmAction(action);
    } else {
      try { await startService(svc.id); toast(`Đã khởi động ${svc.name || svc.id}`, 'success'); loadServices(); }
      catch { toast(`Không thể khởi động ${svc.name || svc.id}`, 'error'); }
    }
  };

  const confirmToggle = async () => {
    if (!confirmSvc) return;
    try {
      if (confirmAction === 'stop') { await stopService(confirmSvc.id); toast(`Đã dừng ${confirmSvc.name || confirmSvc.id}`, 'info'); }
      else if (confirmAction === 'restart') { await stopService(confirmSvc.id); await startService(confirmSvc.id); toast(`Đã restart ${confirmSvc.name || confirmSvc.id}`, 'info'); }
      loadServices();
    } catch { toast('Thao tác thất bại', 'error'); }
    setConfirmSvc(null); setConfirmAction(null);
  };

  const uptime = (s) => {
    if (!s.startedAt) return null;
    const sec = Math.floor((Date.now() - s.startedAt) / 1000);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <>
      {/* Ensure 3D canvas is global-scope by putting it at root */}
      <div className="homepage">
        <HeroSection />

        <StatsDashboard services={services} />

        <section id="services" style={{ padding: '2rem 0 4rem', position: 'relative', zIndex: 1 }}>
          <NeuralNodes
            services={services} loading={loading}
            healthMap={healthMap} uptime={uptime}
            onToggle={handleToggle}
          />
        </section>

        <AISection />

        <section id="contact" style={{ padding: '3rem 1rem 5rem', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '1.5rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, color: 'var(--text-strong)' }}>
              ⌨️ Connect
            </h2>
          </motion.div>
          <TerminalContact toast={toast} />
        </section>

        <ConfirmModal show={confirmSvc !== null}
          title={confirmAction === 'stop' ? 'Dừng service' : 'Restart service'}
          message={`⚠️ ${confirmAction === 'stop' ? 'Stop' : 'Restart'} service <strong>${confirmSvc?.name || confirmSvc?.id}</strong>?`}
          confirmLabel={confirmAction === 'stop' ? 'Dừng' : 'Restart'} danger
          onConfirm={confirmToggle}
          onCancel={() => { setConfirmSvc(null); setConfirmAction(null); }} />
      </div>
    </>
  );
}
