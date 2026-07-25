import { useState } from 'react';

const SIDES = [4, 6, 8, 10, 12, 20, 100];

const gameStyle = {
  section: {
    padding: '1rem', marginBottom: '1rem',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
  },
  title: {
    fontSize: '0.82rem', fontWeight: 600,
    color: 'var(--text-strong)', marginBottom: '0.75rem',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
  btn: {
    padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)',
    border: 'none', background: 'var(--accent)', color: '#fff',
    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
  },
  result: {
    fontSize: '1.5rem', fontWeight: 700,
    color: 'var(--accent)', margin: '0.5rem 0',
  },
  row: {
    display: 'flex', gap: '0.35rem', flexWrap: 'wrap',
    justifyContent: 'center', marginBottom: '0.5rem',
  },
  diceBtn: (active) => ({
    padding: '0.25rem 0.5rem', borderRadius: '4px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
    background: active ? 'var(--glass-bg)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-dim)',
    fontSize: '0.65rem', cursor: 'pointer',
  }),
  coinDisplay: {
    display: 'inline-block', width: '50px', height: '50px',
    borderRadius: '50%', lineHeight: '50px', textAlign: 'center',
    fontSize: '1.1rem', fontWeight: 700, margin: '0.5rem auto',
  },
  input: {
    width: '50px', padding: '0.25rem', textAlign: 'center',
    borderRadius: '4px', border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)', color: 'var(--text)',
    fontSize: '0.78rem', outline: 'none',
    margin: '0 0.25rem',
  },
  label: { fontSize: '0.7rem', color: 'var(--text-dim)', marginRight: '0.25rem' },
};

export default function MiniGames() {
  // Dice state
  const [sides, setSides] = useState(6);
  const [diceResult, setDiceResult] = useState(null);
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceHistory, setDiceHistory] = useState([]);

  // Coin state
  const [coinResult, setCoinResult] = useState(null);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);

  // Number state
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [numResult, setNumResult] = useState(null);

  const rollDice = () => {
    setDiceRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * sides) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * sides) + 1;
        setDiceResult(final);
        setDiceRolling(false);
        setDiceHistory(prev => [`d${sides}:${final}`, ...prev].slice(0, 10));
      }
    }, 70);
  };

  const flipCoin = () => {
    setCoinFlipping(true);
    let count = 0;
    const interval = setInterval(() => {
      setCoinResult(Math.random() < 0.5 ? 'H' : 'T');
      count++;
      if (count > 8) {
        clearInterval(interval);
        const final = Math.random() < 0.5 ? 'H' : 'T';
        setCoinResult(final);
        setCoinFlipping(false);
        if (final === 'H') setHeads(h => h + 1);
        else setTails(t => t + 1);
      }
    }, 80);
  };

  const genNumber = () => {
    const mn = Math.min(min, max);
    const mx = Math.max(min, max);
    setNumResult(Math.floor(Math.random() * (mx - mn + 1)) + mn);
  };

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Dice */}
      <div style={gameStyle.section}>
        <div style={gameStyle.title}>🎲 Xúc xắc</div>
        <div style={gameStyle.row}>
          {SIDES.map(s => (
            <button key={s} style={gameStyle.diceBtn(sides === s)} onClick={() => setSides(s)}>
              d{s}
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={gameStyle.result}>
            {diceResult !== null ? diceResult : <span style={{ opacity: 0.3 }}>?</span>}
          </div>
          <button style={gameStyle.btn} onClick={rollDice}>
            {diceRolling ? '🎲...' : '🎲 Tung!'}
          </button>
          {diceHistory.length > 0 && (
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
              {diceHistory.join(' · ')}
            </div>
          )}
        </div>
      </div>

      {/* Coin */}
      <div style={gameStyle.section}>
        <div style={gameStyle.title}>🪙 Tung đồng xu</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            ...gameStyle.coinDisplay,
            background: coinResult === 'H' ? '#f59e0b' : coinResult === 'T' ? '#6b7280' : '#333',
            color: '#fff',
            transform: coinFlipping ? 'rotateY(1440deg)' : 'rotateY(0)',
            transition: 'transform 0.1s',
          }}>
            {coinResult || '?'}
          </div>
          <button style={gameStyle.btn} onClick={flipCoin}>
            {coinFlipping ? '🪙...' : '🪙 Tung!'}
          </button>
          {(heads + tails) > 0 && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
              H:{heads} · T:{tails}
            </div>
          )}
        </div>
      </div>

      {/* Number */}
      <div style={gameStyle.section}>
        <div style={gameStyle.title}>🔢 Số ngẫu nhiên</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={gameStyle.label}>Min</span>
            <input style={gameStyle.input} type="number" value={min} onChange={e => setMin(Number(e.target.value))} />
            <span style={gameStyle.label}>Max</span>
            <input style={gameStyle.input} type="number" value={max} onChange={e => setMax(Number(e.target.value))} />
          </div>
          <div style={gameStyle.result}>
            {numResult !== null ? numResult : <span style={{ opacity: 0.3 }}>?</span>}
          </div>
          <button style={gameStyle.btn} onClick={genNumber}>
            🔢 Sinh số
          </button>
        </div>
      </div>
    </div>
  );
}
