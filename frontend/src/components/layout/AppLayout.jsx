import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './Navbar';
import BottomTab from './BottomTab';
import Footer from './Footer';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useCommandPalette } from '../CommandPalette';
import CommandPalette from '../CommandPalette';

function BlobBackground() {
  const { isMobile } = useMediaQuery();
  if (isMobile) return null;
  return (
    <div className="animated-blobs" aria-hidden="true">
      <div className="animated-blob" />
      <div className="animated-blob" />
      <div className="animated-blob" />
    </div>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const { isMobile } = useMediaQuery();
  const { open: paletteOpen, close: closePalette } = useCommandPalette();

  // Track navigation loading manually (BrowserRouter doesn't support useNavigation)
  const [navigating, setNavigating] = useState(false);
  useEffect(() => {
    setNavigating(true);
    requestAnimationFrame(() => setNavigating(false));
  }, [location.pathname]);

  useSwipeBack();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <>
      <BlobBackground />
      <div className="noise-overlay" aria-hidden="true" />
      <Navbar />

      <main style={{
        paddingTop: 'var(--navbar-height)',
        paddingBottom: isMobile ? 'calc(var(--bottom-nav-height) + 1rem)' : '1rem',
        position: 'relative', zIndex: 1,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {navigating ? (
              <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                <div className="liquid-skeleton" style={{ height: '200px' }} />
                <div className="liquid-skeleton" style={{ height: '100px', width: '70%' }} />
                <div className="liquid-skeleton" style={{ height: '160px' }} />
              </div>
            ) : (
              <Outlet />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <div className="mobile-only"><BottomTab /></div>

      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}
