import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToastContext } from '../components/shared/Toast';
import { useMediaQuery } from '../hooks/useMediaQuery';
import useDocuments from '../hooks/useDocuments';
import DocSidebar from './docs/DocSidebar';
import DocReader from './docs/DocReader';
import DocEditor from './docs/DocEditor';
import ConfirmModal from '../components/ConfirmModal';
import './docs/docs.css';

const MARKED_CDN = 'https://cdn.jsdelivr.net/npm/marked@5/marked.min.js';

function loadMarked() {
  if (typeof window !== 'undefined' && !window.marked) {
    const s = document.createElement('script');
    s.src = MARKED_CDN; s.async = false;
    document.head.appendChild(s);
  }
}

const TEMPLATES = [
  { id: 'blank', label: 'Blank', icon: 'fa-file', content: '# Tài liệu mới\n\nBắt đầu viết...' },
  { id: 'article', label: '📝 Article', content: '# Tiêu đề\n\n## Tóm tắt\n\n...\n\n## Nội dung\n...' },
  { id: 'report', label: '📊 Report', content: '# Báo cáo\n\n**Ngày:** \n\n## Tổng quan\n...' },
  { id: 'note', label: '📋 Note', content: '# Ghi chú\n\n- Điểm 1\n- Điểm 2\n' },
];

