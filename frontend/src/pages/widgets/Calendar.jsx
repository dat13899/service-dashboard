import { useState } from 'react';

const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const dayNames = ['CN','T2','T3','T4','T5','T6','T7'];

export default function Calendar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const today = new Date();
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
        <button onClick={prev} style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-dim)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>◀</button>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)' }}>{months[month]} {year}</div>
        <button onClick={next} style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-dim)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>▶</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem', maxWidth: '350px', margin: '0 auto' }}>
        {dayNames.map(d => (
          <div key={d} style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600, padding: '0.2rem 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} style={{
            padding: '0.35rem 0', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)',
            background: d === null ? 'transparent' : isToday(d) ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
            color: d === null ? 'transparent' : isToday(d) ? '#fff' : d ? 'var(--text)' : 'transparent',
            fontWeight: isToday(d) ? 700 : 400,
          }}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
}
