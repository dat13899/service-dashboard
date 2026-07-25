import { useState } from 'react';

const foods = [
  'Phở bò', 'Bún bò Huế', 'Bún riêu', 'Bún chả Hà Nội', 'Cơm tấm Sài Gòn',
  'Bánh mì thịt', 'Bánh xèo', 'Bánh cuốn', 'Cháo lòng', 'Lẩu Thái',
  'Lẩu bò nhúng dấm', 'Cơm rang dưa bò', 'Mì xào bò', 'Bún thịt nướng',
  'Gà luộc', 'Vịt quay Bắc Kinh', 'Cá kho tộ', 'Thịt kho tàu', 'Canh chua cá lóc',
  'Bánh tráng trộn', 'Nem nướng Nha Trang', 'Bánh căn', 'Bánh bèo', 'Bánh ướt',
  'Chả giò', 'Mì Quảng', 'Cao lầu', 'Hủ tiếu Nam Vang', 'Bún mắm',
  'Sushi Nhật', 'Ramen Nhật', 'Cơm chiên Thái', 'Pad Thái', 'Tom Yum',
  'Pizza', 'Pasta Carbonara', 'Burger', 'Tacos', 'Salad Caesar',
  'Súp miso', 'Cà ri gà', 'Cà ri Ấn Độ', 'Nasi goreng', 'Bibimbap',
  'Đậu phụ mắm tôm', 'Ốc luộc', 'Nộm sứa', 'Bê thui', 'Dê nướng',
];

export default function Food() {
  const [result, setResult] = useState(null);

  const pick = () => {
    const f = foods[Math.floor(Math.random() * foods.length)];
    setResult(f);
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍜</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        Hôm nay ăn gì?
      </div>
      <button onClick={pick}
        style={{
          padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
          background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem',
        }}
      >
        🎲 Random món ăn
      </button>
      {result && (
        <div style={{
          padding: '1rem 2rem', borderRadius: 'var(--radius-md)',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)', display: 'inline-block',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
            Gợi ý cho bạn
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
