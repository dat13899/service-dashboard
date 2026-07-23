# Cyber Dark Dashboard — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax.

**Goal:** Transform dashboard UI từ basic dark theme → Cyber Dark hiện đại, mượt

**Architecture:** Sửa 2 file — `public/index.html` (frontend CSS + HTML + JS) và `server.js` (backend thêm version endpoint + dashboard uptime). Zero dependency, không cần npm install.

**Tech Stack:** Node.js (http), vanilla HTML/CSS/JS

## Global Constraints

- Zero dependency — không thêm package mới
- Giữ nguyên API backend (ko break existing endpoints)
- Màu sắc dùng CSS variables, dễ chỉnh sau
- Animation dùng CSS transitions/keyframes + requestAnimationFrame, không thư viện
- Collapsible log panel dùng CSS class toggle, ko thay đổi layout logic

---

### Task 1: Theme & CSS Variables

**Files:**
- Modify: `public/index.html` (CSS root variables, typography, gradient accent)

- [ ] **Step 1: Thay CSS variables**

Tìm `:root{...}` trong `<style>` ở index.html, thay bằng:

```css
:root{--bg:#0a0e17;--surface:#111827;--surface-2:#1e293b;--border:#2d3a5c;--border-hover:#4a5f8a;--accent:#6366f1;--accent-2:#06b6d4;--text:#f1f5f9;--text-dim:#94a3b8;--green:#22c55e;--red:#ef4444;--orange:#f59e0b;--font-ui:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--radius:10px}
```

- [ ] **Step 2: Thêm font import + body font**

Sau dòng `<title>`, thêm:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Sửa `body` font-family thành `Inter,var(--font-ui)`

- [ ] **Step 3: Gradient top-bar underline**

Sửa `.top-bar` border-bottom thành gradient:
```css
.top-bar{border-bottom:2px solid;border-image:linear-gradient(90deg,var(--accent),var(--accent-2))1}
```

Thêm class `.cyber-badge` cho title:
```css
.cyber-badge{font-size:9px;font-weight:600;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff;padding:0 6px;border-radius:4px;margin-left:4px}
```

---

### Task 2: Card Redesign

**Files:**
- Modify: `public/index.html` (special card + regular card CSS, glow, skeleton)

- [ ] **Step 1: Special card gradient border + glow**

Tìm `.special-row` section. Thêm CSS cho special cards:
```css
.special-card{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;transition:all .2s ease}
.special-card::before{content:'';position:absolute;inset:-1px;border-radius:calc(var(--radius)+1px);background:linear-gradient(135deg,var(--accent),var(--accent-2));z-index:-1;opacity:0;transition:opacity .2s ease}
.special-card:hover{border-color:transparent}
.special-card:hover::before{opacity:1}
.special-card:hover{box-shadow:0 0 24px rgba(99,102,241,0.2)}
```

- [ ] **Step 2: Skeleton loading shimmer**

Thêm CSS:
```css
@keyframes shimmer{0%{background-position:-200px 0}100%{background-position:calc(200px + 100%) 0}}
.skeleton{background:linear-gradient(90deg,var(--surface-2) 25%,var(--surface) 50%,var(--surface-2) 75%);background-size:200px 100%;animation:shimmer 1.5s infinite linear;border-radius:4px;height:14px;margin-bottom:8px}
```

- [ ] **Step 3: Status dot pulse animation**

```css
@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}
.dot.running{background:var(--green);animation:pulse-dot 2s ease-in-out infinite}
.dot.stopped{background:var(--red);animation:none}
.dot.waiting{background:var(--orange);animation:pulse-dot 1.5s ease-in-out infinite}
```

- [ ] **Step 4: Regular card hover scale + glow**

Sửa `.card` hover:
```css
.card{transition:all .2s ease}
.card:hover{transform:scale(1.02);border-color:var(--border-hover);box-shadow:0 0 16px rgba(99,102,241,0.12)}
```

- [ ] **Step 5: Custom scrollbar gradient**

```css
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--surface-2);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--border)}
```

---

### Task 3: Micro-interactions & Animations

**Files:**
- Modify: `public/index.html` (JS: stagger fade-in, tooltips, collapsible log, transitions)

