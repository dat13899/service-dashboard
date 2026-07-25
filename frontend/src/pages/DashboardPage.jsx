import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import BlobBackground from '../components/BlobBackground';
import {
  fetchServices, startService, stopService, restartService,
  fetchServiceLogs, fetchServiceHealth, fetchServiceTimeline,
  fetchResources, fetchPorts, fetchFiles,
  addService, updateService, deleteService,
  startAllServices, stopAllServices,
} from '../services/api';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';

const TABS = [
  { id: 'services', label: 'Services', icon: 'fa-server' },
  { id: 'resources', label: 'Resources', icon: 'fa-microchip' },
  { id: 'ports', label: 'Ports', icon: 'fa-plug' },
  { id: 'files', label: 'Files', icon: 'fa-folder' },
];

export default function DashboardPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [loadingSvcs, setLoadingSvcs] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');
  const [healthPings, setHealthPings] = useState({});
  const [timelines, setTimelines] = useState({});

  // Resources
  const [resources, setResources] = useState([]);
  const [ports, setPorts] = useState([]);
  const [files, setFiles] = useState([]);
  const [filePath, setFilePath] = useState('/');

  // SSE
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('');
  const [logAutoScroll, setLogAutoScroll] = useState(true);
  const logEndRef = useRef(null);
  const sseRef = useRef(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [confirmState, setConfirmState] = useState(null); // {type, svc}

  // Form state
  const [form, setForm] = useState({ name: '', id: '', port: '', command: '', dir: '', autoStart: false });

  // ── SSE ──
  useEffect(() => {
    const es = new EventSource('/api/logs/stream');
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        setLogs(prev => [...prev.slice(-200), d]);
      } catch {}
    };
    es.onerror = () => {};
    sseRef.current = es;
    return () => es.close();
  }, []);

  useEffect(() => {
    if (logAutoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, logAutoScroll]);

  // ── Load services ──
  const loadServices = useCallback(async () => {
    try {
      const data = await fetchServices();
      setServices(data);
    } catch { toast('Lỗi tải services', 'error'); }
    setLoadingSvcs(false);
  }, [toast]);

  useEffect(() => { loadServices(); }, [loadServices]);

  // Health + timeline pings
  useEffect(() => {
    if (services.length === 0) return;
    const timers = [];
    services.forEach(s => {
      const t = setInterval(async () => {
        try {
          const h = await fetchServiceHealth(s.id);
          setHealthPings(m => ({ ...m, [s.id]: h }));
        } catch {}
      }, 30000);
      timers.push(t);
    });
    return () => timers.forEach(clearInterval);
  }, [services]);

  const fetchTimeline = async (id) => {
    try {
      const t = await fetchServiceTimeline(id);
      setTimelines(m => ({ ...m, [id]: t }));
    } catch {}
  };

  // ── Resource refresh ──
  const refreshResources = useCallback(async () => {
    try { setResources(await fetchResources()); } catch {}
  }, []);
  const refreshPorts = useCallback(async () => {
    try { setPorts(await fetchPorts()); } catch {}
  }, []);
  const refreshFiles = useCallback(async (p) => {
    try { setFiles(await fetchFiles(p)); } catch {}
  }, []);

  useEffect(() => {
    if (activeTab === 'resources') refreshResources();
    if (activeTab === 'ports') refreshPorts();
    if (activeTab === 'files') refreshFiles(filePath);
  }, [activeTab, refreshResources, refreshPorts, refreshFiles, filePath]);

  // ── Handlers ──
  const toggleExpand = async (id) => {
    const next = { ...expanded, [id]: !expanded[id] };
    setExpanded(next);
    if (next[id]) {
      try { const logs = await fetchServiceLogs(id); setLogs(prev => [...prev, ...logs.map(l => ({ serviceId: id, line: l.line, ts: l.ts }))]); } catch {}
      fetchTimeline(id);
    }
  };

  const handleStart = async (id) => {
    try { await startService(id); toast('Đã khởi động', 'success'); loadServices(); }
    catch { toast('Lỗi', 'error'); }
  };
  const handleStop = async (id) => {
    try { await stopService(id); toast('Đã dừng', 'info'); loadServices(); }
    catch { toast('Lỗi', 'error'); }
  };
  const handleRestart = async (id) => {
    try { await restartService(id); toast('Đã restart', 'info'); loadServices(); }
    catch { toast('Lỗi', 'error'); }
  };
  const handleDelete = async (id) => {
    try { await deleteService(id); toast('Đã xoá', 'info'); loadServices(); }
    catch { toast('Lỗi', 'error'); }
  };
  const handleBulkStart = async () => {
    try { await startAllServices(); toast('Started all', 'success'); loadServices(); }
    catch { toast('Lỗi', 'error'); }
  };
  const handleBulkStop = async () => {
    setConfirmState({ type: 'bulk-stop' });
  };
  const confirmBulkStop = async () => {
    try { await stopAllServices(); toast('Stopped all', 'info'); loadServices(); }
    catch { toast('Lỗi', 'error'); }
    setConfirmState(null);
  };

  // ── Form ──
  const handleAdd = async () => {
    try {
      await addService({ ...form, port: form.port ? parseInt(form.port) : null });
      toast('Đã thêm service', 'success');
      setShowAddModal(false);
      setForm({ name: '', id: '', port: '', command: '', dir: '', autoStart: false });
      loadServices();
    } catch (e) { toast('Lỗi: ' + (e.data?.error || e.message), 'error'); }
  };
  const handleEdit = async () => {
    if (!editSvc) return;
    try {
      await updateService(editSvc.id, { ...form, port: form.port ? parseInt(form.port) : null });
      toast('Đã cập nhật', 'success');
      setShowEditModal(false);
      setEditSvc(null);
      loadServices();
    } catch (e) { toast('Lỗi: ' + (e.data?.error || e.message), 'error'); }
  };
  const openEdit = (svc) => {
    setEditSvc(svc);
    setForm({ name: svc.name || '', id: svc.id, port: svc.port || '', command: svc.command || '', dir: svc.dir || '', autoStart: svc.autoStart || false });
    setShowEditModal(true);
  };

  // ── Helpers ──
  const filteredSvcs = services.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
  );
  const svcLogs = logFilter ? logs.filter(l => l.serviceId === logFilter) : logs;

  const statusBadge = (s) => {
    const colors = { running: '#22c55e', stopped: '#6b7280', error: '#ef4444' };
    return <span style={{ color: colors[s.status] || '#6b7280', fontSize: '0.7rem' }}>● {s.status}</span>;
  };

  const renderTimelineChart = (events) => {
    if (!events || events.length < 2) return null;
    const now = Date.now();
    const dayAgo = now - 86400000;
    const points = events.filter(e => e.ts >= dayAgo).map(e => ({
      x: (e.ts - dayAgo) / 86400000 * 100,
      color: e.status === 'running' ? '#22c55e' : e.status === 'error' ? '#ef4444' : '#6b7280',
    }));
    if (points.length < 2) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '24px', marginTop: '0.35rem', padding: '0 0.25rem' }}>
        {points.map((p, i) => (
          <div key={i} style={{
            flex: 1, height: `${(p.x > 0 ? p.x : 5)}%`,
            background: p.color, borderRadius: '1px 1px 0 0',
            minHeight: '3px', opacity: 0.7 + (p.color === '#22c55e' ? 0.3 : 0),
          }} title={new Date(p.ts).toLocaleTimeString()} />
        ))}
      </div>
    );
  };

  return (
    <>
      <BlobBackground />
      <Navbar active="/dashboard" />

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>

          {/* Tabs */}
          <div className="tabs is-boxed" style={{ marginBottom: '1rem' }}>
            <ul style={{ borderBottomColor: 'var(--glass-border)', gap: '0.2rem' }}>
              {TABS.map(tab => (
                <li key={tab.id} className={activeTab === tab.id ? 'is-active' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <a style={{
                    borderRadius: '8px 8px 0 0',
                    padding: '0.5rem 1rem',
                    border: '1px solid transparent',
                    borderBottom: 'none',
                    fontSize: '0.82rem',
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-dim)',
                    background: activeTab === tab.id ? 'var(--glass-bg)' : 'transparent',
                    backdropFilter: activeTab === tab.id ? 'blur(12px)' : 'none',
                  }}>
                    <i className={`fas ${tab.icon}`} style={{ marginRight: '0.3rem' }}></i>
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── SERVICES TAB ─── */}
          {activeTab === 'services' && (
            <>
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
                <div className="control has-icons-left" style={{ flex: '1 1 200px', minWidth: '160px' }}>
                  <input className="input" type="text" placeholder="Search services..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{
                      background: 'var(--surface-2)', border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.82rem',
                      padding: '0.35rem 0.6rem 0.35rem 2rem',
                    }}
                  />
                  <span className="icon is-left" style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <i className="fas fa-search" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}></i>
                  </span>
                </div>
                <button onClick={handleBulkStart} className="button is-small"
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.78rem' }}>
                  <i className="fas fa-play" style={{ marginRight: '0.25rem' }}></i> Start All
                </button>
                <button onClick={handleBulkStop} className="button is-small"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.78rem' }}>
                  <i className="fas fa-stop" style={{ marginRight: '0.25rem' }}></i> Stop All
                </button>
                <button onClick={() => setShowAddModal(true)} className="button is-small"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text)' }}>
                  <i className="fas fa-plus" style={{ marginRight: '0.25rem' }}></i> Add
                </button>
              </div>

              {/* Service cards */}
              {loadingSvcs ? (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[1,2,3].map(i => (
                    <div key={i} className="card glass-card" style={{ width: '280px', padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
                      <div className="skeleton-load"><div className="skel skel-txt" style={{ height:'0.8rem', marginBottom:'0.5rem', width:'60%' }}></div><div className="skel skel-txt2" style={{ height:'0.6rem', width:'80%' }}></div></div>
                    </div>
                  ))}
                </div>
              ) : filteredSvcs.length === 0 ? (
                <div className="has-text-centered" style={{ padding: '2rem', color: 'var(--text-dim)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                  <p>Không có service nào</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredSvcs.map(s => (
                    <div key={s.id} className="card glass-card" style={{
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      transition: 'box-shadow .2s',
                    }}>
                      {/* Card header */}
                      <div style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', cursor: 'pointer' }}
                        onClick={() => toggleExpand(s.id)}
                      >
                        <i className={`fas fa-chevron-${expanded[s.id] ? 'down' : 'right'}`} style={{ color: 'var(--text-dim)', fontSize: '0.7rem', width: '12px' }}></i>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-strong)', flex: '1 0 auto', minWidth: '120px' }}>{s.name || s.id}</span>
                        {statusBadge(s)}
                        {s.port && <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>:{s.port}</span>}
                        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
                          {s.status !== 'running' && (
                            <button onClick={(e) => { e.stopPropagation(); handleStart(s.id); }} className="button is-small" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.7rem', padding: '0.2rem 0.5rem', fontWeight: 600 }}>▶</button>
                          )}
                          {s.status === 'running' && (
                            <button onClick={(e) => { e.stopPropagation(); handleStop(s.id); }} className="button is-small" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px', fontSize: '0.7rem', padding: '0.2rem 0.5rem', fontWeight: 600 }}>⏹</button>
                          )}
                          {s.status === 'running' && (
                            <button onClick={(e) => { e.stopPropagation(); handleRestart(s.id); }} className="button is-small" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: 'var(--text-dim)' }}>⟳</button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="button is-small" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: 'var(--text-dim)' }}>✎</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmState({ type: 'delete', svc: s }); }} className="button is-small" style={{ background: 'transparent', border: 'none', borderRadius: '4px', fontSize: '0.7rem', padding: '0.2rem 0.4rem', color: '#ef4444' }}>✕</button>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {expanded[s.id] && (
                        <div style={{ borderTop: '1px solid var(--glass-border)', padding: '0.75rem 0.85rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            <div><span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Command:</span> <code style={{ fontSize: '0.72rem', color: 'var(--text)', background: 'var(--surface-2)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{s.command || '—'}</code></div>
                            <div><span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Dir:</span> <code style={{ fontSize: '0.72rem', color: 'var(--text)', background: 'var(--surface-2)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{s.dir || '—'}</code></div>
                            {timelines[s.id] && <div style={{ flex: '1 1 100%', marginTop: '0.25rem' }}><span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>24h timeline:</span>{renderTimelineChart(timelines[s.id].events)}</div>}
                          </div>

                          {/* Logs */}
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Logs:</div>
                          <div style={{
                            background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
                            padding: '0.4rem', height: '120px', overflowY: 'auto',
                            fontFamily: 'monospace', fontSize: '0.7rem', lineHeight: '1.5',
                          }}>
                            {logs.filter(l => l.serviceId === s.id).slice(-50).map((l, i) => (
                              <div key={i} style={{ color: l.line?.includes('[E]') || l.line?.includes('Error') || l.line?.includes('error') ? '#ef4444' : 'var(--text-dim)' }}>
                                <span style={{ opacity: 0.5 }}>{new Date(l.ts).toLocaleTimeString()}</span> {l.line}
                              </div>
                            ))}
                            {logs.filter(l => l.serviceId === s.id).length === 0 && <span style={{ opacity: 0.5 }}>No logs yet</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Log monitor */}
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-strong)' }}><i className="fas fa-terminal" style={{ marginRight: '0.3rem' }}></i>Log Stream</span>
                  <select value={logFilter} onChange={e => setLogFilter(e.target.value)}
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text)', fontSize: '0.72rem', padding: '0.2rem 0.4rem', outline: 'none' }}>
                    <option value="">All services</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
                  </select>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input type="checkbox" checked={logAutoScroll} onChange={e => setLogAutoScroll(e.target.checked)} />
                    Auto-scroll
                  </label>
                </div>
                <div style={{
                  background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--glass-border)', height: '200px', overflowY: 'auto',
                  fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: '1.6',
                  padding: '0.5rem',
                }}>
                  {svcLogs.slice(-100).map((l, i) => (
                    <div key={i} style={{
                      color: l.line?.includes('[E]') || l.line?.includes('Error') || l.line?.includes('error') || l.line?.includes('crash') ? '#ef4444'
                        : l.line?.includes('Stopped') ? '#f59e0b'
                        : l.line?.includes('Started') ? '#22c55e'
                        : 'var(--text-dim)',
                    }}>
                      <span style={{ opacity: 0.4, marginRight: '0.5rem' }}>[{new Date(l.ts).toLocaleTimeString()}]</span>
                      <span style={{ opacity: 0.6, marginRight: '0.3rem' }}>{l.serviceId}:</span>{l.line}
                    </div>
                  ))}
                  {svcLogs.length === 0 && <span style={{ opacity: 0.4 }}>Waiting for logs...</span>}
                  <div ref={logEndRef} />
                </div>
              </div>
            </>
          )}

          {/* ─── RESOURCES TAB ─── */}
          {activeTab === 'resources' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-strong)' }}>Process Resources</h2>
                <button onClick={refreshResources} className="button is-small" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  <i className="fas fa-sync-alt" style={{ marginRight: '0.25rem' }}></i>Refresh
                </button>
              </div>
              {resources.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No resource data</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>Service</th>
                        <th style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>PID</th>
                        <th style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>Memory</th>
                        <th style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>Process</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map(r => (
                        <tr key={r.id}>
                          <td style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text)' }}>{r.id}</td>
                          <td style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}>{r.pid}</td>
                          <td style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text)' }}>{r.memMB} MB</td>
                          <td style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-dim)', fontSize: '0.72rem' }}>{r.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── PORTS TAB ─── */}
          {activeTab === 'ports' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-strong)' }}>Active Ports</h2>
                <button onClick={refreshPorts} className="button is-small" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  <i className="fas fa-sync-alt" style={{ marginRight: '0.25rem' }}></i>Refresh
                </button>
              </div>
              {ports.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No ports data</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>Port</th>
                        <th style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>PID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ports.map((p, i) => (
                        <tr key={i}>
                          <td style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text)' }}>{p.port || p}</td>
                          <td style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}>{p.pid || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── FILES TAB ─── */}
          {activeTab === 'files' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-strong)' }}>File Browser</h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Path: {filePath}</span>
                <button onClick={() => {
                  const parent = filePath.split('/').filter(Boolean).slice(0, -1).join('/');
                  setFilePath('/' + parent);
                }} className="button is-small" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--text-dim)' }}
                  disabled={filePath === '/'}>
                  <i className="fas fa-arrow-up"></i>
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>Name</th>
                      <th style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>Size</th>
                      <th style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)' }}>Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f, i) => (
                      <tr key={i} style={{ cursor: f.isDirectory ? 'pointer' : 'default' }} onClick={() => { if (f.isDirectory) setFilePath(f.path); }}>
                        <td style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text)' }}>
                          <i className={`fas ${f.isDirectory ? 'fa-folder' : 'fa-file'}`} style={{ marginRight: '0.35rem', color: f.isDirectory ? '#f59e0b' : 'var(--text-dim)' }}></i>
                          {f.name}
                        </td>
                        <td style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}>{f.size || '—'}</td>
                        <td style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}>{f.modified || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── Add Service Modal ── */}
      <div className={`modal ${showAddModal ? 'is-active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-background" onClick={() => setShowAddModal(false)}></div>
        <div className="modal-card" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', border: '1px solid var(--glass-border)', maxWidth: '480px' }}>
          <header className="modal-card-head" style={{ borderBottom: '1px solid var(--glass-border)', background: 'transparent', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <p className="modal-card-title" style={{ color: 'var(--text-strong)', fontSize: '1rem' }}>Add Service</p>
          </header>
          <section className="modal-card-body" style={{ background: 'transparent' }}>
            <ServiceForm form={form} onChange={setForm} />
          </section>
          <footer className="modal-card-foot" style={{ borderTop: '1px solid var(--glass-border)', background: 'transparent', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <button onClick={() => setShowAddModal(false)} className="button" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-dim)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
            <button onClick={handleAdd} className="button is-link" style={{ borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>Add</button>
          </footer>
        </div>
      </div>

      {/* ── Edit Service Modal ── */}
      <div className={`modal ${showEditModal ? 'is-active' : ''}`} style={{ zIndex: 9999 }}>
        <div className="modal-background" onClick={() => setShowEditModal(false)}></div>
        <div className="modal-card" style={{ borderRadius: 'var(--radius-lg)', background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', border: '1px solid var(--glass-border)', maxWidth: '480px' }}>
          <header className="modal-card-head" style={{ borderBottom: '1px solid var(--glass-border)', background: 'transparent', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <p className="modal-card-title" style={{ color: 'var(--text-strong)', fontSize: '1rem' }}>Edit Service</p>
          </header>
          <section className="modal-card-body" style={{ background: 'transparent' }}>
            <ServiceForm form={form} onChange={setForm} />
          </section>
          <footer className="modal-card-foot" style={{ borderTop: '1px solid var(--glass-border)', background: 'transparent', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <button onClick={() => setShowEditModal(false)} className="button" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-dim)', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
            <button onClick={handleEdit} className="button is-link" style={{ borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>Save</button>
          </footer>
        </div>
      </div>

      {/* ── Confirm modals ── */}
      <ConfirmModal
        show={confirmState?.type === 'bulk-stop'}
        title="Stop All Services"
        message="Bạn có chắc muốn dừng tất cả services?"
        confirmLabel="Stop All"
        danger
        onConfirm={confirmBulkStop}
        onCancel={() => setConfirmState(null)}
      />
      <ConfirmModal
        show={confirmState?.type === 'delete'}
        title="Xoá service"
        message={`Xoá "${confirmState?.svc?.name || confirmState?.svc?.id}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={() => { handleDelete(confirmState.svc.id); setConfirmState(null); }}
        onCancel={() => setConfirmState(null)}
      />
    </>
  );
}

// ── Service Form sub-component ──
function ServiceForm({ form, onChange }) {
  const set = (key, val) => onChange(f => ({ ...f, [key]: val }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div className="field">
        <label className="label" style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Name *</label>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }} />
      </div>
      <div className="field">
        <label className="label" style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>ID *</label>
        <input className="input" value={form.id} onChange={e => set('id', e.target.value)}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }} />
      </div>
      <div className="field">
        <label className="label" style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Port</label>
        <input className="input" type="number" value={form.port} onChange={e => set('port', e.target.value)}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }} />
      </div>
      <div className="field">
        <label className="label" style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Command</label>
        <input className="input" value={form.command} onChange={e => set('command', e.target.value)}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }} />
      </div>
      <div className="field">
        <label className="label" style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Directory</label>
        <input className="input" value={form.dir} onChange={e => set('dir', e.target.value)}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }} />
      </div>
      <div className="field">
        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
          <input type="checkbox" checked={form.autoStart} onChange={e => set('autoStart', e.target.checked)}
            style={{ accentColor: 'var(--accent)' }} />
          Auto-start
        </label>
      </div>
    </div>
  );
}
