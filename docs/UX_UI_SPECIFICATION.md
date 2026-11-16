# TÀI LIỆU THIẾT KẾ UX/UI - DỰ ÁN VIVU AI
> **Hệ thống hỗ trợ lập lịch trình du lịch thông minh Đà Nẵng - Hội An**  
> Nền tảng: React Native (Expo) cho Mobile & React (Vite) cho Admin Web

---

## 1. Bảng màu & Phong cách thiết kế (Design Tokens)

- **Phong cách:** Hiện đại, tối giản, du lịch trải nghiệm (Modern Clean Travel UI).
- **Màu chủ đạo (Primary Brand):**
  - `Primary Blue` (`#2563EB` / `#0EA5E9`): Màu của biển Đà Nẵng, trời xanh, công nghệ AI thông minh.
  - `Accent Amber/Orange` (`#F59E0B` / `#EA580C`): Màu của đèn lồng phố cổ Hội An, tạo sự ấm áp, truyền thống.
  - `Success Emerald` (`#10B981`): Hiển thị trạng thái hoạt động, GPS gần bạn, giá hợp lý.
  - `Dark Surface` (`#0F172A` / `#1E293B`): Hỗ trợ Dark Mode và tương phản cao trên bản đồ.

---

## 2. Kiến trúc thông tin & Điều hướng (Navigation Flow)

### 2.1. Cấu trúc Bottom Tab (Mobile App)
1. **Tab 1: Khám phá (`Home / Explore`)**: Tìm kiếm địa điểm, chọn nhanh Đà Nẵng/Hội An, danh mục (Ăn uống, Biển, Check-in, Văn hóa), địa điểm quanh tôi theo GPS.
2. **Tab 2: Tạo lịch (`AI Planner`)**: Form nhập tham số tạo lịch trình thông minh (Số ngày, số người, sở thích dạng chip, ngân sách).
3. **Tab 3: Lịch trình (`My Trips`)**: Danh sách lịch trình đã lưu, chi tiết theo ngày kèm bản đồ ghim số và lộ trình nối liền.
4. **Tab 4: Quét AI (`Vision Scanner`)**: Chụp ảnh món ăn / danh lam thắng cảnh để AI nhận diện và gợi ý điểm đến tương ứng.
5. **Tab 5: Tài khoản (`Profile`)**: Thông tin cá nhân, cài đặt ngôn ngữ, quyền Admin (nếu có role Admin).

---

## 3. Đặc tả chi tiết 5 màn hình chính

### 3.1. Màn hình 1: Khám phá & Quanh bạn (Home & GPS)
- **Header:** Lời chào, nút chuyển đổi khu vực nhanh (`[Đà Nẵng] [Hội An]`), thanh tìm kiếm (`SearchBar`).
- **Category Chips:** `Tất cả`, `Ẩm thực 🍜`, `Bãi biển 🏖️`, `Check-in 📸`, `Văn hóa 🏮`, `Cà phê ☕`.
- **Hero Card:** Call-to-Action "Tạo lịch trình AI trong 5 giây" dẫn thẳng tới Tab 2.
- **Section Điểm nổi bật:** Dạng Carousel hoặc Grid 2 cột: Ảnh đại diện, tên, số sao đánh giá, giá trung bình.
- **Section Quanh tôi (GPS):** Lấy vị trí thực bằng `expo-location`, tính khoảng cách bằng công thức Haversine:
  - Hiển thị nhãn: `Cách 450m`, `Cách 1.2km`.
  - Sắp xếp từ gần nhất đến xa nhất.

### 3.2. Màn hình 2: Lập lịch trình thông minh (AI Planner)
- **Bước 1 (Khu vực):** Radio chọn `Đà Nẵng` / `Hội An` / `Cả hai nơi`.
- **Bước 2 (Thời gian & Quy mô):** 
  - Chọn số ngày: `1 Ngày`, `2 Ngày`, `3 Ngày`, `4 Ngày`.
  - Chọn số người: `1 người (Solo)`, `2 người (Cặp đôi)`, `Nhóm bạn`, `Gia đình`.
- **Bước 3 (Sở thích):** Chip đa lựa chọn (`Multi-select chips`):
  - 🍜 Ẩm thực đặc sản
  - 📸 Sống ảo / Check-in
  - 🏖️ Tắm biển & Nghỉ dưỡng
  - 🏮 Văn hóa & Di tích lịch sử
  - ☕ Cà phê view đẹp
