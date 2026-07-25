import { useState, useRef, useCallback, useEffect } from 'react';
import { useToastContext } from '../components/shared/Toast';

const UTILITIES = [
  { id: 'youtube', icon: '🎵', name: 'YouTube Audio Player', desc: 'Dán link YouTube → phát âm thanh. Timer 5p mặc định, tắt hẳn stream khi hết giờ.' },
];

export default function UtilitiesPage() {
  const toast = useToastContext();
  const [selected, setSelected] = useState('youtube');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null); // { title, thumbnail, uploader, duration }
  const [timer, setTimer] = useState(300);
  const [timerLabel, setTimerLabel] = useState('⏳ Tắt sau 5p');
  const [streaming, setStreaming] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const killStream = useCallback(async () => {
    try { await fetch('/api/utilities/youtube-audio/stop', { method: 'POST' }); } catch {}
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    setStreaming(false);
  }, []);

  useEffect(() => {
    return () => { killStream(); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [killStream]);

  const loadYt = async () => {
    if (!url.trim()) { toast('Dán link YouTube', 'error'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/utilities/youtube-audio?url=' + encodeURIComponent(url.trim()));
      if (!r.ok) throw new Error('fetch-failed');
      const d = await r.json();
      setPlayer(d);
      await killStream();
      const a = audioRef.current;
      if (a) {
        a.src = '/api/utilities/youtube-audio/stream?url=' + encodeURIComponent(url.trim());
        a.play().catch(() => {});
      }
      setStreaming(true);
      setTimerSec(300);
    } catch {
      toast('Không tải được. Kiểm tra link.', 'error');
    }
    setLoading(false);
  };

  const setTimerSec = (sec) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimer(sec);
    const l = sec >= 1800 ? '30p' : sec >= 600 ? '10p' : sec >= 300 ? '5p' : '3p';
    setTimerLabel(`⏳ Tắt sau ${l}`);
    timerRef.current = setTimeout(async () => {
      await killStream();
      setTimerLabel('⏹ Đã tắt');
      toast('⏹ Audio đã tắt hoàn toàn', 'info');
    }, sec * 1000);
  };

  return (
    <>
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 className="title is-4" style={{ color: 'var(--text-strong)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🧰 Tiện ích
          </h1>

          {/* Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem',
          }}>
            {UTILITIES.map(ut => (
              <div key={ut.id} className="card glass-card" style={{
                cursor: 'pointer',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                border: selected === ut.id ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                transition: 'transform .2s, box-shadow .2s',
                transform: selected === ut.id ? 'translateY(-3px)' : 'none',
                boxShadow: selected === ut.id ? '0 12px 36px var(--glass-shadow)' : '0 4px 20px rgba(0,0,0,0.08)',
              }} onClick={() => setSelected(ut.id)}>
                <div className="card-header" style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{ut.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-strong)' }}>{ut.name}</span>
                </div>
                <div className="card-content" style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>{ut.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Player area */}
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem',
            animation: 'fadeIn .25s ease',
          }}>
            {/* Input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <input value={url} onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadYt()}
                placeholder="Dán link YouTube vào đây..."
                style={{
                  flex: 1, padding: '0.5rem 0.8rem',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
              <button onClick={loadYt} disabled={loading}
                style={{
                  padding: '0.45rem 1rem', border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent)', color: '#fff',
                  fontWeight: 600, cursor: 'pointer',
                  fontSize: '0.82rem', opacity: loading ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}
              >
                <i className="fas fa-play"></i> {loading ? '...' : 'Play'}
              </button>
            </div>

            {/* Empty state or player */}
            {!player ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎵</div>
                <p>Dán link YouTube, bấm Play</p>
              </div>
            ) : loading ? (
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '0.5rem' }}>
                <div style={{ width: '80px', height: '60px', borderRadius: '6px', background: 'linear-gradient(90deg,var(--surface-2) 25%,var(--border) 50%,var(--surface-2) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '0.8rem', marginBottom: '0.5rem', borderRadius: '4px', background: 'linear-gradient(90deg,var(--surface-2) 25%,var(--border) 50%,var(--surface-2) 75%)', backgroundSize: '200%', animation: 'shimmer 1.5s infinite', width: '60%' }} />
                  <div style={{ height: '0.6rem', borderRadius: '4px', background: 'linear-gradient(90deg,var(--surface-2) 25%,var(--border) 50%,var(--surface-2) 75%)', backgroundSize: '200%', animation: 'shimmer 1.5s infinite', width: '40%' }} />
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                  {player.thumbnail && (
                    <img src={player.thumbnail} alt="" style={{
                      width: '80px', height: '60px', objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface-2)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-strong)' }}>
                      {player.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      {player.uploader}
                      {player.duration && ` · ${Math.floor(player.duration / 60)}:${String(player.duration % 60).padStart(2, '0')}`}
                    </div>
                  </div>
                </div>

                <audio ref={audioRef} controls autoPlay style={{ width: '100%', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }} />

                {/* Timer bar */}
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>⏱ Tắt sau:</span>
                  {[
                    { label: '3p', sec: 180 },
                    { label: '5p', sec: 300 },
                    { label: '10p', sec: 600 },
                    { label: '30p', sec: 1800 },
                  ].map(t => (
                    <button key={t.sec} onClick={() => setTimerSec(t.sec)}
                      style={{
                        border: timer === t.sec ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                        background: timer === t.sec ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                        color: timer === t.sec ? '#fff' : 'var(--text-dim)',
                        padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.68rem', cursor: 'pointer',
                        fontWeight: timer === t.sec ? 600 : 400,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent)', marginLeft: 'auto', fontWeight: 500 }}>
                    {timerLabel}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