export default function DocumentsPage() {
  const toast = useToastContext();
  const { isMobile } = useMediaQuery();
  const docsCtrl = useDocuments(toast);

  // ── Shared state (used by both DocumentsPage + DocSidebar) ──
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [draftOnly, setDraftOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // ── Local UI state ──
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocTags, setNewDocTags] = useState('');
  const [newDocTemplate, setNewDocTemplate] = useState('blank');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => { loadMarked(); }, []);
  useEffect(() => { docsCtrl.fetchDocs(); }, []);

  // Auto-hide mobile sidebar when doc selected
  useEffect(() => { if (isMobile && docsCtrl.currentDoc) setShowSidebar(false); }, [docsCtrl.currentDoc, isMobile]);

  // ── Handlers ──
  const handleSelect = useCallback(async (id) => {
    await docsCtrl.fetchDoc(id);
    if (isMobile) setShowSidebar(false);
  }, [docsCtrl, isMobile]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await docsCtrl.deleteDoc(deleteTarget.id);
    setDeleteTarget(null);
    if (isMobile) setShowSidebar(true);
  }, [deleteTarget, docsCtrl, isMobile]);

  const handleEditorSave = useCallback(async (content) => {
    if (!docsCtrl.currentDoc) return;
    await docsCtrl.scheduleSave(docsCtrl.currentDoc.id, { ...docsCtrl.currentDoc, content });
  }, [docsCtrl]);

  const handleCreateDoc = useCallback(async () => {
    const title = newDocTitle.trim() || 'Tài liệu mới';
    const tpl = TEMPLATES.find(t => t.id === newDocTemplate) || TEMPLATES[0];
    const tags = newDocTags.split(',').map(t => t.trim()).filter(Boolean);
    const doc = await docsCtrl.createDoc(title, { content: tpl.content, tags, template: newDocTemplate });
    setShowNewModal(false);
    if (doc?.id) await docsCtrl.fetchDoc(doc.id);
  }, [newDocTitle, newDocTags, newDocTemplate, docsCtrl]);

  const handleBulkDelete = useCallback(async () => {
    await docsCtrl.bulkDelete(selectedIds);
    setSelectedIds([]);
    setShowBulkConfirm(false);
  }, [selectedIds, docsCtrl]);

  const openNewModal = () => { setNewDocTitle(''); setNewDocTags(''); setNewDocTemplate('blank'); setShowNewModal(true); };

  const handleCacheClear = useCallback(() => {
    docsCtrl.fetchDocs();
    toast?.('Đã xoá cache', 'info');
  }, [docsCtrl, toast]);

  return (
    <div className="doc-page">
      {/* Top bar */}
      <div className="doc-topbar">
        <div className="flex items-center gap-sm">
          {(!isMobile || !docsCtrl.currentDoc) && (
            <a href="/" className="btn btn-glass btn-sm"><i className="fas fa-arrow-left" /></a>
          )}
          <span className="font-semibold" style={{ color: 'var(--text-strong)', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--accent)' }}>◆</span> Tài liệu
          </span>
        </div>

        {isMobile && docsCtrl.currentDoc && (
          <button className="btn btn-glass btn-sm" onClick={() => setShowSidebar(p => !p)}>
            <i className={`fas ${showSidebar ? 'fa-file-lines' : 'fa-bars'}`} />
            {showSidebar ? ' Xem' : ' DS'}
          </button>
        )}
      </div>

      {/* Main */}
      <div className="doc-main">
        {/* Sidebar (list) — DocSidebar has built-in search/sort/tag filter/draft filter */}
        {(!isMobile || showSidebar) && (
          <div className="doc-sidebar">
            <DocSidebar
              docs={docsCtrl.docs}
              loading={docsCtrl.loading}
              currentDoc={docsCtrl.currentDoc}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectDoc={handleSelect}
              onCreateDoc={openNewModal}
              onUploadDoc={docsCtrl.uploadDoc}
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
          </div>
        )}

        {/* Reader */}
        {(!isMobile || !showSidebar) && (
          <div className="doc-reader">
            {editing && docsCtrl.currentDoc ? (
              <DocEditor
                doc={docsCtrl.currentDoc}
                onSave={handleEditorSave}
                onClose={() => setEditing(false)}
              />
            ) : docsCtrl.currentDoc ? (
              <DocReader
                doc={docsCtrl.currentDoc}
                onEdit={() => setEditing(true)}
                onDelete={() => setDeleteTarget(docsCtrl.currentDoc)}
                onRename={docsCtrl.renameDoc}
                onDownload={docsCtrl.downloadDoc}
                onExportPdf={docsCtrl.exportPdf}
                onConvert={docsCtrl.convertDoc}
              />
            ) : (
              <div className="doc-reader-empty">
                <i className="fas fa-file-lines" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                <span>Chọn tài liệu bên trái</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk bar */}
      {selectedIds.length > 0 && (
        <div className="doc-bulkbar">
          <span className="text-dim text-xs">{selectedIds.length} đã chọn</span>
          <button className="btn btn-danger btn-sm" onClick={() => setShowBulkConfirm(true)}><i className="fas fa-trash" /> Xoá</button>
        </div>
      )}

      {/* New doc modal */}
      {showNewModal && (
        <div className="doc-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
          <div className="doc-modal">
            <div className="doc-modal-header">
              <span style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: '0.95rem' }}>Tài liệu mới</span>
              <button onClick={() => setShowNewModal(false)} className="btn btn-glass btn-sm">✕</button>
            </div>
            <div className="doc-modal-body">
              <div>
                <label className="text-xs text-dim">Tên tài liệu</label>
                <input className="input" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)}
                  placeholder="Tiêu đề..." style={{ width: '100%', marginTop: '0.2rem' }} />
              </div>
              <div>
                <label className="text-xs text-dim">Tags (phân cách bằng dấu phẩy)</label>
                <input className="input" value={newDocTags} onChange={e => setNewDocTags(e.target.value)}
                  placeholder="hướng dẫn, devops" style={{ width: '100%', marginTop: '0.2rem' }} />
              </div>
              <div>
                <label className="text-xs text-dim">Template</label>
                <div className="flex gap-xs mt-xs" style={{ flexWrap: 'wrap' }}>
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setNewDocTemplate(t.id)}
                      className={`btn btn-sm ${newDocTemplate === t.id ? 'btn-primary' : 'btn-glass'}`}>{t.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="doc-modal-footer">
              <button onClick={() => setShowNewModal(false)} className="btn btn-glass">Huỷ</button>
              <button onClick={handleCreateDoc} className="btn btn-primary">Tạo</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal show={deleteTarget !== null}
        title="Xoá tài liệu" message={`Xoá "${deleteTarget?.title || deleteTarget?.id}"?`}
        confirmLabel="Xoá" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ConfirmModal show={showBulkConfirm}
        title="Xoá hàng loạt" message={`Xoá ${selectedIds.length} tài liệu?`}
        confirmLabel="Xoá" danger onConfirm={handleBulkDelete} onCancel={() => setShowBulkConfirm(false)} />
    </div>
  );
}
