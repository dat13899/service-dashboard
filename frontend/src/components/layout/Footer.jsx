import { useMediaQuery } from '../../hooks/useMediaQuery';

/** Global footer — shown on desktop only. */
export default function Footer() {
  const { isMobile } = useMediaQuery();
  if (isMobile) return null; // mobile uses BottomTab instead

  return (
    <footer className="glass-panel" style={{
      borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
      borderRadius: 0, padding: '1rem 1.5rem', textAlign: 'center',
    }}>
      <div className="text-xs text-dim">
        BT Dat © 2026 · Powered by Hermes AI
      </div>
    </footer>
  );
}
