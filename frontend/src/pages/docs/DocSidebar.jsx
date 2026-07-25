import { useState, useMemo, useRef, useCallback } from 'react';

const ALL_TAGS = ['note', 'guide', 'reference', 'draft', 'important', 'archive'];

const s = {
  sidebar: (visible, mobile) => ({
    width: mobile ? '100%' : '280px',
    minWidth: mobile ? '100%' : '280px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: mobile ? '0' : 'var(--radius-lg)',
    overflow: 'hidden',
    transition: 'all .3s ease',
    position: mobile ? 'relative' : 'static',
    zIndex: mobile && visible ? 10 : mobile ? 0 : 1,
  }),
  header: {
    padding: '1rem 1rem 0.5rem',
    borderBottom: '1px solid var(--glass-border)',
  },
  headerTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-strong)',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.82rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid var(--glass-border)',
  },
  tagChip: (active) => ({
    fontSize: '0.72rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    border: '1px solid var(--glass-border)',
    background: active ? 'var(--accent)' : 'var(--surface-2)',
    color: active ? '#fff' : 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'all .15s',
    fontWeight: active ? 600 : 400,
  }),
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem',
  },
  docItem: (selected) => ({
    padding: '0.5rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'background .15s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: selected ? 'rgba(99,102,241,0.08)' : 'transparent',
    border: selected ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
  }),
  docTitle: {
    fontSize: '0.82rem',
    color: 'var(--text)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  docTags: {
    display: 'flex',
    gap: '0.2rem',
    flexWrap: 'wrap',
    marginTop: '0.15rem',
  },
  docTag: {
    fontSize: '0.65rem',
    padding: '0.05rem 0.35rem',
    borderRadius: '999px',
    background: 'var(--surface-2)',
    color: 'var(--text-dim)',
    border: '1px solid var(--glass-border)',
  },
  empty: {
    padding: '2rem 1rem',
    textAlign: 'center',
    color: 'var(--text-dim)',
    fontSize: '0.82rem',
  },
  newBtn: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'all .15s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  dragOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(99,102,241,0.1)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-lg)',
    zIndex: 5,
    fontSize: '0.9rem',
    color: 'var(--accent)',
    fontWeight: 600,
  },
  checkbox: {
    cursor: 'pointer',
    accentColor: 'var(--accent)',
    flexShrink: 0,
  },
};

export default function DocSidebar({ docs, loading, currentDoc, selectedTags, setSelectedTags, searchQuery, setSearchQuery, onSelectDoc, onCreateDoc, onDeleteDoc, onUploadDoc, visible, isMobile }) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleTagToggle = useCallback((tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, [setSelectedTags]);

  const filteredDocs = useMemo(() => {
    let result = docs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.content || '').toLowerCase().includes(q)
      );
    }
    if (selectedTags.length > 0) {
      result = result.filter(d =>
        d.tags && selectedTags.some(t => (d.tags || []).includes(t))
      );
    }
    return result;
  }, [docs, searchQuery, selectedTags]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(f => onUploadDoc?.(f));
    }
  }, [onUploadDoc]);

  return (
    <div
      style={s.sidebar(visible, isMobile)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTitle}>
          <span><i className="fas fa-file-lines" style={{ marginRight: '0.35rem', color: 'var(--accent)' }}></i>Tài liệu</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button style={s.newBtn} onClick={onCreateDoc} title="Tạo mới">
              <i className="fas fa-plus" style={{ fontSize: '0.65rem' }}></i> Mới
            </button>
            <button style={s.newBtn} onClick={() => fileRef.current?.click()} title="Tải lên">
              <i className="fas fa-upload" style={{ fontSize: '0.65rem' }}></i>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".md,.txt,.html,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadDoc?.(f);
                e.target.value = '';
              }}
            />
          </div>
        </div>
        <input
          style={s.searchInput}
          placeholder="Tìm tài liệu..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tags */}
      <div style={s.tagsRow}>
        {ALL_TAGS.map(tag => (
          <span
            key={tag}
            style={s.tagChip(selectedTags.includes(tag))}
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Doc list */}
      <div style={s.listContainer}>
        {loading && (
          <div style={s.empty}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.35rem' }}></i> Đang tải...
          </div>
        )}
        {!loading && filteredDocs.length === 0 && (
          <div style={s.empty}>
            {searchQuery || selectedTags.length > 0
              ? 'Không tìm thấy tài liệu nào'
              : 'Chưa có tài liệu nào'}
          </div>
        )}
        {!loading && filteredDocs.map(doc => (
          <div
            key={doc.id}
            style={s.docItem(currentDoc?.id === doc.id)}
            onClick={() => onSelectDoc(doc.id)}
          >
            <input
              type="checkbox"
              style={s.checkbox}
              checked={currentDoc?.id === doc.id}
              onChange={() => onSelectDoc(doc.id)}
              onClick={e => e.stopPropagation()}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.docTitle}>{doc.title || 'Untitled'}</div>
              {doc.tags && doc.tags.length > 0 && (
                <div style={s.docTags}>
                  {doc.tags.map(t => (
                    <span key={t} style={s.docTag}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Drag overlay */}
      {dragOver && (
        <div style={s.dragOverlay}>
          <i className="fas fa-cloud-upload-alt" style={{ marginRight: '0.5rem' }}></i>
          Thả file để tải lên
        </div>
      )}
    </div>
  );
}
