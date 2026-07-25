import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchServices, startService, stopService, restartService,
  fetchServiceLogs, fetchServiceHealth, fetchServiceTimeline,
  fetchResources, fetchPorts, fetchFiles,
  addService, updateService, deleteService,
  startAllServices, stopAllServices,
} from '../services/api';
import { useToastContext } from '../components/shared/Toast';
import ConfirmModal from '../components/ConfirmModal';

const TABS = [
  { id: 'services', label: 'Services', icon: 'fa-server' },
  { id: 'resources', label: 'Resources', icon: 'fa-microchip' },
  { id: 'ports', label: 'Ports', icon: 'fa-plug' },
  { id: 'files', label: 'Files', icon: 'fa-folder' },
];

export default function DashboardPage() {
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [loadingSvcs, setLoadingSvcs] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');
  const [healthPings, setHealthPings] = useState({});
  const [timelines, setTimelines] = useState({});

  const [resources, setResources] = useState([]);
  const [ports, setPorts] = useState([]);
  const [files, setFiles] = useState([]);
  const [filePath, setFilePath] = useState('/');

  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('');
  const [logAutoScroll, setLogAutoScroll] = useState(true);
  const logEndRef = useRef(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [form, setForm] = useState({ name: '', id: '', port: '', command: '', dir: '', autoStart: false });

  // SSE
  useEffect(() => {
    const es = new EventSource('/api/logs/stream');
    es.onmessage = (e) => { try { setLogs(prev => [...prev.slice(-200), JSON.parse(e.data)]); } catch {} };
    return () => es.close();
  }, []);
  useEffect(() => { if (logAutoScroll) logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs, logAutoScroll]);

  const loadServices = useCallback(async () => {
    try { setServices(await fetchServices()); } catch { toast('Lỗi tải services', 'error'); }
    setLoadingSvcs(false);
  }, [toast]);
  useEffect(() => { loadServices(); }, [loadServices]);

  useEffect(() => {
    if (!services.length) return;
    const timers = services.map(s => setInterval(() => {
      fetchServiceHealth(s.id).then(h => setHealthPings(m => ({ ...m, [s.id]: h }))).catch(() => {});
    }, 30000));
    return () => timers.forEach(clearInterval);
  }, [services]);

  const fetchTimeline = (id) => {
    fetchServiceTimeline(id).then(t => setTimelines(m => ({ ...m, [id]: t }))).catch(() => {});
  };

  const refreshResources = useCallback(async () => { try { setResources(await fetchResources()); } catch {} }, []);
  const refreshPorts = useCallback(async () => { try { setPorts(await fetchPorts()); } catch {} }, []);
  const refreshFiles = useCallback(async (p) => { try { setFiles(await fetchFiles(p)); } catch {} }, []);
  useEffect(() => {
    if (activeTab === 'resources') refreshResources();
    if (activeTab === 'ports') refreshPorts();
    if (activeTab === 'files') refreshFiles(filePath);
  }, [activeTab, refreshResources, refreshPorts, refreshFiles, filePath]);

  const toggleExpand = async (id) => {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
    if (!expanded[id]) { fetchTimeline(id); }
  };
  const handleStart = async (id) => { try { await startService(id); toast('Đã khởi động', 'success'); loadServices(); } catch { toast('Lỗi', 'error'); } };
  const handleStop = async (id) => { try { await stopService(id); toast('Đã dừng', 'info'); loadServices(); } catch { toast('Lỗi', 'error'); } };
  const handleRestart = async (id) => { try { await restartService(id); toast('Đã restart', 'info'); loadServices(); } catch { toast('Lỗi', 'error'); } };
  const handleDelete = async (id) => { try { await deleteService(id); toast('Đã xoá', 'info'); loadServices(); } catch { toast('Lỗi', 'error'); } };
  const handleBulkStart = async () => { try { await startAllServices(); toast('Started all', 'success'); loadServices(); } catch { toast('Lỗi', 'error'); } };
  const handleBulkStop = () => setConfirmState({ type: 'bulk-stop' });
  const confirmBulkStop = async () => { try { await stopAllServices(); toast('Stopped all', 'info'); loadServices(); } catch { toast('Lỗi', 'error'); } setConfirmState(null); };

  const handleAdd = async () => {
    try {
      await addService({ ...form, port: form.port ? parseInt(form.port) : null });
      toast('Đã thêm service', 'success'); setShowAddModal(false);
      setForm({ name: '', id: '', port: '', command: '', dir: '', autoStart: false }); loadServices();
    } catch (e) { toast('Lỗi: ' + (e.data?.error || e.message), 'error'); }
  };
  const handleEdit = async () => {
    if (!editSvc) return;
    try {
      await updateService(editSvc.id, { ...form, port: form.port ? parseInt(form.port) : null });
      toast('Đã cập nhật', 'success'); setShowEditModal(false); setEditSvc(null); loadServices();
    } catch (e) { toast('Lỗi: ' + (e.data?.error || e.message), 'error'); }
  };
  const openEdit = (svc) => {
    setEditSvc(svc);
    setForm({ name: svc.name || '', id: svc.id, port: svc.port || '', command: svc.command || '', dir: svc.dir || '', autoStart: svc.autoStart || false });
    setShowEditModal(true);
  };

  const filteredSvcs = services.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search));
  const svcLogs = logFilter ? logs.filter(l => l.serviceId === logFilter) : logs;

  const statusBadge = (s) => <span style={{ color: { running: '#22c55e', stopped: '#6b7280', error: '#ef4444' }[s.status] || '#6b7280', fontSize: '0.7rem' }}>● {s.status}</span>;

  return (
    <div style={{ padding: '0.5rem 1rem' }}>
      {/* Stats bar */}
      <div className="flex gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'running', count: services.filter(s => s.status === 'running').length, color: '#22c55e' },
          { label: 'stopped', count: services.filter(s => s.status !== 'running').length, color: '#6b7280' },
          { label: 'error', count: services.filter(s => s.status === 'error').length, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-sm" style={{ flex: '1 1 100px', textAlign: 'center', minWidth: '80px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stat.color }}>{stat.count}</div>
            <div className="text-xs text-dim" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-xs mb-md" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-glass'} btn-sm`}
          >
            <i className={`fas ${tab.icon}`} /> {tab.label}
          </button>
        ))}
      </div>

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <>
          <div className="flex gap-sm mb-md" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="input" placeholder="Search services..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ flex: '1 1 200px', minWidth: '160px', maxWidth: '300px' }} />
            <button onClick={handleBulkStart} className="btn btn-primary btn-sm"><i className="fas fa-play" /> Start All</button>
            <button onClick={handleBulkStop} className="btn btn-danger btn-sm"><i className="fas fa-stop" /> Stop All</button>
            <button onClick={() => setShowAddModal(true)} className="btn btn-glass btn-sm"><i className="fas fa-plus" /> Add</button>
          </div>

          {loadingSvcs ? (
            <div className="flex flex-col gap-sm">{['w-60','w-80','w-40'].map((w,i) => <div key={i} className="skeleton" style={{ height: '48px', width: w === 'w-60' ? '60%' : w === 'w-80' ? '80%' : '40%' }} />)}</div>
          ) : filteredSvcs.length === 0 ? (
            <div className="empty-state">📭 <p>Không có service nào</p></div>
          ) : (
            <div className="flex flex-col gap-sm">
              {filteredSvcs.map(s => (
                <div key={s.id} className="card">
                  <div className="flex items-center gap-sm px-md py-sm cursor-pointer" onClick={() => toggleExpand(s.id)}
                    style={{ minHeight: '44px' }}>
                    <i className={`fas fa-chevron-${expanded[s.id] ? 'down' : 'right'}`} style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }} />
                    <span className="font-semibold text-strong flex-1" style={{ fontSize: '0.88rem', minWidth: '120px' }}>{s.name || s.id}</span>
                    {statusBadge(s)}
                    {s.port && <a href={`http://localhost:${s.port}`} target="_blank" rel="noopener" className="badge" onClick={e => e.stopPropagation()}>:{s.port}</a>}
                    {s.autoRestart && <span className="badge badge-amber">↻ auto</span>}
                    <div className="flex gap-xs" style={{ marginLeft: 'auto' }}>
                      {s.status !== 'running' && <button onClick={e => { e.stopPropagation(); handleStart(s.id); }} className="btn btn-primary btn-sm" style={{ minWidth: '32px' }}>▶</button>}
                      {s.status === 'running' && <button onClick={e => { e.stopPropagation(); handleStop(s.id); }} className="btn btn-danger btn-sm" style={{ minWidth: '32px' }}>⏹</button>}
                      {s.status === 'running' && <button onClick={e => { e.stopPropagation(); handleRestart(s.id); }} className="btn btn-glass btn-sm" style={{ minWidth: '32px' }}>⟳</button>}
                      <button onClick={e => { e.stopPropagation(); openEdit(s); }} className="btn btn-glass btn-sm">✎</button>
                      <button onClick={e => { e.stopPropagation(); setConfirmState({ type: 'delete', svc: s }); }} className="btn btn-glass btn-sm" style={{ color: 'var(--red)' }}>✕</button>
                    </div>
                  </div>
                  {expanded[s.id] && (
                    <div style={{ borderTop: '1px solid var(--glass-border)', padding: '0.75rem' }}>
                      <div className="flex gap-md" style={{ flexWrap: 'wrap', marginBottom: '0.5rem', fontSize: '0.72rem' }}>
                        <span className="text-dim">Command: <code style={{ background: 'var(--surface-2)', padding: '0.1rem 0.3rem', borderRadius: '3px', color: 'var(--text)' }}>{s.command || '—'}</code></span>
                        <span className="text-dim">Dir: <code style={{ background: 'var(--surface-2)', padding: '0.1rem 0.3rem', borderRadius: '3px', color: 'var(--text)' }}>{s.dir || '—'}</code></span>
                      </div>
                      <div className="text-xs text-dim mb-sm">Logs:</div>
                      <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.4rem', height: '120px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                        {logs.filter(l => l.serviceId === s.id).slice(-50).map((l, i) => (
                          <div key={i} style={{ color: /[Ee]rror|\[E\]/.test(l.line || '') ? 'var(--red)' : 'var(--text-dim)' }}>
                            <span style={{ opacity: 0.5 }}>{new Date(l.ts).toLocaleTimeString()}</span> {l.line}
                          </div>
                        ))}
                        {!logs.filter(l => l.serviceId === s.id).length && <span style={{ opacity: 0.5 }}>No logs</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Log monitor */}
          <div className="mt-lg">
            <div className="flex items-center gap-sm mb-sm" style={{ flexWrap: 'wrap' }}>
              <span className="font-semibold text-strong text-sm"><i className="fas fa-terminal" style={{ marginRight: '0.3rem' }} />Log Stream</span>
              <select value={logFilter} onChange={e => setLogFilter(e.target.value)}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text)', fontSize: '0.72rem', padding: '0.2rem 0.4rem' }}>
                <option value="">All</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
              </select>
              <label className="text-xs text-dim flex items-center gap-xs"><input type="checkbox" checked={logAutoScroll} onChange={e => setLogAutoScroll(e.target.checked)} />Auto-scroll</label>
            </div>
            <div className="glass-panel" style={{ height: '200px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', padding: '0.5rem' }}>
              {svcLogs.slice(-100).map((l, i) => (
                <div key={i} style={{ color: /[Ee]rror|\[E\]|crash/.test(l.line || '') ? 'var(--red)' : l.line?.includes('Stopped') ? 'var(--amber)' : l.line?.includes('Started') ? 'var(--green)' : 'var(--text-dim)' }}>
                  <span style={{ opacity: 0.4, marginRight: '0.5rem' }}>[{new Date(l.ts).toLocaleTimeString()}]</span>
                  <span style={{ opacity: 0.6, marginRight: '0.3rem' }}>{l.serviceId}:</span>{l.line}
                </div>
              ))}
              {!svcLogs.length && <span style={{ opacity: 0.4 }}>Waiting for logs...</span>}
              <div ref={logEndRef} />
            </div>
          </div>
        </>
      )}

      {/* RESOURCES TAB */}
      {activeTab === 'resources' && (
        <>
          <div className="flex items-center gap-sm mb-md">
            <h2 className="text-lg font-semibold text-strong">Process Resources</h2>
            <button onClick={refreshResources} className="btn btn-glass btn-sm"><i className="fas fa-sync-alt" /> Refresh</button>
          </div>
          {!resources.length ? <div className="empty-state">No resource data</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="card" style={{ width: '100%', fontSize: '0.78rem' }}>
                <thead><tr>{['Service','PID','Memory','Process'].map(h => <th key={h} className="text-dim text-xs" style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', textAlign: 'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {resources.map(r => (
                    <tr key={r.id}>
                      <td style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>{r.id}</td>
                      <td className="text-dim" style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>{r.pid}</td>
                      <td style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>{r.memMB} MB</td>
                      <td className="text-dim text-xs" style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>{r.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* PORTS TAB */}
      {activeTab === 'ports' && (
        <>
          <div className="flex items-center gap-sm mb-md">
            <h2 className="text-lg font-semibold text-strong">Active Ports</h2>
            <button onClick={refreshPorts} className="btn btn-glass btn-sm"><i className="fas fa-sync-alt" /> Refresh</button>
          </div>
          {!ports.length ? <div className="empty-state">No ports data</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="card" style={{ width: '100%', fontSize: '0.78rem' }}>
                <thead><tr>{['Port','PID'].map(h => <th key={h} className="text-dim text-xs" style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', textAlign: 'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {ports.map((p, i) => (
                    <tr key={i}>
                      <td style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>{p.port || p}</td>
                      <td className="text-dim" style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>{p.pid || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* FILES TAB */}
      {activeTab === 'files' && (
        <>
          <div className="flex items-center gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
            <h2 className="text-lg font-semibold text-strong">File Browser</h2>
            <span className="text-xs text-dim">Path: {filePath}</span>
            <button onClick={() => { const p = filePath.split('/').filter(Boolean).slice(0,-1).join('/'); setFilePath('/'+p); }}
              className="btn btn-glass btn-sm" disabled={filePath === '/'}><i className="fas fa-arrow-up" /></button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="card" style={{ width: '100%', fontSize: '0.78rem' }}>
              <thead><tr>{['Name','Size','Modified'].map(h => <th key={h} className="text-dim text-xs" style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', textAlign: 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                {files.map((f, i) => (
                  <tr key={i} style={{ cursor: f.isDirectory ? 'pointer' : 'default' }} onClick={() => { if (f.isDirectory) setFilePath(f.path); }}>
                    <td style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>
                      <i className={`fas ${f.isDirectory ? 'fa-folder' : 'fa-file'}`} style={{ marginRight: '0.35rem', color: f.isDirectory ? 'var(--amber)' : 'var(--text-dim)' }} />{f.name}
                    </td>
                    <td className="text-dim" style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>{f.size || '—'}</td>
                    <td className="text-dim" style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>{f.modified || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <div className="modal is-active" style={{ zIndex: 9999 }} onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal-background" onClick={() => setShowAddModal(false)} />
          <div className="modal-card glass-panel" style={{ maxWidth: '480px' }}>
            <header className="modal-card-head" style={{ borderBottom: '1px solid var(--glass-border)', background: 'transparent' }}>
              <p className="modal-card-title text-strong" style={{ fontSize: '1rem' }}>Add Service</p>
            </header>
            <section className="modal-card-body" style={{ background: 'transparent' }}><ServiceForm form={form} onChange={setForm} /></section>
            <footer className="modal-card-foot" style={{ borderTop: '1px solid var(--glass-border)', background: 'transparent' }}>
              <button onClick={() => setShowAddModal(false)} className="btn btn-glass">Cancel</button>
              <button onClick={handleAdd} className="btn btn-primary">Add</button>
            </footer>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal is-active" style={{ zIndex: 9999 }} onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="modal-background" onClick={() => setShowEditModal(false)} />
          <div className="modal-card glass-panel" style={{ maxWidth: '480px' }}>
            <header className="modal-card-head" style={{ borderBottom: '1px solid var(--glass-border)', background: 'transparent' }}>
              <p className="modal-card-title text-strong" style={{ fontSize: '1rem' }}>Edit Service</p>
            </header>
            <section className="modal-card-body" style={{ background: 'transparent' }}><ServiceForm form={form} onChange={setForm} /></section>
            <footer className="modal-card-foot" style={{ borderTop: '1px solid var(--glass-border)', background: 'transparent' }}>
              <button onClick={() => setShowEditModal(false)} className="btn btn-glass">Cancel</button>
              <button onClick={handleEdit} className="btn btn-primary">Save</button>
            </footer>
          </div>
        </div>
      )}

      <ConfirmModal show={confirmState?.type === 'bulk-stop'} title="Stop All Services" message="Stop tất cả services?" confirmLabel="Stop All" danger
        onConfirm={confirmBulkStop} onCancel={() => setConfirmState(null)} />
      <ConfirmModal show={confirmState?.type === 'delete'} title="Xoá service"
        message={`Xoá "${confirmState?.svc?.name || confirmState?.svc?.id}"?`} confirmLabel="Xoá" danger
        onConfirm={() => { handleDelete(confirmState.svc.id); setConfirmState(null); }} onCancel={() => setConfirmState(null)} />
    </div>
  );
}

function ServiceForm({ form, onChange }) {
  const set = (key, val) => onChange(f => ({ ...f, [key]: val }));
  const field = (label, key, type = 'text', required) => (
    <div className="field">
      <label className="text-xs text-dim">{label}{required ? ' *' : ''}</label>
      <input className="input" type={type} value={form[key]} onChange={e => set(key, e.target.value)}
        style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }} />
    </div>
  );
  return (
    <div className="flex flex-col gap-sm">
      {field('Name', 'name', 'text', true)}
      {field('ID', 'id', 'text', true)}
      {field('Port', 'port', 'number')}
      {field('Command', 'command')}
      {field('Directory', 'dir')}
      <label className="flex items-center gap-xs text-xs text-dim">
        <input type="checkbox" checked={form.autoStart} onChange={e => set('autoStart', e.target.checked)} style={{ accentColor: 'var(--accent)' }} /> Auto-start
      </label>
    </div>
  );
}
