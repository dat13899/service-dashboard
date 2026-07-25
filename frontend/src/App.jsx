import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { ErrorBoundary } from './components/shared';

/* ── Lazy route pages ── */
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const UtilitiesPage = lazy(() => import('./pages/UtilitiesPage'));
const WidgetPage = lazy(() => import('./pages/WidgetPage'));
const HermesPage = lazy(() => import('./pages/HermesPage'));

function PageFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" style={{ width: '32px', height: '32px' }} />
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
          <Route path="*" element={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: '4rem' }}>404</div>
              <p>Trang không tồn tại</p>
              <a href="/" className="btn btn-primary">Về trang chủ</a>
            </div>
          } />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
