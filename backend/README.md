# ViVu AI Backend

Express + TypeScript + Prisma/PostgreSQL. Hướng dẫn đầy đủ, API contract và kết quả kiểm tra:
[Hoan – backend core/auth/places](../docs/HOAN-BE-CORE.md).

```powershell
npm ci
Copy-Item .env.example .env  # Chỉ khi chưa có .env; điền giá trị local riêng
npm run prisma:generate
# Chỉ sau khi xác nhận DATABASE_URL và DIRECT_URL là PostgreSQL local/test:
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Bắt buộc cấu hình `JWT_SECRET` riêng ít nhất 32 bytes. `npm run build` rồi `npm start` chạy bản biên dịch.
`npm run typecheck`, `npm test` kiểm tra code và HTTP contract; test dùng Prisma double, không kết nối database.
Giữ nguyên migration ban đầu và toàn bộ quan hệ của Thành viên B/trưởng nhóm.
Không dùng `prisma db push` hoặc `migrate reset` để cập nhật database có dữ liệu.

Các routes cộng đồng/thống kê có sẵn được giữ nguyên: `/api/reviews`, `/api/suggestions`,
`/api/reports`, `/api/admin/stats`. Các routes này còn cần trưởng nhóm gắn middleware phân quyền
trước khi triển khai chung. Routes mới `/api/auth`, `/api/places`, `/api/users` đã áp dụng quyền theo contract bàn giao.

`POST /api/places/reset-seed` (admin) khôi phục 16 địa điểm mẫu trên DB local/test; giữ ID, quan hệ, dữ liệu người dùng và chỉ số review hiện có. Nút Khôi phục mẫu gốc trong Admin gọi endpoint này. Không chạy trên DB remote hoặc production.
