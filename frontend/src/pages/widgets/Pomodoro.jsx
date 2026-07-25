import { useState, useEffect, useRef } from 'react';

const POMODORO = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

export default function Pomodoro() {
  const [time, setTime] = useState(POMODORO);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('pomodoro'); // pomodoro, short, long
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const start = () => setActive(true);
  const pause = () => setActive(false);

  const reset = () => {
    setActive(false);
    clearInterval(intervalRef.current);
    if (phase === 'pomodoro') setTime(POMODORO);
    else if (phase === 'short') setTime(SHORT_BREAK);
    else setTime(LONG_BREAK);
  };

  const nextPhase = (p) => {
    setActive(false);
    clearInterval(intervalRef.current);
    setPhase(p);
    if (p === 'pomodoro') setTime(POMODORO);
    else if (p === 'short') setTime(SHORT_BREAK);
    else setTime(LONG_BREAK);
  };

  useEffect(() => {
    if (time === 0) {
      if (phase === 'pomodoro') {
        const s = sessions + 1;
        setSessions(s);
        if (s % 4 === 0) {
          nextPhase('long');
        } else {
          nextPhase('short');
        }
      } else {
        nextPhase('pomodoro');
      }
    }
  }, [time]);

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const phaseLabel = phase === 'pomodoro' ? '🍅 Pomodoro' : phase === 'short' ? '☕ Nghỉ ngắn' : '🧘 Nghỉ dài';
  const progress = phase === 'pomodoro' ? time / POMODORO : phase === 'short' ? time / SHORT_BREAK : time / LONG_BREAK;

  return (
    <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {[
          { id: 'pomodoro', label: '🍅 25m' },
          { id: 'short', label: '☕ 5m' },
          { id: 'long', label: '🧘 15m' },
        ].map(p => (
          <button key={p.id} onClick={() => nextPhase(p.id)}
            style={{
              padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem',
              border: `1px solid ${phase === p.id ? 'var(--accent)' : 'var(--glass-border)'}`,
              background: phase === p.id ? 'rgba(129,140,248,0.1)' : 'rgba(255,255,255,0.03)',
              color: phase === p.id ? 'var(--accent)' : 'var(--text-dim)',
              cursor: 'pointer', fontWeight: phase === p.id ? 600 : 400,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.15rem' }}>{phaseLabel}</div>

      <div style={{
        position: 'relative', width: '160px', height: '160px', borderRadius: '50%',
        margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `conic-gradient(var(--accent) ${(1 - progress) * 360}deg, var(--glass-bg) ${(1 - progress) * 360}deg)`,
        boxShadow: '0 0 20px rgba(129,140,248,0.15)',
      }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-strong)' }}>
            {format(time)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {!active ? (
          <button onClick={start}
            style={{
              padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: '0.85rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            ▶ Bắt đầu
          </button>
        ) : (
          <button onClick={pause}
            style={{
              padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: '0.85rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            ⏸ Tạm dừng
          </button>
        )}
        <button onClick={reset}
          style={{
            padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-dim)', fontSize: '0.78rem', cursor: 'pointer',
          }}
        >
          🔄 Reset
        </button>
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        Pomodoro hôm nay: {sessions} 🍅
      </div>
    </div>
  );
}
