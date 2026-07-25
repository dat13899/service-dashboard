import { useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomTab from './BottomTab';
import BlobBackground from '../shared/BlobBackground';
import Cursor from '../Cursor';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/**
 * AppLayout — premium cinematic shell.
 * - Lenis smooth scroll
 * - Custom magnetic cursor (desktop only)
 * - AnimatePresence page transitions
 * - Global touch ripple
 */
export default function AppLayout() {
  const { isMobile } = useMediaQuery();
  const location = useLocation();

  // Lenis smooth scroll
  useEffect(() => {
    let lenis;
    import('lenis').then(mod => {
      const Lenis = mod.default;
      lenis = new Lenis({
        lerp: isMobile ? 0.1 : 0.065,
        wheelMultiplier: 1,
        smoothWheel: true,
        syncTouch: true,
      });
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    });
    return () => lenis?.destroy();
  }, [isMobile]);

  // Global touch ripple
  useEffect(() => {
    const handler = (e) => {
      const el = e.target.closest('.btn, .card, [role="button"], a[href]');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left - size / 2;
      const y = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top - size / 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };
    document.addEventListener('click', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 12, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  return (
    <>
      <Cursor />
      <div className="noise-overlay" />
      <BlobBackground />
      <Navbar />
      <main
        style={{
          paddingTop: '56px',
          paddingBottom: isMobile ? '64px' : '0',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="page-enter flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ flex: 1 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {isMobile && <BottomTab />}
      <Footer />
    </>
  );
}
