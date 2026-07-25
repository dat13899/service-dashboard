// ── Search/dropdown for Documents ──
import Input from '../../components/ui/Input';

const LS_HISTORY = 'documents_search_history';

export default function DocSearch({ value, onChange, allDocs, onSelect, searchHistory, addSearchHistory, clearSearchHistory, onSearchFocus, showDropdown, searchDropdownRef }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
      <Input
        value={value}
        onChange={onChange}
        onFocus={onSearchFocus}
        placeholder="🔍 Tìm tài liệu..."
        style={{ width: '100%', padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
      />
      {showDropdown && (
        <div ref={searchDropdownRef} style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.15rem',
          background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 50,
          maxHeight: '220px', overflowY: 'auto',
        }}>
          {/* Search history */}
          {searchHistory.length > 0 && (
            <>
              <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.65rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Gần đây</span>
                <button onClick={clearSearchHistory} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.6rem' }}>clear</button>
              </div>
              {searchHistory.map((h, i) => (
                <div key={i} onClick={() => addSearchHistory(h)} style={{
                  padding: '0.35rem 0.75rem', fontSize: '0.72rem', color: 'var(--text-dim)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <i className="fas fa-clock" style={{ fontSize: '0.6rem' }} />{h}
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--glass-border)', margin: '0.25rem 0' }} />
            </>
          )}
          {/* Search results */}
          {allDocs.length > 0 ? allDocs.map(doc => (
            <div key={doc.id} onClick={() => onSelect(doc)} style={{
              padding: '0.4rem 0.75rem', fontSize: '0.78rem', color: 'var(--text)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <i className="fas fa-file-lines" style={{ color: 'var(--muted)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title || doc.id}</span>
            </div>
          )) : (
            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {value ? 'Không tìm thấy' : 'Nhập để tìm kiếm'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
