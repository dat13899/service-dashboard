import { useState, lazy, Suspense } from 'react';
import widgets from './widgets/widgetData';

/* ── WidgetPage ──
 * Widget registry: mỗi widget được đăng ký 1 lần ở đây.
 * Thêm widget mới: thêm entry vào widgetData.js + tạo file .jsx + thêm 1 dòng import dưới.
 */
const widgetMap = {
  random: lazy(() => import('./widgets/RandomDiscovery.jsx')),
  dice: lazy(() => import('./widgets/DiceRoller.jsx')),
  coin: lazy(() => import('./widgets/CoinFlip.jsx')),
  number: lazy(() => import('./widgets/NumberGen.jsx')),
  password: lazy(() => import('./widgets/PasswordGen.jsx')),
  palette: lazy(() => import('./widgets/ColorPalette.jsx')),
  gradient: lazy(() => import('./widgets/GradientGen.jsx')),
  activity: lazy(() => import('./widgets/ActivitySuggester.jsx')),
  '8ball': lazy(() => import('./widgets/Magic8Ball.jsx')),
  braindump: lazy(() => import('./widgets/BrainDump.jsx')),
  games: lazy(() => import('./widgets/MiniGames.jsx')),
  food: lazy(() => import('./widgets/Food.jsx')),
  bmi: lazy(() => import('./widgets/Bmi.jsx')),
  calendar: lazy(() => import('./widgets/Calendar.jsx')),
  cards: lazy(() => import('./widgets/Cards.jsx')),
  challenge: lazy(() => import('./widgets/Challenge.jsx')),
  convert: lazy(() => import('./widgets/Convert.jsx')),
  countdown: lazy(() => import('./widgets/Countdown.jsx')),
  counter: lazy(() => import('./widgets/Counter.jsx')),
  emoji: lazy(() => import('./widgets/Emoji.jsx')),
  guess: lazy(() => import('./widgets/Guess.jsx')),
  history: lazy(() => import('./widgets/History.jsx')),
  idea: lazy(() => import('./widgets/Idea.jsx')),
  list: lazy(() => import('./widgets/List.jsx')),
  mood: lazy(() => import('./widgets/Mood.jsx')),
  pomodoro: lazy(() => import('./widgets/Pomodoro.jsx')),
  rps: lazy(() => import('./widgets/Rps.jsx')),
  tarot: lazy(() => import('./widgets/Tarot.jsx')),
  textgen: lazy(() => import('./widgets/TextGen.jsx')),
  van: lazy(() => import('./widgets/Van.jsx')),
  workout: lazy(() => import('./widgets/Workout.jsx')),
};

export default function WidgetPage() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const ActiveWidget = selected ? widgetMap[selected] : null;
  const activeInfo = widgets.find(w => w.id === selected);

  const filtered = widgets.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter" style={{ padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {selected ? (
          <div style={{ animation: 'fadeUp .3s ease' }}>
            <div className="flex items-center gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
              <button onClick={() => setSelected(null)} className="btn btn-glass btn-sm"><i className="fas fa-arrow-left" /> Back</button>
              <span className="font-semibold" style={{ fontSize: '1.05rem', color: 'var(--text-strong)' }}>{activeInfo?.icon} {activeInfo?.name}</span>
            </div>
            <Suspense fallback={<div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}><div className="spinner" /> Loading...</div>}>
              {ActiveWidget && <ActiveWidget />}
            </Suspense>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', paddingTop: '0.5rem', marginBottom: '1rem' }}>
              <h1 className="hero-gradient-text">🎲 Widget</h1>
              <p className="text-dim" style={{ fontSize: '0.8rem', marginTop: '2px' }}>Chọn một widget để sử dụng</p>
            </div>

            <div className="flex justify-center mb-md">
              <input className="input" type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Tìm widget..." style={{ maxWidth: '360px', width: '100%' }} />
            </div>

            <div className="widget-grid">
              {filtered.length === 0 ? (
                <div className="empty-state">Không tìm thấy widget &quot;{search}&quot;</div>
              ) : filtered.map(w => (
                <div key={w.id} className="card card-hover" onClick={() => setSelected(w.id)}
                  style={{ padding: '1rem 0.6rem', textAlign: 'center', position: 'relative' }}>
                  {w.badge && <span className="badge badge-accent" style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.5rem' }}>{w.badge}</span>}
                  <div style={{ fontSize: '2rem', marginBottom: '0.35rem', lineHeight: '1.2' }}>{w.icon}</div>
                  <div className="font-semibold" style={{ fontSize: '0.85rem', marginBottom: '0.15rem', color: 'var(--text-strong)' }}>{w.name}</div>
                  <div className="text-dim" style={{ fontSize: '0.65rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{w.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        .widget-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        @media (min-width: 480px) { .widget-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 720px) { .widget-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); } }
      `}</style>
    </div>
  );
}
