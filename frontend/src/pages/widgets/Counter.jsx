import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Bước nhảy:</div>
        <input type="number" min="1" max="100" value={step}
          onChange={e => setStep(Math.max(1, Number(e.target.value)))}
          style={{
            width: '60px', padding: '0.3rem 0.4rem', textAlign: 'center',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
            background: 'var(--surface-2)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
          }}
        />
      </div>
      <div style={{
        fontSize: '4rem', fontWeight: 800, color: 'var(--text-strong)',
        marginBottom: '1.5rem', lineHeight: 1.2,
      }}>
        {count}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setCount(c => c - step)}
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            border: '1px solid var(--glass-border)', background: 'rgba(239,68,68,0.1)',
            color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700,
          }}
        >
          −
        </button>
        <button onClick={() => setCount(0)}
          style={{
            padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-dim)', fontSize: '0.78rem', cursor: 'pointer',
          }}
        >
          Reset
        </button>
        <button onClick={() => setCount(c => c + step)}
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            border: '1px solid var(--glass-border)', background: 'rgba(34,197,94,0.1)',
            color: '#22c55e', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
