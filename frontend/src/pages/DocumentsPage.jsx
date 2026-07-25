import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import BlobBackground from '../components/BlobBackground';
import { useToast } from '../hooks/useToast';
import useDocuments from '../hooks/useDocuments';
import DocSidebar from './docs/DocSidebar';
import DocReader from './docs/DocReader';
import DocEditor from './docs/DocEditor';
import ConfirmModal from '../components/ConfirmModal';

// Load marked from CDN
const MARKED_CDN = 'https://cdn.jsdelivr.net/npm/marked@5/marked.min.js';

function loadMarked() {
  if (typeof window !== 'undefined' && !window.marked) {
    const script = document.createElement('script');
    script.src = MARKED_CDN;
    script.async = false;
    document.head.appendChild(script);
  }
}

// Templates
const TEMPLATES = [
  { id: 'blank', label: 'Blank', icon: 'fa-file', content: '# Tài liệu mới\n\nBắt đầu viết...' },
  { id: 'article', label: '📝 Article', icon: null, content: '# Tiêu đề bài viết\n\n## Tóm tắt\n\nViết tóm tắt tại đây...\n\n## Nội dung\n\nNội dung chính...\n\n## Kết luận\n\nKết luận...' },
  { id: 'report', label: '📊 Report', icon: null, content: '# Báo cáo\n\n**Ngày:** \n**Tác giả:** \n\n## Tổng quan\n\n...\n\n## Kết quả\n\n| Mục | Giá trị |\n|-----|--------|\n|     |        |\n\n## Kết luận\n\n...' },
  { id: 'note', label: '📋 Note', icon: null, content: '# Ghi chú\n\n- Điểm 1\n- Điểm 2\n- Điểm 3\n\n## Chi tiết\n\n...' },
];

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1.25rem',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--glass-border)',
    transition: 'background .3s, border .3s',
    minHeight: '48px',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  backBtn: {
    fontSize: '0.82rem',
    padding: '0.3rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    textDecoration: 'none',
    transition: 'all .15s',
  },
  brandText: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: 'var(--text-strong)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  mobileToggle: {
    fontSize: '0.82rem',
    padding: '0.3rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  main: {
    flex: 1,
    display: 'flex',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    overflow: 'hidden',
    position: 'relative',
  },
  mainMobile: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '0.75rem',
    overflow: 'hidden',
    position: 'relative',
  },
  readerOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5rem',
    animation: 'fadeIn .15s ease',
  },
  readerOverlayTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
  },
  readerOverlayBody: {
    flex: 1,
    overflow: 'hidden',
  },
  // Search dropdown
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
    padding: '0.4rem 0.75rem',
    fontSize: '0.78rem',
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'background .1s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  searchHistoryItem: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'background .1s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  // New doc modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9000,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn .15s ease',
  },
  modalCard: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
    width: '90%',
    maxWidth: '480px',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-strong)',
  },
  modalCloseBtn: {
    fontSize: '0.82rem',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'transparent',
    color: 'var(--text-dim)',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  modalFooter: {
    padding: '0.75rem 1rem',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  modalInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  modalTextarea: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.82rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: "'JetBrains Mono', monospace",
    boxSizing: 'border-box',
  },
  modalLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    fontWeight: 600,
    marginBottom: '0.2rem',
  },
  templateGrid: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
  templateCard: (active) => ({
    padding: '0.35rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
    background: active ? 'rgba(99,102,241,0.1)' : 'var(--surface-2)',
    color: active ? 'var(--accent)' : 'var(--text-dim)',
    cursor: 'pointer',
    fontSize: '0.72rem',
    transition: 'all .15s',
    fontWeight: active ? 600 : 400,
  }),
  modalBtn: (primary) => ({
    fontSize: '0.82rem',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: primary ? 'var(--accent)' : 'var(--surface-2)',
    color: primary ? '#fff' : 'var(--text-dim)',
    cursor: 'pointer',
    fontWeight: primary ? 600 : 400,
    transition: 'all .15s',
  }),
  // Bulk delete bar
  bulkBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    padding: '0.5rem 1rem',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bulkDeleteBtn: {
    fontSize: '0.78rem',
    padding: '0.3rem 0.7rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--red)',
    background: 'rgba(239,68,68,0.1)',
    color: 'var(--red)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontWeight: 600,
  },
};

// Mobile breakpoint
const MOBILE_BP = 720;

// LocalStorage keys
const LS_CACHE_VERSION = 'documents_cache_version';

