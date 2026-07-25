import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import UtilitiesPage from './pages/UtilitiesPage';
import WidgetPage from './pages/WidgetPage';
import HermesPage from './pages/HermesPage';

function Page({ children }) {
  return <ErrorBoundary showDetails>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Page><HomePage /></Page>} />
        <Route path="/dashboard" element={<Page><DashboardPage /></Page>} />
        <Route path="/documents" element={<Page><DocumentsPage /></Page>} />
        <Route path="/utilities" element={<Page><UtilitiesPage /></Page>} />
        <Route path="/random-widget" element={<Page><WidgetPage /></Page>} />
        <Route path="/hermes" element={<Page><HermesPage /></Page>} />
        <Route path="*" element={<Page>
          <div className="flex items-center justify-center" style={{ minHeight: '60dvh' }}>
            <div className="glass-panel p-xl text-center" style={{ maxWidth: '400px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔮</div>
              <h1 className="text-xl font-bold text-strong mb-sm">404</h1>
              <p className="text-dim mb-lg">Trang này không tồn tại hoặc đã bị dịch chuyển.</p>
              <a href="/" className="btn btn-primary">Về trang chủ</a>
            </div>
          </div>
        </Page>} />
      </Routes>
    </AppLayout>
  );
}
