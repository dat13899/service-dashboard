# Plan: Homepage "Command Center" — Đập đi xây lại

**Ngày:** 2026-07-26
**Triết lý:** Một trang duy nhất, cuộn xuống kể chuyện. 3D background + narrative sections.

---

## 🔥 Concept mới
**"Command Center"** — Giao diện như trung tâm điều khiển AI.
- Background: React Three Fiber với floating geometry + particles
- Sections: Full-height, mỗi section 1 câu chuyện
- Scroll narrative: Text reveal + parallax depth

---

## So sánh: Cũ vs Mới

| Khía cạnh | Hiện tại (chán) | Mới (wow) |
|-----------|----------------|-----------|
| Background | Grid tĩnh | **3D scene** — torus knots, icosahedrons, particles floating |
| Hero | Title gradient + typing | **Cinematic hero** — chữ xuất hiện từng từ, 3D objects respond to mouse |
| Services | Cards grid | **Neural nodes** — service hiển thị như node trong mạng neural, connected lines |
| Stats | Số count-up | **Live dashboard** — real-time counters với micro-interactions |
| AI | 3 cards grid | **Feature spotlight** — mỗi feature full-width, scroll horizontal |
| Footer | Links | **Terminal-style** — giao diện dòng lệnh |

---

## Tech Stack Mới

| Library | Size | Dùng cho |
|---------|------|----------|
| `@react-three/fiber` | ~40KB | React renderer cho Three.js |
| `@react-three/drei` | ~30KB | Helper: OrbitControls, Float, Text3D |
| `three` | ~120KB | Engine 3D |
| `motion` | Đã có | Page transitions, text reveal |
| `lenis` | Đã có | Smooth scroll |

**Tổng thêm:** ~190KB (Three.js engine). Xứng đáng cho 3D background.

---

## 5 Sections Mới (full-height narrative)

### 🎬 Section 1: "BT DAT" — Cinematic Hero
- 3D sphere với wireframe + particles bao quanh
- Title "BT DAT" split thành từng chữ xuất hiện stagger
- Subtitle typing effect dưới
- Scroll indicator mũi tên xuống

### 🕸️ Section 2: "Live Services" — Neural Network
- Service nodes hiển thị như nodes trong AI network
- Running = green pulse, Stopped = gray
- Lines kết nối giữa các nodes
- Hover node → hiện chi tiết + health

### 📊 Section 3: "Stats" — Command Dashboard
- 4 metrics cards full-width ngang
- Live counters real-time
- Background: grid + scan line effect

### 🧠 Section 4: "AI" — Feature Spotlight
- 3 features, mỗi feature 1 slide full-width
- Scroll ngang hoặc click để chuyển
- Neural network visualization đằng sau

### ⌨️ Section 5: "Connect" — Terminal Contact
- Fake terminal UI
- Gõ `ssh btdat@home-lab` → hiện contact info
- Social links dạng command output

---

## Implementation

1. Cài `three @react-three/fiber @react-three/drei`
2. Tạo `components/Scene3D.jsx` — background 3D objects + particles
3. Tạo `components/NeuralNodes.jsx` — service visualization
4. Viết lại `HomePage.jsx` từ đầu
5. Xóa các file cũ không dùng
6. Build + deploy

---

## Files Changed

| File | Action |
|------|--------|
| `components/Scene3D.jsx` | NEW |
| `components/NeuralNodes.jsx` | NEW |
| `components/TerminalContact.jsx` | NEW |
| `pages/HomePage.jsx` | REWRITE from scratch |
| `pages/home/*` | DELETE (all old sections) |
