import { useState, useEffect } from 'react';

export default function Countdown() {
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [remaining, setRemaining] = useState(null);
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const now = new Date();
      const target = new Date(`${targetDate}T${targetTime || '00:00'}`);
      const diff = target - now;
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
        setActive(false);
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemaining({ days, hours, minutes, seconds, done: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active, targetDate, targetTime]);

  const start = () => {
    if (!targetDate) return;
    setActive(true);
  };

  const reset = () => {
    setActive(false);
    setRemaining(null);
  };

  const formatNum = (n) => String(n).padStart(2, '0');

  return (
    <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
      {!active ? (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--glass-border)', background: 'var(--surface-2)',
                color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
              }}
            />
            <input type="time" value={targetTime} onChange={e => setTargetTime(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--glass-border)', background: 'var(--surface-2)',
                color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ghi chú (VD: Sinh nhật)..."
              style={{
                padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--glass-border)', background: 'var(--surface-2)',
                color: 'var(--text)', fontSize: '0.85rem', outline: 'none', width: '200px',
              }}
            />
          </div>
          <button onClick={start}
            style={{
              padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            ⏰ Bắt đầu đếm ngược
          </button>
        </>
      ) : remaining && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {label && <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>{label}</div>}
          {remaining.done ? (
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>🎉 Đã đến giờ!</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { v: remaining.days, l: 'Ngày' },
                  { v: remaining.hours, l: 'Giờ' },
                  { v: remaining.minutes, l: 'Phút' },
                  { v: remaining.seconds, l: 'Giây' },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2rem', fontWeight: 800, color: 'var(--text-strong)',
                      background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem',
                      minWidth: '50px',
                    }}>
                      {formatNum(item.v)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{item.l}</div>
                  </div>
                ))}
              </div>
              <button onClick={reset}
                style={{
                  padding: '0.35rem 1rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer',
                }}
              >
                🔄 Reset
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
