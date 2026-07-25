# Plan: Tích hợp Taste Skill vào btdat.io.vn

**Ngày:** 2026-07-25  
**Nguồn:** https://www.tasteskill.dev + https://github.com/Leonxlnx/taste-skill  
**Skill chọn:** `redesign-existing-projects` (audit-first) + tham khảo `design-taste-frontend`

---

## Tổng quan

Taste Skill là bộ SKILL.md cho AI agents, giúp tạo frontend có "gu" thay vì "slop" (nhàm chán, generic).  
Với btdat.io.vn đã có sẵn, dùng `redesign-existing-projects` — protocol: **Scan → Diagnose → Fix**, không đập đi xây lại.

---

## Pha 1: Audit toàn bộ site theo Taste Skill checklist

Chạy audit 8 nhóm vấn đề từ `redesign-existing-projects`, so sánh với codebase hiện tại:

### 1.1 Typography Audit
| Rule | Check btdat.io.vn | Status |
|------|-------------------|--------|
| Font có character (không Inter mặc định) | Đang dùng `Inter`, `JetBrains Mono` trong tokens.css | ⚠️ Weak — Inter là font bị Taste cấm làm default |
| Headline presence | Các headline home dùng gradient text + font-weight 800 | ⚠️ OK nhưng thiếu tracking tùy chỉnh |
| Body max-width ~65ch | DashboardPage text tràn, không có max-width | ❌ |
| 4+ font weights | tokens.css có `Inter 400,500,600,700` | ✅ |
| Mono cho số | Đã có `--font-mono: JetBrains Mono` | ✅ |
| text-wrap: balance | Không có ở đâu | ❌ |
| Orphan words | Không check | ❌ |

