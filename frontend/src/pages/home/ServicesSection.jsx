/* ── Services Section for HomePage (Telegram-style glass) ── */

function ServiceCard({ svc: s, health: h, statusColor, uptime, onToggle }) {
  const running = s.status === 'running';
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '1rem' }}>
        {/* Header: dot + name + port */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: statusColor(s),
              boxShadow: running ? `0 0 6px ${statusColor(s)}` : 'none',
            }} />
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-strong)' }}>{s.name || s.id}</strong>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: h?.status === 'ok' ? 'var(--green)' : h?.status === 'error' ? 'var(--red)' : 'var(--text-dim)',
              animation: h?.status === 'ok' ? 'pulse 2s infinite' : 'none',
            }} />
          </div>
          <span style={{
            fontSize: '0.68rem', padding: '0.1rem 0.5rem', borderRadius: 6,
            background: 'var(--surface-2)', color: 'var(--text-dim)',
            border: '1px solid var(--glass-border)',
          }}>{s.port ? `:${s.port}` : '—'}</span>
        </div>

        {s.description && <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.4, marginBottom: '0.4rem' }}>{s.description}</p>}

        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
          {running ? '🟢 Running' : s.status === 'error' ? '🔴 Error' : '⚪ Stopped'}
          {running && uptime(s) ? ` ⏱ ${uptime(s)}` : ''}
        </p>

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button onClick={() => onToggle(s, 'start')} disabled={running} className="btn btn-glass btn-sm">▶ Start</button>
          <button onClick={() => onToggle(s, 'stop')} disabled={!running} className="btn btn-glass btn-sm"
            style={running ? { color: 'var(--red)' } : undefined}>■ Stop</button>
          <button onClick={() => onToggle(s, 'restart')} disabled={!running} className="btn btn-glass btn-sm">↻ Restart</button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesSection({ services, loading, healthMap, statusColor, uptime, onToggle }) {
  const running = services.filter(s => s.status === 'running').length;
  const stopped = services.filter(s => s.status !== 'running').length;

  return (
    <section id="services-section" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--text-strong)', marginBottom: '1rem' }}>
          <span style={{ marginRight: 8 }}>📦</span> Services
        </h2>

        {/* Status bar pill */}
        <div style={{
          display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center',
          flexWrap: 'wrap', padding: '0.75rem 1.2rem', marginBottom: '1rem',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem', boxShadow: '0 4px 24px var(--glass-shadow)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{running}</span> running
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-dim)' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{stopped}</span> stopped
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            🟢 <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>—</span> uptime
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[1, 2].map(i => (
              <div key={i} className="card"><div style={{ padding: '1rem' }}><div className="skeleton" style={{ height: 80 }} /></div></div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="card"><div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>Chưa có service</div></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {services.map(s => (
              <ServiceCard key={s.id} svc={s} health={healthMap[s.id]} statusColor={statusColor} uptime={uptime} onToggle={onToggle} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
