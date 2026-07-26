# Liquid Glass Redesign — btdat.io.vn

> **Goal:** Toàn bộ UI chuyển sang Liquid Glass — phong cách frosted glass cao cấp, đồng nhất, depth-aware, prismatic edge.

## Audit findings

| Page | Trạng thái hiện tại | Vấn đề |
|------|-------------------|--------|
| **HomePage** | Hero 3D + stats card glass cơ bản | Stats có blur nhưng border cứng, màu rgba cũ, chưa prismatic |
| **DashboardPage** | `glass-panel`, `glass-card` class | Class tồn tại nhưng CSS viết sơ sài, tab bar chưa glass |
| **WidgetPage** | `card card-hover` | Card đơn giản, chưa có glass gì |
| **UtilitiesPage** | `card glass-card` + inline | Mix class + inline, không đồng nhất |
| **DocumentsPage** | Toolbar + file list | Chưa glass các section chính |
| **HermesPage** | iframe trần | Không cần sửa |

## Liqui...[truncated]