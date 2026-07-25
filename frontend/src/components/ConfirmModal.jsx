export default function ConfirmModal({ show, title, message, confirmLabel, cancelLabel, danger, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className={`modal ${show ? 'is-active' : ''}`}
      style={{ zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className="modal-background" onClick={onCancel}></div>
      <div className="modal-card" style={{
        borderRadius: 'var(--radius-lg)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
        maxWidth: '420px',
      }}>
        <header className="modal-card-head" style={{
          borderBottom: '1px solid var(--glass-border)',
          background: 'transparent',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        }}>
          <p className="modal-card-title" style={{ color: 'var(--text-strong)', fontSize: '1rem' }}>
            {title || 'Xác nhận'}
          </p>
        </header>
        <section className="modal-card-body" style={{ background: 'transparent', color: 'var(--text)' }}>
          {message}
        </section>
        <footer className="modal-card-foot" style={{
          borderTop: '1px solid var(--glass-border)',
          background: 'transparent',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          gap: '0.5rem',
          justifyContent: 'flex-end',
        }}>
          <button className="button" onClick={onCancel}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-dim)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
            }}
          >
            {cancelLabel || 'Huỷ'}
          </button>
          <button className={`button ${danger ? 'is-danger' : 'is-link'}`} onClick={onConfirm}
            style={{
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            {confirmLabel || 'Xác nhận'}
          </button>
        </footer>
      </div>
    </div>
  );
}
