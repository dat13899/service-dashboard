import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

function randomGradient() {
  const dirs = ['to right', 'to bottom', 'to bottom right', 'to bottom left', '135deg', '45deg', 'to top right'];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  const c1 = `hsl(${Math.floor(Math.random() * 360)}, ${70 + Math.floor(Math.random() * 30)}%, ${50 + Math.floor(Math.random() * 30)}%)`;
  const c2 = `hsl(${Math.floor(Math.random() * 360)}, ${70 + Math.floor(Math.random() * 30)}%, ${50 + Math.floor(Math.random() * 30)}%)`;
  const stops = (Math.floor(Math.random() * 2) + 1) > 1 ? 3 : 2;
  let css;
  if (stops === 3) {
    const c3 = `hsl(${Math.floor(Math.random() * 360)}, ${70 + Math.floor(Math.random() * 30)}%, ${50 + Math.floor(Math.random() * 30)}%)`;
    css = `linear-gradient(${dir}, ${c1}, ${c2}, ${c3})`;
  } else {
    css = `linear-gradient(${dir}, ${c1}, ${c2})`;
  }
  return { css, dir, colors: [c1, c2], stops };
}

const S = {
  container: { padding: '1.5rem 1rem', textAlign: 'center' },
  preview: {
    width: '100%', height: '180px', borderRadius: 'var(--radius-md)',
    marginBottom: '1.25rem', transition: 'all 0.3s',
    border: '1px solid var(--glass-border)',
  },
  codeBox: {
    padding: '0.75rem', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface-2)', border: '1px solid var(--glass-border)',
    fontFamily: '"Fira Code", "Cascadia Code", monospace',
    fontSize: '0.75rem', color: 'var(--text)', wordBreak: 'break-all',
    textAlign: 'left', marginBottom: '1rem', position: 'relative',
  },
  genBtn: {
    padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
    fontWeight: 600, cursor: 'pointer',
  },
  directionRow: {
    display: 'flex', gap: '0.4rem', justifyContent: 'center',
    flexWrap: 'wrap', marginBottom: '1rem',
  },
  dirBtn: (active) => ({
    padding: '0.3rem 0.55rem', borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-dim)',
    fontSize: '0.65rem', cursor: 'pointer', fontWeight: active ? 600 : 400,
  }),
  copyBtn: {
    position: 'absolute', top: '0.3rem', right: '0.3rem',
    padding: '0.15rem 0.4rem', fontSize: '0.6rem',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)', color: 'var(--text-dim)', cursor: 'pointer',
  },
};

const DIRECTIONS = [
  { id: 'to right', label: '→' },
  { id: 'to bottom', label: '↓' },
  { id: 'to bottom right', label: '↘' },
  { id: 'to bottom left', label: '↙' },
  { id: '135deg', label: '↗' },
  { id: '45deg', label: '↗45' },
  { id: 'to top right', label: '↗T' },
];

export default function GradientGen() {
  const toast = useToast();
  const [gradient, setGradient] = useState(() => randomGradient());
  const [direction, setDirection] = useState(null);

  const generate = () => {
    const g = randomGradient();
    if (direction) {
      const parsed = g.css.replace(/linear-gradient\([^,]+,/, `linear-gradient(${direction},`);
      setGradient({ ...g, css: parsed, dir: direction });
    } else {
      setGradient(g);
    }
  };

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(`background: ${gradient.css};`);
      toast('Đã copy CSS gradient', 'success');
    } catch {
      toast('Không thể copy', 'error');
    }
  };

  return (
    <div style={S.container}>
      <div style={{ ...S.preview, background: gradient.css }} />
      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
        Hướng gradient (tùy chọn)
      </div>
      <div style={S.directionRow}>
        <button style={S.dirBtn(direction === null)} onClick={() => setDirection(null)}>🎲</button>
        {DIRECTIONS.map(d => (
          <button key={d.id} style={S.dirBtn(direction === d.id)} onClick={() => setDirection(d.id)}>
            {d.label}
          </button>
        ))}
      </div>
      <div style={S.codeBox}>
        <button style={S.copyBtn} onClick={copyCSS}>📋 Copy</button>
        <code>{gradient.css}</code>
      </div>
      <button style={S.genBtn} onClick={generate}>🌈 Sinh gradient</button>
    </div>
  );
}
