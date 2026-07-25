import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </ToastProvider>
  );
}
