import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../../hooks/useToast';

const COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca',
  '#e9d5ff', '#fed7aa', '#c7d2fe', '#a7f3d0',
  '#fde68a', '#d1fae5', '#c4b5fd', '#fbcfe8',
];

function loadNotes() {
  try {
    const raw = localStorage.getItem('braindump_notes');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotes(notes) {
  localStorage.setItem('braindump_notes', JSON.stringify(notes));
}

const S = {
  container: { padding: '1rem', position: 'relative' },
  canvas: {
    position: 'relative',
    width: '100%',
    minHeight: '400px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface-2)',
    border: '1px solid var(--glass-border)',
    overflow: 'hidden',
  },
  note: (color) => ({
    position: 'absolute',
    width: '200px',
    minHeight: '120px',
    padding: '0.6rem',
    borderRadius: '4px',
    background: color,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
    cursor: 'move',
    userSelect: 'none',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }),
  textarea: {
    width: '100%',
    flex: 1,
    border: 'none',
    background: 'transparent',
    color: '#1f2937',
    fontSize: '0.78rem',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    minHeight: '70px',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  noteTime: { fontSize: '0.55rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600 },
  deleteBtn: {
    background: 'rgba(0,0,0,0.1)',
    border: 'none',
    borderRadius: '3px',
    width: '18px',
    height: '18px',
    fontSize: '0.6rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 1,
    padding: 0,
  },
  addBtn: {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'transform 0.2s',
  },
  clearBtn: {
    position: 'absolute',
    bottom: '1rem',
    left: '1rem',
    padding: '0.35rem 0.7rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    color: 'var(--text-dim)',
    fontSize: '0.65rem',
    cursor: 'pointer',
    zIndex: 10,
  },
  empty: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: 'var(--text-dim)',
    fontSize: '0.85rem',
    pointerEvents: 'none',
  },
};

export default function BrainDump() {
  const toast = useToast();
  const [notes, setNotes] = useState([]);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  useEffect(() => {
    if (notes.length > 0) saveNotes(notes);
  }, [notes]);

  const addNote = () => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newNote = {
      id: Date.now(),
      text: '',
      color,
      x: 20 + Math.random() * 100,
      y: 20 + Math.random() * 100,
      createdAt: Date.now(),
    };
    setNotes(prev => [...prev, newNote]);
    toast('Đã thêm note mới', 'success');
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    toast('Đã xóa note', 'info');
  };

  const updateText = (id, text) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  };

  const handleMouseDown = (e, id) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const offsetX = e.clientX - rect.left - note.x;
    const offsetY = e.clientY - rect.top - note.y;
    dragRef.current = { id, offsetX, offsetY };

    const handleMouseMove = (ev) => {
      if (!dragRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      const nx = Math.max(0, Math.min(r.width - 200, ev.clientX - r.left - dragRef.current.offsetX));
      const ny = Math.max(0, Math.min(r.height - 120, ev.clientY - r.top - dragRef.current.offsetY));
      setNotes(prev => prev.map(n =>
        n.id === dragRef.current.id ? { ...n, x: nx, y: ny } : n
      ));
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const clearAll = () => {
    if (notes.length === 0) return;
    setNotes([]);
    localStorage.removeItem('braindump_notes');
    toast('Đã xóa tất cả notes', 'info');
  };

  return (
    <div style={S.container}>
      <div ref={canvasRef} style={S.canvas}>
        {notes.length === 0 && (
          <div style={S.empty}>
            🧠 Bắt đầu brain dump<br />
            <span style={{ fontSize: '0.72rem', marginTop: '0.3rem', display: 'block' }}>
              Bấm nút + để thêm ghi chú
            </span>
          </div>
        )}
        {notes.map(note => (
          <div
            key={note.id}
            style={{ ...S.note(note.color), left: note.x, top: note.y, zIndex: note.id }}
            onMouseDown={(e) => handleMouseDown(e, note.id)}
          >
            <div style={S.noteHeader}>
              <span style={S.noteTime}>
                {new Date(note.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button style={S.deleteBtn} onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                ✕
              </button>
            </div>
            <textarea
              style={S.textarea}
              placeholder="Viết gì đó..."
              value={note.text}
              onChange={(e) => updateText(note.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
        <button
          style={S.addBtn}
          onClick={addNote}
          title="Thêm ghi chú"
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          +
        </button>
        {notes.length > 0 && (
          <button style={S.clearBtn} onClick={clearAll}>
            🗑️ Xóa tất cả
          </button>
        )}
      </div>
    </div>
  );
}
