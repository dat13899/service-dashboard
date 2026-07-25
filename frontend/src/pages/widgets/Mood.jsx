import { useState, useEffect } from 'react';

const moods = [
  { emoji: '😄', label: 'Tuyệt vời', color: '#22c55e' },
  { emoji: '🙂', label: 'Tốt', color: '#818cf8' },
  { emoji: '😐', label: 'Bình thường', color: '#f59e0b' },
  { emoji: '😞', label: 'Buồn', color: '#f97316' },
  { emoji: '😡', label: 'Tức giận', color: '#ef4444' },
];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function loadLog() {
  try {
    return JSON.parse(localStorage.getItem('moodLog') || '{}');
  } catch { return {}; }
}

function saveLog(log) {
  localStorage.setItem('moodLog', JSON.stringify(log));
}

export default function Mood() {
  const [log, setLog] = useState({});
  const [note, setNote] = useState('');
  const today = getToday();

  useEffect(() => { setLog(loadLog()); }, []);

  const setMood = (idx) => {
    const newLog = { ...log, [today]: { mood: idx, note: note || '' } };
    setLog(newLog);
    saveLog(newLog);
  };

  const todayEntry = log[today];
  const days = Object.keys(log).sort().reverse().slice(0, 30);

  return (
    <div style={{ padding: '1.5rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          Hôm nay bạn thế nào?
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {moods.map((m, i) => (
            <button key={i} onClick={() => setMood(i)}
              style={{
                padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)',
                border: todayEntry?.mood === i ? `2px solid ${m.color}` : '1px solid var(--glass-border)',
                background: todayEntry?.mood === i ? `${m.color}22` : 'rgba(255,255,255,0.03)',
                cursor: 'pointer', fontSize: '0.78rem', color: m.color, fontWeight: todayEntry?.mood === i ? 600 : 400,
                transition: 'all .15s',
              }}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          placeholder="Ghi chú hôm nay..."
          style={{
            padding: '0.35rem 0.7rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)', background: 'var(--surface-2)',
            color: 'var(--text)', fontSize: '0.78rem', outline: 'none',
            width: '200px',
          }}
        />
      </div>

      {days.length > 0 && (
        <>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textAlign: 'center' }}>
            Lịch sử 30 ngày
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {days.map(d => {
              const entry = log[d];
              const m = entry ? moods[entry.mood] : null;
              return (
                <div key={d} title={`${d}: ${m ? m.label : ''}`}
                  style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                    background: m ? `${m.color}33` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${m ? `${m.color}44` : 'var(--glass-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', cursor: 'default',
                  }}
                >
                  {m ? m.emoji : '-'}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