- **Bước 4 (Ngân sách):** Slider hoặc Preset buttons (`1.000.000đ` - `10.000.000đ`).
- **Nút hành động:** "Vivu AI, Tạo Lịch Trình Ngay!" kèm hiệu ứng loading spinner và trạng thái chờ thông minh.

### 3.3. Màn hình 3: Chi tiết lịch trình & Bản đồ tương tác
- **Phần trên (MapView):**
  - Bản đồ chiếm 40% chiều cao màn hình.
  - Render các `<Marker>` đánh số thứ tự `1, 2, 3...` theo thứ tự tham quan trong ngày.
  - Nối các điểm bằng `<Polyline>` (hoặc đường OSRM).
  - Nút overlay: `Dẫn đường Google Maps` (gọi `Linking.openURL`).
- **Phần dưới (Timeline Card List):**
  - Tab chọn ngày: `Ngày 1 (Đà Nẵng)` | `Ngày 2 (Hội An)`.
  - Mỗi thẻ địa điểm gồm:
    - Số thứ tự và mốc giờ: `07:30 - 08:30`.
    - Tên địa điểm & ghi chú của AI (ví dụ: *"Ăn sáng mì ếch Bà Mua"*).
    - Ước tính chi phí cá nhân.
    - Nút đổi thứ tự nhanh: `[▲ Lên]` và `[▼ Xuống]` (thay thế an toàn cho thư viện kéo thả dễ lỗi).
- **Thanh thao tác cố định:** Nút `Lưu lịch trình`, Nút `Xuất PDF`.

### 3.4. Màn hình 4: Nhận diện món ăn & Địa điểm qua ảnh (Vision Scanner)
- **Khung Camera / Viewfinder:** 
  - Nút bấm `Chụp ảnh` (`expo-image-picker`) hoặc `Chọn ảnh từ máy`.
  - Xử lý nén ảnh còn tối đa 1024px bằng `expo-image-manipulator` trước khi gửi lên Backend.
- **Khối kết quả AI:**
  - Tên món ăn / di tích nhận diện được (ví dụ: *"Mì Quảng Ếch"*, *"Cầu Vàng Bà Nà"*).
  - Mức độ tin cậy: `96% Độ chính xác`.
  - Mô tả ngắn gọn về nguồn gốc & hương vị.
- **Liên kết cơ sở dữ liệu:**
  - Tự động tìm các quán/địa điểm có món này trong Database hệ thống.
  - Nút `+ Thêm vào lịch trình hôm nay`.

### 3.5. Màn hình 5: Trang quản trị Admin Web
- **Bảng điều khiển (Dashboard):** 
  - Tổng số địa điểm (`Đà Nẵng` / `Hội An`).
  - Tổng số lịch trình đã tạo.
  - Tổng số lượt gọi AI API & tỷ lệ thành công.
- **Bảng quản lý địa điểm (Places Management):**
  - Lọc theo khu vực (`danang` / `hoian`).
  - Thêm / Sửa / Xóa địa điểm.
  - Switch Toggle: `Bật / Tắt` (Nếu quán tạm đóng cửa, tắt đi thì AI sẽ không bốc vào prompt).
- **Quản lý người dùng & Đánh giá:** Khóa tài khoản vi phạm, duyệt ảnh phản cảm.

---

## 4. Nguyên tắc phản hồi trạng thái & Trải nghiệm người dùng (UX Guidelines)
1. **Trạng thái AI đang xử lý (Loading State):** Hiển thị animation quay vòng cùng các câu trích dẫn thú vị (ví dụ: *"Đang chọn quán mì ngon nhất cho bạn..."*, *"Đang tính cung đường ngắn nhất..."*), tránh để màn hình đơ quá 5 giây.
2. **Khách vãng lai (Guest Mode):** Cho phép xem toàn bộ địa điểm, bản đồ, GPS và thử tạo lịch trình 1 lần; chỉ hiện modal đăng nhập khi người dùng bấm "Lưu lịch trình" hoặc "Yêu thích".
3. **Phản hồi lỗi mạng:** Nếu mất kết nối, hiển thị thông báo nhẹ và tự động đọc dữ liệu lịch trình đã lưu từ bộ nhớ máy (`AsyncStorage`).
