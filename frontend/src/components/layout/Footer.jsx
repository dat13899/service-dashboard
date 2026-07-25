import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/** Telegram-inspired floating footer — desktop only */
export default function Footer() {
  const { isMobile } = useMediaQuery();
  const [time, setTime] = useState('');

  // Live clock — updates every 30s
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  if (isMobile) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      zIndex: 400,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.9rem',
      borderRadius: '999px',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--glass-border)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      fontSize: '0.72rem',
      color: 'var(--text-dim)',
      transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      cursor: 'default',
      userSelect: 'none',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)';
    }}
    >
      {/* Status dot — always green (online) */}
      <span style={{
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: 'var(--green)',
        boxShadow: '0 0 6px var(--green)',
        flexShrink: 0,
      }} />

      {/* Live clock */}
      <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>
        {time}
      </span>

      {/* Divider */}
      <span style={{
        width: '1px', height: '14px',
        background: 'var(--glass-border)',
        borderRadius: '1px',
      }} />

      {/* Brand */}
      <span>btdat.io.vn</span>

      {/* Hermes link */}
      <Link to="/hermes" style={{
        display: 'flex', alignItems: 'center', gap: '0.2rem',
        color: 'var(--accent)', textDecoration: 'none',
        fontWeight: 500, transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <i className="fas fa-galaxy" style={{ fontSize: '0.65rem' }}></i>
        <span>Hermes</span>
      </Link>
    </div>
  );
}
