import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * BottomSheet — iOS-style bottom action sheet with drag-to-dismiss.
 *
 * Usage:
 *   <BottomSheet open={show} onClose={() => setShow(false)} title="Actions">
 *     <button onClick={action}>Do thing</button>
 *   </BottomSheet>
 *
 * Modes:
 * - 'list': renders children as vertical action list with cancel button
 * - 'content': renders children directly (custom content)
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  mode = 'list',
  actions = [],
  cancelLabel = 'Cancel',
}) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Drag to dismiss
  const handleTouchStart = useCallback((e) => {
    dragging.current = true;
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!dragging.current) return;
    currentY.current = e.touches[0].clientY - startY.current;
    if (currentY.current > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${currentY.current}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    dragging.current = false;
    if (currentY.current > 100) {
      onClose();
    }
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    currentY.current = 0;
  }, [onClose]);

  if (!open) return null;

  const backdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const sheetAnim = {
    initial: { y: '100%' },
    animate: { y: 0, transition: { type: 'spring', damping: 28, stiffness: 360 } },
    exit: { y: '100%', transition: { duration: 0.2, ease: 'easeIn' } },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={backdrop}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        <motion.div
          ref={sheetRef}
          variants={sheetAnim}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '500px',
            background: 'var(--surface)',
            borderRadius: '20px 20px 0 0',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.3)',
          }}
        >
          {/* Drag handle */}
          <div
            style={{
              padding: '0.75rem', display: 'flex', justifyContent: 'center',
              cursor: 'grab', touchAction: 'none',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div style={{
              width: '36px', height: '4px',
              background: 'var(--text-dim)', opacity: 0.4,
              borderRadius: '999px',
            }} />
          </div>

          {/* Title */}
          {title && (
            <h3 style={{
              textAlign: 'center', fontSize: '0.95rem', fontWeight: 700,
              color: 'var(--text-strong)', padding: '0 1rem 0.5rem',
            }}>{title}</h3>
          )}

          {/* Content */}
          {mode === 'list' ? (
            <div style={{ padding: '0.5rem 1rem' }}>
              {/* Action items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => { action.onClick?.(); if (action.close !== false) onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      background: 'var(--surface-2)', border: 'none',
                      borderRadius: '14px', color: action.danger ? 'var(--red)' : 'var(--text)',
                      fontSize: '0.95rem', fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      minHeight: '48px',
                    }}
                  >
                    {action.icon && (
                      <i className={action.icon} style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center', color: action.danger ? 'var(--red)' : 'var(--text-dim)' }} />
                    )}
                    <span>{action.label}</span>
                    {action.subtitle && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{action.subtitle}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Cancel button */}
              <button
                onClick={onClose}
                style={{
                  width: '100%', marginTop: '0.75rem', marginBottom: '1rem',
                  padding: '0.85rem', background: 'var(--surface-2)',
                  border: 'none', borderRadius: '14px',
                  color: 'var(--text-dim)', fontSize: '0.95rem',
                  fontWeight: 600, cursor: 'pointer', minHeight: '48px',
                }}
              >
                {cancelLabel}
              </button>
            </div>
          ) : (
            <div style={{ padding: '1rem' }}>{children}</div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
