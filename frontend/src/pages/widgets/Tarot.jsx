import { useState } from 'react';

const tarotCards = [
  { name: 'The Fool', meaning: 'Khởi đầu mới, hồn nhiên, phiêu lưu', img: '0' },
  { name: 'The Magician', meaning: 'Sức mạnh, tài năng, tự tin', img: 'I' },
  { name: 'The High Priestess', meaning: 'Trực giác, bí ẩn, tiềm thức', img: 'II' },
  { name: 'The Empress', meaning: 'Sự nữ tính, phong phú, thiên nhiên', img: 'III' },
  { name: 'The Emperor', meaning: 'Quyền lực, cấu trúc, bảo vệ', img: 'IV' },
  { name: 'The Hierophant', meaning: 'Truyền thống, tri thức, tâm linh', img: 'V' },
  { name: 'The Lovers', meaning: 'Tình yêu, lựa chọn, hòa hợp', img: 'VI' },
  { name: 'The Chariot', meaning: 'Chiến thắng, ý chí, quyết tâm', img: 'VII' },
  { name: 'Strength', meaning: 'Sức mạnh nội tâm, can đảm', img: 'VIII' },
  { name: 'The Hermit', meaning: 'Cô độc, suy ngẫm, tìm kiếm', img: 'IX' },
  { name: 'Wheel of Fortune', meaning: 'May mắn, thay đổi, chu kỳ', img: 'X' },
  { name: 'Justice', meaning: 'Công lý, cân bằng, sự thật', img: 'XI' },
  { name: 'The Hanged Man', meaning: 'Hy sinh, buông bỏ, góc nhìn mới', img: 'XII' },
  { name: 'Death', meaning: 'Kết thúc, chuyển đổi, tái sinh', img: 'XIII' },
  { name: 'Temperance', meaning: 'Điều độ, hài hòa, kiên nhẫn', img: 'XIV' },
  { name: 'The Devil', meaning: 'Ràng buộc, dục vọng, vật chất', img: 'XV' },
  { name: 'The Tower', meaning: 'Sụp đổ, thay đổi đột ngột', img: 'XVI' },
  { name: 'The Star', meaning: 'Hy vọng, cảm hứng, thanh thản', img: 'XVII' },
  { name: 'The Moon', meaning: 'Ảo ảnh, sợ hãi, trực giác', img: 'XVIII' },
  { name: 'The Sun', meaning: 'Niềm vui, thành công, năng lượng', img: 'XIX' },
  { name: 'Judgement', meaning: 'Phán xét, tái sinh, sứ mệnh', img: 'XX' },
  { name: 'The World', meaning: 'Hoàn thành, viên mãn, thành tựu', img: 'XXI' },
];

export default function Tarot() {
  const [card, setCard] = useState(null);
  const [spread, setSpread] = useState([]);

  const draw = () => {
    const c = tarotCards[Math.floor(Math.random() * tarotCards.length)];
    setCard(c);
    const s = [];
    for (let i = 0; i < 3; i++) {
      const pool = [...tarotCards];
      const selected = [];
      for (let j = 0; j < 3; j++) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool.splice(idx, 1)[0]);
      }
      s.push(selected);
    }
    setSpread(s);
  };

  return (
    <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔮</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        Rút một lá bài tarot
      </div>
      <button onClick={draw}
        style={{
          padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
          background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem',
        }}
      >
        🔮 Rút bài
      </button>
      {card && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            padding: '1.25rem', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(129,140,248,0.3)', marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(129,140,248,0.7)', fontWeight: 600, marginBottom: '0.15rem' }}>
              {card.img}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e0e0ff', marginBottom: '0.3rem' }}>
              {card.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              {card.meaning}
            </div>
          </div>
        </div>
      )}
      {spread.length > 0 && (
        <>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            Trải bài 3 lá
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Quá khứ', 'Hiện tại', 'Tương lai'].map((label, i) => (
              <div key={i} style={{
                flex: '1', minWidth: '100px', maxWidth: '140px', padding: '0.6rem',
                borderRadius: 'var(--radius-sm)', background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)',
              }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.15rem' }}>{label}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-strong)' }}>{spread[i][0]?.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{spread[i][0]?.meaning}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
