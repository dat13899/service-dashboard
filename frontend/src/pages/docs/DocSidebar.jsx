import { useState, useMemo, useRef, useCallback, useEffect } from 'react';

const LS_SEARCH_HISTORY = 'documents_search_history';

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
  sortBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.15rem 0.5rem',
    borderBottom: '1px solid var(--glass-border)',
    fontSize: '0.6rem',
    gap: '0.35rem',
  },
  sortSelect: {
    fontSize: '0.65rem',
    padding: '0.15rem 0.3rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text-dim)',
    outline: 'none',
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderBottom: '1px solid var(--glass-border)',
    gap: '0.5rem',
    fontSize: '0.65rem',
  },
  draftCheck: {
    accentColor: 'var(--accent)',
    cursor: 'pointer',
  },
  draftLabel: {
    color: 'var(--text-dim)',
    cursor: 'pointer',
    fontSize: '0.65rem',
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    padding: '0.35rem 0.5rem',
    borderBottom: '1px solid var(--glass-border)',
    maxHeight: '80px',
    overflowY: 'auto',
  },
  tagChip: (active) => ({
    fontSize: '0.58rem',
    padding: '0.1rem 0.45rem',
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
    gap: '0.4rem',
    background: selected ? 'rgba(99,102,241,0.08)' : 'transparent',
    border: selected ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
  }),
  docCheckbox: {
    cursor: 'pointer',
    accentColor: 'var(--accent)',
    flexShrink: 0,
    width: '14px',
    height: '14px',
  },
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
  footer: {
    padding: '0.35rem 0.5rem',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.65rem',
  },
  footerBtn: (color) => ({
    fontSize: '0.65rem',
    padding: '0.2rem 0.45rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: color || 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'all .15s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
  }),
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
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.15rem',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    zIndex: 50,
    maxHeight: '240px',
    overflowY: 'auto',
  },
  searchDropdownItem: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'background .1s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  searchHistoryItem: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.7rem',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'background .1s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  searchWrap: {
    position: 'relative',
  },
};

