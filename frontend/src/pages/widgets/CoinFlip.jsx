import { useState } from 'react';

const S = {
  container: { textAlign: 'center', padding: '2rem 1rem' },
  coin: {
    width: '150px', height: '150px', borderRadius: '50%',
    margin: '0 auto 1.5rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', fontWeight: 800,
    userSelect: 'none', transition: 'all 0.15s',
  },
  flipBtn: {
    padding: '0.6rem 2rem',
    borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--accent)', color: '#fff',
    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
  },
  stat: {
    display: 'flex', justifyContent: 'center', gap: '1.5rem',
    marginTop: '1.5rem',
  },
  statItem: {
    textAlign: 'center',
  },
  statLabel: { fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.15rem' },
  statValue: { fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-strong)' },
  label: { fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.5rem' },
  seq: {
    display: 'flex', gap: '0.3rem', justifyContent: 'center',
    flexWrap: 'wrap', marginTop: '0.75rem', maxWidth: '360px',
    margin: '0.75rem auto 0',
  },
  seqItem: {
    width: '28px', height: '28px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.65rem', fontWeight: 600,
  },
};

export default function CoinFlip() {
  const [result, setResult] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [history, setHistory] = useState([]);

  const flip = () => {
    setFlipping(true);
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.random() < 0.5 ? 'heads' : 'tails');
      count++;
      if (count > 12) {
        clearInterval(interval);
        const final = Math.random() < 0.5 ? 'heads' : 'tails';
        setResult(final);
        setFlipping(false);
        if (final === 'heads') setHeads(h => h + 1);
        else setTails(t => t + 1);
        setHistory(prev => [final, ...prev].slice(0, 30));
      }
    }, 70);
  };

  const coinFace = result === 'heads' ? 'H' : result === 'tails' ? 'T' : '?';
  const coinGradient = result === 'heads'
    ? 'radial-gradient(circle at 40% 40%, #fbbf24, #d97706)'
    : result === 'tails'
    ? 'radial-gradient(circle at 40% 40%, #94a3b8, #475569)'
    : 'radial-gradient(circle at 40% 40%, #666, #333)';
  const total = heads + tails;

  return (
    <div style={S.container}>
      <div style={S.label}>Bấm để tung đồng xu</div>
      <div
        style={{
          ...S.coin,
          background: coinGradient,
          color: result ? '#fff' : '#555',
          transform: flipping ? 'rotateY(720deg) scale(1.1)' : 'rotateY(0deg) scale(1)',
          boxShadow: `0 4px 20px ${result === 'heads' ? 'rgba(251,191,36,0.3)' : 'rgba(148,163,184,0.3)'}`,
        }}
        onClick={flip}
      >
        {coinFace}
      </div>
      <button style={S.flipBtn} onClick={flip}>
        {flipping ? '🪙 Đang tung...' : '🪙 Tung đồng xu'}
      </button>
      <div style={S.stat}>
        <div style={S.statItem}>
          <div style={S.statLabel}>Mặt ngửa</div>
          <div style={{ ...S.statValue, color: '#f59e0b' }}>{heads}</div>
        </div>
        <div style={S.statItem}>
          <div style={S.statLabel}>Mặt sấp</div>
          <div style={{ ...S.statValue, color: '#94a3b8' }}>{tails}</div>
        </div>
        <div style={S.statItem}>
          <div style={S.statLabel}>Tổng</div>
          <div style={S.statValue}>{total}</div>
        </div>
      </div>
      {total > 0 && (
        <div style={S.seq}>
          <div style={{ ...S.label, width: '100%', marginBottom: '0.15rem' }}>Chuỗi gần đây</div>
          {history.slice(0, 20).map((h, i) => (
            <div key={i} style={{
              ...S.seqItem,
              background: h === 'heads' ? 'rgba(245,158,11,0.2)' : 'rgba(148,163,184,0.2)',
              color: h === 'heads' ? '#f59e0b' : '#94a3b8',
              border: `1px solid ${h === 'heads' ? 'rgba(245,158,11,0.3)' : 'rgba(148,163,184,0.3)'}`,
            }}>
              {h === 'heads' ? 'H' : 'T'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
