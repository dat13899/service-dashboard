import { useState } from 'react';

const S = {
  container: { textAlign: 'center', padding: '1.5rem 1rem' },
  row: {
    display: 'flex', gap: '0.75rem', justifyContent: 'center',
    alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap',
  },
  field: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' },
  label: { fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 },
  input: {
    width: '80px', padding: '0.45rem 0.5rem', textAlign: 'center',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)', color: 'var(--text)',
    fontSize: '0.9rem', outline: 'none', fontWeight: 600,
  },
  genBtn: {
    padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
    marginBottom: '1rem',
  },
  resultBox: {
    padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)',
    background: 'var(--surface-2)', border: '1px solid var(--glass-border)',
    display: 'inline-block',
  },
  result: {
    fontSize: '3rem', fontWeight: 800, color: 'var(--accent)',
    lineHeight: 1.2, letterSpacing: '0.02em',
  },
  pick: {
    marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap',
  },
  chip: {
    padding: '0.3rem 0.6rem', borderRadius: '20px',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)', fontSize: '0.78rem',
    color: 'var(--text-dim)',
  },
};

export default function NumberGen() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState([]);
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    const mn = Math.min(min, max);
    const mx = Math.max(min, max);
    const n = Math.min(Math.max(1, count), 100);
    setGenerating(true);
    setTimeout(() => {
      const nums = [];
      for (let i = 0; i < n; i++) {
        nums.push(Math.floor(Math.random() * (mx - mn + 1)) + mn);
      }
      setResults(nums);
      setGenerating(false);
    }, 200);
  };

  return (
    <div style={S.container}>
      <div style={S.row}>
        <div style={S.field}>
          <div style={S.label}>Min</div>
          <input style={S.input} type="number" value={min} onChange={e => setMin(Number(e.target.value))} />
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--text-dim)', marginTop: '1.2rem' }}>→</div>
        <div style={S.field}>
          <div style={S.label}>Max</div>
          <input style={S.input} type="number" value={max} onChange={e => setMax(Number(e.target.value))} />
        </div>
        <div style={S.field}>
          <div style={S.label}>Số lượng</div>
          <input style={{ ...S.input, width: '60px' }} type="number" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value))} />
        </div>
      </div>
      <button style={S.genBtn} onClick={generate}>
        {generating ? '🔢 Đang sinh...' : '🔢 Sinh số'}
      </button>
      {results.length > 0 && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {results.length === 1 ? (
            <div style={S.resultBox}>
              <div style={S.result}>{results[0]}</div>
            </div>
          ) : (
            <>
              <div style={S.resultBox}>
                <div style={{ ...S.result, fontSize: '1.5rem' }}>
                  {results.slice(0, 10).map((n, i) => (
                    <span key={i} style={{ margin: '0 0.2rem' }}>
                      {n}{i < Math.min(results.length, 10) - 1 ? ',' : ''}
                    </span>
                  ))}
                  {results.length > 10 && <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}> … +{results.length - 10}</span>}
                </div>
              </div>
              <div style={S.pick}>
                <span style={S.chip}>Min: {Math.min(...results)}</span>
                <span style={S.chip}>Max: {Math.max(...results)}</span>
                <span style={S.chip}>Tổng: {results.reduce((a, b) => a + b, 0)}</span>
                <span style={S.chip}>TB: {Math.round(results.reduce((a, b) => a + b, 0) / results.length)}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
