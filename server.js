const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const zlib = require('zlib');

const SOFFICE = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

// ── Config ──
const PORT = parseInt(process.env.PORT || '3000', 10);
const LOG_MAX = 3000;
const DASHBOARD_START = Date.now();
const CONFIG_PATH = path.join(__dirname, 'services.json');
const DOCS_DIR = path.join(__dirname, '..', 'documents');
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png',
};
const SYSTEM_PORTS = new Set([135, 445, 3389, 5040, 5357, 7680, 8644, 20128, 49664, 49665, 49666, 49667, 49668, 49672, 49675]);

// ── Resource cache ──
let _resCache = { ts: 0, data: null };

function getResources() {
  const now = Date.now();
  if (_resCache.data && now - _resCache.ts < 3000) return _resCache.data;
  try {
    const out = execSync('tasklist /fo csv /nh', { encoding: 'utf8', timeout: 5000, maxBuffer: 1024 * 1024 });
    const procs = new Map();
    for (const line of out.split('\n').filter(Boolean)) {
      const parts = line.match(/"([^"]+)","([^"]*)","(\d+)","(\d+)","(\d+) K"/);
      if (!parts) continue;
      const name = parts[1], pid = parseInt(parts[2]), mem = parseInt(parts[5]) / 1024;
      procs.set(pid, { name, memMB: Math.round(mem * 10) / 10 });
    }
    const srvPids = new Map();
    for (const s of services) {
      const st = S.get(s.id);
      if (st && st.pid) srvPids.set(st.pid, s.id);
    }
    const svcResources = [];
    for (const [pid, info] of procs) {
      if (srvPids.has(pid)) svcResources.push({ id: srvPids.get(pid), pid, memMB: info.memMB, name: info.name });
    }
    _resCache = { ts: now, data: svcResources };
    return svcResources;
  } catch (_) { return []; }
}

// ── Uptime timeline events ──
const EVENTS = new Map();
function trackEvent(id, status, msg) {
  if (!EVENTS.has(id)) EVENTS.set(id, []);
  const arr = EVENTS.get(id);
  arr.push({ ts: Date.now(), status, msg });
  const cutoff = Date.now() - 86400000; // 24h
  while (arr.length > 1 && arr[0].ts < cutoff) arr.shift();
}
function getTimeline(id) {
  const arr = EVENTS.get(id) || [];
  return { events: arr.slice(-288), total: arr.length };
}

// ── Helpers ──
function isSafePath(base, target) { const r = path.resolve(base, target); return r.startsWith(base); }

function extractMDFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, content: raw };
  const meta = {};
  for (const line of m[1].split('\n')) { const kv = line.match(/^(\w+):\s*(.+)/); if (kv) meta[kv[1]] = kv[2].replace(/^['"]|['"]$/g, ''); }
  return { meta, content: m[2] };
}

function json(res, data, code = 200) {
  const body = JSON.stringify(data);
  const accept = reqOf(res)?.headers?.['accept-encoding'] || '';
  if (accept.includes('gzip') && body.length > 1024) {
    zlib.gzip(body, (_, buf) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' }); res.end(buf); });
  } else { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(body); }
}
function reqOf(res) { return res._req; }

// ── netstat cache (5s TTL) ──
let _netstatCache = { ts: 0, data: null };
function getNetstat() {
  const now = Date.now();
  if (_netstatCache.data && now - _netstatCache.ts < 5000) return _netstatCache.data;
  const out = execSync('netstat -ano', { encoding: 'utf8', timeout: 5000, maxBuffer: 1024 * 1024 });
  const ports = new Map();
  for (const line of out.split('\n')) { const m = line.match(/^\s*TCP\s+\S+:(\d+)\s+\S+:\d+\s+LISTENING\s+(\d+)/); if (m) ports.set(parseInt(m[1]), parseInt(m[2])); }
  _netstatCache = { ts: Date.now(), data: ports };
  return ports;
}

// ── Services data ──
let services = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
const S = new Map();

function initState() {
  S.clear();
  const activePorts = getNetstat();
  for (const s of services) {
    const pid = s.port ? activePorts.get(s.port) : null;
    S.set(s.id, { proc: null, pid, status: pid ? 'running' : 'stopped', logs: [], sseClients: new Set(), startedAt: pid ? Date.now() : null });
  }
  S.set('__all__', { sseClients: new Set() });
}
initState();

function autoStartServices() {
  for (const s of services) {
    if (s.autoStart && s.command) {
      const st = S.get(s.id);
      if (st && st.status !== 'running') { console.log(`  Auto-starting ${s.name}...`); startService(s.id); }
    }
  }
}

function saveServices() { fs.writeFileSync(CONFIG_PATH, JSON.stringify(services, null, 2), 'utf-8'); }
function reloadServices() {
  services = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const oldS = new Map(S); initState();
  for (const s of services) { const old = oldS.get(s.id); if (old && old.status === 'running' && old.proc) S.set(s.id, old); }
}

// ── Logging + SSE ──
function addLog(id, line) {
  const st = S.get(id);
  if (!st) return;
  const entry = { ts: Date.now(), line: String(line) };
  st.logs.push(entry);
  if (st.logs.length > LOG_MAX) st.logs.splice(0, st.logs.length - LOG_MAX);
  for (const cb of st.sseClients) { try { cb(entry, id, 'log'); } catch (_) {} }
  const all = S.get('__all__');
  if (all) for (const cb of all.sseClients) { try { cb(entry, id, 'log'); } catch (_) {} }
}

function sseSendAlert(res, msg) {
  if (res.writableEnded) return;
  res.write(`event: alert\ndata: ${JSON.stringify(msg)}\n\n`);
}

function sseSend(res, id, entry) {
  if (res.writableEnded) return;
  res.write(`id: ${entry.ts}\nevent: log\ndata: ${JSON.stringify({ serviceId: id, line: entry.line, ts: entry.ts })}\n\n`);
}

// ── Process mgmt ──
function startService(id) {
  const svc = services.find(s => s.id === id);
  const st = S.get(id);
  if (!svc || !st) return { error: 'not-found' };
  if (st.status === 'running') return { ok: true, status: 'already-running' };
  const parts = svc.command.split(/\s+/);
  const child = spawn(parts[0], parts.slice(1), { cwd: svc.dir, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  st.proc = child; st.pid = child.pid; st.status = 'running'; st.startedAt = Date.now();
  trackEvent(id, 'running', 'Started');
  addLog(id, `── Started (PID ${child.pid}) ──`);
  child.stdout.on('data', (buf) => { for (const l of buf.toString().split(/\r?\n/).filter(Boolean)) addLog(id, l); });
  child.stderr.on('data', (buf) => { for (const l of buf.toString().split(/\r?\n/).filter(Boolean)) addLog(id, `[E] ${l}`); });
  child.on('exit', (code, sig) => {
    addLog(id, `── Exited (code=${code}, signal=${sig}) ──`);
    const wasRunning = st.status === 'running';
    st.proc = null; st.pid = null; st.status = 'stopped'; st.startedAt = null;
    trackEvent(id, 'stopped', `Exited code=${code}`);
    if (wasRunning && code !== 0 && sig !== 'SIGTERM') {
      const alert = { type: 'crash', serviceId: id, msg: `${svc.name} crashed (code=${code})` };
      for (const cb of st.sseClients) { try { cb(alert.msg, id, 'alert'); } catch (_) {} }
      const all = S.get('__all__');
      if (all) for (const cb of all.sseClients) { try { cb(alert.msg, id, 'alert'); } catch (_) {} }
    }
  });
  child.on('error', (err) => {
    addLog(id, `[ERROR] ${err.message}`);
    st.proc = null; st.pid = null; st.status = 'error'; st.startedAt = null;
    trackEvent(id, 'error', err.message);
  });
  return { ok: true };
}

function stopService(id) {
  const st = S.get(id);
  if (!st) return { error: 'not-found' };
  if (st.status !== 'running') return { ok: true, status: 'already-stopped' };
  if (st.pid) { try { spawn('taskkill', ['/pid', String(st.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' }).unref(); } catch (_) {} }
  st.proc = null; st.pid = null; st.status = 'stopped'; st.startedAt = null;
  trackEvent(id, 'stopped', 'Stopped by user');
  addLog(id, '── Stopped by user ──');
  return { ok: true };
}

// ── Bulk start/stop ──
function startAll() { const r = []; for (const s of services) if (S.get(s.id)?.status !== 'running') r.push(startService(s.id)); return { ok: true, affected: r.filter(x => !x.error).length }; }
function stopAll() { const r = []; for (const s of services) if (S.get(s.id)?.status === 'running') r.push(stopService(s.id)); return { ok: true, affected: r.filter(x => !x.error).length }; }

function getStatus(id) {
  const svc = services.find(s => s.id === id);
  const st = S.get(id);
  if (!svc || !st) return null;
  return { id: svc.id, name: svc.name, description: svc.description, port: svc.port, status: st.status, pid: st.pid,
    uptime: st.startedAt ? Math.floor((Date.now() - st.startedAt) / 1000) : 0, autoRestart: svc.autoRestart || 0 };
}

// ── CRUD services ──
function addService(data) {
  const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (services.find(s => s.id === id)) return { error: 'id-exists' };
  if (services.find(s => s.port === data.port)) return { error: 'port-exists' };
  const svc = { id, name: data.name, description: data.description || '', dir: data.dir, command: data.command, port: data.port, autoRestart: data.autoRestart || 0 };
  services.push(svc);
  const activePorts = getNetstat();
  const existingPid = svc.port ? activePorts.get(svc.port) : null;
  S.set(svc.id, { proc: null, pid: existingPid, status: existingPid ? 'running' : 'stopped', logs: [], sseClients: new Set(), startedAt: existingPid ? Date.now() : null });
  saveServices();
  return { ok: true, service: svc };
}
function removeService(id) {
  const idx = services.findIndex(s => s.id === id);
  if (idx === -1) return { error: 'not-found' };
  stopService(id); services.splice(idx, 1); S.delete(id); saveServices();
  return { ok: true };
}
function updateService(id, data) {
  const svc = services.find(s => s.id === id);
  if (!svc) return { error: 'not-found' };
  if (data.autoRestart !== undefined) svc.autoRestart = parseInt(data.autoRestart) || 0;
  if (data.command) svc.command = data.command;
  if (data.dir) svc.dir = data.dir;
  if (data.description !== undefined) svc.description = data.description;
  if (data.port !== undefined) svc.port = parseInt(data.port) || 0;
  saveServices();
  return { ok: true };
}

// ── Port scan ──
function scanPorts() {
  const known = new Set(services.map(s => s.port)); known.add(PORT);
  const portMap = new Map();
  const activePorts = getNetstat();
  for (const [port, pid] of activePorts) { if (!portMap.has(port)) portMap.set(port, { port, pid, name: '' }); }
  for (const [port, info] of portMap) {
    try { const out = execSync(`tasklist /fi "pid eq ${info.pid}" /nh /fo csv`, { encoding: 'utf8', timeout: 3000 }); const m = out.match(/"([^"]+)"/); if (m) info.name = m[1]; } catch (_) {}
    info.known = known.has(port) || SYSTEM_PORTS.has(port) || port < 1024;
  }
  return [...portMap.values()].filter(p => !p.known).sort((a, b) => a.port - b.port);
}

// ── Aternos ──
const ATERNOS_PY = path.join(__dirname, 'aternos.py');
function aternosCall(action) { try { const out = execSync(`python "${ATERNOS_PY}" ${action}`, { encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 64 }); return JSON.parse(out); } catch (e) { return { ok: false, error: e.message }; } }

// ── SSE ──
function sseSubscribe(res, filterId) {
  const target = filterId ? S.get(filterId) : S.get('__all__');
  if (!target) { res.statusCode = 404; res.end(); return; }
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'Access-Control-Allow-Origin': '*' });
  res.write('event: connected\ndata: {}\n\n');
  const cb = (entry, id, type) => {
    if (type === 'alert') { if (!res.writableEnded) res.write(`event: alert\ndata: ${JSON.stringify({ serviceId: id, msg: entry })}\n\n`); return; }
    if (res.writableEnded) return;
    res.write(`id: ${entry.ts}\nevent: log\ndata: ${JSON.stringify({ serviceId: id, line: entry.line, ts: entry.ts })}\n\n`);
  };
  cb._res = res;
  target.sseClients.add(cb);
  if (filterId) { const st = S.get(filterId); if (st) for (const e of st.logs) { if (!res.writableEnded) res.write(`id: ${e.ts}\nevent: log\ndata: ${JSON.stringify({ serviceId: filterId, line: e.line, ts: e.ts })}\n\n`); } }
  res.on('close', () => target.sseClients.delete(cb));
}

// ── Async PDF convert ──
function convertDocxToPdf(docxPath, pdfPath, cb) {
  if (!isSafePath(DOCS_DIR, docxPath) || !isSafePath(DOCS_DIR, pdfPath)) return cb(new Error('invalid-path'));
  if (fs.existsSync(pdfPath) && fs.statSync(docxPath).mtime <= fs.statSync(pdfPath).mtime) return cb(null, pdfPath);
  const child = spawn(SOFFICE, ['--headless', '--convert-to', 'pdf', '--outdir', DOCS_DIR, docxPath], { windowsHide: true, timeout: 30000 });
  let err = ''; child.stderr.on('data', d => err += d);
  child.on('close', code => { if (code !== 0) return cb(new Error(`soffice exited ${code}: ${err.slice(0, 200)}`)); cb(null, pdfPath); });
  child.on('error', cb);
}

// ── Gzip static ──
function serveStatic(res, filePath) {
  if (!isSafePath(PUBLIC_DIR, filePath)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('404 Not Found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    const accept = reqOf(res)?.headers?.['accept-encoding'] || '';
    if (accept.includes('gzip') && data.length > 1024) { zlib.gzip(data, (_, buf) => { headers['Content-Encoding'] = 'gzip'; res.writeHead(200, headers); res.end(buf); }); }
    else { res.writeHead(200, headers); res.end(data); }
  });
}

// ── File browser ──
function listFiles(subPath) {
  const target = path.join(DOCS_DIR, subPath || '');
  if (!isSafePath(DOCS_DIR, target)) return { error: 'invalid-path' };
  try {
    const entries = fs.readdirSync(target, { withFileTypes: true });
    const list = entries.filter(e => e.name !== 'desktop.ini').map(e => {
      const full = path.join(target, e.name);
      let stat;
      try { stat = fs.statSync(full); } catch (_) { stat = { size: 0, mtime: new Date(0) }; }
      return { name: e.name, isDir: e.isDirectory(), size: e.isFile() ? stat.size : 0, mtime: stat.mtime.toISOString() };
    });
    list.sort((a, b) => (b.isDir ? 1 : 0) - (a.isDir ? 1 : 0) || a.name.localeCompare(b.name));
    return { entries: list, path: subPath || '' };
  } catch (e) { return { error: 'not-found' }; }
}

// ── HTTP server ──
const server = http.createServer((req, res) => {
  const u = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;
  res._req = req;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // GET /api/services
  if (u.pathname === '/api/services' && method === 'GET') return json(res, services.map(s => getStatus(s.id)));

  // POST /api/services (add)
  if (u.pathname === '/api/services' && method === 'POST') { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { json(res, addService(JSON.parse(b))); } catch (e) { json(res, { error: 'invalid-json' }, 400); } }); return; }

  // PUT /api/services/:id (update config)
  const mSvcPut = u.pathname.match(/^\/api\/services\/([\w-]+)$/);
  if (mSvcPut && method === 'PUT') { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { json(res, updateService(mSvcPut[1], JSON.parse(b))); } catch (e) { json(res, { error: 'invalid-json' }, 400); } }); return; }

  // POST /api/services/:id/start
  const mStart = u.pathname.match(/^\/api\/services\/([\w-]+)\/start$/);
  if (mStart && method === 'POST') return json(res, startService(mStart[1]) || { error: 'not-found' });

  // POST /api/services/:id/stop
  const mStop = u.pathname.match(/^\/api\/services\/([\w-]+)\/stop$/);
  if (mStop && method === 'POST') return json(res, stopService(mStop[1]) || { error: 'not-found' });

  // POST /api/services/:id/restart
  const mRestart = u.pathname.match(/^\/api\/services\/([\w-]+)\/restart$/);
  if (mRestart && method === 'POST') { const r = stopService(mRestart[1]); if (r.error) return json(res, r); setTimeout(() => json(res, startService(mRestart[1]) || { error: 'not-found' }), 500); return; }

  // DELETE /api/services/:id
  const mDel = u.pathname.match(/^\/api\/services\/([\w-]+)$/);
  if (mDel && method === 'DELETE') return json(res, removeService(mDel[1]) || { error: 'not-found' });

  // POST /api/services/start-all
  if (u.pathname === '/api/services/start-all' && method === 'POST') return json(res, startAll());

  // POST /api/services/stop-all
  if (u.pathname === '/api/services/stop-all' && method === 'POST') return json(res, stopAll());

  // GET /api/services/:id/logs
  const mLogs = u.pathname.match(/^\/api\/services\/([\w-]+)\/logs$/);
  if (mLogs && method === 'GET') { const st = S.get(mLogs[1]); if (!st) return json(res, { error: 'not-found' }, 404); const n = Math.min(parseInt(u.searchParams.get('lines') || '200', 10) || 200, 2000); return json(res, { logs: st.logs.slice(-n), total: st.logs.length }); }

  // GET /api/services/:id/health
  const mHealth = u.pathname.match(/^\/api\/services\/([\w-]+)\/health$/);
  if (mHealth && method === 'GET') {
    const svc = services.find(s => s.id === mHealth[1]);
    if (!svc || !svc.port) return json(res, { ok: false, reason: 'no-port' });
    const r = http.request({ hostname: 'localhost', port: svc.port, path: '/', method: 'HEAD', timeout: 3000 }, (r2) => json(res, { ok: true, statusCode: r2.statusCode }));
    r.on('error', () => json(res, { ok: false })); r.on('timeout', () => { r.destroy(); json(res, { ok: false }); }); r.end(); return;
  }

  // GET /api/services/:id/timeline
  const mTimeline = u.pathname.match(/^\/api\/services\/([\w-]+)\/timeline$/);
  if (mTimeline && method === 'GET') return json(res, getTimeline(mTimeline[1]));

  // GET /api/system/resources
  if (u.pathname === '/api/system/resources' && method === 'GET') return json(res, getResources());

  // GET /api/scan
  if (u.pathname === '/api/scan' && method === 'GET') return json(res, scanPorts());

  // GET /api/files
  if (u.pathname === '/api/files' && method === 'GET') return json(res, listFiles(u.searchParams.get('path') || ''));

  // Proxy
  const mProxy = u.pathname.match(/^\/proxy\/(\d+)(\/.*)?$/);
  if (mProxy && method === 'GET') {
    const opts = { hostname: 'localhost', port: parseInt(mProxy[1]), path: mProxy[2] || '/', method: 'GET', timeout: 10000 };
    const r = http.request(opts, (r2) => { res.writeHead(r2.statusCode, { 'Content-Type': r2.headers['content-type'] || 'text/html', 'Access-Control-Allow-Origin': '*' }); r2.pipe(res); });
    r.on('error', () => { res.writeHead(502); res.end('Proxy error'); }); r.end(); return;
  }

  // RAG proxy
  if (u.pathname === '/api/rag/status' && method === 'GET') { http.get('http://localhost:3001/status', (r2) => { let d = ''; r2.on('data', c => d += c); r2.on('end', () => { try { json(res, JSON.parse(d)); } catch (_) { json(res, { ok: false }); } }); }).on('error', () => json(res, { ok: false })); return; }
  if (u.pathname === '/api/rag/reindex' && method === 'POST') { const r = http.request({ hostname: 'localhost', port: 3001, path: '/reindex', method: 'POST' }, (r2) => { let d = ''; r2.on('data', c => d += c); r2.on('end', () => { try { json(res, JSON.parse(d)); } catch (_) { json(res, { ok: false }); } }); }); r.on('error', () => json(res, { error: 'rag-unreachable' }, 502)); r.end(); return; }
  if (u.pathname === '/api/rag/query' && method === 'POST') { let b = ''; req.on('data', c => b += c); req.on('end', () => { const r = http.request({ hostname: 'localhost', port: 3001, path: '/query', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (r2) => { let d = ''; r2.on('data', c => d += c); r2.on('end', () => { try { json(res, JSON.parse(d)); } catch (_) { json(res, { error: 'bad-response' }, 502); } }); }); r.on('error', () => json(res, { error: 'rag-unreachable' }, 502)); r.write(b); r.end(); }); return; }

  // Aternos
  if (u.pathname === '/api/aternos' && method === 'GET') return json(res, aternosCall('status'));
  if (u.pathname === '/api/aternos/start' && method === 'POST') return json(res, aternosCall('start'));
  if (u.pathname === '/api/aternos/confirm' && method === 'POST') return json(res, aternosCall('confirm'));
  if (u.pathname === '/api/aternos/restart' && method === 'POST') return json(res, aternosCall('restart'));
  if (u.pathname === '/api/aternos/stop' && method === 'POST') return json(res, aternosCall('stop'));

  // Version
  if (u.pathname === '/api/version' && method === 'GET') return json(res, { version: '3.1', uptime: Math.floor((Date.now() - DASHBOARD_START) / 1000) });

  // SSE
  if (u.pathname === '/api/logs/stream' && method === 'GET') return sseSubscribe(res, u.searchParams.get('serviceId') || null);

  // ── Documents API ──
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

  if (u.pathname === '/api/documents/search' && method === 'GET') {
    const q = (u.searchParams.get('q') || '').toLowerCase().trim();
    if (!q) return json(res, []);
    try {
      const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.docx'));
      const results = [];
      for (const f of files) {
        const filePath = path.join(DOCS_DIR, f);
        if (!isSafePath(DOCS_DIR, filePath)) continue;
        const ext = path.extname(f).toLowerCase();
        const id = f.replace(/\.(md|docx)$/, '');
        if (ext === '.docx') { if (id.toLowerCase().includes(q)) results.push({ id, file: f, match: id, ext: 'docx' }); continue; }
        const content = fs.readFileSync(filePath, 'utf-8');
        const idx = content.toLowerCase().indexOf(q);
        if (idx === -1) continue;
        const start = Math.max(0, idx - 40);
        const end = Math.min(content.length, idx + q.length + 40);
        results.push({ id, file: f, match: (start > 0 ? '…' : '') + content.slice(start, end).replace(/\n/g, ' ') + (end < content.length ? '…' : ''), ext: 'md' });
        if (results.length >= 50) break;
      }
      return json(res, results);
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  const mExpPdf = u.pathname.match(/^\/api\/documents\/([^\/]+)\/export-pdf$/);
  if (mExpPdf && method === 'POST') {
    const baseName = mExpPdf[1];
    const mdPath = path.join(DOCS_DIR, baseName + '.md');
    if (!isSafePath(DOCS_DIR, mdPath)) return json(res, { error: 'invalid' }, 400);
    if (!fs.existsSync(mdPath)) return json(res, { error: 'not-found' }, 404);
    const tmpHtml = path.join(DOCS_DIR, baseName + '-export.html');
    const pdfPath = path.join(DOCS_DIR, baseName + '-export.pdf');
    try {
      const content = fs.readFileSync(mdPath, 'utf-8');
      const plain = content.replace(/^---[\s\S]*?---\n/, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      fs.writeFileSync(tmpHtml, '<html><body style="font-family:sans-serif;max-width:700px;margin:2rem auto;line-height:1.8"><pre>' + plain + '</pre></body></html>');
      execSync('"' + SOFFICE + '" --headless --convert-to pdf --outdir "' + DOCS_DIR + '" "' + tmpHtml + '"', { timeout: 30000, windowsHide: true });
      const buf = fs.readFileSync(pdfPath);
      res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': buf.length, 'Content-Disposition': 'attachment; filename="' + baseName + '.pdf"' });
      res.end(buf);
      try { fs.unlinkSync(tmpHtml); fs.unlinkSync(pdfPath); } catch (_) {}
    } catch (e) { return json(res, { error: 'conversion-failed' }, 500); }
    return;
  }

  if (u.pathname === '/api/documents' && method === 'GET') {
    try {
      const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.docx')).sort().reverse();
      const list = files.map(f => {
        const ext = path.extname(f).toLowerCase();
        const stat = fs.statSync(path.join(DOCS_DIR, f));
        if (ext === '.docx') return { id: f.replace(/\.docx$/, ''), file: f, title: f.replace(/\.docx$/, ''), created: stat.birthtime.toISOString(), tags: 'docx', size: stat.size, ext: 'docx' };
        const raw = fs.readFileSync(path.join(DOCS_DIR, f), 'utf-8');
        const { meta } = extractMDFrontmatter(raw);
        return { id: f.replace(/\.md$/, ''), file: f, title: meta.title || f.replace(/\.md$/, ''), created: meta.date || stat.birthtime.toISOString(), tags: meta.tags || '', size: stat.size, ext: 'md' };
      });
      return json(res, list);
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  const mDocGet = u.pathname.match(/^\/api\/documents\/([^\/]+)$/);
  if (mDocGet && method === 'GET') {
    const baseName = mDocGet[1];
    const isDl = u.searchParams.get('dl') === '1';
    let filePath = path.join(DOCS_DIR, baseName + '.md');
    let isDocx = false;
    if (!isSafePath(DOCS_DIR, filePath)) return json(res, { error: 'invalid' }, 400);
    if (!fs.existsSync(filePath)) { filePath = path.join(DOCS_DIR, baseName + '.docx'); isDocx = true; }
    if (!isSafePath(DOCS_DIR, filePath)) return json(res, { error: 'invalid' }, 400);
    try {
      if (isDl) {
        const buf = fs.readFileSync(filePath);
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/markdown', 'Content-Disposition': 'attachment; filename="' + path.basename(filePath) + '"', 'Content-Length': buf.length });
        return res.end(buf);
      }
      if (isDocx) { const buf = fs.readFileSync(filePath); return json(res, { id: baseName, content: buf.toString('base64'), ext: 'docx', size: buf.length }); }
      const content = fs.readFileSync(filePath, 'utf-8');
      const { content: body } = extractMDFrontmatter(content);
      return json(res, { id: baseName, content: body, ext: 'md' });
    } catch (e) { return json(res, { error: 'not-found' }, 404); }
  }

  // PDF convert
  const mPdf = u.pathname.match(/^\/api\/documents\/([^\/]+)\/pdf$/);
  if (mPdf && method === 'GET') {
    const baseName = mPdf[1];
    const docxPath = path.join(DOCS_DIR, baseName + '.docx');
    const pdfPath = path.join(DOCS_DIR, baseName + '.pdf');
    if (!isSafePath(DOCS_DIR, docxPath) || !isSafePath(DOCS_DIR, pdfPath)) return json(res, { error: 'invalid' }, 400);
    if (!fs.existsSync(docxPath)) return json(res, { error: 'not-found' }, 404);
    convertDocxToPdf(docxPath, pdfPath, (err) => {
      if (err) return json(res, { error: 'conversion-failed', detail: err.message }, 500);
      const buf = fs.readFileSync(pdfPath);
      res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': buf.length, 'Cache-Control': 'public, max-age=3600' });
      res.end(buf);
    });
    return;
  }

  // Upload
  if (u.pathname === '/api/documents/upload' && method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { const { title, data } = JSON.parse(body); const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now().toString(36); fs.writeFileSync(path.join(DOCS_DIR, id + '.docx'), Buffer.from(data, 'base64')); return json(res, { ok: true, id }); } catch (e) { return json(res, { error: e.message }, 400); }
    });
    return;
  }

  // Create
  if (u.pathname === '/api/documents' && method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { const { title, content, tags } = JSON.parse(body); const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now().toString(36); const date = new Date().toISOString().split('T')[0]; const md = `---\ntitle: ${title}\ndate: ${date}\ntags: ${tags || ''}\n---\n\n${content || ''}`; fs.writeFileSync(path.join(DOCS_DIR, id + '.md'), md, 'utf-8'); return json(res, { ok: true, id }); } catch (e) { return json(res, { error: e.message }, 400); }
    });
    return;
  }

  // Update
  const mDocPut = u.pathname.match(/^\/api\/documents\/([^\/]+)$/);
  if (mDocPut && method === 'PUT') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { content, title, tags } = JSON.parse(body);
        const filePath = path.join(DOCS_DIR, mDocPut[1] + '.md');
        if (!isSafePath(DOCS_DIR, filePath)) return json(res, { error: 'invalid' }, 400);
        const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
        const m = existing.match(/^(---\n[\s\S]*?\n---\n)/);
        const frontmatter = m ? m[1] : `---\ntitle: ${title || mDocPut[1]}\ndate: ${new Date().toISOString().split('T')[0]}\ntags: ${tags || ''}\n---\n\n`;
        fs.writeFileSync(filePath, frontmatter + (content || ''), 'utf-8');
        return json(res, { ok: true });
      } catch (e) { return json(res, { error: e.message }, 400); }
    });
    return;
  }

  // Delete doc
  const mDocDel = u.pathname.match(/^\/api\/documents\/([^\/]+)$/);
  if (mDocDel && method === 'DELETE') {
    const filePath = path.join(DOCS_DIR, mDocDel[1] + '.md');
    if (!isSafePath(DOCS_DIR, filePath)) return json(res, { error: 'invalid' }, 400);
    try { fs.unlinkSync(filePath); return json(res, { ok: true }); } catch (e) { return json(res, { error: 'not-found' }, 404); }
  }

  // Redirect
  if (u.pathname === '/dashboard' || u.pathname === '/documents' || u.pathname === '/documents/') { u.pathname = u.pathname.replace(/\/$/, '') + '.html'; }

  // Static
  let filePath = u.pathname === '/' ? '/index.html' : u.pathname;
  filePath = path.join(PUBLIC_DIR, filePath);
  if (!isSafePath(PUBLIC_DIR, filePath)) { res.writeHead(403); res.end('Forbidden'); return; }
  serveStatic(res, filePath);
});

// ── Scheduled restart check ──
setInterval(() => {
  const now = Date.now();
  for (const s of services) {
    if (!s.autoRestart) continue;
    const st = S.get(s.id);
    if (!st || st.status !== 'running' || !st.startedAt) continue;
    const elapsed = Math.floor((now - st.startedAt) / 1000);
    if (elapsed >= s.autoRestart) { console.log(`  Scheduled restart: ${s.name}`); stopService(s.id); setTimeout(() => startService(s.id), 1000); }
  }
}, 10000);

// ── Graceful shutdown ──
function shutdown() {
  console.log('\n  Shutting down...');
  for (const [id, st] of S) { if (id !== '__all__' && st.status === 'running' && st.pid) { try { spawn('taskkill', ['/pid', String(st.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' }).unref(); } catch (_) {} } }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, () => {
  console.log(`\n  🖥  Service Dashboard running`);
  console.log(`  ─────────────────────────────`);
  for (const s of services) console.log(`  ${(s.name + '  ').padEnd(18)} → http://localhost:${s.port}`);
  console.log(`\n  Dashboard:  http://localhost:${PORT}\n`);
  autoStartServices();
});
