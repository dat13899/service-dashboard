import { useState, useEffect, useCallback, useRef } from 'react';
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
};

// Mobile breakpoint
const MOBILE_BP = 720;

export default function DocumentsPage() {
  const toast = useToast();
  const docsCtrl = useDocuments(toast);

  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BP);
  const [showSidebar, setShowSidebar] = useState(true);
  const [markedLoaded, setMarkedLoaded] = useState(false);

  // Load marked.js on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.marked) {
      loadMarked();
      const check = setInterval(() => {
        if (window.marked) {
          setMarkedLoaded(true);
          clearInterval(check);
        }
      }, 100);
      setTimeout(() => clearInterval(check), 10000);
    } else if (window.marked) {
      setMarkedLoaded(true);
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
  const handleEdit = useCallback((doc) => {
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
    // Force immediate save before closing
    if (docsCtrl.currentDoc && editing) {
      // Content is already being auto-saved debounced
    }
    setEditing(false);
  }, [docsCtrl, editing]);

  // Rename
  const handleRename = useCallback(async (id, title) => {
    await docsCtrl.renameDoc(id, title);
  }, [docsCtrl]);

  // Convert
  const handleConvert = useCallback(async (id) => {
    await docsCtrl.convertDoc(id);
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
            onCreateDoc={docsCtrl.createDoc}
            onDeleteDoc={docsCtrl.deleteDoc}
            onUploadDoc={handleUpload}
            visible={showSidebar}
            isMobile={isMobile}
          />
        )}

        {/* Reader - hidden behind sidebar on mobile */}
        {!isMobile && (
          <DocReader
            doc={docsCtrl.currentDoc}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onRename={handleRename}
            onConvert={handleConvert}
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
    </div>
  );
}
