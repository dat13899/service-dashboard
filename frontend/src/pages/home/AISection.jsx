import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import WireframeSphere from '../../components/WireframeSphere';

const features = [
  {
    icon: '🧠', title: 'Hermes Agent', color: '#34d399',
    desc: 'AI agent tự động giám sát, deploy, và xử lý sự cố 24/7. Tích hợp Telegram, memory, cron jobs.',
    tags: ['LLM', 'RAG', 'Autonomous'],
  },
  {
    icon: '📚', title: 'Knowledge Base', color: '#10b981',
    desc: 'RAG system lưu trữ tài liệu, codebase, và kinh nghiệm. Truy vấn bằng ngôn ngữ tự nhiên.',
    tags: ['Vector DB', 'Embedding', 'Search'],
  },
  {
    icon: '🔮', title: 'AI Tools Suite', color: '#059669',
    desc: 'Bộ công cụ AI: text generation, image analysis, code review, data processing.',
    tags: ['Multi-modal', 'Code Gen', 'Analytics'],
  },
];

export default function AISection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="ai-section" style={{ padding: '3rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Neural network decoration */}
      <div style={{ position: 'absolute', right: -60, bottom: -40, opacity: 0.15, pointerEvents: 'none' }}>
        <WireframeSphere width={300} height={300} color="rgba(52,211,153,0.5)" speed={0.003} opacity={1} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--text-strong)', marginBottom: '0.25rem' }}>
            <span style={{ marginRight: 8 }}>🤖</span> AI-Powered
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Tự động hóa mọi thứ với AI agent chạy trên chính server của bạn
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
              className="card rotating-border"
              style={{ padding: '1.2rem' }}
              whileHover={{ y: -4 }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '0.4rem' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {f.desc}
              </p>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {f.tags.map(t => (
                  <span key={t} style={{
                    fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)',
                    background: 'rgba(52,211,153,0.1)', color: 'var(--accent)',
                    border: '1px solid rgba(52,211,153,0.15)',
                  }}>{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
