import { useState } from 'react';

const templates = [
  'Chào bạn, tôi là {name}, một {job} đến từ {place}. Tôi đam mê {hobby} và hy vọng {dream}.',
  'Hôm nay là một ngày {adj} ở {place}. Tôi đã {action} và cảm thấy thật {emotion}.',
  '{name} là một người {adj}. Anh ấy/cô ấy luôn {habit} và được mọi người yêu quý vì {quality}.',
  'Dự án {project} của tôi đã {outcome}. Nhờ có {reason}, tôi đã học được {lesson}.',
  'Cuối tuần này, tôi sẽ {plan1}, sau đó {plan2} và kết thúc bằng {plan3}.',
  'Nếu tôi có {resource}, tôi sẽ {goal}. Đó là ước mơ của tôi từ khi {time}.',
  '{place} là nơi {desc}. Mỗi khi đến đây, tôi luôn cảm thấy {emotion}.',
  'Công nghệ {tech} đang thay đổi thế giới. Trong tương lai, {prediction}.',
  'Bài học lớn nhất tôi học được là {lesson}. Điều này đã thay đổi {aspect} của tôi.',
  'Một ngày nọ, {character} tình cờ gặp {character2} tại {place}. Họ đã {action} cùng nhau.',
];

const words = {
  name: ['Minh', 'An', 'Hùng', 'Linh', 'Hoa', 'Nam', 'Mai', 'Tuấn', 'Lan', 'Dũng'],
  job: ['lập trình viên', 'giáo viên', 'bác sĩ', 'kỹ sư', 'nhà thiết kế', 'nhà văn', 'nhạc sĩ', 'đầu bếp', 'phi công', 'kiến trúc sư'],
  place: ['Hà Nội', 'Sài Gòn', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Huế', 'Hội An', 'Phú Quốc', 'Hạ Long', 'Sapa'],
  hobby: ['đọc sách', 'chơi game', 'nấu ăn', 'du lịch', 'vẽ tranh', 'nghe nhạc', 'tập yoga', 'chạy bộ', 'quay phim', 'trồng cây'],
  dream: ['có thể đi du lịch vòng quanh thế giới', 'trở thành chuyên gia trong lĩnh vực của mình', 'sống một cuộc đời ý nghĩa', 'xây dựng một gia đình hạnh phúc', 'tạo ra sản phẩm giúp ích cho cộng đồng'],
  adj: ['tuyệt vời', 'đẹp trời', 'đầy năng lượng', 'yên bình', 'thú vị', 'khó quên', 'thư giãn', 'sôi động', 'kỳ diệu', 'ấm áp'],
  action: ['đi dạo trong công viên', 'nấu một bữa ăn ngon', 'gặp gỡ bạn bè', 'xem một bộ phim hay', 'đọc một cuốn sách', 'tập thể dục', 'nghe nhạc', 'viết nhật ký', 'vẽ tranh', 'học một điều mới'],
  emotion: ['hạnh phúc', 'thư thái', 'phấn khởi', 'bình yên', 'tự hào', 'biết ơn', 'vui vẻ', 'tràn đầy năng lượng', 'thoải mái', 'tích cực'],
  habit: ['chăm chỉ làm việc', 'giúp đỡ người khác', 'sống lạc quan', 'học hỏi mỗi ngày', 'tập thể dục buổi sáng', 'đọc sách trước khi ngủ', 'viết ra những điều biết ơn', 'cười thật nhiều'],
  quality: ['lòng tốt', 'sự kiên nhẫn', 'tài năng', 'trí thông minh', 'sự sáng tạo', 'tính hài hước', 'lòng dũng cảm', 'sự trung thực'],
  project: ['website', 'ứng dụng', 'dự án cộng đồng', 'nghiên cứu', 'khóa học', 'cuốn sách', 'bộ phim', 'sản phẩm mới'],
  outcome: ['thành công ngoài mong đợi', 'hoàn thành đúng hạn', 'nhận được nhiều phản hồi tốt', 'vượt qua mọi khó khăn', 'mở ra nhiều cơ hội mới'],
  reason: ['sự nỗ lực không ngừng', 'sự hỗ trợ từ đồng đội', 'niềm đam mê mãnh liệt', 'sự kiên trì vượt khó', 'tinh thần học hỏi'],
  lesson: ['không gì là không thể', 'thất bại là mẹ thành công', 'hạnh phúc đến từ những điều giản dị', 'cho đi là nhận lại', 'mỗi ngày đều là một cơ hội mới'],
  plan1: ['đi biển', 'về quê', 'đi cắm trại', 'ở nhà đọc sách', 'đi xem phim', 'tổ chức tiệc', 'đi mua sắm', 'tham gia workshop'],
  plan2: ['nấu ăn cùng gia đình', 'chơi thể thao', 'dạo phố', 'xem Netflix', 'nghe nhạc', 'chụp ảnh', 'làm bánh', 'viết blog'],
  plan3: ['một bữa tối lãng mạn', 'một giấc ngủ ngon', 'một cuộc điện thoại với bạn thân', 'một buổi thiền', 'một tách trà ấm', 'một bộ phim hay'],
  resource: ['một tỷ đô', 'một cỗ máy thời gian', 'siêu năng lực', 'đôi cánh', 'một hòn đảo riêng', 'một đội quân robot'],
  goal: ['xây dựng thành phố thông minh', 'khám phá vũ trụ', 'chữa khỏi mọi bệnh tật', 'dạy học miễn phí cho trẻ em', 'bảo vệ môi trường'],
  time: ['còn nhỏ', 'học đại học', 'lần đầu đi du lịch', 'đọc một cuốn sách', 'xem một bộ phim'],
  desc: ['yên bình và thơ mộng', 'sôi động và náo nhiệt', 'cổ kính và trầm mặc', 'hiện đại và năng động', 'xinh đẹp và lãng mạn'],
  tech: ['AI', 'blockchain', 'IoT', 'VR/AR', 'robot', 'in 3D', 'năng lượng mặt trời', 'xe điện'],
  prediction: ['mọi người sẽ sống trên sao Hỏa', 'robot sẽ làm hầu hết công việc', 'con người sẽ sống đến 150 tuổi', 'AI sẽ giúp chữa mọi bệnh', 'năng lượng sạch sẽ thay thế hoàn toàn'],
  aspect: ['cách nhìn về cuộc sống', 'cách đối xử với người khác', 'cách làm việc', 'cách vượt qua khó khăn', 'cách tận hưởng cuộc sống'],
  character: ['Một chàng trai trẻ', 'Một cô gái thông minh', 'Một ông lão hiền lành', 'Một chú mèo tinh nghịch', 'Một robot tò mò'],
  character2: ['một người bạn lạ mặt', 'một người thầy', 'một chú chó', 'một người du hành thời gian', 'một phù thủy'],
};

function fill(template) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const list = words[key];
    if (!list) return `{${key}}`;
    return list[Math.floor(Math.random() * list.length)];
  });
}

export default function TextGen() {
  const [result, setResult] = useState('');

  const generate = () => {
    const t = templates[Math.floor(Math.random() * templates.length)];
    setResult(fill(t));
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        Sinh văn bản ngẫu nhiên
      </div>
      <button onClick={generate}
        style={{
          padding: '0.6rem 2rem', borderRadius: 'var(--radius-sm)', border: 'none',
          background: 'var(--accent)', color: '#fff', fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem',
        }}
      >
        📝 Sinh văn bản
      </button>
      {result && (
        <div style={{
          padding: '1.25rem', borderRadius: 'var(--radius-md)',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7, textAlign: 'left' }}>
            {result}
          </div>
          <button onClick={() => navigator.clipboard?.writeText(result)}
            style={{
              marginTop: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-dim)', fontSize: '0.72rem', cursor: 'pointer',
            }}
          >
            📋 Copy
          </button>
        </div>
      )}
    </div>
  );
}