export default function DocSidebar({
  docs, loading, currentDoc, selectedTags, setSelectedTags = () => {},
  searchQuery = '', setSearchQuery = () => {}, onSelectDoc, onCreateDoc,
  onUploadDoc, visible, isMobile,
  sortBy = 'newest', setSortBy = () => {}, draftOnly, setDraftOnly,
  selectedIds = [], setSelectedIds = () => {},
  onCacheClear,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const fileRef = useRef(null);
  const searchWrapRef = useRef(null);

  // Search history from localStorage
  const searchHistory = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(LS_SEARCH_HISTORY)) || []; }
    catch { return []; }
  }, []);

  // Match docs for full-text dropdown
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return docs.filter(d =>
      (d.title || '').toLowerCase().includes(q) ||
      (d.content || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [docs, searchQuery]);

  // Click outside dropdown
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchFocus(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Save search query to history
  const saveSearchQuery = useCallback((q) => {
    if (!q.trim()) return;
    const history = (() => { try { return JSON.parse(localStorage.getItem(LS_SEARCH_HISTORY)) || []; } catch { return []; } })();
    const updated = [q.trim(), ...history.filter(h => h !== q.trim())].slice(0, 5);
    try { localStorage.setItem(LS_SEARCH_HISTORY, JSON.stringify(updated)); } catch {}
  }, []);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      saveSearchQuery(searchQuery);
      setSearchFocus(false);
    }
  }, [searchQuery, saveSearchQuery]);

  // Dynamic tags from actual docs (handles string or array)
  const allTags = useMemo(() => {
    const tagSet = new Set();
    docs.forEach(d => {
      if (d.tags) {
        const tags = Array.isArray(d.tags) ? d.tags : d.tags.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(t => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [docs]);

  const handleTagToggle = useCallback((tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, [setSelectedTags]);

  // Filtering & sorting
  const filteredDocs = useMemo(() => {
    let result = docs;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.content || '').toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter(d => {
        const tags = d.tags ? (Array.isArray(d.tags) ? d.tags : d.tags.split(',').map(t => t.trim()).filter(Boolean)) : [];
        return selectedTags.some(t => tags.includes(t));
      });
    }

    // Draft filter
    if (draftOnly) {
      result = result.filter(d => d.status === 'draft');
    }

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created || b.meta?.createdAt || 0) - new Date(a.created || a.meta?.createdAt || 0));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created || a.meta?.createdAt || 0) - new Date(b.created || b.meta?.createdAt || 0));
        break;
      case 'az':
        sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'za':
        sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      default:
        break;
    }

    return sorted;
  }, [docs, searchQuery, selectedTags, draftOnly, sortBy]);

  // Toggle selection for bulk delete
  const handleCheckToggle = useCallback((e, docId) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  }, [setSelectedIds]);

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
            <button style={s.newBtn} onClick={() => onCreateDoc?.()} title="Tạo mới">
              <i className="fas fa-plus" style={{ fontSize: '0.65rem' }}></i> Mới
            </button>
            <button style={s.newBtn} onClick={() => fileRef.current?.click()} title="Tải lên">
              <i className="fas fa-upload" style={{ fontSize: '0.65rem' }}></i>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".md,.txt,.html,.pdf,.docx"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadDoc?.(f);
                e.target.value = '';
              }}
            />
          </div>
        </div>
        <div ref={searchWrapRef} style={s.searchWrap}>
          <input
            style={s.searchInput}
            placeholder="Tìm tài liệu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchFocus && (searchQuery.trim() || searchHistory.length > 0) && (
            <div style={s.searchDropdown}>
              {/* Full-text results when typing */}
              {searchQuery.trim() && searchResults.length > 0 && (
                <>
                  <div style={{ padding: '0.35rem 0.75rem', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--glass-border)' }}>
                    <i className="fas fa-search" style={{ marginRight: '0.25rem' }}></i>Kết quả tìm kiếm
                  </div>
                  {searchResults.map(d => (
                    <div
                      key={d.id}
                      style={s.searchDropdownItem}
                      onClick={() => { onSelectDoc(d.id); setSearchFocus(false); }}
                      onMouseEnter={e => e.target.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      <i className="fas fa-file-lines" style={{ color: 'var(--accent)', fontSize: '0.65rem', flexShrink: 0 }}></i>
                      {d.title || 'Untitled'}
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--glass-border)' }} />
                </>
              )}
              {/* Search history */}
              {searchHistory.length > 0 && (
                <>
                  <div style={{ padding: '0.35rem 0.75rem', fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--glass-border)' }}>
                    <i className="fas fa-history" style={{ marginRight: '0.25rem' }}></i>Lịch sử tìm kiếm
                  </div>
                  {searchHistory.map((q, idx) => (
                    <div
                      key={idx}
                      style={s.searchHistoryItem}
                      onClick={() => { setSearchQuery(q); saveSearchQuery(q); setSearchFocus(false); }}
                      onMouseEnter={e => e.target.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      <i className="fas fa-clock" style={{ fontSize: '0.6rem', flexShrink: 0 }}></i>
                      {q}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sort bar */}
      <div style={s.sortBar}>
        <i className="fas fa-sort" style={{ color: 'var(--text-dim)', fontSize: '0.55rem' }}></i>
        <select
          style={s.sortSelect}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
        <div style={{ flex: 1 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            style={s.draftCheck}
            checked={draftOnly}
            onChange={e => setDraftOnly(e.target.checked)}
          />
          <span style={s.draftLabel}>Nháp</span>
        </label>
      </div>

      {/* Dynamic tags */}
      {allTags.length > 0 && (
        <div style={s.tagsRow}>
          {allTags.map(tag => (
            <span
              key={tag}
              style={s.tagChip(selectedTags.includes(tag))}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Doc list */}
      <div style={s.listContainer}>
        {loading && (
          <div style={s.empty}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.35rem' }}></i> Đang tải...
          </div>
        )}
        {!loading && filteredDocs.length === 0 && (
          <div style={s.empty}>
            {searchQuery || selectedTags.length > 0 || draftOnly
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
              style={s.docCheckbox}
              checked={selectedIds.includes(doc.id)}
              onChange={(e) => handleCheckToggle(e, doc.id)}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.docTitle}>{doc.title || 'Untitled'}</div>
              {doc.tags && (() => {
                const tags = Array.isArray(doc.tags) ? doc.tags : doc.tags.split(',').map(t => t.trim()).filter(Boolean);
                return tags.length > 0 ? (
                  <div style={s.docTags}>
                    {tags.map((t, i) => (
                      <span key={i} style={s.docTag}>{t}</span>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: cache clear */}
      <div style={s.footer}>
        <span style={{ color: 'var(--text-dim)' }}>{filteredDocs.length} tài liệu</span>
        <button style={s.footerBtn()} onClick={onCacheClear} title="Xoá cache">
          <i className="fas fa-eraser"></i> Xoá cache
        </button>
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
