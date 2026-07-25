import { useState } from 'react';

const suits = [
  { sym: '♠', color: '#222' },
  { sym: '♥', color: '#ef4444' },
  { sym: '♣', color: '#222' },
  { sym: '♦', color: '#ef4444' },
];
const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function createDeck() {
  const deck = [];
  for (const s of suits)
    for (const r of ranks)
      deck.push({ rank: r, suit: s });
  return deck;
}

export default function Cards() {
  const [hand, setHand] = useState([]);
  const [count, setCount] = useState(1);

  const draw = () => {
    const deck = createDeck();
    const n = Math.min(count, 52);
    const drawn = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * deck.length);
      drawn.push(deck.splice(idx, 1)[0]);
    }
    setHand(drawn);
  };

  return (
    <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Số bài:</div>
        <input type="number" min="1" max="10" value={count}
          onChange={e => setCount(Math.min(10, Math.max(1, Number(e.target.value))))}
          style={{
            width: '60px', padding: '0.3rem 0.4rem', textAlign: 'center',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
            background: 'var(--surface-2)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
          }}
        />
        <button onClick={draw}
          style={{
            padding: '0.4rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: '0.85rem',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          🃏 Rút bài
        </button>
      </div>
      {hand.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeIn 0.3s ease' }}>
          {hand.map((c, i) => (
            <div key={i} style={{
              width: '70px', height: '100px', borderRadius: '8px',
              background: '#fff', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: c.suit.color, fontWeight: 700, fontSize: '1.1rem',
            }}>
              <div>{c.rank}</div>
              <div style={{ fontSize: '1.3rem' }}>{c.suit.sym}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
