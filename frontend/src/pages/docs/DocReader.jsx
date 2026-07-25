import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

const s = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    position: 'relative',
    minWidth: 0,
  },
  readingProgress: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '3px',
    background: 'linear-gradient(90deg, var(--accent), #818cf8)',
    zIndex: 999,
    transition: 'width .15s ease',
  },
  header: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  titleRow: {
    flex: 1,
    minWidth: 0,
    cursor: 'pointer',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-strong)',
    margin: 0,
    wordBreak: 'break-word',
  },
  meta: {
    fontSize: '0.75rem',
    color: 'var(--text-dim)',
    marginTop: '0.25rem',
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaTag: {
    fontSize: '0.65rem',
    padding: '0.05rem 0.4rem',
    borderRadius: '999px',
    background: 'var(--surface-2)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-dim)',
  },
  actions: {
    display: 'flex',
    gap: '0.35rem',
    flexShrink: 0,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionBtn: (color) => ({
    fontSize: '0.75rem',
    padding: '0.3rem 0.55rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: color || 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'all .15s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  }),
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem 2rem',
    lineHeight: 1.7,
    color: 'var(--text)',
    wordBreak: 'break-word',
  },
  tocBtn: {
    fontSize: '0.75rem',
    padding: '0.3rem 0.55rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'all .15s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    position: 'relative',
  },
  tocDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.25rem',
    minWidth: '220px',
    maxHeight: '320px',
    overflowY: 'auto',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    zIndex: 20,
    padding: '0.25rem 0',
  },
  tocItem: (depth) => ({
    padding: '0.3rem 0.75rem',
    paddingLeft: `${0.75 + (depth - 1) * 1}rem`,
    fontSize: '0.78rem',
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'background .1s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-dim)',
    fontSize: '0.9rem',
    gap: '0.5rem',
    padding: '2rem',
    textAlign: 'center',
  },
  renameInput: {
    fontSize: '1.1rem',
    fontWeight: 700,
    padding: '0.15rem 0.35rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--accent)',
    background: 'var(--surface-2)',
    color: 'var(--text-strong)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  wordCount: {
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    padding: '0.35rem 1.25rem',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  fontCtrl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.15rem',
  },
  fontBtn: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'all .15s',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
  },
  pdfContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minHeight: 0,
  },
  pdfIframe: {
    flex: 1,
    border: 'none',
    width: '100%',
    height: '100%',
    minHeight: '400px',
    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
  },
  pdfLoading: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-dim)',
    gap: '0.75rem',
    fontSize: '0.9rem',
  },
  docxBadge: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    background: 'rgba(59,130,246,0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(59,130,246,0.3)',
    fontWeight: 500,
  },
};

// Convert markdown headings to TOC items
function extractTOC(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  const headings = div.querySelectorAll('h1, h2, h3, h4');
  return Array.from(headings).map(h => ({
    id: h.id || h.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    text: h.textContent,
    depth: parseInt(h.tagName[1], 10),
  }));
}

// Render markdown to HTML
function renderMarkdown(content) {
  if (typeof window !== 'undefined' && window.marked) {
    return window.marked.parse(content || '', { breaks: true, gfm: true });
  }
  return `<p>Đang tải thư viện markdown...</p>`;
}

// Format date
function fmtDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Word count
function wordStats(content) {
  const text = content || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const lines = text.split('\n').length;
  return { words, chars, lines };
}