### 1.2 Color & Surfaces Audit
| Rule | Check | Status |
|------|-------|--------|
| Không dùng `#000` pure | `--surface-dark: #111827` ← OK, nhưng `#000` có thể xuất hiện ở vài chỗ | ⚠️ Cần scan |
| Max 1 accent color | Đang dùng `var(--accent)` + `var(--accent-1)`, `var(--accent-2)` | ❌ 3 accent colors |
| Không AI purple/blue gradient mặc định | Màu accent hiện tại là purple (#818cf8) | ❌ Lila Rule bị vi phạm |
| Gray family nhất quán | `--glass-bg: rgba(30,30,35,0.85)` warm dark, nhưng vài chỗ `#111827` (Tailwind gray) | ⚠️ Mixed |
| Shadow tinted (không pure black) | `--glass-shadow: rgba(0,0,0,0.3)` ← pure black | ❌ |
| Texture / noise overlay | Chưa có | ❌ |
| Inconsistent lighting | Chưa audit | ❌ |

### 1.3 Layout Audit
| Rule | Check | Status |
|------|-------|--------|
| Không mọi thứ centered | Hero centered ← OK cho landing, nhưng variant=7 cần asymmetry | ⚠️ |
| Không 3-card feature row | Dashboard stats bar dùng 3 flex card | ❌ Cần diversify |
| `min-h-dvh` thay vì `h-screen` | HeroSection: `min-Height: '100vh'` ← cần sửa thành `100dvh` | ❌ |
| Max-width container | `maxWidth: 1000` cho section ← hơi hẹp, nên 1200-1400 | ⚠️ |
| Button bottom-aligned trong card | ServiceCard: buttons ở giữa, không pin bottom | ⚠️ |
| Border-radius nhất quán | `radius-sm`, `radius-full` hỗn hợp | ⚠️ |
| No overlap/depth | Trang phẳng, không có layering | ❌ |
| Dashboard dùng sidebar trái | Không có sidebar, dùng top nav + tabs ← OK | ✅ |

### 1.4 Interactivity & States Audit
| Rule | Check | Status |
|------|-------|--------|
| Hover states trên buttons | Navbar có, Dashboard ServiceCard không có hover riêng | ⚠️ |
| Active/pressed feedback | Chỉ CTA hero có `translateY(-2px)`, các button khác không | ❌ |
| Transitions 200-300ms | Rất ít transition | ❌ |
| Focus ring | Gần như không có | ❌ |
| Skeleton loader (không spinner) | Dashboard có skeleton rồi | ✅ |
| Empty state đẹp | Có `.empty-state` với icon + text | ✅ |
| Active nav link | Navbar có pillSlide indicator | ✅ |
| scroll-behavior: smooth | /documents không có smooth scroll | ⚠️ |

### 1.5 Content Audit
| Rule | Check | Status |
|------|-------|--------|
| Không "John Doe" | OK | ✅ |
| Không AI buzzwords ("Seamless", "Unleash") | Cần audit copy trên toàn site | ⚠️ |
| Không Title Case everywhere | Cần audit | ⚠️ |

### 1.6 Component Patterns Audit
| Rule | Check | Status |
|------|-------|--------|
| Card không chỉ là border+shadow+white | Đang dùng `.card` class với glass border | ✅ |
| Không chỉ filled + ghost button | Có `.btn-primary`, `.btn-glass`, `.btn-danger` ← 3 variants | ✅ |
| Không accordion FAQ | Không có | ✅ |
| Modal có dùng quá nhiều không | DashboardPage dùng modal cho Add/Edit ← OK | ✅ |
| Avatar không chỉ circle | Không có avatar | N/A |

### 1.7 Code Quality
| Rule | Check | Status |
|------|-------|--------|
| Semantic HTML | DashboardPage dùng `<div>` cho tất cả, not `<section>` | ❌ |
| Không inline style mixed class | **Toàn bộ site dùng inline styles + class** ← vấn đề lớn | ❌ |
| Pixel width → relative units | Dashboard có 200px, 300px hardcoded | ❌ |
| Alt text | Chưa audit icon/logo | ⚠️ |
| z-index scale | `zIndex: 9999` trên modal ← bị cấm | ❌ |
| Import không có thật | Cần check | ⚠️ |
| Meta tags | Đã có trong index.html | ✅ |

### 1.8 Strategic Omissions
| Rule | Check | Status |
|------|-------|--------|
| Legal links (privacy, terms) | Không có trong footer | ❌ |
| "Back" nav | Documents có back khi drill-down? | ⚠️ |
| Custom 404 | Cần check server.js | ⚠️ |
| "Skip to content" | Không có | ❌ |

---

## Pha 2: Fix theo priority (từ Taste Skill)

Fix priority của Taste Skill, áp dụng cho btdat.io.vn:

### Priority 1: 🔥 Font swap (impact cao nhất, rủi ro thấp nhất)
- Bỏ `Inter`, đổi sang `Geist` + `Geist Mono` (recommended pairing của Taste Skill)
- Giữ `JetBrains Mono` cho code/mono
- Cập nhật `tokens.css`

### Priority 2: 🔥 Color palette cleanup
- Giảm từ 3 accent colors → 1 (giữ accent chính, bỏ `--accent-1`, `--accent-2` hoặc rename)
- Đổi từ AI purple (#818cf8) → 1 màu accent khác (Emerald, Electric Blue, hoặc Deep Rose)
- Tint shadow theo màu nền (không dùng `rgba(0,0,0,...)`)
- Thêm grain/noise overlay toàn site

### Priority 3: Hover & active states
- Thêm `:active` feedback (`scale(0.98)` hoặc `translateY(1px)`) cho tất cả buttons
- Thêm transition 200-300ms mặc định
- Focus ring accessible

### Priority 4: Layout & spacing fixes
- `min-height: 100vh` → `100dvh` (iOS Safari fix)
- `maxWidth: 1000` → `1200-1400`
- Thêm optical overlap/layering (không phẳng)
- Asymmetry cho một vài section (variant=7)

### Priority 5: Component upgrades
- Dashboard stats bar: 3 flex card → layout đa dạng hơn
- ServiceCard: pin buttons bottom
- Thêm "Trusted by" / logo section cho HomePage

### Priority 6: States (loading, empty, error)
- Đã có skeleton + empty state → ok
- Thêm error boundary component

### Priority 7: Polish
- `text-wrap: balance` cho headlines
- Smooth scroll toàn site
- `leading-[1.1]` cho italic descender clearance (nếu dùng italic)
- Bỏ `z-index: 9999`, lập z-index scale trong tokens.css

---

## Pha 3: Tạo Hermes skill từ Taste Skill

Lưu `redesign-existing-projects` + các rule quan trọng từ `design-taste-frontend` thành Hermes skill để reuse.

### 3.1 Save as Hermes skill
- Tạo skill `taste-redesign` chứa nội dung từ `redesign-existing-projects/SKILL.md`
- Tạo skill `taste-design` chứa tóm tắt các rule không trùng lặp từ `design-taste-frontend/SKILL.md` (phần khác biệt: 3 dials, brief inference, anti-default discipline, dependency verification, shape consistency lock, layout discipline)

### 3.2 Workflow sau này
- Mỗi lần audit UI → skill_view("taste-redesign") → chạy checklist
- Mỗi lần tạo component mới → skill_view("taste-design") → kiểm tra các rule

---

## Implementation Order

1. **Pha 1** (hôm nay): Audit toàn bộ site, ghi kết quả vào file audit
2. **Pha 3** (hôm nay): Tạo Hermes skill từ Taste Skill
3. **Pha 2 - Priority 1** (font swap): 15 phút
4. **Pha 2 - Priority 2** (color cleanup): 30 phút
5. **Pha 2 - Priority 3** (states): 20 phút
6. **Pha 2 - Priority 4-7** (layout + polish): 45 phút

**Tổng thời gian ước tính: ~2.5h**

---

## Risk Assessment

- Font swap: thay đổi visual toàn site, cần kiểm tra trên tất cả page → ✅ Rủi ro thấp, dễ revert
- Color cleanup: ảnh hưởng đến tất cả component dùng `var(--accent)` → ⚠️ Rủi ro trung bình, cần test kỹ
- Layout changes: có thể break responsive → ⚠️ Test trên mobile + desktop
- z-index scale: cần audit tất cả z-index hiện tại → ✅ Rủi ro thấp

---

## Success Metrics

Sau khi hoàn thành:
- [ ] 0 lỗi trong Taste Skill audit checklist
- [ ] Font không còn là Inter
- [ ] 1 accent color duy nhất (không phải purple)
- [ ] `100dvh` thay vì `100vh`
- [ ] Shadow tinted thay vì pure black
- [ ] z-index có scale rõ ràng
- [ ] Tất cả buttons có hover + active + focus states
- [ ] `text-wrap: balance` trên headlines
- [ ] Semantic HTML (`<section>`, `<nav>`, `<main>`) thay thế `<div>`
