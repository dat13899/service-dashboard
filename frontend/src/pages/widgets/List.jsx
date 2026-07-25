import { useState } from 'react';

export default function List() {
  const [text, setText] = useState('');
  const [items, setItems] = useState(['Học bài', 'Tập thể dục', 'Đọc sách', 'Nấu ăn', 'Đi dạo']);
  const [result, setResult] = useState(null);

  const addItem = () => {
    const t = text.trim();
    if (!t) return;
    setItems(prev => [...prev, t]);
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') addItem();
  };

  const pick = () => {
    if (items.length === 0) return;
    setResult(items[Math.floor(Math.random() * items.length)]);
  };

  const removeItem = (i) => {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div style={{ padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
        <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
          placeholder="Thêm mục..."
          style={{
            flex: 1, padding: '0.4rem 0.7rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)', background: 'var(--surface-2)',
            color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
          }}
        />
        <button onClick={addItem}
          style={{
            padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: '0.78rem', cursor: 'pointer',
          }}
        >
          + Thêm
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {items.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '0.5rem' }}>
            Danh sách trống
          </div>
        ) : items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.02)', marginBottom: '0.2rem',
            fontSize: '0.82rem', color: 'var(--text)',
          }}>
            <span>{i + 1}. {item}</span>
            <span onClick={() => removeItem(i)}
              style={{ color: '#ef4444', cursor: 'pointer', fontSize: '0.72rem', opacity: 0.6 }}
            >✕</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={pick} disabled={items.length === 0}
          style={{
            padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
            background: items.length === 0 ? 'var(--text-dim)' : 'var(--accent)',
            color: '#fff', fontSize: '0.85rem', fontWeight: 600,
            cursor: items.length === 0 ? 'default' : 'pointer',
          }}
        >
          🎲 Chọn ngẫu nhiên
        </button>
      </div>

      {result && (
        <div style={{
          marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)', textAlign: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.15rem' }}>Kết quả</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>{result}</div>
        </div>
      )}
    </div>
  );
}