export default function DocReader({ doc, onEdit, onDelete, onRename, onConvert, onExportPdf, onDownloadDoc, isMobile }) {
  const [showToc, setShowToc] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [fontSize, setFontSize] = useState(() => {
    try { return parseFloat(localStorage.getItem('docReaderFontSize')) || 0.92; }
    catch { return 0.92; }
  });
  const [pdfLoading, setPdfLoading] = useState(false);
  const contentRef = useRef(null);
  const tocRef = useRef(null);
  const renameRef = useRef(null);

  const isDocx = doc?.ext === 'docx' || (doc?.file || '').endsWith('.docx');
  const pdfUrl = isDocx ? `/api/documents/${doc?.id}/pdf` : null;

  // Trigger PDF convert when docx doc loads
  useEffect(() => {
    if (isDocx) {
      setPdfLoading(true);
      fetch(pdfUrl).finally(() => setPdfLoading(false));
    }
  }, [doc?.id, isDocx, pdfUrl]);

  // Rendered HTML (only for .md files)
  const renderedHtml = useMemo(() => {
    if (!doc || isDocx) return '';
    return renderMarkdown(doc.content);
  }, [doc?.content, isDocx]);

  // TOC from rendered HTML
  const toc = useMemo(() => {
    if (!renderedHtml) return [];
    return extractTOC(renderedHtml);
  }, [renderedHtml]);

  // Word count
  const stats = useMemo(() => wordStats(doc?.content), [doc?.content]);

  // Persist font size
  useEffect(() => {
    try { localStorage.setItem('docReaderFontSize', fontSize.toString()); } catch {}
  }, [fontSize]);

  // Reading progress
  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight > 0) {
      setReadProgress(Math.min((scrollTop / scrollHeight) * 100, 100));
    }
  }, []);

  // Track page-level scroll
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Click outside TOC dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (tocRef.current && !tocRef.current.contains(e.target)) {
        setShowToc(false);
      }
    };
    if (showToc) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showToc]);

  // Focus rename input
  useEffect(() => {
    if (renaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renaming]);

  // Scroll content to heading
  const scrollToHeading = useCallback((id) => {
    setShowToc(false);
    const el = contentRef.current?.querySelector(`#${CSS.escape(id)}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Font size controls
  const increaseFont = useCallback(() => {
    setFontSize(prev => Math.min(prev + 0.08, 1.6));
  }, []);

  const decreaseFont = useCallback(() => {
    setFontSize(prev => Math.max(prev - 0.08, 0.65));
  }, []);

  // Print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Download
  const handleDownload = useCallback(() => {
    if (isDocx) {
      const a = document.createElement('a');
      a.href = `/api/documents/${doc.id}?dl=1`;
      a.download = (doc.title || doc.id) + '.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    onDownloadDoc?.(doc);
  }, [onDownloadDoc, doc, isDocx]);

  // Export PDF
  const handleExportPdf = useCallback(() => {
    onExportPdf?.(doc.id, doc.title);
  }, [onExportPdf, doc]);

  if (!doc) {
    return (
      <div style={s.container}>
        <div style={s.empty}>
          <i className="fas fa-file-lines" style={{ fontSize: '2rem', opacity: 0.4 }}></i>
          <span>Chọn một tài liệu để xem</span>
        </div>
      </div>
    );
  }

  const handleStartRename = () => {
    setNewTitle(doc.title || '');
    setRenaming(true);
  };

  const handleSubmitRename = () => {
    if (newTitle.trim() && newTitle.trim() !== doc.title) {
      onRename?.(doc.id, newTitle.trim());
    }
    setRenaming(false);
  };

  const handleKeyRename = (e) => {
    if (e.key === 'Enter') handleSubmitRename();
    if (e.key === 'Escape') setRenaming(false);
  };

  return (
    <div style={s.container}>
      {/* Fixed reading progress bar */}
      <div style={{ ...s.readingProgress, width: `${readProgress}%` }} />

      {/* Header */}
      <div style={s.header}>
        <div style={s.titleRow} onDoubleClick={handleStartRename}>
          {renaming ? (
            <input
              ref={renameRef}
              style={s.renameInput}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onBlur={handleSubmitRename}
              onKeyDown={handleKeyRename}
            />
          ) : (
            <h2 style={s.title}>{doc.title || 'Untitled'}</h2>
          )}
          <div style={s.meta}>
            {(doc.created || doc.meta?.createdAt) && (
              <span><i className="far fa-calendar-alt" style={{ marginRight: '0.25rem' }}></i>{fmtDate(doc.created || doc.meta?.createdAt)}</span>
            )}
            {(doc.meta?.updatedAt) && (
              <span><i className="far fa-clock" style={{ marginRight: '0.25rem' }}></i>{fmtDate(doc.meta.updatedAt)}</span>
            )}
            {doc.tags && (() => {
              const tags = Array.isArray(doc.tags) ? doc.tags : String(doc.tags).split(',').map(t => t.trim()).filter(Boolean);
              return tags.map((t, i) => (
                <span key={i} style={s.metaTag}>{t}</span>
              ));
            })()}
            {isDocx && <span style={s.docxBadge}><i className="fas fa-file-word" style={{ marginRight: '0.2rem' }}></i>DOCX</span>}
          </div>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          {/* Font size controls — md only */}
          {!isDocx && (
            <div style={s.fontCtrl}>
              <button style={s.fontBtn} onClick={decreaseFont} title="Thu nhỏ chữ">
                <i className="fas fa-font" style={{ fontSize: '0.55rem' }}></i><span style={{ fontSize: '0.55rem' }}>⁻</span>
              </button>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', padding: '0 0.2rem' }}>{Math.round(fontSize * 100)}%</span>
              <button style={s.fontBtn} onClick={increaseFont} title="Phóng to chữ">
                <i className="fas fa-font" style={{ fontSize: '0.7rem' }}></i><span style={{ fontSize: '0.65rem' }}>⁺</span>
              </button>
            </div>
          )}

          {/* TOC button — md only */}
          {!isDocx && toc.length > 0 && (
            <div ref={tocRef} style={{ position: 'relative' }}>
              <button
                style={s.tocBtn}
                onClick={() => setShowToc(p => !p)}
                title="Mục lục"
              >
                <i className="fas fa-list"></i>
                <span style={{ display: isMobile ? 'none' : 'inline' }}> Mục lục</span>
              </button>
              {showToc && (
                <div style={s.tocDropdown}>
                  {toc.map((item, idx) => (
                    <div
                      key={idx}
                      style={s.tocItem(item.depth)}
                      onClick={() => scrollToHeading(item.id)}
                      onMouseEnter={e => e.target.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Convert to PDF — docx only */}
          {isDocx && (
            <button style={s.actionBtn('var(--amber)')} onClick={() => onConvert?.(doc.id)} title="Chuyển sang PDF">
              <i className="fas fa-file-pdf"></i>
              <span>PDF</span>
            </button>
          )}

          {/* Edit — md only */}
          {!isDocx && (
            <button style={s.actionBtn()} onClick={() => onEdit?.(doc)} title="Chỉnh sửa">
              <i className="fas fa-pen"></i>
            </button>
          )}

          <button style={s.actionBtn()} onClick={handleStartRename} title="Đổi tên">
            <i className="fas fa-pencil"></i>
          </button>

          <button style={s.actionBtn()} onClick={handleDownload} title={isDocx ? 'Tải xuống .docx' : 'Tải xuống .md'}>
            <i className="fas fa-download"></i>
          </button>

          <button style={s.actionBtn()} onClick={handlePrint} title="In ấn">
            <i className="fas fa-print"></i>
          </button>

          <button style={s.actionBtn('var(--red)')} onClick={() => onDelete?.(doc)} title="Xoá">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      {/* Content — PDF iframe for DOCX, HTML for markdown */}
      {isDocx ? (
        <div style={s.pdfContainer}>
          {pdfLoading ? (
            <div style={s.pdfLoading}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', opacity: 0.6 }}></i>
              <span>Đang chuyển đổi DOCX sang PDF...</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Quá trình này có thể mất vài giây</span>
            </div>
          ) : (
            <iframe
              style={s.pdfIframe}
              src={pdfUrl}
              title={doc.title}
            />
          )}
        </div>
      ) : (
        <div
          ref={contentRef}
          style={{ ...s.contentArea, fontSize: `${fontSize}rem` }}
          className="doc-reader-content"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )}

      {/* Word count footer (md only) */}
      {!isDocx && doc.content && (
        <div style={s.wordCount}>
          <span>{stats.lines} dòng</span>
          <span>{stats.words} từ</span>
          <span>{stats.chars} ký tự</span>
        </div>
      )}
    </div>
  );
}
