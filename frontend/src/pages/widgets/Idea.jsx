import { useState } from 'react';

const ideas = [
  'App đọc tin tức cá nhân hóa theo AI',
  'Web tìm bạn học cùng sở thích',
  'Tool theo dõi chi tiêu cá nhân',
  'Game 2D platformer tự học',
  'Chrome extension chặn quảng cáo thông minh',
  'API đồng hồ thời gian thực cho dev',
  'App học từ vựng qua flashcard',
  'Dashboard quản lý dự án mini',
  'Bot Discord quản lý server',
  'App nhắc uống nước thông minh',
  'Web đọc truyện online đơn giản',
  'Tool chuyển đổi ảnh sang ASCII',
  'App tập thể dục với timer và nhạc',
  'Hệ thống booking lịch hẹn online',
  'Website portfolio cho freelancer',
  'App vẽ ghi chú nhanh (whiteboard)',
  'Tool xem lịch âm dương',
  'Game cờ caro với AI',
  'App đếm calo bữa ăn',
  'Ứng dụng karaoke online',
  'Web tạo CV trực tuyến',
  'App quản lý thói quen hàng ngày',
  'Tool rút gọn link + thống kê',
  'Ứng dụng ghi nhật ký tâm trạng',
  'Game flappy bird clone',
  'Web học code với bài tập tương tác',
  'App đặt đồ ăn nhóm',
  'Tool quản lý kho hàng mini',
  'App tìm kiếm công thức nấu ăn',
  'Website so sánh giá sản phẩm',
  'Bot Telegram gửi tin nhắn định kỳ',
  'App nghe nhạc với playlist chia sẻ',
];

export default function Idea() {
  const [idea, setIdea] = useState(null);

  const gen = () => {
    setIdea(ideas[Math.floor(Math.random() * ideas.length)]);
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💡</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        Ý tưởng dự án ngẫu nhiên
      </div>
      <button onClick={gen}
        style={{
          padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
          background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem',
        }}
      >
        💡 Sinh ý tưởng
      </button>
      {idea && (
        <div style={{
          padding: '1.5rem', borderRadius: 'var(--radius-md)',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.5 }}>
            {idea}
          </div>
        </div>
      )}
    </div>
  );
}
