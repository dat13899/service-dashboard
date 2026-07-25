import { useState } from 'react';

const ACTIVITIES = [
  { emoji: '📖', text: 'Đọc một cuốn sách ngẫu nhiên trên Wikipedia' },
  { emoji: '🧘', text: 'Thiền 5 phút — hít thở sâu và thư giãn' },
  { emoji: '🚶', text: 'Đi dạo 10 phút quanh nhà' },
  { emoji: '🎵', text: 'Nghe một bài nhạc bạn chưa từng nghe' },
  { emoji: '✍️', text: 'Viết nhật ký 3 điều bạn biết ơn' },
  { emoji: '🧹', text: 'Dọn dẹp một góc nhỏ trong phòng' },
  { emoji: '💪', text: 'Tập 10 cái hít đất hoặc vươn vai' },
  { emoji: '🎨', text: 'Vẽ một thứ gì đó nguệch ngoạc' },
  { emoji: '📝', text: 'Lên danh sách việc cần làm trong tuần' },
  { emoji: '☎️', text: 'Gọi cho một người bạn hoặc người thân' },
  { emoji: '🌱', text: 'Tưới cây hoặc chăm sóc cây cảnh' },
  { emoji: '🧩', text: 'Giải một câu đố hoặc chơi Sudoku' },
  { emoji: '📸', text: 'Chụp một bức ảnh đẹp quanh nhà' },
  { emoji: '🎬', text: 'Xem trailer của một bộ phim ngẫu nhiên' },
  { emoji: '🥤', text: 'Pha một ly nước uống mới' },
  { emoji: '📚', text: 'Học 5 từ mới tiếng Anh' },
  { emoji: '🎮', text: 'Chơi một game nhỏ trong 15 phút' },
  { emoji: '🧠', text: 'Brain dump — viết tất cả ra giấy' },
  { emoji: '🎯', text: 'Đặt một mục tiêu nhỏ cho hôm nay' },
  { emoji: '🔧', text: 'Sửa một thứ lặt vặt trong nhà' },
  { emoji: '🧋', text: 'Pha trà hoặc cà phê và thưởng thức' },
  { emoji: '🎭', text: 'Xem một TED Talk ngắn' },
  { emoji: '🏋️', text: 'Tập thể dục 15 phút' },
  { emoji: '🧹', text: 'Sắp xếp lại bàn làm việc' },
  { emoji: '🎤', text: 'Hát theo một bài hát yêu thích' },
  { emoji: '🧪', text: 'Thử làm một thí nghiệm nhỏ' },
  { emoji: '🌍', text: 'Đọc tin tức thế giới trong 5 phút' },
  { emoji: '🎲', text: 'Chơi một board game hoặc card game online' },
  { emoji: '🧵', text: 'Học một kỹ năng thủ công mới' },
  { emoji: '🌿', text: 'Hít thở không khí trong lành ngoài trời' },
  { emoji: '📊', text: 'Xem lại ngân sách cá nhân' },
  { emoji: '🎄', text: 'Làm điều tốt cho người khác' },
  { emoji: '🎶', text: 'Học lời một bài hát mới' },
  { emoji: '📋', text: 'Lập kế hoạch cho ngày mai' },
  { emoji: '🏡', text: 'Bài trí lại một góc trong nhà' },
];

const S = {
  container: { padding: '1.5rem 1rem', textAlign: 'center' },
  suggestion: {
    padding: '2rem 1.5rem', borderRadius: 'var(--radius-md)',
    background: 'var(--surface-2)', border: '1px solid var(--glass-border)',
    marginBottom: '1.5rem', minHeight: '120px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: '2.5rem', marginBottom: '0.75rem' },
  text: { fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.5, fontWeight: 500 },
  genBtn: {
    padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
    fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: '0.4rem',
  },
  empty: {
    fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6,
  },
  refresh: {
    display: 'inline-block', marginTop: '0.5rem',
    fontSize: '0.72rem', color: 'var(--accent)',
    cursor: 'pointer', textDecoration: 'underline',
  },
  tagRow: {
    display: 'flex', gap: '0.4rem', justifyContent: 'center',
    flexWrap: 'wrap', marginTop: '1.25rem',
  },
  tag: {
    padding: '0.2rem 0.5rem', borderRadius: '12px',
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    fontSize: '0.65rem', color: 'var(--text-dim)',
  },
};

export default function ActivitySuggester() {
  const [current, setCurrent] = useState(null);

  const suggest = () => {
    const idx = Math.floor(Math.random() * ACTIVITIES.length);
    setCurrent(ACTIVITIES[idx]);
  };

  return (
    <div style={S.container}>
      {current ? (
        <div style={S.suggestion}>
          <div style={S.emoji}>{current.emoji}</div>
          <div style={S.text}>{current.text}</div>
        </div>
      ) : (
        <div style={S.suggestion}>
          <div style={S.empty}>
            🤔 Không biết làm gì?<br />
            Bấm nút bên dưới để được gợi ý!
          </div>
        </div>
      )}
      <button style={S.genBtn} onClick={suggest}>
        💡 Gợi ý cho tôi
      </button>
      <div style={S.tagRow}>
        <span style={S.tag}>{ACTIVITIES.length} hoạt động</span>
        <span style={S.tag}>✨ Đa dạng</span>
        {current && <span style={S.tag} onClick={suggest}>🔄 Làm mới</span>}
      </div>
    </div>
  );
}
