import { useState } from 'react';

const events = [
  { date: '1/1', event: 'Năm mới Dương lịch' },
  { date: '7/1', event: 'Ngày chiến thắng Pol Pot (1979)' },
  { date: '27/1', event: 'Ký Hiệp định Paris (1973)' },
  { date: '3/2', event: 'Thành lập Đảng CSVN (1930)' },
  { date: '27/2', event: 'Ngày Thầy thuốc Việt Nam' },
  { date: '8/3', event: 'Ngày Quốc tế Phụ nữ' },
  { date: '26/3', event: 'Thành lập Đoàn TNCS HCM (1931)' },
  { date: '30/4', event: 'Giải phóng miền Nam (1975)' },
  { date: '1/5', event: 'Ngày Quốc tế Lao động' },
  { date: '7/5', event: 'Chiến thắng Điện Biên Phủ (1954)' },
  { date: '19/5', event: 'Sinh nhật Bác Hồ (1890)' },
  { date: '1/6', event: 'Ngày Quốc tế Thiếu nhi' },
  { date: '21/6', event: 'Ngày Báo chí Việt Nam' },
  { date: '28/6', event: 'Ngày Gia đình Việt Nam' },
  { date: '27/7', event: 'Ngày Thương binh Liệt sĩ' },
  { date: '19/8', event: 'Cách mạng Tháng Tám (1945)' },
  { date: '2/9', event: 'Quốc khánh Việt Nam (1945)' },
  { date: '15/10', event: 'Ngày sinh của Isaac Newton (1642)' },
  { date: '20/10', event: 'Ngày Phụ nữ Việt Nam' },
  { date: '31/10', event: 'Halloween' },
  { date: '9/11', event: 'Bức tường Berlin sụp đổ (1989)' },
  { date: '20/11', event: 'Ngày Nhà giáo Việt Nam' },
  { date: '22/12', event: 'Ngày thành lập Quân đội NDVN (1944)' },
  { date: '24/12', event: 'Giáng sinh' },
  { date: '25/12', event: 'Giáng sinh' },
  { date: '1/1/1995', event: 'WTO chính thức thành lập' },
  { date: '17/4/1975', event: 'Campuchia rơi vào tay Khmer Đỏ' },
  { date: '20/7/1969', event: 'Con người đặt chân lên Mặt trăng' },
  { date: '15/4/1912', event: 'Tàu Titanic chìm' },
  { date: '6/8/1945', event: 'Mỹ ném bom nguyên tử xuống Hiroshima' },
  { date: '9/8/1945', event: 'Mỹ ném bom nguyên tử xuống Nagasaki' },
  { date: '28/2/1953', event: 'Phát hiện cấu trúc DNA' },
  { date: '12/4/1961', event: 'Gagarin bay vào vũ trụ' },
  { date: '11/9/2001', event: 'Sự kiện 11/9 tại Mỹ' },
];

export default function History() {
  const [item, setItem] = useState(null);

  const pick = () => {
    setItem(events[Math.floor(Math.random() * events.length)]);
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        Sự kiện lịch sử ngẫu nhiên
      </div>
      <button onClick={pick}
        style={{
          padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
          background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem',
        }}
      >
        📖 Xem sự kiện
      </button>
      {item && (
        <div style={{
          padding: '1.5rem', borderRadius: 'var(--radius-md)',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.3rem' }}>
            {item.date}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.5 }}>
            {item.event}
          </div>
        </div>
      )}
    </div>
  );
}
