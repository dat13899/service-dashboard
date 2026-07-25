import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const HERMES_STANDALONE = '/hermes-standalone.html';

export default function HermesPage() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      // Forward keyboard events to iframe
      iframeRef.current?.contentWindow?.postMessage({ type: 'keydown', key: e.key, code: e.code }, '*');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1,
      display: 'flex', flexDirection: 'column',
    }}>
      <Navbar active="/hermes" />
      <iframe
        ref={iframeRef}
        src={HERMES_STANDALONE}
        style={{
          flex: 1, border: 'none', width: '100%',
          background: '#0a0e17',
        }}
        title="Hermes Visualizer"
      />
    </div>
  );
}
