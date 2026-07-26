import { useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomTab from './BottomTab';
import BlobBackground from '../shared/BlobBackground';
import Cursor from '../Cursor';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useSwipeBack } from '../../hooks/useSwipeBack';

/**
 * AppLayout — premium cinematic shell.
 * Mobile-first: bottom tab nav, swipe-back gesture, touch ripple.
 * Desktop: top navbar, magnetic cursor, smooth scroll.
 */
export default function AppLayout() {
  const { isMobile } = useMediaQuery();
  const location = useLocation();

  // Swipe-back gesture on mobile
  useSwipeBack({ enabled: isMobile });

  // Lenis smooth scroll
  useEffect(() => {
    let lenis;
    import('lenis').then(mod => {
      const Lenis = mod.default;
      lenis = new Lenis({
        lerp: isMobile ? 0.08 : 0.065,
        wheelMultiplier: 1,
        smoothWheel: !isMobile,
        syncTouch: true,
        gestureOrientation: 'vertical',
      });
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    });
    return () => lenis?.destroy();
  }, [isMobile]);

  // Global touch ripple — mobile only
  useEffect(() => {
    if (!isMobile) return;
    const handler = (e) => {
      const el = e.target.closest('.btn, .card, [role="button"], a[href], button');
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
    document.addEventListener('touchstart', handler, { passive: true });
    return () => document.removeEventListener('touchstart', handler);
  }, [isMobile]);

  const pageVariants = {
    initial: { opacity: 0, y: isMobile ? 20 : 12, scale: isMobile ? 1 : 0.985 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: isMobile ? -10 : -8, scale: isMobile ? 1 : 0.99, transition: { duration: 0.15, ease: 'easeIn' } },
  };

  return (
    <>
      {!isMobile && <Cursor />}
      <div className="noise-overlay" />
      {!isMobile && <BlobBackground />}
      {!isMobile && <Navbar />}
      <main
        style={{
          paddingTop: isMobile ? '0' : '56px',
          paddingBottom: isMobile ? 'var(--bottom-nav-height)' : '0',
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
      {!isMobile && <Footer />}
    </>
  );
}
