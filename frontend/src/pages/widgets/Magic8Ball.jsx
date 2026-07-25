import { useState } from 'react';

const ANSWERS = [
  'Chắc chắn rồi.', 'Đúng vậy.', 'Không nghi ngờ gì nữa.',
  'Có, hoàn toàn.', 'Tin đi.', 'Theo tao thấy thì có.',
  'Rất có khả năng.', 'Triển vọng tốt.', 'Ừ, cứ tin tao.',
  'Hỏi lại sau đi.', 'Tao chưa nói được.', 'Tập trung hỏi lại nhé.',
  'Đừng hỏi bây giờ.', 'Không thể nói bây giờ.', 'Đợi tí, suy nghĩ đã.',
  'Đừng có tin.', 'Câu trả lời là không.', 'Tao nghĩ không đâu.',
  'Không có cơ hội.', 'Rất khó đấy.',
];

const S = {
  container: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  ball: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #2d2d2d, #111)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    cursor: 'pointer',
    transition: 'transform 0.3s',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    border: '2px solid #333',
    userSelect: 'none',
  },
  inner: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 40%, #1a1a2e, #0a0a1a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #333',
    transition: 'all 0.3s',
  },
  answer: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--accent)',
    textAlign: 'center',
    padding: '0.3rem',
    lineHeight: 1.2,
  },
  prompt: {
    fontSize: '0.85rem',
    color: 'var(--text-dim)',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    maxWidth: '350px',
    padding: '0.6rem 0.8rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontSize: '0.85rem',
    outline: 'none',
    marginBottom: '1rem',
    boxSizing: 'border-box',
  },
  shakeBtn: {
    padding: '0.6rem 1.5rem',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  history: {
    marginTop: '1.5rem',
    textAlign: 'left',
    maxWidth: '400px',
    margin: '1.5rem auto 0',
  },
  historyTitle: {
    fontSize: '0.75rem',
    color: 'var(--text-dim)',
    fontWeight: 600,
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  historyItem: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.35rem 0',
    borderBottom: '1px solid var(--glass-border)',
    fontSize: '0.78rem',
  },
  q: { color: 'var(--text-dim)', flex: 1 },
  a: { color: 'var(--accent)', fontWeight: 600 },
};

export default function Magic8Ball() {
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [revealed, setRevealed] = useState(false);

  const shake = () => {
    if (!question.trim()) return;
    setShaking(true);
    setRevealed(false);
    setCurrentAnswer(null);
    setTimeout(() => {
      const ans = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      setCurrentAnswer(ans);
      setShaking(false);
      setRevealed(true);
      setHistory(prev => [{ q: question, a: ans }, ...prev].slice(0, 10));
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') shake();
  };

  return (
    <div style={S.container}>
      <div style={S.prompt}>Hỏi 8-Ball một câu, gõ Enter hoặc bấm lắc</div>
      <input
        style={S.input}
        placeholder="Nhập câu hỏi của bạn..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div
        style={{ ...S.ball, transform: shaking ? 'rotate(360deg) scale(1.05)' : 'rotate(0deg) scale(1)' }}
        onClick={shake}
      >
        <div style={S.inner}>
          {revealed && currentAnswer ? (
            <span style={S.answer}>{currentAnswer}</span>
          ) : (
            <span style={{ color: '#555', fontSize: '0.6rem', fontWeight: 700 }}>8</span>
          )}
        </div>
      </div>
      <button style={S.shakeBtn} onClick={shake}>
        {shaking ? '🔮 Đang suy nghĩ...' : '🔮 Lắc 8-Ball'}
      </button>
      {history.length > 0 && (
        <div style={S.history}>
          <div style={S.historyTitle}>Lịch sử</div>
          {history.map((item, i) => (
            <div key={i} style={S.historyItem}>
              <span style={S.q}>❓ {item.q}</span>
              <span style={S.a}>{item.a}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
