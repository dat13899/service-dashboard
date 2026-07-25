# Plan: Homepage Motion System — Premium Cinematic 2025

**Ngày:** 2026-07-26
**Triết lý:** Apple.com × Linear.app × Vercel.com — mượt mà, tinh tế, không lố

---

## Stack "Xịn Xò" (chọn lọc kỹ)

| Library | Size (gzip) | Tại sao chọn |
|---------|-------------|-------------|
| **`lenis`** | ~3KB | Smooth scroll #1 thế giới. Apple/Linear/Vercel đều dùng. Không hacky, accessibility nguyên vẹn. |
| **`motion`** | ~30KB (đã có) | Animation engine. Spring physics, stagger, scroll-linked, layout animations. |
| **Custom cursor** | 0KB (Motion built-in) | Motion có cursor system (`motion.dev/docs/cursor`). Magnetic, spring-follow. |
| **Custom text reveal** | 0KB (Motion stagger) | Char/word reveal khi scroll. Không cần split-type library. |

**Tổng thêm:** ~3KB (chỉ Lenis). Motion đã có sẵn.

---

## 6 Trụ Cột "Xịn Xò"

### 🎯 1. Lenis Smooth Scroll — Nền Tảng
- **Cảm giác:** Cuộn trang như lướt trên băng — mượt, quán tính, không giật
- **Code:** `<ReactLenis root>` bọc toàn bộ app
- **Impact:** **80% cảm giác "xịn" đến từ cái này**
- Tương thích: sticky, anchor links, accessibility vẫn hoạt động

### 🖱️ 2. Custom Cursor — Magnetic Spring
- **Cảm giác:** Con trỏ custom hình tròn nhỏ, follow chuột với spring physics
- Hover link → phình to + magnetic snap vào element
- Hover text → đổi thành I-beam style
- Mặc định → dot nhỏ 12px, mờ dần khi rời trang
- **Ẩn trên mobile** (touch screen không có cursor)

### ✍️ 3. Text Reveal — Stagger Scroll
- **Cảm giác:** Từng chữ/từ sáng dần khi scroll đến (như Apple product pages)
- Hero title: char-by-char stagger 0.015s mỗi chữ
- Section headings: word-by-word fade-up khi vào viewport
- Tagline typing effect giữ lại

### 🧲 4. Magnetic Buttons + Cards
- **Cảm giác:** Button bị hút về phía con trỏ khi hover (max 8px)
- CTA "Dashboard" → magnetic + glow + confetti
- Service cards → magnetic nhẹ (max 4px)
- Dùng `useMotionValue` + `useSpring` (Motion built-in)

### 📐 5. Parallax Layers — Depth
- **Cảm giác:** Nhiều layer chuyển động ở tốc độ khác nhau khi scroll
- Grid background: scroll × 0.3
- Wireframe sphere: scroll × 0.15 (slow, tạo depth)
- Hero content: scroll × 0.5
- Stats cards: scroll × 0.8

### 🔄 6. Page Transitions — App-like
- **Cảm giác:** Chuyển trang mượt như mobile app
- Page enter: fade-up + scale 0.97 → 1, duration 0.4s
- Page exit: fade-down + scale 1 → 0.97, duration 0.25s
- `AnimatePresence` bọc `Routes`

---

## Implementation Map

```
Phase 1 (nền tảng): Lenis + Custom cursor
  └── Cài lenis, bọc App, tạo Cursor component
Phase 2 (hero): Text reveal + Parallax
  └── Viết lại HeroSection với stagger text + parallax layers
Phase 3 (cards): Magnetic + Tilt upgrade
  └── Magnetic CTA, magnetic cards
Phase 4 (pages): Transitions
  └── AnimatePresence page transitions
Phase 5: Build + deploy
```

---

## File Changes

| File | Action | Content |
|------|--------|---------|
| `components/Cursor.jsx` | NEW | Custom magnetic cursor (spring follow + hover states) |
| `components/Magnetic.jsx` | NEW | Wrapper: any child becomes magnetic to cursor |
| `components/layout/AppLayout.jsx` | MODIFY | Bọc ReactLenis, thêm Cursor |
| `App.jsx` | MODIFY | AnimatePresence page transitions |
| `pages/home/HeroSection.jsx` | REWRITE | Stagger text reveal + parallax |
| `pages/home/ServicesSection.jsx` | MODIFY | Magnetic cards |
| `package.json` | MODIFY | Thêm lenis |

---

## So Sánh Trước/Sau

| Khía cạnh | Hiện tại | Sau upgrade |
|-----------|----------|-------------|
| Scroll | Native browser scroll (giật) | **Lenis smooth** (mượt như iOS) |
| Cursor | Mặc định OS | **Custom magnetic spring dot** |
| Hero text | Static gradient | **Char-by-char stagger reveal** |
| Buttons | Hover scale 1.06 | **Magnetic attract + glow + confetti** |
| Depth | Phẳng | **3-layer parallax** (grid/sphere/content) |
| Chuyển trang | Flash trắng | **AnimatePresence fade-scale** |

---

## Risk & Fallback
- Lenis trên mobile: `lerp` cao hơn (0.1 thay vì 0.07) để không lag
- Custom cursor: ẩn trên touch device (`prefers-reduced-motion` hoặc media query)
- Parallax layers: `will-change: transform` để GPU accelerated
- Motion bundle: LazyMotion + domAnimation chỉ load khi cần
