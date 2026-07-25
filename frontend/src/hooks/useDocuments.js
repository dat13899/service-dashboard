import { useState, useCallback, useRef } from 'react';

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

export default function useDocuments(toast) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  // ── Fetch all documents ──
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request('/api/documents');
      setDocs(data);
    } catch {
      toast?.('Lỗi tải danh sách tài liệu', 'error');
    }
    setLoading(false);
  }, [toast]);

  // ── Fetch single document ──
  const fetchDoc = useCallback(async (id) => {
    try {
      const data = await request(`/api/documents/${id}`);
      setCurrentDoc(data);
      return data;
    } catch {
      toast?.('Lỗi tải tài liệu', 'error');
      return null;
    }
  }, [toast]);

  // ── Create document ──
  const createDoc = useCallback(async (title = 'Tài liệu mới') => {
    try {
      const data = await request('/api/documents', {
        method: 'POST',
        body: JSON.stringify({ title, content: '# Tài liệu mới\n\nNội dung...' }),
      });
      setDocs(prev => [data, ...prev]);
      toast?.('Đã tạo tài liệu mới', 'success');
      return data;
    } catch {
      toast?.('Lỗi tạo tài liệu', 'error');
      return null;
    }
  }, [toast]);

  // ── Update document (debounced auto-save) ──
  const updateDoc = useCallback(async (id, data) => {
    setSaving(true);
    try {
      const result = await request(`/api/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setCurrentDoc(prev => prev && prev.id === id ? { ...prev, ...result } : prev);
      setDocs(prev => prev.map(d => d.id === id ? { ...d, ...result } : d));
      return result;
    } catch {
      toast?.('Lỗi lưu tài liệu', 'error');
      return null;
    }
    setSaving(false);
  }, [toast]);

  // ── Debounced save ──
  const scheduleSave = useCallback((id, data) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      try {
        const result = await request(`/api/documents/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        setCurrentDoc(prev => prev && prev.id === id ? { ...prev, ...result } : prev);
        setDocs(prev => prev.map(d => d.id === id ? { ...d, ...result } : d));
      } catch {
        toast?.('Lỗi auto-save', 'error');
      }
      setSaving(false);
    }, 2000);
  }, [toast]);

  // ── Delete document ──
  const deleteDoc = useCallback(async (id) => {
    try {
      await request(`/api/documents/${id}`, { method: 'DELETE' });
      setDocs(prev => prev.filter(d => d.id !== id));
      setCurrentDoc(prev => prev && prev.id === id ? null : prev);
      toast?.('Đã xoá tài liệu', 'info');
      return true;
    } catch {
      toast?.('Lỗi xoá tài liệu', 'error');
      return false;
    }
  }, [toast]);

  // ── Rename document ──
  const renameDoc = useCallback(async (id, title) => {
    try {
      const data = await request(`/api/documents/${id}/rename`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      setCurrentDoc(prev => prev && prev.id === id ? { ...prev, title: data.title || title } : prev);
      setDocs(prev => prev.map(d => d.id === id ? { ...d, title: data.title || title } : d));
      toast?.('Đã đổi tên', 'success');
      return true;
    } catch {
      toast?.('Lỗi đổi tên', 'error');
      return false;
    }
  }, [toast]);

  // ── Convert to PDF ──
  const convertDoc = useCallback(async (id) => {
    try {
      await request(`/api/documents/${id}/convert`, { method: 'POST' });
      toast?.('Đã chuyển sang PDF', 'success');
      return true;
    } catch {
      toast?.('Lỗi chuyển PDF', 'error');
      return false;
    }
  }, [toast]);

  // ── Upload file ──
  const uploadDoc = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${BASE}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload ${res.status}`);
      const data = await res.json();
      setDocs(prev => [data, ...prev]);
      toast?.('Đã tải lên', 'success');
      return data;
    } catch {
      toast?.('Lỗi tải lên', 'error');
      return null;
    }
  }, [toast]);

  return {
    docs,
    setDocs,
    loading,
    currentDoc,
    setCurrentDoc,
    saving,
    fetchDocs,
    fetchDoc,
    createDoc,
    updateDoc,
    scheduleSave,
    deleteDoc,
    renameDoc,
    convertDoc,
    uploadDoc,
  };
}
