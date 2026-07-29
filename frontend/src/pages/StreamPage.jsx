import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import Hls from 'hls.js';

/* ── Inline styles ── */
const s = {
  page: {
    padding: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    paddingBottom: '6rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  title: {
    fontSize: '1.35rem',
    fontWeight: 700,
    color: 'var(--text)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-dim)',
  },
  inputCard: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '0.65rem 0.85rem',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    background: 'var(--glass-bg)',
    color: 'var(--text)',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    transition: 'border var(--transition-fast)',
  },
  inputFocus: {
    border: '1px solid var(--accent)',
  },
  playBtn: {
    padding: '0.65rem 1.2rem',
    border: 'none',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  playerCard: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: '16/9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'contain',
    background: '#000',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--text-dim)',
    padding: '2rem',
    textAlign: 'center',
  },
  placeholderIcon: {
    fontSize: '2.5rem',
    opacity: 0.4,
  },
  infoBar: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    padding: '0.5rem 0',
  },
  infoTag: {
    background: 'rgba(0,212,255,0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
  },
  errorMsg: {
    fontSize: '0.78rem',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  recentItem: {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid transparent',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-dim)',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

/* ── Load recent URLs from localStorage ── */
const RECENT_KEY = 'btdat-stream-recent';
function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 5);
  } catch { return []; }
}
function saveRecent(url) {
  const existing = loadRecent().filter(u => u !== url);
  existing.unshift(url);
  localStorage.setItem(RECENT_KEY, JSON.stringify(existing.slice(0, 5)));
}

export default function StreamPage() {
  const [url, setUrl] = useState('');
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState(loadRecent);
  const [status, setStatus] = useState('');
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Cleanup HLS on unmount ── */
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  /* ── Load & play stream ── */
  const playStream = useCallback((streamUrl) => {
    if (!streamUrl) return;
    setError('');
    setStatus('Đang kết nối…');
    setPlaying(false);

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    if (!video) return;

    // Try native HLS first (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().then(() => {
        setPlaying(true);
        setStatus('Live');
      }).catch(e => {
        setError('Không thể phát: ' + e.message);
      });
      return;
    }

    // Use hls.js for other browsers
    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => {
          setPlaying(true);
          setStatus('Live');
        }).catch(e => {
          setError('Tự động phát bị chặn. Click vào video để phát.');
        });
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError('Lỗi stream: ' + (data.details || 'không xác định'));
          setPlaying(false);
          setStatus('');
        }
      });
      return;
    }

    // Fallback: try direct source
    video.src = streamUrl;
    video.play().then(() => {
      setPlaying(true);
      setStatus('M3U8 (direct)');
    }).catch(e => {
      setError('Không thể phát. Trình duyệt không hỗ trợ HLS.');
    });
  }, []);

  /* ── Handle play button / Enter ── */
  const handlePlay = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Vui lòng nhập link stream');
      return;
    }
    saveRecent(trimmed);
    setRecent(loadRecent());
    playStream(trimmed);
  }, [url, playStream]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handlePlay();
  }, [handlePlay]);

  /* ── Click recent item ── */
  const handleRecentClick = useCallback((recentUrl) => {
    setUrl(recentUrl);
    playStream(recentUrl);
  }, [playStream]);

  /* ── Input focus border ── */
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={s.page}
    >
      {/* Header */}
      <div style={s.header}>
        <div style={s.title}>
          <i className="fas fa-play" style={{ color: 'var(--accent)', fontSize: '1rem' }} />
          Stream Player
        </div>
        <div style={s.subtitle}>
          Dán link HLS (.m3u8) để xem stream trực tiếp
        </div>
      </div>

      {/* Input card */}
      <div className="liquid-card" style={s.inputCard}>
        <div style={s.inputRow}>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="https://example.com/stream.m3u8?token=..."
            style={{
              ...s.input,
              ...(focused ? s.inputFocus : {}),
            }}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            style={s.playBtn}
            onClick={handlePlay}
          >
            <i className={`fas ${playing ? 'fa-rotate-right' : 'fa-play'}`} />
            {playing ? 'Reload' : 'Play'}
          </motion.button>
        </div>

        {/* Error */}
        {error && (
          <div style={s.errorMsg}>
            <i className="fas fa-circle-exclamation" />
            {error}
          </div>
        )}

        {/* Status bar */}
        {status && (
          <div style={s.infoBar}>
            <span>📡 {status}</span>
            {url && url.includes('.m3u8') && (
              <span style={s.infoTag}>HLS</span>
            )}
            {url && url.includes('cdnsi.com') && (
              <span style={s.infoTag}>VolcCDN</span>
            )}
            {url && url.includes('expire=') && (
              <span style={{ ...s.infoTag, background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                ⏱ Có expire
              </span>
            )}
          </div>
        )}
      </div>

      {/* Player */}
      <div className="liquid-card" style={s.playerCard}>
        {playing || status ? (
          <video
            ref={videoRef}
            style={s.video}
            controls
            autoPlay
            playsInline
            muted={false}
          />
        ) : (
          <div style={s.placeholder}>
            <i className="fas fa-film" style={s.placeholderIcon} />
            <span>Dán link HLS và nhấn Play</span>
            <span style={{ fontSize: '0.7rem' }}>
              Hỗ trợ .m3u8 từ yy-live, web.cdnsi.com, và các CDN HLS khác
            </span>
          </div>
        )}
      </div>

      {/* Recent streams */}
      {recent.length > 0 && (
        <div className="liquid-card" style={{ ...s.inputCard, padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '0.3rem' }}>
            <i className="fas fa-clock-rotate" style={{ marginRight: '0.3rem' }} />
            Gần đây
          </div>
          <div style={s.recentList}>
            {recent.map((recentUrl, idx) => (
              <div
                key={idx}
                style={s.recentItem}
                onClick={() => handleRecentClick(recentUrl)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(0,212,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <i className="fas fa-arrow-rotate-right" style={{ marginRight: '0.4rem', fontSize: '0.65rem', opacity: 0.5 }} />
                {recentUrl.length > 70 ? recentUrl.substring(0, 70) + '…' : recentUrl}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
