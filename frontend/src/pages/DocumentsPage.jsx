import { useState, useEffect, useCallback, useRef } from 'react';
import { useToastContext } from '../components/shared/Toast';
import { useMediaQuery } from '../hooks/useMediaQuery';
import useDocuments from '../hooks/useDocuments';
import DocSidebar from './docs/DocSidebar';
import DocReader from './docs/DocReader';
import DocEditor from './docs/DocEditor';
import DocSearch from './docs/DocSearch';
import DocTags from './docs/DocTags';
import ConfirmModal from '../components/ConfirmModal';
import './docs/docs.css';

const MARKED_CDN = 'https://cdn.jsdelivr.net/npm/marked@5/marked.min.js';
const LS_HISTORY = 'documents_search_history';

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

  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocTags, setNewDocTags] = useState('');
  const [newDocTemplate, setNewDocTemplate] = useState('blank');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]').slice(0, 10); } catch { return []; }
  });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef(null);

  useEffect(() => { loadMarked(); }, []);
  useEffect(() => { docsCtrl.fetchDocs(); }, []);

  // Auto-hide mobile sidebar when doc selected
  useEffect(() => { if (isMobile && docsCtrl.currentDoc) setShowSidebar(false); }, [docsCtrl.currentDoc, isMobile]);

  // Search history
  const addSearchHistory = useCallback((q) => {
    if (!q) return;
    setSearchHistory(prev => {
      const next = [q, ...prev.filter(h => h !== q)].slice(0, 10);
      localStorage.setItem(LS_HISTORY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Click outside search dropdown
  useEffect(() => {
    const click = (e) => { if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) setShowSearchDropdown(false); };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, []);

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

  const toggleTag = useCallback((tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }, []);

  const openNewModal = () => { setNewDocTitle(''); setNewDocTags(''); setNewDocTemplate('blank'); setShowNewModal(true); };

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
        {/* Sidebar (list) */}
        {(!isMobile || showSidebar) && (
          <div className="doc-sidebar">
            <div className="doc-sidebar-header">
              {/* Search */}
              <DocSearch
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                allDocs={docsCtrl.docs.filter(d => d.title?.toLowerCase().includes(searchQuery.toLowerCase()))}
                onSelect={async (doc) => {
                  addSearchHistory(searchQuery);
                  setShowSearchDropdown(false);
                  await handleSelect(doc.id);
                }}
                searchHistory={searchHistory}
                addSearchHistory={addSearchHistory}
                clearSearchHistory={() => { setSearchHistory([]); localStorage.removeItem(LS_HISTORY); }}
                onSearchFocus={() => setShowSearchDropdown(true)}
                showDropdown={showSearchDropdown}
                searchDropdownRef={searchDropdownRef}
              />

              {/* Sort + actions row */}
              <div className="flex gap-xs items-center" style={{ flexWrap: 'wrap' }}>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text)', fontSize: '0.7rem', padding: '0.2rem 0.3rem' }}>
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="az">A → Z</option>
                </select>
                <button onClick={openNewModal} className="btn btn-primary btn-sm"><i className="fas fa-plus" /> New</button>
              </div>

              {/* Tags */}
              {docsCtrl.allTags.length > 0 && (
                <DocTags allTags={docsCtrl.allTags} selectedTags={selectedTags} onToggle={toggleTag} />
              )}
            </div>

            {docsCtrl.loading ? (
              <div className="flex flex-col gap-xs">{['60%', '80%', '40%'].map((w, i) => <div key={i} className="skeleton" style={{ height: '36px', width: w }} />)}</div>
            ) : (
              <DocSidebar
                docs={docsCtrl.docs}
                activeId={docsCtrl.currentDoc?.id}
                selectedTags={selectedTags}
                sortBy={sortBy}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onDelete={(doc) => setDeleteTarget(doc)}
                onRename={docsCtrl.renameDoc}
                onDownload={docsCtrl.downloadDoc}
                onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                onSelectAll={() => setSelectedIds(docsCtrl.docs.filter(d => !selectedTags.length || d.tags?.some(t => selectedTags.includes(t))).map(d => d.id))}
                onClearSelection={() => setSelectedIds([])}
                onUpload={docsCtrl.uploadDoc}
              />
            )}
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
