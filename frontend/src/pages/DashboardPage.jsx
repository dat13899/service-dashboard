/* ── DashboardPage: Service management + monitoring (Telegram-style glass) ── */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchServices, startService, stopService, restartService,
  fetchResources, fetchPorts, fetchFiles,
  addService, updateService, deleteService,
  startAllServices, stopAllServices,
} from '../services/api';
import { useToastContext } from '../components/shared/Toast';
import ConfirmModal from '../components/ConfirmModal';
import ServiceCard from './dashboard/ServiceCard';
import ServiceForm from './dashboard/ServiceForm';
import LogMonitor from './dashboard/LogMonitor';

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

  // SSE log stream
  useEffect(() => {
    const es = new EventSource('/api/logs/stream');
    es.onmessage = (e) => { try { setLogs(prev => [...prev.slice(-200), JSON.parse(e.data)]); } catch {} };
    return () => es.close();
  }, []);
  useEffect(() => { if (logAutoScroll) logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs, logAutoScroll]);

  // Load services
  const loadServices = useCallback(async () => {
    try { setServices(await fetchServices()); } catch { toast('Lỗi tải services', 'error'); }
    setLoadingSvcs(false);
  }, [toast]);
  useEffect(() => { loadServices(); }, [loadServices]);

  // Tab lazy loading
  const refreshResources = useCallback(async () => { try { setResources(await fetchResources()); } catch {} }, []);
  const refreshPorts = useCallback(async () => { try { setPorts(await fetchPorts()); } catch {} }, []);
  const refreshFiles = useCallback(async (p) => { try { setFiles(await fetchFiles(p)); } catch {} }, []);
  useEffect(() => {
    if (activeTab === 'resources') refreshResources();
    if (activeTab === 'ports') refreshPorts();
    if (activeTab === 'files') refreshFiles(filePath);
  }, [activeTab, refreshResources, refreshPorts, refreshFiles, filePath]);

  // Actions
  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));
  const handleStart = async (id) => { try { await startService(id); toast('Đã khởi động', 'success'); loadServices(); } catch { toast('Lỗi', 'error'); } };
  const handleStop = async (id) => { try { await stopService(id); toast('Đã dừng', 'info'); loadServices(); } catch { toast('Lỗi', 'error'); } };
  const handleRestart = async (id) => { try { await restartService(id); toast('Đã restart', 'info'); loadServices(); } catch { toast('Lỗi', 'error'); } };
  const handleDelete = async (id) => { try { await deleteService(id); toast('Đã xoá', 'info'); loadServices(); } catch { toast('Lỗi', 'error'); } };
  const handleBulkStart = async () => { try { await startAllServices(); toast('Started all', 'success'); loadServices(); } catch { toast('Lỗi', 'error'); } };
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
    try { await updateService(editSvc.id, { ...form, port: form.port ? parseInt(form.port) : null }); toast('Đã cập nhật', 'success'); setShowEditModal(false); loadServices(); } catch { toast('Lỗi', 'error'); }
  };
  const openEdit = (svc) => { setEditSvc(svc); setForm({ name: svc.name || '', id: svc.id, port: svc.port || '', command: svc.command || '', dir: svc.dir || '', autoStart: svc.autoStart || false }); setShowEditModal(true); };

  const filteredSvcs = services.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search));

  // ===== RENDER =====
  return (
    <div style={{ padding: '0.5rem 1rem' }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {[
          { label: 'running', count: services.filter(s => s.status === 'running').length, color: '#22c55e' },
          { label: 'stopped', count: services.filter(s => s.status !== 'running').length, color: '#6b7280' },
          { label: 'error', count: services.filter(s => s.status === 'error').length, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel" style={{ flex: '1 1 100px', textAlign: 'center', minWidth: 80, padding: '0.75rem 0.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-glass'} btn-sm`}>
            <i className={`fas ${tab.icon}`} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ===== SERVICES TAB ===== */}
      {activeTab === 'services' && (
        <>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
            <input className="input" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: '1 1 200px', minWidth: 160, maxWidth: 300 }} />
            <button onClick={handleBulkStart} className="btn btn-primary btn-sm"><i className="fas fa-play" /> Start All</button>
            <button onClick={() => setConfirmState({ type: 'bulk-stop' })} className="btn btn-danger btn-sm"><i className="fas fa-stop" /> Stop All</button>
            <button onClick={() => setShowAddModal(true)} className="btn btn-glass btn-sm"><i className="fas fa-plus" /> Add</button>
          </div>

          {/* Service list */}
          {loadingSvcs ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['60%','80%','40%'].map((w,i) => <div key={i} className="skeleton" style={{ height: 48, width: w }} />)}
            </div>
          ) : filteredSvcs.length === 0 ? (
            <div className="empty-state">📭 <p>Không có service nào</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredSvcs.map(s => (
                <ServiceCard key={s.id} svc={s} expanded={expanded[s.id]}
                  onToggle={() => toggleExpand(s.id)}
                  onStart={() => handleStart(s.id)} onStop={() => handleStop(s.id)} onRestart={() => handleRestart(s.id)}
                  onEdit={() => openEdit(s)} onDelete={() => setConfirmState({ type: 'delete', svc: s })}
                  logs={logs.filter(l => l.serviceId === s.id).slice(-50)}
                />
              ))}
            </div>
          )}

          {/* Log monitor */}
          <LogMonitor logs={logs} services={services} filter={logFilter} onFilterChange={setLogFilter}
            autoScroll={logAutoScroll} onAutoScrollChange={setLogAutoScroll} logEndRef={logEndRef} />
        </>
      )}

      {/* ===== RESOURCES TAB ===== */}
      {activeTab === 'resources' && <ResourcesTab resources={resources} onRefresh={refreshResources} />}

      {/* ===== PORTS TAB ===== */}
      {activeTab === 'ports' && <PortsTab ports={ports} onRefresh={refreshPorts} />}

      {/* ===== FILES TAB ===== */}
      {activeTab === 'files' && <FilesTab files={files} filePath={filePath} onNavigate={setFilePath} />}

      {/* ===== MODALS ===== */}
      {showAddModal && (
        <ServiceModal title="Add Service" form={form} onChange={setForm}
          onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      )}
      {showEditModal && (
        <ServiceModal title="Edit Service" form={form} onChange={setForm}
          onSubmit={handleEdit} onCancel={() => setShowEditModal(false)} />
      )}
      <ConfirmModal show={confirmState?.type === 'bulk-stop'} title="Stop All Services" message="Stop tất cả services?" confirmLabel="Stop All" danger
        onConfirm={confirmBulkStop} onCancel={() => setConfirmState(null)} />
      <ConfirmModal show={confirmState?.type === 'delete'} title="Xoá service"
        message={`Xoá "${confirmState?.svc?.name || confirmState?.svc?.id}"?`} confirmLabel="Xoá" danger
        onConfirm={() => { handleDelete(confirmState.svc.id); setConfirmState(null); }} onCancel={() => setConfirmState(null)} />
    </div>
  );
}

