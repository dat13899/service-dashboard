import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, useScroll, useTransform } from 'motion/react';
import GlitchText from '../../components/GlitchText';
import WireframeSphere from '../../components/WireframeSphere';
import AIBadge from '../../components/AIBadge';

const TAGS = ['Node.js', 'Cloudflare', 'Minecraft', 'RAG', 'AI'];

export default function HeroSection({ displayedText, scrollTo }) {
  const { scrollY } = useScroll();
  const sphereScale = useTransform(scrollY, [0, 400], [1, 0.3]);
  const sphereOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const fireConfetti = useCallback(() => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6, x: 0.5 }, colors: ['#34d399', '#10b981', '#fff', '#6ee7b7'] });
  }, []);

  return (
    <motion.section style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '4rem 1.5rem 2.5rem', minHeight: '100dvh',
      position: 'relative', overflow: 'hidden', opacity: heroOpacity,
    }}>
      {/* Grid background */}
      <div className="grid-bg" />

      {/* 3D Wireframe Sphere — góc phải */}
      <motion.div style={{
        position: 'absolute', right: '-40px', top: '15%',
        scale: sphereScale, opacity: sphereOpacity,
        pointerEvents: 'none',
      }}>
        <WireframeSphere width={240} height={240} color="rgba(52,211,153,0.35)" opacity={0.5} />
      </motion.div>

      {/* Second smaller sphere — góc trái */}
      <motion.div style={{
        position: 'absolute', left: '-30px', bottom: '20%',
        scale: sphereScale, opacity: sphereOpacity,
        pointerEvents: 'none',
      }}>
        <WireframeSphere width={160} height={160} color="rgba(16,185,129,0.25)" speed={0.008} opacity={0.35} />
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ maxWidth: 700, padding: '0 1rem', position: 'relative', zIndex: 1 }}
      >
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ marginBottom: '0.75rem' }}
        >
          <AIBadge />
        </motion.div>

        {/* Glitch title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ marginBottom: '0.25rem' }}
        >
          <GlitchText
            text="BT DAT"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
              color: 'var(--text-strong)',
            }}
          />
        </motion.div>

        {/* Typing tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ minHeight: '2rem', marginBottom: '0.5rem' }}
        >
          <span style={{
            color: 'var(--text-dim)', fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)',
          }}>
            {displayedText}
            <span style={{
              display: 'inline-block', width: 2, height: '1.1em',
              background: 'var(--accent)', marginLeft: 2, verticalAlign: 'text-bottom',
              animation: 'blink 0.8s steps(1) infinite',
            }} />
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: 500, margin: '0 auto 1.5rem' }}
        >
          Minecraft server, AI agent, và các self-hosted service chạy 24/7.
        </motion.p>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}
        >
          {TAGS.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.08, duration: 0.3 }}
              style={{
                background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-full)',
                padding: '0.15rem 0.7rem', fontSize: '0.7rem', fontWeight: 500,
                cursor: 'default',
              }}
              whileHover={{ scale: 1.1, boxShadow: '0 0 12px rgba(52,211,153,0.5)' }}
            >{t}</motion.span>
          ))}
        </motion.div>

        {/* CTA with confetti */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <motion.a
            href="/dashboard"
            onClick={(e) => { e.preventDefault(); fireConfetti(); setTimeout(() => window.location.href = '/dashboard', 300); }}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--green))',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 1.8rem', fontWeight: 700, textDecoration: 'none',
              display: 'inline-block', fontSize: '0.95rem', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(52,211,153,0.3)',
            }}
            whileHover={{
              scale: 1.06,
              boxShadow: '0 0 35px rgba(52,211,153,0.5)',
            }}
            whileTap={{ scale: 0.96 }}
          >
            Dashboard <span style={{ marginLeft: 6 }}>→</span>
          </motion.a>
        </motion.div>

        {/* Anchor links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          style={{ marginTop: '1.2rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
        >
          {[
            { label: 'Services', target: 'services-section' },
            { label: 'AI', target: 'ai-section' },
            { label: 'Stack', target: 'stack-section' },
            { label: 'Contact', target: 'contact-section' },
          ].map(link => (
            <button key={link.target} onClick={() => scrollTo(link.target)} style={{
              background: 'transparent', border: 'none', color: 'var(--text-dim)',
              fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline',
              textUnderlineOffset: 3, opacity: 0.7, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.opacity = '0.7'; }}
            >{link.label}</button>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
