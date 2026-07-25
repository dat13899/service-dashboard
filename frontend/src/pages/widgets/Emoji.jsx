import { useState } from 'react';

const emojis = ['😀','😎','🤩','😜','🤪','😈','👻','🎃','🤖','👽','🦄','🐉','🦖','🐱','🐶','🐼','🐸','🦊','🐯','🦁',
  '🍕','🍔','🌮','🍩','🧁','🎂','🍦','🍿','🥤','☕','⚽','🏀','🎸','🎹','🚀','🛸','🌈','⭐','🔥','💎',
  '🌸','🌺','🍄','🌻','🍀','🎭','🎪','🎨','🧩','🎲','💡','🔮','📚','🎯','🧠','💪','🫶','✨','💫','🌟'];

export default function Emoji() {
  const [mix, setMix] = useState([]);

  const generate = () => {
    const n = Math.floor(Math.random() * 3) + 3;
    const result = [];
    for (let i = 0; i < n; i++) {
      result.push(emojis[Math.floor(Math.random() * emojis.length)]);
    }
    setMix(result);
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😎</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        Trộn emoji ngẫu nhiên
      </div>
      <button onClick={generate}
        style={{
          padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
          background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem',
        }}
      >
        🎲 Trộn
      </button>
      {mix.length > 0 && (
        <div style={{
          padding: '1.5rem', borderRadius: 'var(--radius-md)',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '2.5rem', lineHeight: 1.5, letterSpacing: '0.15em' }}>
            {mix.join('')}
          </div>
          <button onClick={() => {
            navigator.clipboard?.writeText(mix.join(''));
          }}
            style={{
              marginTop: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-dim)', fontSize: '0.72rem', cursor: 'pointer',
            }}
          >
            📋 Copy
          </button>
        </div>
      )}
    </div>
  );
}
