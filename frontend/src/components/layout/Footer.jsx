import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export default function Footer({ backToTopVisible = false }) {
  const { isMobile } = useMediaQuery();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (isMobile) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="glass-dock"
      style={{
        position: 'fixed', bottom: '1.5rem', left: '50%',
        zIndex: 350,
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.45rem 1rem',
        borderRadius: '999px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--liquid-border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,212,255,0.04) inset',
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        userSelect: 'none',
        maxWidth: 'calc(100vw - 2rem)',
        transition: 'transform 0.2s cubic-bezier(.4,0,.2,1), box-shadow 0.2s cubic-bezier(.4,0,.2,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,212,255,0.06) inset';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateX(-50%) translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,212,255,0.04) inset';
      }}
    >
      <span style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: '#34d399',
        boxShadow: '0 0 8px #34d399, 0 0 2px #34d399',
        flexShrink: 0,
        animation: 'pulse-dot 2s ease-in-out infinite',
      }} />
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: 'var(--text)', display: 'flex', gap: '0.35rem' }}>
        <span style={{ color: 'var(--text-dim)' }}>{date}</span>
        <span>{time}</span>
      </span>
      <span style={{ width: '1px', height: '16px', background: 'var(--liquid-border)', borderRadius: '1px' }} />
      <Link to="/" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 500, transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
      >Home</Link>
      <Link to="/dashboard" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 500, transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
      >Dashboard</Link>
      <Link to="/hermes" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#00d4ff', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 500 }}>
        <i className="fas fa-galaxy" style={{ fontSize: '0.6rem' }} />
        Hermes
      </Link>
      <span style={{ width: '1px', height: '16px', background: 'var(--liquid-border)', borderRadius: '1px' }} />
      <span style={{ color: 'var(--text-dim)', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
        Press <kbd style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '3px', padding: '0.05rem 0.3rem', fontSize: '0.58rem', fontFamily: 'var(--font-mono)' }}>Ctrl+K</kbd> to search
      </span>
    </motion.div>
  );
}
