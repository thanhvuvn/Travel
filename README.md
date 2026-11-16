# 🌟 Vivu AI - Trợ Lý Du Lịch Thông Minh Đà Nẵng & Hội An

> **Đồ án môn học: Lập trình đa nền tảng**  
> **Nhóm thực hiện:** 3 thành viên  
> **Công nghệ chính:** React Native (Expo) + Node.js (Express + Zod) + Gemini AI API

---

## 1. Giới thiệu dự án
**Vivu AI** là ứng dụng du lịch đa nền tảng kết hợp bản đồ, định vị GPS, camera và trí tuệ nhân tạo (AI) nhằm hỗ trợ du khách lên lịch trình khám phá Đà Nẵng - Hội An một cách tối ưu, tự động hóa và sát với thực tế nhất.

### Điểm nổi bật
- **Dữ liệu thật 100%:** Cơ sở dữ liệu địa phương chọn lọc với tọa độ GPS, mức giá và giờ mở cửa chính xác.
- **AI không bịa điểm:** Đưa danh sách ID địa điểm thật vào Prompt để AI sắp xếp cung đường hợp lý theo khu vực và ngân sách.
- **Bản đồ trực quan:** Hiển thị điểm đến theo số thứ tự từng ngày kèm lộ trình kết nối, tích hợp dẫn đường bằng Google Maps.
- **Nhận diện bằng hình ảnh:** Sử dụng Vision AI nhận diện món ăn đặc sản hoặc danh thắng, gợi ý điểm đến tương ứng.
- **Trang Admin Web:** Quản trị dữ liệu đầu vào cho AI, kiểm duyệt đánh giá và theo dõi số lượt tạo lịch trình.

---

## 2. Cấu trúc thư mục
```text
Travel/
├── backend/            # API Node.js (Express, JWT, Zod, Gemini AI proxy)
├── mobile/             # Ứng dụng di động React Native (Expo SDK, TypeScript)
├── admin/              # Trang Web quản trị (React + Vite + TailwindCSS)
├── docs/               # Bản đặc tả kỹ thuật, thiết kế UX/UI & DB
├── .gitignore
└── README.md
```

---

## 3. Phân chia công việc (Nhóm 3 thành viên)
- **Thành viên 1:** Phụ trách `backend/` (Database, API xác thực JWT, phân quyền, proxy bảo mật gọi Gemini AI, kiểm tra schema).
- **Thành viên 2:** Phụ trách `mobile/` (Giao diện React Native, hiển thị bản đồ, tính toán GPS Haversine, timeline lịch trình).
- **Thành viên 3:** Phụ trách `admin/` & AI (Prompt engineering, xử lý ảnh Vision AI, xây dựng trang Admin Web, kiểm thử và báo cáo).

---

## 4. Tài liệu thiết kế
- [Tài liệu thiết kế UX/UI](docs/UX_UI_SPECIFICATION.md)
