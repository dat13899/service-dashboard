const BASE = '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(`API ${res.status}`);
    err.status = res.status;
    try { err.data = await res.json(); } catch {}
    throw err;
  }
  return res.json();
}

export function fetchServices() {
  return request('/api/services');
}

export function startService(id) {
  return request(`/api/services/${id}/start`, { method: 'POST' });
}

export function stopService(id) {
  return request(`/api/services/${id}/stop`, { method: 'POST' });
}

export function restartService(id) {
  return request(`/api/services/${id}/restart`, { method: 'POST' });
}

export function fetchServiceLogs(id, lines = 100) {
  return request(`/api/services/${id}/logs?lines=${lines}`);
}

export function fetchServiceHealth(id) {
  return request(`/api/services/${id}/health`);
}

export function fetchServiceTimeline(id) {
  return request(`/api/services/${id}/timeline`);
}

export function addService(data) {
  return request('/api/services', { method: 'POST', body: JSON.stringify(data) });
}

export function updateService(id, data) {
  return request(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteService(id) {
  return request(`/api/services/${id}`, { method: 'DELETE' });
}

export function startAllServices() {
  return request('/api/services/start-all', { method: 'POST' });
}

export function stopAllServices() {
  return request('/api/services/stop-all', { method: 'POST' });
}

export function fetchResources() {
  return request('/api/system/resources');
}

export function fetchPorts() {
  return request('/api/scan');
}

export function fetchFiles(path) {
  return request(`/api/files?path=${encodeURIComponent(path || '/')}`);
}
