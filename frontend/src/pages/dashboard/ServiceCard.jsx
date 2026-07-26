/* ── ServiceCard: expandable card for 1 service ── */
import { useState } from 'react';

export default function ServiceCard({ svc: s, expanded, onToggle, onStart, onStop, onRestart, onEdit, onDelete, logs }) {
  const running = s.status === 'running';
  const statusColor = { running: '#22c55e', stopped: '#6b7280', error: '#ef4444' }[s.status] || '#6b7280';

  return (
    <div className="liquid-card">
      {/* Header row */}
      <div className="flex items-center gap-sm px-md py-sm cursor-pointer" onClick={onToggle}
        style={{ minHeight: 44 }}>
        <i className={`fas fa-chevron-${expanded ? 'down' : 'right'}`} style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }} />
        <span style={{ fontWeight: 600, color: 'var(--text-strong)', flex: 1, fontSize: '0.88rem', minWidth: 120 }}>{s.name || s.id}</span>
        <span style={{ color: statusColor, fontSize: '0.7rem' }}>● {s.status}</span>
        {s.port && <a href={`http://localhost:${s.port}`} target="_blank" rel="noopener" className="badge" onClick={e => e.stopPropagation()}>:{s.port}</a>}
        {s.autoRestart && <span className="badge badge-amber">↻ auto</span>}
        <div className="flex gap-xs" style={{ marginLeft: 'auto' }}>
          {!running && <button onClick={e => { e.stopPropagation(); onStart(); }} className="liquid-btn primary" style={{ minWidth: 32 }}>▶</button>}
          {running && <button onClick={e => { e.stopPropagation(); onStop(); }} className="liquid-btn danger" style={{ minWidth: 32 }}>⏹</button>}
          {running && <button onClick={e => { e.stopPropagation(); onRestart(); }} className="liquid-btn" style={{ minWidth: 32 }}>⟳</button>}
          <button onClick={e => { e.stopPropagation(); onEdit(); }} className="liquid-btn">✎</button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="liquid-btn" style={{ color: 'var(--red)' }}>✕</button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--glass-border)', padding: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>
              Command: <code style={{ background: 'var(--surface-2)', padding: '0.1rem 0.3rem', borderRadius: 3, color: 'var(--text)' }}>{s.command || '—'}</code>
            </span>
            <span style={{ color: 'var(--text-dim)' }}>
              Dir: <code style={{ background: 'var(--surface-2)', padding: '0.1rem 0.3rem', borderRadius: 3, color: 'var(--text)' }}>{s.dir || '—'}</code>
            </span>
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginBottom: '0.6rem' }}>Logs:</div>
          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', height: 120, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            {logs.map((l, i) => (
              <div key={i} style={{ color: /[Ee]rror|\\[E\\]/.test(l.line || '') ? 'var(--red)' : 'var(--text-dim)' }}>
                <span style={{ opacity: 0.5 }}>{new Date(l.ts).toLocaleTimeString()}</span> {l.line}
              </div>
            ))}
            {!logs.length && <span style={{ opacity: 0.5 }}>No logs</span>}
          </div>
        </div>
      )}
    </div>
  );
}