/* ── Sub-components (local) ── */

function ServiceModal({ title, form, onChange, onSubmit, onCancel }) {
  return (
    <div className="modal is-active" style={{ zIndex: 9999 }} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-background" onClick={onCancel} />
      <div className="modal-card glass-panel" style={{ maxWidth: 480 }}>
        <header className="modal-card-head" style={{ borderBottom: '1px solid var(--glass-border)', background: 'transparent' }}>
          <p className="modal-card-title" style={{ fontSize: '1rem', color: 'var(--text-strong)' }}>{title}</p>
        </header>
        <section className="modal-card-body" style={{ background: 'transparent' }}>
          <ServiceForm form={form} onChange={onChange} />
        </section>
        <footer className="modal-card-foot" style={{ borderTop: '1px solid var(--glass-border)', background: 'transparent' }}>
          <button onClick={onCancel} className="btn btn-glass">Cancel</button>
          <button onClick={onSubmit} className="btn btn-primary">{title === 'Add Service' ? 'Add' : 'Save'}</button>
        </footer>
      </div>
    </div>
  );
}

function ResourcesTab({ resources, onRefresh }) {
  const cols = ['Service', 'PID', 'Memory', 'Process'];
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-strong)' }}>Process Resources</h2>
        <button onClick={onRefresh} className="btn btn-glass btn-sm"><i className="fas fa-sync-alt" /> Refresh</button>
      </div>
      {!resources.length ? <div className="empty-state">No resource data</div> : (
        <div style={{ overflowX: 'auto' }}><TableCard cols={cols} rows={resources} /></div>
      )}
    </>
  );
}

function PortsTab({ ports, onRefresh }) {
  const cols = ['Port', 'PID'];
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-strong)' }}>Active Ports</h2>
        <button onClick={onRefresh} className="btn btn-glass btn-sm"><i className="fas fa-sync-alt" /> Refresh</button>
      </div>
      {!ports.length ? <div className="empty-state">No ports data</div> : (
        <div style={{ overflowX: 'auto' }}><TableCard cols={cols} rows={ports.map(p => ({ port: p.port || p, pid: p.pid || '—' }))} /></div>
      )}
    </>
  );
}

function FilesTab({ files, filePath, onNavigate }) {
  const up = () => { const p = filePath.split('/').filter(Boolean).slice(0, -1).join('/'); onNavigate('/' + p); };
  const cols = ['Name', 'Size', 'Modified'];
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-strong)' }}>File Browser</h2>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Path: {filePath}</span>
        <button onClick={up} className="btn btn-glass btn-sm" disabled={filePath === '/'}><i className="fas fa-arrow-up" /></button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="card" style={{ width: '100%', fontSize: '0.78rem' }}>
          <thead><tr>{cols.map(h => <th key={h} style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-dim)' }}>{h}</th>)}</tr></thead>
          <tbody>
            {files.map((f, i) => (
              <tr key={i} style={{ cursor: f.isDirectory ? 'pointer' : 'default' }}
                onClick={() => { if (f.isDirectory) onNavigate(f.path); }}>
                <td style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem' }}>
                  <i className={`fas ${f.isDirectory ? 'fa-folder' : 'fa-file'}`} style={{ marginRight: '0.35rem', color: f.isDirectory ? 'var(--amber)' : 'var(--text-dim)' }} />{f.name}
                </td>
                <td style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', color: 'var(--text-dim)' }}>{f.size || '—'}</td>
                <td style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', color: 'var(--text-dim)' }}>{f.modified || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TableCard({ cols, rows }) {
  return (
    <table className="card" style={{ width: '100%', fontSize: '0.78rem' }}>
      <thead><tr>{cols.map(h => <th key={h} style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-dim)' }}>{h}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {Object.values(r).map((v, j) => (
              <td key={j} style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', color: j === 1 ? 'var(--text-dim)' : undefined }}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
