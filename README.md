# 🌟 Vivu AI - Trợ Lý Du Lịch Thông Minh Đà Nẵng & Hội An

Ứng dụng đa nền tảng hỗ trợ lập lịch trình, khám phá điểm đến và nhận diện món ăn đặc sản tại **Đà Nẵng & Hội An** với sự đồng hành của Trí tuệ Nhân tạo (AI).

---

## 📖 1. Giới Thiệu Ứng Dụng

**Vivu AI** được xây dựng nhằm giải quyết bài toán lên kế hoạch du lịch thực tế, loại bỏ tình trạng "AI bịa địa điểm" hoặc gợi ý những quán ăn đã ngừng hoạt động. Ứng dụng kết hợp giữa dữ liệu địa phương chọn lọc, định vị GPS, camera thị giác máy tính và hệ thống đóng góp từ cộng đồng.

### ✨ Các Tính Năng Nổi Bật

- 🤖 **Lập lịch trình thông minh (AI Itinerary):** 
  - Tự động sắp xếp lịch trình từ 1 - 4 ngày dựa trên số người, sở thích và ngân sách.
  - Sử dụng cơ sở dữ liệu thật 100%, chống tình trạng AI tạo điểm đến ảo.
  - Tính toán tổng chi phí dự kiến so sánh trực quan với ngân sách.
  - Cho phép người dùng linh hoạt đổi thứ tự mốc giờ `[▲/▼]`, xóa điểm hoặc tạo lại từng ngày.

- 📍 **Khám phá & Định vị quanh bạn (GPS):**
  - Tự động tính khoảng cách thực tế đến các điểm du lịch bằng công thức Haversine.
  - Phân loại nhanh theo danh mục (Ẩm thực, Bãi biển, Văn hóa, Cà phê, Check-in).

- 🔍 **Chi tiết điểm đến & Dẫn đường:**
  - Cung cấp đầy đủ thông tin: hình ảnh, giờ mở cửa, chi phí trung bình, tọa độ GPS và văn hóa địa phương.
  - Nút **Dẫn đường** tích hợp liên kết mở trực tiếp ứng dụng Google Maps.
  - Đánh dấu danh sách **Yêu thích (Favorites)** để lưu lại các địa điểm muốn ghé thăm.

- 📸 **Nhận diện bằng hình ảnh (Vision AI):**
  - Quét ảnh món ăn đặc sản (Mì Quảng, Bánh xèo...) hoặc danh thắng (Cầu Rồng, Chùa Cầu...) với độ tin cậy cao.
  - Gợi ý câu chuyện ẩm thực và quán ăn chuẩn vị tương ứng, hỗ trợ thêm ngay vào lịch trình.

- 👥 **Đóng góp cộng đồng (Crowdsourcing):**
  - Du khách có thể **Đề xuất địa điểm mới** (quán ngon ẩn mình) gửi lên hệ thống.
  - Chức năng **Báo quán đã đóng cửa / thông tin sai** giúp hệ thống luôn cập nhật trạng thái mới nhất.

- 🛡️ **Cổng Quản trị viên (Admin Portal):**
  - Quản lý kho dữ liệu địa điểm, bật/tắt quyền AI chọn quán (`is_active`).
  - Trung tâm kiểm duyệt 3 luồng: Đánh giá người dùng, Đề xuất quán mới và Báo cáo đóng cửa (tự động ẩn quán khỏi AI khi xác nhận).
  - Biểu đồ thống kê lượt tạo lịch trình theo tuần và bảng xếp hạng địa điểm hot.

- 🌓 **Đa nền tảng & Giao diện Tối/Sáng (Dark / Light Mode):**
  - Chuyển đổi theme mượt mà toàn diện trong 0.1 giây.
  - Chạy mượt mà trên cả Android, iOS và Trình duyệt Web máy tính/laptop.

---

## 🛠️ 2. Công Nghệ Sử Dụng

- **Framework:** React Native (Expo SDK 52)
- **Ngôn ngữ:** TypeScript
- **Lưu trữ cục bộ:** `@react-native-async-storage/async-storage`
- **Icon:** `@expo/vector-icons` (Ionicons)
- **Nền tảng hỗ trợ:** Android, iOS, Web (React Native for Web)

---

## 🚀 3. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu tiên quyết
- Đã cài đặt **Node.js** (phiên bản 18 trở lên khuyến nghị).
- Đã cài đặt **npm** hoặc **yarn**.
- *(Tùy chọn khi test trên điện thoại)*: Ứng dụng **Expo Go** trên [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent) hoặc [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779).

---

### Các bước thực hiện

#### Bước 1: Mở terminal và chuyển vào thư mục ứng dụng
```bash
cd mobile
```

#### Bước 2: Cài đặt các thư viện phụ thuộc (Dependencies)
```bash
npm install
```

#### Bước 3: Khởi chạy ứng dụng

- **Cách 1: Chạy trực tiếp trên Trình duyệt Web (Khuyên dùng khi chạy thử nghiệm hoặc demo)**
  ```bash
  npm run web
  ```
  > Ứng dụng sẽ tự động mở trên trình duyệt tại địa chỉ `http://localhost:8081`.

- **Cách 2: Chạy trên Điện thoại thật bằng Expo Go**
  ```bash
  npm start
  ```
  > Mở ứng dụng **Expo Go** trên điện thoại:
  > - Android: Bấm "Scan QR code" và quét mã QR hiển thị trên terminal.
  > - iOS: Mở Camera mặc định quét mã QR để mở qua Expo Go.

---

## 🔑 4. Tài Khoản Thử Nghiệm

Ứng dụng tích hợp sẵn **bộ nút chuyển đổi quyền nhanh 1 chạm** tại màn hình đăng nhập (Tab *Cá nhân* -> Bấm *Đăng nhập*):

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Khách (Guest)** | *(Không cần)* | *(Không cần)* | Trải nghiệm toàn bộ tính năng khám phá, tạo lịch, quét ảnh |
| **Thành viên (User)** | `dukhach@vivuai.vn` | `123456` | Lưu lịch trình, yêu thích địa điểm, gửi đánh giá, đề xuất quán |
| **Quản trị (Admin)** | `admin@vivuai.vn` | `admin123` | Toàn quyền Admin Portal: Quản lý điểm, duyệt bài, xem thống kê |
