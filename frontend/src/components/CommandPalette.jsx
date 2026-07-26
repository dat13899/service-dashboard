import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useHaptic } from '../hooks/useHaptic';

/**
 * Command Palette — Cmd/Ctrl+K opens a glass search/command overlay.
 * Nested inside AppLayout (no need to wrap router).
 */

const COMMANDS = [
  { id: 'home', label: 'Home', icon: 'fa-house', to: '/', keywords: ['trang chủ'] },
  { id: 'dashboard', label: 'Dashboard — Services', icon: 'fa-gauge-high', to: '/dashboard', keywords: ['dịch vụ', 'status', 'server'] },
  { id: 'documents', label: 'Documents — Knowledge Base', icon: 'fa-file-lines', to: '/documents', keywords: ['tài liệu', 'doc', 'notes', 'ghi chú'] },
  { id: 'widgets', label: 'Widgets — Tools', icon: 'fa-cubes', to: '/widgets', keywords: ['công cụ', 'tool', 'mini game'] },
  { id: 'utilities', label: 'Utilities — YouTube Audio', icon: 'fa-toolbox', to: '/utilities', keywords: ['tiện ích', 'nhạc', 'youtube'] },
  { id: 'hermes', label: 'Hermes AI', icon: 'fa-robot', to: '/hermes', keywords: ['ai', 'agent'] },
];

export default function CommandPalette({ open, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const haptic = useHaptic();

  // Focus input on open
  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on route change
  useEffect(() => { onClose(); }, [location.pathname]);

  const filtered = search.trim()
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.keywords.some(k => k.includes(search.toLowerCase()))
      )
    : COMMANDS;

  // Clamp selected index
  const safeIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));

  const execute = useCallback((cmd) => {
    haptic.light();
    navigate(cmd.to);
    onClose();
  }, [navigate, onClose, haptic]);

  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[safeIndex]) {
      e.preventDefault();
      execute(filtered[safeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filtered, safeIndex, execute, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 5000,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center',
          paddingTop: '15vh',
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="liquid-panel"
          style={{ width: '100%', maxWidth: '460px', padding: 0, overflow: 'hidden', margin: '0 1rem' }}
        >
          {/* Search input */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--liquid-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.25rem' }}>
              <i className="fas fa-magnifying-glass" style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }} />
              <input
                ref={inputRef}
                className="liquid-input"
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKey}
                placeholder="Search pages..."
                style={{ flex: 1, border: 'none', boxShadow: 'none', background: 'transparent', padding: '0.4rem 0' }}
              />
              <kbd style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: '4px',
                padding: '0.1rem 0.35rem', fontSize: '0.65rem', color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
              }}>esc</kbd>
            </div>
          </div>

          {/* Command list */}
          <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '0.4rem' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                No results
              </div>
            ) : (
              filtered.map((cmd, i) => (
                <div
                  key={cmd.id}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: i === safeIndex ? 'var(--liquid-glow)' : 'transparent',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === safeIndex ? 'var(--accent)' + '18' : 'rgba(255,255,255,0.04)',
                    flexShrink: 0,
                  }}>
                    <i className={`fas ${cmd.icon}`} style={{
                      color: i === safeIndex ? 'var(--accent)' : 'var(--text-dim)',
                      fontSize: '0.78rem',
                    }} />
                  </span>
                  <span style={{
                    fontSize: '0.85rem', fontWeight: i === safeIndex ? 600 : 400,
                    color: i === safeIndex ? 'var(--text-strong)' : 'var(--text-dim)',
                  }}>
                    {cmd.label}
                  </span>
                  {i === safeIndex && (
                    <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '0.7rem' }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div style={{
            padding: '0.5rem 0.75rem', borderTop: '1px solid var(--liquid-border)',
            display: 'flex', gap: '1rem', fontSize: '0.62rem', color: 'var(--text-dim)',
          }}>
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>Esc Close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to bind Cmd/Ctrl+K to open palette.
 * Usage: const { open } = useCommandPalette(); <CommandPalette open={open} onClose={...} />
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(p => !p);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return { open, close: () => setOpen(false), toggle: () => setOpen(p => !p) };
}