- [ ] **Step 1: Stagger fade-in cho cards khi load**

Thêm JS function:
```javascript
function staggerFadeIn() {
  const cards = document.querySelectorAll('.card, .special-card');
  cards.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = `all 0.3s ease ${i * 0.05}s`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}
```
Gọi sau mỗi `render()`.

- [ ] **Step 2: Pulse dot khi service chuyển trạng thái**

Trong hàm refresh/fetch, khi phát hiện status thay đổi từ stopped → running, thêm class `pulse` tạm thời:
```javascript
function pulseDot(id) {
  const dot = document.getElementById(id + '-dot');
  if (!dot) return;
  dot.classList.add('pulse');
  setTimeout(() => dot.classList.remove('pulse'), 2000);
}
```
CSS:
```css
@keyframes pulse-on{0%{box-shadow:0 0 0 0 var(--green)}50%{box-shadow:0 0 0 6px transparent}100%{box-shadow:0 0 0 0 transparent}}
.dot.pulse{animation:pulse-on .5s ease 3}
```

- [ ] **Step 3: Collapsible log panel**

Thêm nút toggle góc phải log panel:
```html
<button onclick="toggleLog()" class="log-toggle" title="Toggle log panel">◀</button>
```
```javascript
let logCollapsed = false;
function toggleLog() {
  logCollapsed = !logCollapsed;
  document.querySelector('.col-right').classList.toggle('collapsed', logCollapsed);
  document.querySelector('.log-toggle').textContent = logCollapsed ? '▶' : '◀';
}
```
```css
.col-right.collapsed{width:40px;min-width:40px}
.col-right.collapsed .log-content,.col-right.collapsed .log-header{display:none}
```

- [ ] **Step 4: Tooltip cho action buttons**

Thêm data-title attribute cho button:
```html
<button data-title="Start" onclick="...">▶</button>
```
```css
[data-title]{position:relative}
[data-title]:hover::after{content:attr(data-title);position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);background:var(--surface-2);color:var(--text);font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap;z-index:10;pointer-events:none}
```

- [ ] **Step 5: Button scale on click**

```css
button:active{transform:scale(0.95)!important}
```

---

### Task 4: Backend Tweaks

**Files:**
- Modify: `server.js` (thêm /api/version endpoint, dashboard uptime)

- [ ] **Step 1: Thêm dashboard uptime tracking**

Ở đầu server.js, sau `const PORT`:
```javascript
const DASHBOARD_START = Date.now();
```

- [ ] **Step 2: Thêm /api/version endpoint**

Trong router, thêm:
```javascript
// Dashboard info
if (url === '/api/version') {
  res.writeHead(200, {'Content-Type': 'application/json'});
  return res.end(JSON.stringify({version:'2.0',uptime:Math.floor((Date.now()-DASHBOARD_START)/1000)}));
}
```

- [ ] **Step 3: Frontend gọi version + hiển thị footer**

Trong `<script>` của index.html, thêm:
```javascript
function loadFooter() {
  fetch('/api/version').then(r=>r.json()).then(d=>{
    document.querySelector('.footer-uptime').textContent = fmtUptime(d.uptime);
    document.querySelector('.footer-ver').textContent = 'v' + d.version;
  });
}
```
Thêm HTML footer trước `</body>`:
```html
<div class="footer" style="margin-top:auto;padding:10px 0;font-size:10px;color:var(--text-dim);display:flex;gap:12px;border-top:1px solid var(--border)">
  <span class="footer-ver"></span>
  <span>Dashboard uptime: <span class="footer-uptime">0s</span></span>
</div>
```

---

### Task 5: Final Polish & Verify

- [ ] **Step 1: Restart dashboard + kiểm tra**

```bash
# Kill dashboard process
taskkill /fi "tcp eq 3000" /f 2>/dev/null
# Start lại
cd /c/Users/datel/service-dashboard && node server.js
```

- [ ] **Step 2: Mở browser http://localhost:3000 + verify**

Check:
- Gradient top-bar underline
- Special card glow khi hover
- Pulse dot animation
- Stagger fade-in cards
- Collapsible log panel
- Tooltip action buttons
- Footer version + uptime
- Search vẫn hoạt động
- Modal add/del vẫn hoạt động
