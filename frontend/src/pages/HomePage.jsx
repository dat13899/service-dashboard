import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchServices, startService, stopService, fetchServiceHealth } from '../services/api';
import { useToastContext } from '../components/shared/Toast';
import ConfirmModal from '../components/ConfirmModal';
import HeroSection from './home/HeroSection';
import ServicesSection from './home/ServicesSection';
import TechStackSection from './home/TechStackSection';
import ContactSection from './home/ContactSection';
import './home/home.css';

const TAGLINES = [
  'Chạy home lab 24/7', 'Tự động hóa với AI',
  'Minecraft server luôn online', 'DevOps không cần ops',
];

export default function HomePage() {
  const toast = useToastContext();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthMap, setHealthMap] = useState({});
  const [confirmSvc, setConfirmSvc] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Typing effect
  const [displayedText, setDisplayedText] = useState('');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = TAGLINES[taglineIdx];
    let t;
    if (!isDeleting) {
      if (charIdx < text.length) t = setTimeout(() => { setDisplayedText(text.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, 80);
      else t = setTimeout(() => setIsDeleting(true), 2000);
    } else {
      if (charIdx > 0) t = setTimeout(() => { setDisplayedText(text.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 40);
      else { setIsDeleting(false); setTaglineIdx(i => (i + 1) % TAGLINES.length); }
    }
    return () => clearTimeout(t);
  }, [charIdx, isDeleting, taglineIdx]);

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
  const statusColor = (s) => s.status === 'running' ? '#22c55e' : s.status === 'error' ? '#ef4444' : '#6b7280';
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <HeroSection displayedText={displayedText} scrollTo={scrollTo} />
      <ServicesSection services={services} loading={loading} healthMap={healthMap}
        statusColor={statusColor} uptime={uptime} onToggle={handleToggle} />
      <TechStackSection />
      <ContactSection toast={toast} />

      <footer className="home-footer">
        <div>
          BT Dat · 2026 · <span>⏻ checking...</span>
          <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>·</span>
          <button onClick={() => {
            if ('caches' in window) caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))));
            toast('🧹 Cache cleared', 'success');
          }}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >🧹 clear cache</button>
        </div>
      </footer>

      <ConfirmModal show={confirmSvc !== null}
        title={confirmAction === 'stop' ? 'Dừng service' : 'Restart service'}
        message={`⚠️ ${confirmAction === 'stop' ? 'Stop' : 'Restart'} service <strong>${confirmSvc?.name || confirmSvc?.id}</strong>?`}
        confirmLabel={confirmAction === 'stop' ? 'Dừng' : 'Restart'} danger
        onConfirm={confirmToggle} onCancel={() => { setConfirmSvc(null); setConfirmAction(null); }} />
    </>
  );
}
