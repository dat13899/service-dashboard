/* ── LogMonitor: SSE log stream viewer ── */
export default function LogMonitor({ logs, services, filter, onFilterChange, autoScroll, onAutoScrollChange, logEndRef }) {
  const filtered = filter ? logs.filter(l => l.serviceId === filter) : logs;
  return (
    <div className="mt-lg">
      <div className="flex items-center gap-sm mb-sm" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: '0.85rem' }}>
          <i className="fas fa-terminal" style={{ marginRight: '0.3rem' }} />Log Stream
        </span>
        <select value={filter} onChange={e => onFilterChange(e.target.value)}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: 4, color: 'var(--text)', fontSize: '0.72rem', padding: '0.2rem 0.4rem' }}>
          <option value="">All</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
        </select>
        <label className="text-xs text-dim flex items-center gap-xs">
          <input type="checkbox" checked={autoScroll} onChange={e => onAutoScrollChange(e.target.checked)} />Auto-scroll
        </label>
      </div>
      <div className="liquid-panel" style={{ height: 200, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', padding: '0.5rem' }}>
        {filtered.slice(-100).map((l, i) => (
          <div key={i} style={{ color: /[Ee]rror|\\[E\\]|crash/.test(l.line || '') ? 'var(--red)' : l.line?.includes('Stopped') ? 'var(--amber)' : l.line?.includes('Started') ? 'var(--green)' : 'var(--text-dim)' }}>
            <span style={{ opacity: 0.4, marginRight: '0.5rem' }}>[{new Date(l.ts).toLocaleTimeString()}]</span>
            <span style={{ opacity: 0.6, marginRight: '0.3rem' }}>{l.serviceId}:</span>{l.line}
          </div>
        ))}
        {!filtered.length && <span style={{ opacity: 0.4 }}>Waiting for logs...</span>}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
