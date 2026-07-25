/* ── Services Section for HomePage ── */
export default function ServicesSection({ services, loading, healthMap, statusColor, uptime, onToggle }) {
  const running = services.filter(s => s.status === 'running').length;
  const stopped = services.filter(s => s.status !== 'running').length;

  return (
    <section id="services-section" className="section home-section">
      <div className="container home-container">
        <h2 className="section-title"><span>📦</span> Services</h2>

        {/* Status bar */}
        <div className="status-bar">
          <div className="status-dot running">
            <span className="status-count">{running}</span> running
          </div>
          <div className="status-dot stopped">
            <span className="status-count">{stopped}</span> stopped
          </div>
          <div className="status-dot neutral">🟢 <span className="status-count">—</span> uptime</div>
        </div>

        {loading ? (
          <div className="services-grid">
            {[1, 2].map(i => (
              <div key={i} className="card">
                <div className="card-content"><div className="skeleton" style={{ height: '80px' }} /></div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="card"><div className="card-content text-center text-dim">Chưa có service</div></div>
        ) : (
          <div className="services-grid">
            {services.map(s => {
              const h = healthMap[s.id];
              return (
                <ServiceCard key={s.id} svc={s} health={h} statusColor={statusColor} uptime={uptime} onToggle={onToggle} />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function ServiceCard({ svc: s, health: h, statusColor, uptime, onToggle }) {
  return (
    <div className="card service-card">
      <div className="card-content">
        <div className="service-card-header">
          <div className="flex items-center gap-xs">
            <span className="service-status-dot" style={{ background: statusColor(s), boxShadow: s.status === 'running' ? `0 0 6px ${statusColor(s)}` : 'none' }} />
            <strong className="service-name">{s.name || s.id}</strong>
            <span className="health-dot" style={{
              background: h?.status === 'ok' ? '#22c55e' : h?.status === 'error' ? '#ef4444' : '#6b7280',
              animation: h?.status === 'ok' ? 'pulse 2s infinite' : 'none',
            }} />
          </div>
          <span className="service-port-tag">{s.port ? `:${s.port}` : '—'}</span>
        </div>

        {s.description && <p className="service-desc">{s.description}</p>}

        <p className="service-status-text">
          {s.status === 'running' ? '🟢 Running' : s.status === 'error' ? '🔴 Error' : '⚪ Stopped'}
          {s.status === 'running' && uptime(s) ? ` ⏱ ${uptime(s)}` : ''}
        </p>

        <div className="service-actions">
          <button onClick={() => onToggle(s, 'start')} disabled={s.status === 'running'} className="btn btn-glass btn-sm">▶ Start</button>
          <button onClick={() => onToggle(s, 'stop')} disabled={s.status !== 'running'} className="btn btn-glass btn-sm" style={{ color: s.status === 'running' ? 'var(--red)' : undefined }}>■ Stop</button>
          <button onClick={() => onToggle(s, 'restart')} disabled={s.status !== 'running'} className="btn btn-glass btn-sm">↻ Restart</button>
        </div>
      </div>
    </div>
  );
}
