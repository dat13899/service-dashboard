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
import ShortcutHelper, { useShortcutHelper } from '../ShortcutHelper';

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
  const { open: shortcutOpen, close: closeShortcut } = useShortcutHelper();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track navigation loading manually (BrowserRouter doesn't support useNavigation)
  const [navigating, setNavigating] = useState(false);
  useEffect(() => {
    setNavigating(true);
    requestAnimationFrame(() => setNavigating(false));
  }, [location.pathname]);

  // Show back-to-top button on scroll
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setShowBackToTop(scrollY > 400);
      setScrollProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useSwipeBack();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <>
      <BlobBackground />
      <div className="noise-overlay" aria-hidden="true" />
      <Navbar />

      {/* Scroll progress bar */}
      <div style={{
        position: 'fixed', top: 'calc(var(--navbar-height) - 2px)', left: 0, zIndex: 1099,
        height: '2px', width: scrollProgress + '%',
        background: 'linear-gradient(90deg, var(--accent), var(--green))',
        transition: 'width 0.1s linear',
        boxShadow: '0 0 6px var(--accent)',
      }} />

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
      <ShortcutHelper open={shortcutOpen} onClose={closeShortcut} />

      {/* Back-to-top floating button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="liquid-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed', bottom: '4rem',
              right: '1rem', zIndex: 2000, width: '40px', height: '40px',
              borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Back to top"
          >
            <i className="fas fa-arrow-up" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
