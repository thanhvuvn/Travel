# 🚀 Vivu AI Backend (Node.js + Express + TypeScript + PostgreSQL)

## 1. Cài đặt & Khởi chạy nhanh

```bash
cd backend
npm install

# Tạo file .env từ file mẫu và điền DATABASE_URL PostgreSQL của bạn
cp .env.example .env

# Tạo Prisma Client & đẩy 8 bảng lên PostgreSQL
npm run prisma:generate
npm run prisma:migrate

# Chạy server ở chế độ dev (mặc định http://localhost:4000)
npm run dev
```

## 2. Cấu trúc Database (`prisma/schema.prisma`)
Gồm đủ 8 nhóm bảng PostgreSQL:
- **Thành viên A:** `users`, `places`
- **Thành viên B:** `favorites`, `itineraries`, `itinerary_items`, `ai_logs`
- **Trưởng nhóm:** `reviews`, `suggestions`, `reports`

## 3. Các API đã hoàn thiện (Phần Cộng đồng & Thống kê)
- `GET /api/health` — Kiểm tra trạng thái server
- `GET / POST /api/reviews`, `PATCH /api/reviews/:id/status`, `DELETE /api/reviews/:id`
- `GET / POST /api/suggestions`, `PATCH /api/suggestions/:id/approve`, `PATCH /api/suggestions/:id/reject`
- `GET / POST /api/reports`, `PATCH /api/reports/:id/resolve`
- `GET /api/admin/stats` — Thống kê tổng quan, biểu đồ 7 ngày & Top 5 địa điểm hot
