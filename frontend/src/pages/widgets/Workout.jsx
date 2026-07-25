import { useState } from 'react';

const exercises = [
  { name: 'Hít đất', emoji: '💪', reps: '10-15 cái', body: 'Ngực, tay sau' },
  { name: 'Squat', emoji: '🦵', reps: '15-20 cái', body: 'Đùi, mông' },
  { name: 'Jumping Jack', emoji: '🏃', reps: '30 giây', body: 'Toàn thân' },
  { name: 'Plank', emoji: '🧘', reps: '30-60 giây', body: 'Core' },
  { name: 'Gập bụng', emoji: '💪', reps: '15-20 cái', body: 'Bụng' },
  { name: 'Lunge', emoji: '🦵', reps: '10-12 mỗi chân', body: 'Đùi, mông' },
  { name: 'Burpee', emoji: '💥', reps: '8-12 cái', body: 'Toàn thân' },
  { name: 'Dips ghế', emoji: '💪', reps: '10-15 cái', body: 'Tay sau, ngực' },
  { name: 'Nâng chân', emoji: '🦵', reps: '15 cái mỗi bên', body: 'Bụng dưới' },
  { name: 'Bicycle Crunch', emoji: '🚴', reps: '20 cái', body: 'Bụng, core' },
  { name: 'Mountain Climber', emoji: '⛰️', reps: '30 giây', body: 'Toàn thân' },
  { name: 'Superman', emoji: '🦸', reps: '10-15 cái', body: 'Lưng' },
  { name: 'Calf Raise', emoji: '🦵', reps: '20 cái', body: 'Bắp chân' },
  { name: 'Tricep Pushup', emoji: '💪', reps: '8-12 cái', body: 'Tay sau' },
  { name: 'Side Plank', emoji: '🧘', reps: '20-30 giây mỗi bên', body: 'Core, hông' },
  { name: 'Glute Bridge', emoji: '🦵', reps: '15-20 cái', body: 'Mông, lưng dưới' },
  { name: 'Arm Circles', emoji: '🔄', reps: '30 giây', body: 'Vai' },
  { name: 'Wall Sit', emoji: '🧱', reps: '30-60 giây', body: 'Đùi' },
  { name: 'Russian Twist', emoji: '🔄', reps: '20 cái', body: 'Bụng, core' },
  { name: 'High Knees', emoji: '🏃', reps: '30 giây', body: 'Toàn thân' },
];

export default function Workout() {
  const [routine, setRoutine] = useState([]);

  const genRoutine = () => {
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);
    setRoutine(shuffled.slice(0, 5));
  };

  return (
    <div style={{ padding: '1.5rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>💪</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
          Random bài tập — 5 động tác
        </div>
        <button onClick={genRoutine}
          style={{
            padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: '0.85rem',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          🏋️ Tạo bài tập
        </button>
      </div>
      {routine.length > 0 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {routine.map((ex, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
              background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)', marginBottom: '0.4rem',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(129,140,248,0.15)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>{ex.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-strong)' }}>
                  {ex.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                  {ex.reps} · {ex.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
