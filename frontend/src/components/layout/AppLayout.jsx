import { useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomTab from './BottomTab';
import BlobBackground from '../shared/BlobBackground';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/** AppLayout wraps every page with shared chrome. */
export default function AppLayout({ children }) {
  const { isMobile } = useMediaQuery();

  // Global touch ripple on all .btn, .card, clickable elements
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

  return (
    <>
      <div className="noise-overlay" />
      <BlobBackground />
      <Navbar />
      <main style={{
        paddingTop: '56px',           // navbar height
        paddingBottom: isMobile ? '64px' : '0', // bottom tab space
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Page content via children or Outlet */}
        <div className="page-enter flex-1">
          {children || <Outlet />}
        </div>
      </main>
      {isMobile && <BottomTab />}
      <Footer />
    </>
  );
}
