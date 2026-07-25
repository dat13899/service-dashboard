# Plan: Homepage "Modern AI/Tech" Upgrade

**Ngày:** 2026-07-26  
**Mục tiêu:** Trang chủ nhìn hiện đại, công nghệ, AI — đủ "wow" khi F5

---

## Audit hiện tại
| Thành phần | Hiện trạng | Vấn đề |
|-----------|-----------|--------|
| Hero text | "👋 BT Dat" gradient tĩnh | Không có animation, nhìn như blog cá nhân |
| Hero bg | Blob background chung toàn site | Không có tech vibe (grid, particles) |
| Tags | Pill badge màu accent | Static, không hover effect |
| Service cards | Card glass đơn giản | Phẳng, không có depth/interaction |
| Stats | Số tĩnh "3 running, 2 stopped" | Không animated, không hấp dẫn |
| Visual | Không có 3D, không có particle, không có scroll animation | Thiếu "wow factor" |

---

## 5 Upgrades (theo thứ tự impact)

### 🔥 1. Hero Section — Cinematic Tech Vibe
- **Glitch text effect** trên "BT DAT" (CSS keyframes: RGB shift + skew)
- **Floating 3D wireframe sphere** (CSS-only, rotate infinite, dots connected) — background bên phải
- **Animated grid pattern** overlay (di chuyển chậm, opacity 0.05)
- **"AI Agent Active" badge** với pulse xanh + ripple
- **Gradient CTA button** với glow + hover particles
- Giữ typing effect + tagline

### 🔥 2. Service Cards — 3D Tilt + Glow
- **3D perspective tilt** (mousemove/touchmove → rotateX/Y card)
- **Rotating gradient border** (conic-gradient animation)
- **Stronger pulse** trên status dot + ripple lan ra
- **Hover lift** (translateY -4px + shadow mở rộng)

### 🆕 3. Live Stats Banner (mới)
- **Animated counters** (count-up từ 0 → real numbers khi scroll đến)
- 4 metrics: Services Online, Uptime, AI Requests, Active Users
- Horizontal glass bar với gradient separator

### 🆕 4. AI Features Section (mới)
- 3 cards trưng bày AI capability:
  - 🧠 Hermes Agent (tự động DevOps)
  - 📚 RAG Knowledge Base
  - 🔮 AI Tools Suite
- Neural network SVG animation
- "Powered by AI" tagline

### ✨ 5. Scroll Reveal + Polish
- Tất cả sections fade-up + slide khi scroll đến (Intersection Observer)
- Tech stack icons marquee scroll
- Footer upgraded contact links

---

## Implementation plan
- **File mới**: `components/GlitchText.jsx`, `components/FloatingGeometry.jsx`, `pages/home/AISection.jsx`, `pages/home/StatsBanner.jsx`
- **Sửa**: `HeroSection.jsx`, `ServicesSection.jsx`, `HomePage.jsx`
- **CSS**: Thêm keyframes glitch, grid, 3D tilt, count-up vào `mobile-ux.css`
- **Không thư viện ngoài**: Tất cả CSS + vanilla JS

## Risk
- 3D transform có thể lag trên mobile cũ → fallback opacity-only
- Glitch text có thể khó đọc → chỉ animate khi hover/viewport
