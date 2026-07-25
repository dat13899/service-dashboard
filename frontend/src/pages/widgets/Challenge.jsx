import { useState } from 'react';

const challenges = [
  'Nhảy 20 cái jumping jack',
  'Hát một bài hát bất kỳ',
  'Kể 1 câu chuyện cười',
  'Hít đất 10 cái',
  'Bắt chước tiếng động vật trong 10s',
  'Nói 1 điều tích cực về bản thân',
  'Nhắn tin cho 1 người bạn',
  'Uống 1 cốc nước',
  'Làm 5 cái squat',
  'Giơ tay lên trời và hét "Yeah!"',
  'Kể 3 điều bạn biết ơn',
  'Ngồi thiền 1 phút',
  'Gấp 1 con hạc giấy (nếu có)',
  'Viết 1 câu thơ 2 câu',
  'Nhảy theo 1 bài nhạc trong 30s',
  'Làm 10 cái gập bụng',
  'Đứng 1 chân trong 30s',
  'Cười thật to trong 5s',
  'Massage cổ vai trong 30s',
  'Thở sâu 5 lần',
  'Đi bộ 100 bước tại chỗ',
  'Làm mặt hề trong 10s',
  'Đọc to 1 câu tiếng Anh bất kỳ',
  'Vẽ 1 hình trái tim trên giấy',
  'Tắt điện thoại 5 phút',
];

export default function Challenge() {
  const [current, setCurrent] = useState(null);

  const pick = () => {
    setCurrent(challenges[Math.floor(Math.random() * challenges.length)]);
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        Thử thách ngẫu nhiên
      </div>
      <button onClick={pick}
        style={{
          padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
          background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem',
        }}
      >
        🎯 Nhận thử thách
      </button>
      {current && (
        <div style={{
          padding: '1.5rem', borderRadius: 'var(--radius-md)',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.5 }}>
            {current}
          </div>
        </div>
      )}
    </div>
  );
}
