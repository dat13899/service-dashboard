import { useState, useEffect } from 'react';

export default function Guess() {
  const [target, setTarget] = useState(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    newGame();
  }, []);

  const newGame = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setMessage('');
    setAttempts(0);
    setGameOver(false);
    setHistory([]);
  };

  const check = () => {
    const g = Number(guess);
    if (!g || g < 1 || g > 100) { setMessage('Nhập số từ 1-100!'); return; }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (g === target) {
      setMessage(`🎉 Chính xác! Bạn đã đoán đúng ${target} sau ${newAttempts} lần!`);
      setGameOver(true);
    } else if (g < target) {
      setMessage('⬆️ Lớn hơn!');
    } else {
      setMessage('⬇️ Nhỏ hơn!');
    }
    setHistory(prev => [`${g}${g === target ? ' ✅' : g < target ? ' ↑' : ' ↓'}`, ...prev].slice(0, 20));
    setGuess('');
  };

  const handleKey = (e) => { if (e.key === 'Enter') check(); };

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
        Đoán số từ 1 đến 100
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <input type="number" min="1" max="100" value={guess}
          onChange={e => setGuess(e.target.value)} onKeyDown={handleKey}
          disabled={gameOver}
          style={{
            width: '100px', padding: '0.5rem', textAlign: 'center',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
            background: 'var(--surface-2)', color: 'var(--text)',
            fontSize: '1.2rem', outline: 'none', fontWeight: 700,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={check} disabled={gameOver}
          style={{
            padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
            background: gameOver ? 'var(--text-dim)' : 'var(--accent)', color: '#fff',
            fontSize: '0.85rem', fontWeight: 600, cursor: gameOver ? 'default' : 'pointer',
          }}
        >
          🎯 Đoán
        </button>
        <button onClick={newGame}
          style={{
            padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-dim)', fontSize: '0.78rem', cursor: 'pointer',
          }}
        >
          🔄 Chơi lại
        </button>
      </div>
      {message && (
        <div style={{
          fontSize: gameOver ? '0.95rem' : '0.85rem', fontWeight: 600,
          color: gameOver ? '#22c55e' : 'var(--text)', marginBottom: '1rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          {message}
        </div>
      )}
      {history.length > 0 && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          Lần đoán: {attempts}
        </div>
      )}
    </div>
  );
}
