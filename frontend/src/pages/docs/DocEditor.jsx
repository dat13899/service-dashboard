import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 5000,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'fadeIn .15s ease',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--glass-border)',
    flexShrink: 0,
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  mdToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.25rem 0.75rem',
    borderBottom: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  mdBtn: {
    fontSize: '0.72rem',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    background: 'transparent',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'all .1s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.15rem',
    fontWeight: 500,
    lineHeight: 1.2,
  },
  mdDivider: {
    width: '1px',
    height: '18px',
    background: 'var(--glass-border)',
    margin: '0 0.15rem',
  },
  closeBtn: {
    fontSize: '0.82rem',
    padding: '0.35rem 0.7rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'all .15s',
  },
  saveBtn: (saving) => ({
    fontSize: '0.82rem',
    padding: '0.35rem 0.7rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: saving ? 'var(--amber)' : 'var(--accent)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontWeight: 600,
    transition: 'all .15s',
  }),
  statusBadge: {
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  splitPane: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  editorPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--glass-border)',
    minWidth: 0,
    position: 'relative',
  },
  previewPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  paneHeader: {
    fontSize: '0.72rem',
    padding: '0.35rem 0.75rem',
    color: 'var(--text-dim)',
    borderBottom: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    width: '100%',
    padding: '1rem 1.25rem',
    fontSize: '0.85rem',
    lineHeight: 1.6,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    tabSize: 2,
  },
  previewContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.25rem 1.5rem',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    color: 'var(--text)',
    wordBreak: 'break-word',
  },
  divider: {
    width: '4px',
    cursor: 'col-resize',
    background: 'var(--glass-border)',
    flexShrink: 0,
    transition: 'background .15s',
    position: 'relative',
  },
  wordCount: {
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    padding: '0.25rem 0.75rem',
    borderTop: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
};

// Render markdown to HTML
function renderMarkdown(content) {
  if (typeof window !== 'undefined' && window.marked) {
    return window.marked.parse(content || '', { breaks: true, gfm: true });
  }
  return '<p>Đang tải...</p>';
}

// Markdown toolbar actions
const MD_ACTIONS = [
  { key: 'bold', label: 'B', icon: null, wrapper: ['**', '**'], hint: 'Bold' },
  { key: 'italic', label: 'I', icon: null, wrapper: ['*', '*'], hint: 'Italic' },
  { key: 'heading', label: 'H', icon: null, wrapper: ['\n## ', ''], hint: 'Heading' },
  { key: 'link', label: null, icon: 'fa-link', wrapper: ['[', '](url)'], hint: 'Link' },
  { key: 'code', label: '{}', icon: null, wrapper: ['\n```\n', '\n```'], hint: 'Code block' },
  { key: 'list', label: null, icon: 'fa-list', wrapper: ['\n- ', ''], hint: 'List' },
];

export default function DocEditor({ doc, onClose, onSave, saving }) {
  const [content, setContent] = useState(doc?.content || '');
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

  // Reset content when doc changes
  useEffect(() => {
    setContent(doc?.content || '');
  }, [doc?.id]);

  // Rendered preview
  const previewHtml = useMemo(() => renderMarkdown(content), [content]);

  // Word count
  const stats = useMemo(() => {
    const text = content || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    return { words, chars, lines };
  }, [content]);

  // Handle content change
  const handleChange = useCallback((e) => {
    setContent(e.target.value);
  }, []);

  // Keyboard shortcut: Ctrl+S to save
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave?.(content);
    }
  }, [content, onSave]);

  // Divider drag
  const handleDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(20, Math.min(80, (x / rect.width) * 100));
      setSplitRatio(pct);
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Markdown toolbar insert
  const handleMdAction = useCallback((action) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const [open, close] = action.wrapper;

    let inserted;
    if (action.key === 'heading' || action.key === 'list') {
      // Insert at start of line
      const beforeLine = content.lastIndexOf('\n', start - 1) + 1;
      const linePrefix = content.substring(beforeLine, start);
      if (linePrefix.trim().length === 0 || action.key === 'heading') {
        inserted = open + (selected || 'heading') + close;
      } else {
        inserted = open + selected + close;
      }
    } else if (selected) {
      inserted = open + selected + close;
    } else {
      inserted = open + (action.hint || 'text') + close;
    }

    const newContent = content.substring(0, start) + inserted + content.substring(end);
    setContent(newContent);
    // Restore cursor
    requestAnimationFrame(() => {
      ta.focus();
      const cursorPos = start + inserted.length;
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  }, [content, textareaRef]);

  return (
    <div style={s.overlay}>
      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.toolbarLeft}>
          <button style={s.closeBtn} onClick={onClose}>
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
          <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 500, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc?.title || 'Untitled'}
          </span>
          <span style={s.statusBadge}>
            <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-circle'} ${saving ? '' : ''}`}
              style={{ color: saving ? 'var(--amber)' : 'var(--green)', fontSize: '0.6rem' }}></i>
            {saving ? 'Đang lưu...' : 'Đã lưu'}
          </span>
        </div>
        <div style={s.toolbarRight}>
          <span style={s.statusBadge}>
            <i className="fas fa-file-code"></i> Markdown
          </span>
          <button style={s.saveBtn(saving)} onClick={() => onSave?.(content)} disabled={saving}>
            <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      {/* Markdown toolbar */}
      <div style={s.mdToolbar}>
        {MD_ACTIONS.map((act, i) => (
          <span key={act.key} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {i > 0 && <div style={s.mdDivider} />}
            <button
              style={s.mdBtn}
              onClick={() => handleMdAction(act)}
              title={act.hint}
              onMouseEnter={e => { e.target.style.background = 'var(--surface-2)'; e.target.style.borderColor = 'var(--glass-border)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'transparent'; }}
            >
              {act.icon ? <i className={`fas ${act.icon}`} style={{ fontSize: '0.65rem' }}></i> : act.label}
            </button>
          </span>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
          <i className="fas fa-info-circle"></i> Ctrl+S lưu
        </span>
      </div>

      {/* Split pane */}
      <div ref={containerRef} style={s.splitPane}>
        {/* Editor */}
        <div style={{ ...s.editorPane, flexBasis: `${splitRatio}%`, maxWidth: `${splitRatio}%` }}>
          <div style={s.paneHeader}>Editor</div>
          <textarea
            ref={textareaRef}
            style={s.textarea}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Viết nội dung markdown tại đây..."
            spellCheck={false}
          />
        </div>

        {/* Divider */}
        <div
          style={{
            ...s.divider,
            background: isDragging ? 'var(--accent)' : 'var(--glass-border)',
          }}
          onMouseDown={handleDividerMouseDown}
        />

        {/* Preview */}
        <div style={{ ...s.previewPane, flexBasis: `${100 - splitRatio}%`, maxWidth: `${100 - splitRatio}%` }}>
          <div style={s.paneHeader}>Preview</div>
          <div
            style={s.previewContent}
            className="doc-editor-preview"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>

      {/* Word count footer */}
      <div style={s.wordCount}>
        <span>{stats.lines} dòng</span>
        <span>{stats.words} từ</span>
        <span>{stats.chars} ký tự</span>
      </div>
    </div>
  );
}
