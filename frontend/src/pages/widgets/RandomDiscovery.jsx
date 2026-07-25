import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';

const S = {
  container: { padding: '1.5rem 1rem', textAlign: 'center' },
  discoverBtn: {
    padding: '0.75rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
    fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem',
  },
  card: {
    padding: '1.5rem', borderRadius: 'var(--radius-md)',
    background: 'var(--surface-2)', border: '1px solid var(--glass-border)',
    textAlign: 'left', maxWidth: '500px', margin: '0 auto',
  },
  title: { fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '0.25rem' },
  source: { fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.75rem' },
  extract: { fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '1rem' },
  link: {
    display: 'inline-block', fontSize: '0.78rem', color: 'var(--accent)',
    textDecoration: 'none', fontWeight: 600,
  },
  loading: {
    fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem',
  },
  thumbnail: {
    width: '100%', maxHeight: '200px', objectFit: 'cover',
    borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem',
  },
  error: {
    padding: '1rem', borderRadius: 'var(--radius-sm)',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444', fontSize: '0.82rem', marginBottom: '1rem',
  },
};

export default function RandomDiscovery() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const discover = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch('/api/utilities/random?type=any');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || 'Không thể kết nối API');
      toast('Không thể khám phá ngẫu nhiên', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.container}>
      <button style={S.discoverBtn} onClick={discover} disabled={loading}>
        {loading ? '🎲 Đang khám phá...' : '🎲 Khám phá ngẫu nhiên!'}
      </button>

      {loading && <div style={S.loading}>🔍 Đang tìm kiếm điều thú vị...</div>}

      {error && <div style={S.error}>⚠️ {error}</div>}

      {data && (
        <div style={S.card}>
          {data.thumbnail && (
            <img
              src={data.thumbnail}
              alt={data.title}
              style={S.thumbnail}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div style={S.title}>{data.title || 'Không có tiêu đề'}</div>
          <div style={S.source}>
            📂 {data.source || data.type || 'unknown'}
          </div>
          <div style={S.extract}>
            {(data.extract || data.text || '').slice(0, 500)}
          </div>
          {data.url && (
            <a href={data.url} target="_blank" rel="noopener noreferrer" style={S.link}>
              🔗 Đọc thêm →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
