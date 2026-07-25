import { useState } from 'react';

export default function Bmi() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [bmi, setBmi] = useState(null);

  const calc = () => {
    const h = height / 100;
    const val = weight / (h * h);
    setBmi(Math.round(val * 10) / 10);
  };

  const getCategory = (v) => {
    if (v < 18.5) return { label: 'Thiếu cân', color: '#f59e0b' };
    if (v < 25) return { label: 'Bình thường', color: '#22c55e' };
    if (v < 30) return { label: 'Thừa cân', color: '#f59e0b' };
    return { label: 'Béo phì', color: '#ef4444' };
  };

  const style = {
    field: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' },
    label: { fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 },
    input: {
      width: '100px', padding: '0.45rem 0.5rem', textAlign: 'center',
      borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
      background: 'var(--surface-2)', color: 'var(--text)',
      fontSize: '0.9rem', outline: 'none', fontWeight: 600,
    },
  };

  const cat = bmi ? getCategory(bmi) : null;

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={style.field}>
          <div style={style.label}>Chiều cao (cm)</div>
          <input style={style.input} type="number" value={height} onChange={e => setHeight(Number(e.target.value))} />
        </div>
        <div style={style.field}>
          <div style={style.label}>Cân nặng (kg)</div>
          <input style={style.input} type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
        </div>
      </div>
      <button onClick={calc}
        style={{
          padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
          background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem',
        }}
      >
        ⚖️ Tính BMI
      </button>
      {bmi && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            padding: '1.25rem', borderRadius: 'var(--radius-md)',
            background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
            border: `1px solid ${cat.color}44`, display: 'inline-block',
            minWidth: '200px',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Chỉ số BMI</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: cat.color }}>{bmi}</div>
            <div style={{ fontSize: '0.85rem', color: cat.color, fontWeight: 600, marginTop: '0.25rem' }}>{cat.label}</div>
          </div>
        </div>
      )}
    </div>
  );
}