export default function DocumentsPage() {
  const toast = useToast();
  const docsCtrl = useDocuments(toast);

  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BP);
  const [showSidebar, setShowSidebar] = useState(true);

  // New features state
  const [sortBy, setSortBy] = useState('newest');
  const [draftOnly, setDraftOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocTags, setNewDocTags] = useState('');
  const [newDocTemplate, setNewDocTemplate] = useState('blank');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Load marked.js on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.marked) {
      loadMarked();
      const check = setInterval(() => {
        if (window.marked) {
          clearInterval(check);
        }
      }, 100);
      setTimeout(() => clearInterval(check), 10000);
    }
  }, []);

  // Load documents
  useEffect(() => {
    docsCtrl.fetchDocs();
  }, []);

  // Mobile detection
  useEffect(() => {
    const onResize = () => {
      const mob = window.innerWidth < MOBILE_BP;
      setIsMobile(mob);
      if (!mob) setShowSidebar(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Select document
  const handleSelectDoc = useCallback(async (id) => {
    await docsCtrl.fetchDoc(id);
    if (isMobile) setShowSidebar(false);
  }, [docsCtrl, isMobile]);

  // Delete
  const handleDeleteRequest = useCallback((doc) => {
    setDeleteTarget(doc);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await docsCtrl.deleteDoc(deleteTarget.id);
    setDeleteTarget(null);
    if (isMobile) setShowSidebar(true);
  }, [deleteTarget, docsCtrl, isMobile]);

  // Edit
  const handleEdit = useCallback(() => {
    setEditing(true);
  }, []);

  // Save from editor
  const handleEditorSave = useCallback(async (content) => {
    if (!docsCtrl.currentDoc) return;
    await docsCtrl.scheduleSave(docsCtrl.currentDoc.id, {
      ...docsCtrl.currentDoc,
      content,
    });
  }, [docsCtrl]);

  // Close editor
  const handleEditorClose = useCallback(async () => {
    setEditing(false);
  }, [docsCtrl, editing]);

  // Rename
  const handleRename = useCallback(async (id, title) => {
    await docsCtrl.renameDoc(id, title);
  }, [docsCtrl]);

  // Convert (legacy server-side)
  const handleConvert = useCallback(async (id) => {
    await docsCtrl.convertDoc(id);
  }, [docsCtrl]);

  // Export PDF (client download)
  const handleExportPdf = useCallback(async (id, title) => {
    await docsCtrl.exportPdf(id, title);
  }, [docsCtrl]);

  // Download .md
  const handleDownloadDoc = useCallback((doc) => {
    docsCtrl.downloadDoc(doc);
  }, [docsCtrl]);

  // Upload
  const handleUpload = useCallback(async (file) => {
    const doc = await docsCtrl.uploadDoc(file);
    if (doc && doc.id) {
      await docsCtrl.fetchDoc(doc.id);
    }
  }, [docsCtrl]);

  // Mobile: show sidebar toggle
  const handleToggleSidebar = useCallback(() => {
    setShowSidebar(p => !p);
  }, []);

  // ── New Doc Modal ──
  const openNewDocModal = useCallback(() => {
    setNewDocTitle('');
    setNewDocTags('');
    setNewDocTemplate('blank');
    setShowNewModal(true);
  }, []);

  const handleCreateDoc = useCallback(async () => {
    const title = newDocTitle.trim() || 'Tài liệu mới';
    const template = TEMPLATES.find(t => t.id === newDocTemplate) || TEMPLATES[0];
    const tags = newDocTags.split(',').map(t => t.trim()).filter(Boolean);
    const doc = await docsCtrl.createDoc(title, {
      content: template.content,
      tags,
      template: newDocTemplate,
    });
    setShowNewModal(false);
    if (doc && doc.id) {
      await docsCtrl.fetchDoc(doc.id);
    }
  }, [newDocTitle, newDocTags, newDocTemplate, docsCtrl]);

  // ── Bulk delete ──
  const handleBulkDelete = useCallback(async () => {
    await docsCtrl.bulkDelete(selectedIds);
    setSelectedIds([]);
    setShowBulkConfirm(false);
  }, [selectedIds, docsCtrl]);

  // ── Cache clear ──
  const handleCacheClear = useCallback(() => {
    try {
      localStorage.removeItem('documents_search_history');
      const v = Date.now().toString();
      localStorage.setItem(LS_CACHE_VERSION, v);
      toast?.('Đã xoá cache', 'success');
    } catch {
      toast?.('Lỗi xoá cache', 'error');
    }
  }, [toast]);

  return (
    <div style={s.page}>
      <BlobBackground />

      {/* Top bar */}
      <div style={s.topBar}>
        <div style={s.brandRow}>
          <a href="/" style={s.backBtn}>
            <i className="fas fa-arrow-left"></i>
          </a>
          <span style={s.brandText}>
            <span style={{ color: 'var(--accent)' }}>&#9670;</span>
            Tài liệu
          </span>
        </div>

        {isMobile && docsCtrl.currentDoc && (
          <button style={s.mobileToggle} onClick={handleToggleSidebar}>
            <i className={`fas ${showSidebar ? 'fa-file-lines' : 'fa-bars'}`}></i>
            {showSidebar ? ' Xem tài liệu' : ' Danh sách'}
          </button>
        )}
      </div>

      {/* Main layout */}
      <div style={isMobile ? s.mainMobile : s.main}>
        {/* Sidebar */}
        {(!isMobile || showSidebar) && (
          <DocSidebar
            docs={docsCtrl.docs}
            loading={docsCtrl.loading}
            currentDoc={docsCtrl.currentDoc}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectDoc={handleSelectDoc}
            onCreateDoc={openNewDocModal}
            onUploadDoc={handleUpload}
            visible={showSidebar}
            isMobile={isMobile}
            sortBy={sortBy}
            setSortBy={setSortBy}
            draftOnly={draftOnly}
            setDraftOnly={setDraftOnly}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onCacheClear={handleCacheClear}
          />
        )}

        {/* Reader - desktop */}
        {!isMobile && (
          <DocReader
            doc={docsCtrl.currentDoc}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onRename={handleRename}
            onConvert={handleConvert}
            onExportPdf={handleExportPdf}
            onDownloadDoc={handleDownloadDoc}
            isMobile={isMobile}
          />
        )}

        {/* Mobile: reader overlay when sidebar hidden */}
        {isMobile && !showSidebar && docsCtrl.currentDoc && (
          <DocReader
            doc={docsCtrl.currentDoc}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onRename={handleRename}
            onConvert={handleConvert}
            onExportPdf={handleExportPdf}
            onDownloadDoc={handleDownloadDoc}
            isMobile={isMobile}
          />
        )}

        {/* Mobile empty state */}
        {isMobile && showSidebar && !docsCtrl.currentDoc && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-file-lines" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.5rem', display: 'block' }}></i>
              Chọn tài liệu từ danh sách
            </div>
          </div>
        )}
      </div>

      {/* Bulk delete bar */}
      {selectedIds.length > 0 && (
        <div style={s.bulkBar}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>
            <i className="fas fa-check-circle" style={{ color: 'var(--accent)', marginRight: '0.3rem' }}></i>
            Đã chọn <strong>{selectedIds.length}</strong> tài liệu
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--text-dim)', cursor: 'pointer' }}
              onClick={() => setSelectedIds([])}
            >
              Huỷ
            </button>
            <button style={s.bulkDeleteBtn} onClick={() => setShowBulkConfirm(true)}>
              <i className="fas fa-trash"></i> Xoá {selectedIds.length}
            </button>
          </div>
        </div>
      )}

      {/* Editor overlay */}
      {editing && docsCtrl.currentDoc && (
        <DocEditor
          doc={docsCtrl.currentDoc}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
          saving={docsCtrl.saving}
        />
      )}

      {/* Delete confirm modal */}
      <ConfirmModal
        show={!!deleteTarget}
        title="Xoá tài liệu"
        message={`Bạn có chắc muốn xoá "${deleteTarget?.title || 'Untitled'}"?`}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk delete confirm */}
      <ConfirmModal
        show={showBulkConfirm}
        title="Xoá hàng loạt"
        message={`Bạn có chắc muốn xoá ${selectedIds.length} tài liệu đã chọn?`}
        confirmLabel="Xoá tất cả"
        cancelLabel="Huỷ"
        danger
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkConfirm(false)}
      />

      {/* New Doc Modal */}
      {showNewModal && (
        <div style={s.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
          <div style={s.modalCard}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}><i className="fas fa-plus" style={{ marginRight: '0.35rem' }}></i>Tạo tài liệu mới</span>
              <button style={s.modalCloseBtn} onClick={() => setShowNewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={s.modalBody}>
              <div>
                <div style={s.modalLabel}>Tiêu đề</div>
                <input
                  style={s.modalInput}
                  placeholder="Nhập tiêu đề..."
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateDoc(); }}
                />
              </div>
              <div>
                <div style={s.modalLabel}>Tags (phân cách bằng dấu phẩy)</div>
                <input
                  style={s.modalInput}
                  placeholder="vd: note, important"
                  value={newDocTags}
                  onChange={e => setNewDocTags(e.target.value)}
                />
              </div>
              <div>
                <div style={s.modalLabel}>Template</div>
                <div style={s.templateGrid}>
                  {TEMPLATES.map(t => (
                    <span
                      key={t.id}
                      style={s.templateCard(newDocTemplate === t.id)}
                      onClick={() => setNewDocTemplate(t.id)}
                    >
                      {t.icon ? <i className={`fas ${t.icon}`} style={{ marginRight: '0.2rem' }}></i> : null}
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.modalBtn(false)} onClick={() => setShowNewModal(false)}>Huỷ</button>
              <button style={s.modalBtn(true)} onClick={handleCreateDoc}>
                <i className="fas fa-plus"></i> Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
