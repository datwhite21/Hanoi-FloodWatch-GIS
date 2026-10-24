# KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)
*Chi tiết đầy đủ: xem tại [docs/ARCHITECTURE.md](file:///c:/Users/ADMIN/Documents/PTTKPM/PTTKPM25-26_ClassN05_Nhom-21/Documents/Hanoi-FloodWatch-GIS/docs/ARCHITECTURE.md)*

## TỔNG QUAN KIẾN TRÚC 3 TẦNG
1. **Presentation Tier (Frontend):** React 18, Vite, TypeScript, Leaflet, Tailwind CSS, Recharts -> Triển khai trên **Cloudflare Pages**.
2. **Application Tier (Backend):** Node.js LTS, Express.js, TypeScript, PostGIS Spatial Engine, JWT Auth, Zod -> Triển khai trên **Render Web Service**.
3. **Data Tier (Database):** PostgreSQL 15+ tích hợp PostGIS 3.x, GiST Spatial Indexing, Row Level Security -> Triển khai trên **Supabase Cloud**.
