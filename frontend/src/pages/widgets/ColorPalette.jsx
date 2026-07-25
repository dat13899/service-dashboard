import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { r, g, b, hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` };
}

function generatePalette(count = 5, harmony = 'random') {
  const colors = [];
  if (harmony === 'mono') {
    const base = randomColor();
    for (let i = 0; i < count; i++) {
      const f = 0.5 + (i / (count - 1)) * 0.5;
      colors.push({
        r: Math.min(255, Math.floor(base.r * f)),
        g: Math.min(255, Math.floor(base.g * f)),
        b: Math.min(255, Math.floor(base.b * f)),
        hex: `#${Math.min(255, Math.floor(base.r * f)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(base.g * f)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(base.b * f)).toString(16).padStart(2, '0')}`,
      });
    }
  } else if (harmony === 'complement') {
    const base = randomColor();
    colors.push(base);
    colors.push({ r: 255 - base.r, g: 255 - base.g, b: 255 - base.b, hex: `#${(255 - base.r).toString(16).padStart(2, '0')}${(255 - base.g).toString(16).padStart(2, '0')}${(255 - base.b).toString(16).padStart(2, '0')}` });
    for (let i = 2; i < count; i++) colors.push(randomColor());
  } else {
    for (let i = 0; i < count; i++) colors.push(randomColor());
  }
  return colors;
}

const S = {
  container: { padding: '1.5rem 1rem', textAlign: 'center' },
  palette: {
    display: 'flex', gap: '0.25rem', justifyContent: 'center',
    marginBottom: '1.5rem', flexWrap: 'wrap',
  },
  swatch: {
    width: '70px', height: '90px', borderRadius: 'var(--radius-sm)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'flex-end', padding: '0.4rem', cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  swatchText: { fontSize: '0.6rem', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontWeight: 600 },
  genBtn: {
    padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
    fontWeight: 600, cursor: 'pointer',
  },
  harmonyRow: {
    display: 'flex', gap: '0.5rem', justifyContent: 'center',
    flexWrap: 'wrap', marginBottom: '1rem',
  },
  harmonyBtn: (active) => ({
    padding: '0.35rem 0.7rem', borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-dim)',
    fontSize: '0.72rem', cursor: 'pointer', fontWeight: active ? 600 : 400,
  }),
  countSlider: {
    width: '200px', margin: '0 auto 1rem', display: 'block',
  },
};

export default function ColorPalette() {
  const toast = useToast();
  const [colors, setColors] = useState(() => generatePalette(5, 'random'));
  const [harmony, setHarmony] = useState('random');
  const [count, setCount] = useState(5);

  const generate = () => {
    setColors(generatePalette(count, harmony));
  };

  const copyColor = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      toast(`Đã copy ${hex}`, 'success');
    } catch {
      toast('Không thể copy', 'error');
    }
  };

  return (
    <div style={S.container}>
      <div style={S.harmonyRow}>
        {['random', 'mono', 'complement'].map(h => (
          <button key={h} style={S.harmonyBtn(harmony === h)} onClick={() => setHarmony(h)}>
            {h === 'random' ? '🎲 Ngẫu nhiên' : h === 'mono' ? '🎨 Đơn sắc' : '🔄 Bổ túc'}
          </button>
        ))}
      </div>
      <input
        type="range" min="3" max="10" value={count}
        onChange={e => setCount(Number(e.target.value))}
        style={S.countSlider}
      />
      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
        {count} màu
      </div>
      <div style={S.palette}>
        {colors.map((c, i) => (
          <div
            key={i}
            style={{ ...S.swatch, background: c.hex }}
            onClick={() => copyColor(c.hex)}
            title="Click để copy"
          >
            <span style={S.swatchText}>{c.hex}</span>
          </div>
        ))}
      </div>
      <button style={S.genBtn} onClick={generate}>🎨 Sinh bảng màu</button>
    </div>
  );
}
