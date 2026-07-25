import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import UtilitiesPage from './pages/UtilitiesPage';
import WidgetPage from './pages/WidgetPage';
import HermesPage from './pages/HermesPage';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/utilities" element={<UtilitiesPage />} />
        <Route path="/random-widget" element={<WidgetPage />} />
        <Route path="/hermes" element={<HermesPage />} />
      </Routes>
    </ToastProvider>
  );
}
