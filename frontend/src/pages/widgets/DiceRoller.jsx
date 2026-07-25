import { useState } from 'react';

const SIDES = [4, 6, 8, 10, 12, 20, 100];

const S = {
  container: { textAlign: 'center', padding: '1.5rem 1rem' },
  diceSelector: {
    display: 'flex', gap: '0.5rem', justifyContent: 'center',
    flexWrap: 'wrap', marginBottom: '1.5rem',
  },
  diceBtn: (active) => ({
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: active ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
    background: active ? 'rgba(99,102,241,0.15)' : 'var(--surface-2)',
    color: active ? 'var(--accent)' : 'var(--text-dim)',
    fontSize: '0.82rem',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  result: {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: 'var(--text-strong)',
    margin: '1.5rem 0',
    lineHeight: 1,
  },
  rollBtn: {
    padding: '0.6rem 2rem',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  history: {
    marginTop: '1.5rem',
    maxWidth: '300px',
    margin: '1.5rem auto 0',
  },
  historyTitle: {
    fontSize: '0.72rem', color: 'var(--text-dim)',
    fontWeight: 600, marginBottom: '0.4rem',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  historyItem: {
    display: 'flex', justifyContent: 'space-between',
    padding: '0.25rem 0', fontSize: '0.78rem',
    borderBottom: '1px solid var(--glass-border)',
    color: 'var(--text-dim)',
  },
  label: { fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.25rem' },
};

export default function DiceRoller() {
  const [sides, setSides] = useState(6);
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState([]);

  const roll = () => {
    setRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * sides) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * sides) + 1;
        setResult(final);
        setRolling(false);
        setHistory(prev => [`d${sides}: ${final}`, ...prev].slice(0, 20));
      }
    }, 60);
  };

  return (
    <div style={S.container}>
      <div style={S.label}>Chọn loại xúc xắc</div>
      <div style={S.diceSelector}>
        {SIDES.map(s => (
          <button
            key={s}
            style={S.diceBtn(sides === s)}
            onClick={() => setSides(s)}
          >d{s}</button>
        ))}
      </div>
      <div style={{
        ...S.result,
        animation: rolling ? 'spin 0.3s linear infinite' : 'none',
      }}>
        {result !== null ? (
          <span style={{ color: 'var(--accent)' }}>{result}</span>
        ) : (
          <span style={{ color: 'var(--text-dim)', opacity: 0.3 }}>?</span>
        )}
      </div>
      <button style={S.rollBtn} onClick={roll}>
        {rolling ? '🎲 Đang tung...' : '🎲 Tung xúc xắc'}
      </button>
      {history.length > 0 && (
        <div style={S.history}>
          <div style={S.historyTitle}>Lịch sử</div>
          {history.map((item, i) => (
            <div key={i} style={S.historyItem}>
              <span>#{history.length - i}</span>
              <span style={{ color: 'var(--text)' }}>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
