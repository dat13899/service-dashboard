import { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppLayout } from './components/layout';
import { ErrorBoundary } from './components/shared';

const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const UtilitiesPage = lazy(() => import('./pages/UtilitiesPage'));
const WidgetPage = lazy(() => import('./pages/WidgetPage'));
const HermesPage = lazy(() => import('./pages/HermesPage'));

function PageFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="liquid-skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
    </div>
  );
}

/** Liquid-glass 404 page */
function NotFoundPage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '50vh', textAlign: 'center',
      padding: '2rem 1rem',
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="liquid-panel"
        style={{
          padding: '2.5rem 2rem', maxWidth: '400px', width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        }}
      >
        {/* SVG glow 404 */}
        <svg width="120" height="60" viewBox="0 0 120 60" style={{ filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.5))' }}>
          <defs>
            <linearGradient id="g404" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#00a8e0" />
            </linearGradient>
          </defs>
          <text x="60" y="45" textAnchor="middle" fill="url(#g404)"
            fontFamily="var(--font-mono)" fontSize="48" fontWeight="900">
            404
          </text>
        </svg>

        <p style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 500 }}>
          Trang này không tồn tại
        </p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '-0.5rem' }}>
          Có thể bạn đã đi lạc, hoặc link đã thay đổi
        </p>

        <Link
          to="/"
          className="liquid-btn primary"
          style={{ textDecoration: 'none', marginTop: '0.5rem' }}
        >
          <i className="fas fa-house" /> Về trang chủ
        </Link>

        <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
          Ctrl+K để tìm kiếm nhanh
        </span>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Suspense fallback={<PageFallback />}><HomePage /></Suspense>} />
          <Route path="dashboard" element={<Suspense fallback={<PageFallback />}><DashboardPage /></Suspense>} />
          <Route path="documents" element={<Suspense fallback={<PageFallback />}><DocumentsPage /></Suspense>} />
          <Route path="utilities" element={<Suspense fallback={<PageFallback />}><UtilitiesPage /></Suspense>} />
          <Route path="widgets" element={<Suspense fallback={<PageFallback />}><WidgetPage /></Suspense>} />
          <Route path="hermes" element={<Suspense fallback={<PageFallback />}><HermesPage /></Suspense>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
