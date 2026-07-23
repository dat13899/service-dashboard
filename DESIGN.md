# Cyber Dark Dashboard — Design Spec

> **Goal:** Cải tiến UI/UX dashboard từ basic dark theme → Cyber Dark hiện đại, mượt

## Màu sắc & Theme

```css
:root {
  --bg: #0a0e17;           /* nền tối đen xanh */
  --surface: #111827;      /* card bg */
  --surface-2: #1e293b;    /* surface phụ */
  --border: #2d3a5c;       /* border mờ */
  --border-hover: #4a5f8a; /* border khi hover */
  --accent: #6366f1;       /* gradient start (tím) */
  --accent-2: #06b6d4;     /* gradient end (xanh cyan) */
  --text: #f1f5f9;
  --text-dim: #94a3b8;
  --green: #22c55e;        /* running */
  --red: #ef4444;          /* stopped */
  --orange: #f59e0b;       /* warning */
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

## Components

### Top Bar
- Gradient underline (tím → xanh, 2px)
- Title "Service Dashboard" với chữ "Cyber" badge
- Stats: icon + số (● running, ○ stopped)
- Search bar: gradient focus, icon kính lúp

### Special Cards (Aternos, RAG)
- Gradient border
- Glow box-shadow `0 0 20px rgba(99,102,241,0.15)` khi hover
- Skeleton loading shimmer (nội dung giả lấp lánh)
- Status dot pulse animation (chạy liên tục)

### Regular Service Cards
- Width 220px grid
- Hover: scale(1.02) + border glow
- Action buttons: icon-only, tooltip
- Uptime badge góc phải

### Animations
- Stagger fade-in khi load page
- Pulse dot 2s khi service chuyển từ stopped → running
- Modal: backdrop blur + slide-in
- Button: scale(0.95) on click, 150ms ease
- Log panel: scrollbar gradient, new log fade-in

### Layout Changes
- Log panel collapsible (nút toggle góc)
- Search bar nổi bật, icon gradient
- Stats icon cho từng số
- Footer: version + dashboard uptime
