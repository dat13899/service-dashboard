import { useState } from 'react';

const converters = [
  { id: 'length', name: 'Độ dài', units: ['m', 'cm', 'mm', 'km', 'inch', 'ft', 'yd', 'mile'],
    convert: (v, from, to) => {
      const table = { m:1, cm:0.01, mm:0.001, km:1000, inch:0.0254, ft:0.3048, yd:0.9144, mile:1609.344 };
      return v * table[from] / table[to];
    }
  },
  { id: 'temp', name: 'Nhiệt độ', units: ['°C', '°F', 'K'],
    convert: (v, from, to) => {
      if (from === to) return v;
      let c;
      if (from === '°C') c = v;
      else if (from === '°F') c = (v - 32) * 5/9;
      else c = v - 273.15;
      if (to === '°C') return c;
      if (to === '°F') return c * 9/5 + 32;
      return c + 273.15;
    }
  },
  { id: 'weight', name: 'Khối lượng', units: ['kg', 'g', 'mg', 'tấn', 'lb', 'oz'],
    convert: (v, from, to) => {
      const table = { kg:1, g:0.001, mg:0.000001, tấn:1000, lb:0.453592, oz:0.0283495 };
      return v * table[from] / table[to];
    }
  },
];

export default function Convert() {
  const [cat, setCat] = useState(0);
  const [value, setValue] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const c = converters[cat];
  const result = c.convert(value, c.units[from], c.units[to]);

  return (
    <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {converters.map((conv, i) => (
          <button key={conv.id} onClick={() => { setCat(i); setFrom(0); setTo(Math.min(1, conv.units.length-1)); }}
            style={{
              padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-sm)',
              border: `1px solid ${cat === i ? 'var(--accent)' : 'var(--glass-border)'}`,
              background: cat === i ? 'rgba(129,140,248,0.1)' : 'rgba(255,255,255,0.03)',
              color: cat === i ? 'var(--accent)' : 'var(--text-dim)',
              fontSize: '0.78rem', cursor: 'pointer', fontWeight: cat === i ? 600 : 400,
            }}
          >
            {conv.name}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input type="number" value={value} onChange={e => setValue(Number(e.target.value))}
          style={{
            width: '90px', padding: '0.4rem 0.5rem', textAlign: 'center',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
            background: 'var(--surface-2)', color: 'var(--text)',
            fontSize: '1rem', outline: 'none', fontWeight: 600,
          }}
        />
        <select value={from} onChange={e => setFrom(Number(e.target.value))}
          style={{
            padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)', background: 'var(--surface-2)',
            color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
          }}
        >
          {c.units.map((u, i) => <option key={u} value={i}>{u}</option>)}
        </select>
        <span style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>→</span>
        <select value={to} onChange={e => setTo(Number(e.target.value))}
          style={{
            padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)', background: 'var(--surface-2)',
            color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
          }}
        >
          {c.units.map((u, i) => <option key={u} value={i}>{u}</option>)}
        </select>
      </div>
      <div style={{
        padding: '1rem', borderRadius: 'var(--radius-md)',
        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
          {result.toFixed ? (Math.abs(result) > 0.001 && Math.abs(result) < 1000000 ? result.toFixed(4) : result.toExponential(4)) : result}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          {c.units[to]}
        </div>
      </div>
    </div>
  );
}
