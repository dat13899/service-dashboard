import { useState } from 'react';

const quotes = [
  '"Trên con đường thành công, không có dấu chân của kẻ lười biếng." — Lỗ Tấn',
  '"Học, học nữa, học mãi." — Lênin',
  '"Có công mài sắt, có ngày nên kim." — Tục ngữ Việt Nam',
  '"Đi một ngày đàng, học một sàng khôn." — Tục ngữ Việt Nam',
  '"Thương người như thể thương thân." — Tục ngữ Việt Nam',
  '"Lời nói chẳng mất tiền mua, lựa lời mà nói cho vừa lòng nhau." — Ca dao Việt Nam',
  '"Gần mực thì đen, gần đèn thì rạng." — Tục ngữ Việt Nam',
  '"Tốt gỗ hơn tốt nước sơn." — Tục ngữ Việt Nam',
  '"Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao." — Ca dao Việt Nam',
  '"Uống nước nhớ nguồn." — Tục ngữ Việt Nam',
  '"Chớ thấy sóng cả mà ngã tay chèo." — Tục ngữ Việt Nam',
  '"Ăn quả nhớ kẻ trồng cây." — Tục ngữ Việt Nam',
  '"Cái khó bó cái khôn." — Tục ngữ Việt Nam',
  '"Trăm hay không bằng tay quen." — Tục ngữ Việt Nam',
  '"Của bền tại người." — Tục ngữ Việt Nam',
  '"Thất bại là mẹ thành công." — Tục ngữ Việt Nam',
  '"Không thầy đố mày làm nên." — Tục ngữ Việt Nam',
  '"Học thầy không tày học bạn." — Tục ngữ Việt Nam',
  '"Một mặt người mười mặt của." — Tục ngữ Việt Nam',
  '"Đói cho sạch, rách cho thơm." — Tục ngữ Việt Nam',
  '"Yêu nước thương nòi." — Tục ngữ Việt Nam',
  '"Sống trên đời mới chỉ là một nửa." — Xuân Quỳnh',
  '"Nơi nào có ý chí, nơi đó có con đường." — Nguyễn Bá Học',
  '"Đừng xấu hổ khi không biết, chỉ xấu hổ khi không học." — Khuyết danh',
  '"Người Việt Nam ta không bao giờ chịu khuất phục." — Hồ Chí Minh',
  '"Không có việc gì khó, chỉ sợ lòng không bền." — Hồ Chí Minh',
  '"Con người sinh ra không phải để tan biến như một hạt cát." — Đặng Thai Mai',
  '"Sự thật là ánh sáng, dù có bị che khuất thế nào cũng sẽ tỏa rạng." — Nguyễn Đình Thi',
  '"Cống hiến hết mình là sống hết mình." — Xuân Diệu',
  '"Tuổi trẻ như một cơn mưa rào, dù có bị ướt vẫn muốn được đắm mình một lần." — Nguyễn Nhật Ánh',
  '"Mỗi ngày đến trường là một ngày vui." — Khuyết danh',
  '"Việt Nam là một quốc gia có nền văn hiến lâu đời." — Phạm Văn Đồng',
  '"Cái đẹp cứu rỗi thế giới." — Dostoevsky (bản dịch Việt)',
];

export default function Van() {
  const [quote, setQuote] = useState(null);

  const pick = () => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📖</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        Ngẫu nhiên câu văn hay
      </div>
      <button onClick={pick}
        style={{
          padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
          background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem',
        }}
      >
        📜 Xem câu văn
      </button>
      {quote && (
        <div style={{
          padding: '1.5rem', borderRadius: 'var(--radius-md)',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic' }}>
            {quote}
          </div>
        </div>
      )}
    </div>
  );
}
