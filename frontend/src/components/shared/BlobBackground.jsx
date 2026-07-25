export default function BlobBackground() {
  return (
    <div className="blob-container" style={{
      position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="blob" style={{
          position: 'absolute',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.15,
          animation: `blobFloat ${12 + i * 3}s ease-in-out infinite`,
          animationDelay: `${-i * 3}s`,
          width: `${300 + i * 100}px`,
          height: `${300 + i * 100}px`,
          left: `${15 + i * 18}%`,
          top: `${20 + i * 15}%`,
          background: i % 2 === 0
            ? 'var(--accent)'
            : i === 3 ? '#a78bfa' : '#f472b6',
        }} />
      ))}
    </div>
  );
}
