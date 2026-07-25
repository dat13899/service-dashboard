import { useState } from 'react';

const choices = [
  { id: 'rock', emoji: '✊', label: 'Kéo', beats: 'scissors' },
  { id: 'paper', emoji: '✋', label: 'Búa', beats: 'rock' },
  { id: 'scissors', emoji: '✌️', label: 'Bao', beats: 'paper' },
];

export default function Rps() {
  const [player, setPlayer] = useState(null);
  const [computer, setComputer] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ w: 0, l: 0, d: 0 });

  const play = (pid) => {
    const p = choices.find(c => c.id === pid);
    const c = choices[Math.floor(Math.random() * 3)];
    setPlayer(p);
    setComputer(c);

    if (p.id === c.id) {
      setResult('🤝 Hòa!');
      setScore(s => ({ ...s, d: s.d + 1 }));
    } else if (p.beats === c.id) {
      setResult('🎉 Bạn thắng!');
      setScore(s => ({ ...s, w: s.w + 1 }));
    } else {
      setResult('😞 Bạn thua!');
      setScore(s => ({ ...s, l: s.l + 1 }));
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        {choices.map(c => (
          <button key={c.id} onClick={() => play(c.id)}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
              backdropFilter: 'blur(16px)', fontSize: '2rem', cursor: 'pointer',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {c.emoji}
          </button>
        ))}
      </div>

      {player && computer && (
        <div style={{ animation: 'fadeIn 0.2s ease', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '0.75rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.15rem' }}>Bạn</div>
              <div style={{ fontSize: '2rem' }}>{player.emoji}</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.15rem' }}>Máy</div>
              <div style={{ fontSize: '2rem' }}>{computer.emoji}</div>
            </div>
          </div>
          <div style={{
            fontSize: '1.1rem', fontWeight: 700,
            color: result.includes('thắng') ? '#22c55e' : result.includes('thua') ? '#ef4444' : '#f59e0b',
          }}>
            {result}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        <span>Thắng: <span style={{ color: '#22c55e', fontWeight: 600 }}>{score.w}</span></span>
        <span>Thua: <span style={{ color: '#ef4444', fontWeight: 600 }}>{score.l}</span></span>
        <span>Hòa: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{score.d}</span></span>
      </div>
    </div>
  );
}
