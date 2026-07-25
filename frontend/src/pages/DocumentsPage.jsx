import Navbar from '../components/Navbar';
import BlobBackground from '../components/BlobBackground';

export default function DocumentsPage() {
  return (
    <>
      <BlobBackground />
      <Navbar active="/documents" />
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <h1 className="title is-4" style={{ color: 'var(--text-strong)' }}>📄 Documents</h1>
          <p style={{ color: 'var(--text-dim)' }}>Loading...</p>
        </div>
      </section>
    </>
  );
}
