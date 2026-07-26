# Mobile UX Upgrade — btdat.io.vn

> **Goal:** Nâng cấp toàn diện trải nghiệm mobile: bottom nav, gestures, safe-area, bottom sheets, PWA.

**Architecture:** Thay thế hamburger-menu desktop-first bằng bottom tab bar kiểu iOS/Telegram. 
Thêm gesture navigation, pull-to-refresh, haptic feedback. Tất cả dùng React + Motion + touch events native, 
không framework UI nặng.

**Tech Stack:** React 19, Motion, @use-gesture/react, CSS safe-area, PWA manifest

---

## Global Constraints

- Bottom nav trên mobile thay thế top hamburger menu
- 44px min tap target cho mọi interactive element trên mobile
- env(safe-area-inset-*) cho iPhone notch/Dynamic Island
- 3D scene giảm particle count + DPR trên mobile
- Giữ nguyên desktop UX (top nav), chỉ thay đổi qua CSS media query
- Phosphor icons hoặc SVG inline thay Font Awesome (giảm bundle)

---

## Task 1: Install @use-gesture/react + configure

**Files:** `frontend/package.json`

- `npm install @use-gesture/react` → gesture lib cho swipe, drag, pinch

## Task 2: Safe-area CSS tokens + mobile breakpoint system

**Files:**
- Modify: `frontend/src/styles/tokens.css` — thêm safe-area tokens, viewport units
- Modify: `frontend/src/styles/utilities.css` — thêm mobile-first utility classes
- Modify: `frontend/src/styles/components.css` — thêm mobile component overrides

Thêm CSS custom properties:
```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --bottom-nav-height: calc(56px + var(--safe-bottom));
  --tap-target-min: 44px;
}
```

## Task 3: Bottom Navigation Bar component

**Files:**
- Create: `frontend/src/components/BottomNav.jsx`
- Modify: `frontend/src/components/layout/AppLayout.jsx` — render BottomNav conditionally
- Modify: `frontend/src/components/Navbar.jsx` — ẩn trên mobile (đã có media query)

Bottom tab bar kiểu iOS:
- 4-5 tabs: Home, Dashboard, Documents, Utilities, More
- Active indicator pill trượt animation
- Badge dots cho notifications
- Fixed bottom, safe-area aware
- Glass background blur
- Chỉ hiện trên mobile (`@media max-width: 768px`)

## Task 4: Bottom Sheet component

**Files:**
- Create: `frontend/src/components/BottomSheet.jsx`
- Modify: `frontend/src/pages/HomePage.jsx` — thay ConfirmModal bằng BottomSheet
- Modify: `frontend/src/pages/DashboardPage.jsx` — dùng BottomSheet cho action menu

Kiểu iOS action sheet:
- Slide-up từ bottom, drag handle
- Backdrop blur overlay
- Tap outside để dismiss
- Drag down để dismiss (gesture)
- 2 modes: list (action sheet) và content (custom children)

## Task 5: Pull-to-refresh hook

**Files:**
- Create: `frontend/src/hooks/usePullToRefresh.js`

Custom hook dùng touch events:
- Touch start/move/end handler
- Rubber-band resistance
- Spinner indicator khi pull đủ ngưỡng
- Callback onRefresh
- Debounce chống trigger kép

## Task 6: Swipe back navigation

**Files:**
- Create: `frontend/src/hooks/useSwipeBack.js`

Dùng @use-gesture/react:
- Swipe right từ edge trái → go back
- Visual indicator (icon mũi tên) fade-in khi swipe
- Threshold 80px, velocity > 0.3 → trigger navigation

## Task 7: Haptic feedback utility

**Files:**
- Create: `frontend/src/hooks/useHaptic.js`

```js
// navigator.vibrate wrapper
light() → [10]
medium() → [20]  
heavy() → [30]
success() → [10, 50, 20]
error() → [50, 100, 50]
```

## Task 8: Mobile-optimize all pages

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx` — giảm 3D particles trên mobile, padding mobile-friendly
- Modify: `frontend/src/pages/DashboardPage.jsx` — single-column layout, bottom sheet actions
- Modify: `frontend/src/pages/DocumentsPage.jsx` — full-width reader, floating search
- Modify: `frontend/src/pages/UtilitiesPage.jsx` — grid mobile 2-col
- Modify: `frontend/src/components/Scene3D.jsx` — detect mobile, giảm DPR + particles
- Modify: `frontend/src/components/TerminalContact.jsx` — mobile font-size smaller
- Modify: `frontend/src/components/NeuralNodes.jsx` — mobile single column

CSS approach:
- `@media (max-width: 768px)` cho layout mobile
- Padding bottom thêm `var(--bottom-nav-height)` để không bị bottom nav che
- 44px min-height cho buttons/inputs/tap targets
- Text input 16px font-size để không bị iOS zoom
- Cards full-width, no horizontal scroll

## Task 9: PWA enhancements

**Files:**
- Create: `public/manifest.json` — PWA manifest với icons
- Create: `public/assets/icon-192.png` — PWA icon (SVG inline trong manifest)
- Modify: `frontend/index.html` — thêm meta tags PWA (apple-mobile-web-app, theme-color)

```json
{
  "name": "btdat.io.vn",
  "short_name": "btdat",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e17",
  "theme_color": "#00d4ff",
  "icons": [...]
}
```

## Task 10: Build + deploy

- `cd frontend && npm run build`
- Restart server
- Verify mobile trên Chrome DevTools device mode
- Kiểm tra: bottom nav, swipe, pull-to-refresh, safe-area, PWA installable
