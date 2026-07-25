import { useState, lazy, Suspense } from 'react';
import widgets from './widgets/widgetData';

const widgetComponents = {
  random: lazy(() => import('./widgets/RandomDiscovery')),
  dice: lazy(() => import('./widgets/DiceRoller')),
  coin: lazy(() => import('./widgets/CoinFlip')),
  number: lazy(() => import('./widgets/NumberGen')),
  password: lazy(() => import('./widgets/PasswordGen')),
  palette: lazy(() => import('./widgets/ColorPalette')),
  gradient: lazy(() => import('./widgets/GradientGen')),
  activity: lazy(() => import('./widgets/ActivitySuggester')),
  '8ball': lazy(() => import('./widgets/Magic8Ball')),
  braindump: lazy(() => import('./widgets/BrainDump')),
  games: lazy(() => import('./widgets/MiniGames')),
  food: lazy(() => import('./widgets/Food')),
  bmi: lazy(() => import('./widgets/Bmi')),
  calendar: lazy(() => import('./widgets/Calendar')),
  cards: lazy(() => import('./widgets/Cards')),
  challenge: lazy(() => import('./widgets/Challenge')),
  convert: lazy(() => import('./widgets/Convert')),
  countdown: lazy(() => import('./widgets/Countdown')),
  counter: lazy(() => import('./widgets/Counter')),
  emoji: lazy(() => import('./widgets/Emoji')),
  guess: lazy(() => import('./widgets/Guess')),
  history: lazy(() => import('./widgets/History')),
  idea: lazy(() => import('./widgets/Idea')),
  list: lazy(() => import('./widgets/List')),
  mood: lazy(() => import('./widgets/Mood')),
  pomodoro: lazy(() => import('./widgets/Pomodoro')),
  rps: lazy(() => import('./widgets/Rps')),
  tarot: lazy(() => import('./widgets/Tarot')),
  textgen: lazy(() => import('./widgets/TextGen')),
  van: lazy(() => import('./widgets/Van')),
  workout: lazy(() => import('./widgets/Workout')),
};

export default function WidgetPage() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const ActiveWidget = selected ? widgetComponents[selected] : null;

  const filtered = widgets.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <section className="section" style={{ paddingTop: '1.5rem' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Detail view */}
          {selected ? (
            <div style={{ animation: 'fadeUp .3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => setSelected(null)}
                  style={{
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-dim)', padding: '0.35rem 0.65rem', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                    transition: '.15s',
                  }}
                >
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-strong)' }}>
                  {widgets.find(w => w.id === selected)?.icon} {widgets.find(w => w.id === selected)?.name}
                </span>
              </div>

              <Suspense fallback={
                <div style={{
                  background: 'var(--glass-bg)', borderRadius: '12px',
                  border: '1px solid var(--glass-border)', padding: '2rem',
                  minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Loading...</div>
                </div>
              }>
                {ActiveWidget && <ActiveWidget />}
              </Suspense>
            </div>
          ) : (
            <>
              {/* Grid header */}
              <div style={{ textAlign: 'center', paddingTop: '0.5rem', marginBottom: '1rem' }}>
                <h1 style={{
                  fontSize: '1.4rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--text-strong), var(--accent))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  🎲 Widget
                </h1>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Chọn một widget để sử dụng
                </p>
              </div>

              {/* Search bar */}
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="🔍 Tìm widget..."
                  style={{
                    width: '100%', maxWidth: '360px', padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                    backdropFilter: 'blur(16px)', color: 'var(--text)',
                    fontSize: '0.85rem', outline: 'none',
                  }}
                />
              </div>

              {/* Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.75rem',
              }}
                className="widget-grid"
              >
                {filtered.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1', textAlign: 'center', padding: '2rem',
                    color: 'var(--text-dim)', fontSize: '0.85rem',
                  }}>
                    Không tìm thấy widget "{search}"
                  </div>
                ) : filtered.map(w => (
                  <div key={w.id} className="card glass-card" onClick={() => setSelected(w.id)}
                    style={{
                      position: 'relative',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem 0.6rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'transform .2s, box-shadow .2s, border-color .2s',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                    }}
                  >
                    {w.badge && (
                      <span style={{
                        position: 'absolute', top: '6px', right: '6px',
                        fontSize: '0.5rem', padding: '0.08rem 0.35rem',
                        borderRadius: '8px', color: '#fff', fontWeight: 600,
                        background: 'var(--accent)',
                        pointerEvents: 'none',
                      }}>
                        {w.badge}
                      </span>
                    )}
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.35rem', lineHeight: '1.2' }}>
                      {w.icon}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.15rem', color: 'var(--text-strong)' }}>
                      {w.name}
                    </div>
                    <div style={{
                      fontSize: '0.65rem', color: 'var(--text-dim)',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {w.desc}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Mobile responsive: 2 columns on small screens */}
      <style>{`
        @media (max-width: 720px) {
          .widget-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}
