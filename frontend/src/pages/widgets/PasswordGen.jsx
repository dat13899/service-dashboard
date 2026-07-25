import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

const S = {
  container: { padding: '1.5rem 1rem' },
  row: {
    display: 'flex', gap: '0.75rem', justifyContent: 'center',
    flexWrap: 'wrap', marginBottom: '1.25rem',
  },
  field: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' },
  label: { fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 },
  input: {
    width: '80px', padding: '0.4rem 0.5rem', textAlign: 'center',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)', color: 'var(--text)',
    fontSize: '0.82rem', outline: 'none',
  },
  optionRow: {
    display: 'flex', gap: '0.75rem', justifyContent: 'center',
    flexWrap: 'wrap', marginBottom: '1rem',
  },
  toggle: (active) => ({
    padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-dim)',
    fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s',
    fontWeight: active ? 600 : 400,
  }),
  genBtn: {
    display: 'block', margin: '0 auto 1.25rem',
    padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
    fontWeight: 600, cursor: 'pointer',
  },
  resultBox: {
    padding: '1rem', borderRadius: 'var(--radius-md)',
    background: 'var(--surface-2)', border: '1px solid var(--glass-border)',
    fontFamily: '"Fira Code", "Cascadia Code", monospace',
    fontSize: '0.82rem', color: 'var(--text)',
    wordBreak: 'break-all', lineHeight: 1.6, position: 'relative',
  },
  strength: {
    height: '4px', borderRadius: '2px', marginTop: '0.5rem',
    transition: 'all 0.3s',
  },
  copyBtn: {
    position: 'absolute', top: '0.4rem', right: '0.4rem',
    padding: '0.2rem 0.5rem', fontSize: '0.65rem',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)', color: 'var(--text-dim)',
    cursor: 'pointer',
  },
};

function calcStrength(pwd) {
  if (!pwd) return { label: '', color: '', score: 0, width: '0%' };
  let score = 0;
  if (pwd.length >= 8) score += 25;
  if (pwd.length >= 12) score += 15;
  if (pwd.length >= 16) score += 10;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 15;
  if (/\d/.test(pwd)) score += 15;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;
  score = Math.min(100, score);
  if (score < 40) return { label: 'Yếu', color: '#ef4444', score, width: `${score}%` };
  if (score < 65) return { label: 'Trung bình', color: '#f59e0b', score, width: `${score}%` };
  if (score < 85) return { label: 'Mạnh', color: '#22c55e', score, width: `${score}%` };
  return { label: 'Rất mạnh', color: 'var(--accent)', score, width: `${score}%` };
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?~';

export default function PasswordGen() {
  const toast = useToast();
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);

  const generate = () => {
    let chars = '';
    if (upper) chars += UPPER;
    if (lower) chars += LOWER;
    if (digits) chars += DIGITS;
    if (symbols) chars += SYMBOLS;
    if (!chars) { toast('Chọn ít nhất một loại ký tự', 'error'); return; }
    if (excludeAmbiguous) {
      chars = chars.replace(/[O0Il1]/g, '');
    }
    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(pwd);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast('Đã copy mật khẩu', 'success');
    } catch {
      toast('Không thể copy', 'error');
    }
  };

  const strength = calcStrength(password);

  return (
    <div style={S.container}>
      <div style={S.row}>
        <div style={S.field}>
          <div style={S.label}>Độ dài</div>
          <input style={S.input} type="number" min="4" max="128" value={length} onChange={e => setLength(Number(e.target.value))} />
        </div>
      </div>
      <div style={S.optionRow}>
        <button style={S.toggle(upper)} onClick={() => setUpper(!upper)}>ABC</button>
        <button style={S.toggle(lower)} onClick={() => setLower(!lower)}>abc</button>
        <button style={S.toggle(digits)} onClick={() => setDigits(!digits)}>123</button>
        <button style={S.toggle(symbols)} onClick={() => setSymbols(!symbols)}>#@!</button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button style={S.toggle(excludeAmbiguous)} onClick={() => setExcludeAmbiguous(!excludeAmbiguous)}>
          Loại ký tự dễ nhầm (O0Il1)
        </button>
      </div>
      <button style={S.genBtn} onClick={generate}>🔑 Sinh mật khẩu</button>
      {password && (
        <div style={S.resultBox}>
          <button style={S.copyBtn} onClick={copy}>📋 Copy</button>
          <div>{password}</div>
          <div style={{ ...S.strength, width: strength.width, background: strength.color }} />
          <div style={{ fontSize: '0.7rem', color: strength.color, marginTop: '0.25rem', fontWeight: 600 }}>
            {strength.label} ({password.length} ký tự)
          </div>
        </div>
      )}
    </div>
  );
}
