import { useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomTab from './BottomTab';
import BlobBackground from '../shared/BlobBackground';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/** AppLayout wraps every page with shared chrome: Navbar, background, footer, mobile tab bar.
 *  Usage: <AppLayout><YourPage /></AppLayout> or via router <Route element={<AppLayout />}>
 */
export default function AppLayout({ children }) {
  const { isMobile } = useMediaQuery();

  return (
    <>
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
