# Bàn giao Hoan – Thành viên A: backend core/auth/places

## Hiện trạng ban đầu và cập nhật Git

- Thư mục ban đầu được cung cấp không có `.git`; `git status --short` và `git branch --show-current` đều báo “not a git repository”. Không tạo repository mới để giả lập lịch sử nhóm. Sau khi được cung cấp URL, đã clone `https://github.com/thanhvuvn/Travel.git` vào `Travel-git`, tạo `dev` cục bộ từ `main` và chuyển sang `feat/be-core-auth-places`. Remote chỉ có `main` tại thời điểm clone; chưa commit/push.
- Đã đọc README gốc, backend/README và mobile/AGENTS.md. Giữ Express/TypeScript, Prisma 5, Expo 58 và hệ thống điều hướng hiện có theo yêu cầu không đổi framework.
- Trước sửa: backend có server, CORS mở, routes cộng đồng/thống kê; thiếu auth/users/places và middleware. Schema/migration ban đầu đã đủ User, Place và quan hệ của cả nhóm. Seed có 16 địa điểm, 5 tài khoản, cộng đồng và AI logs nhưng dùng hash giả và ghi đè một số dữ liệu.
- Frontend trước sửa: AuthContext tạo user và quyền từ email, nút chuyển quyền demo; PlacesContext dùng địa điểm/users mock; Home refresh bằng timer; thao tác admin chỉ sửa state. communityApi đã có nhưng chưa gắn JWT.

## Đã hoàn thành

- Register/login/me dùng bcrypt (cost 12), JWT HS256, issuer/audience và thời hạn 1 ngày. Email trim/lowercase; đăng ký luôn role user, bỏ qua role do client gửi. Mật khẩu 6 ký tự đến 72 bytes (giới hạn bcrypt).
- `requireAuth` đọc tài khoản từ DB mỗi request; kiểm tra tồn tại/khóa/quyền hiện tại. `requireAdmin` đặt sau `requireAuth`. Không trả password_hash qua auth hoặc users API.
- Places list/detail công khai chỉ active; admin có thể đọc cả ẩn. CRUD validate input; PUT nhận các trường được cho phép và không sửa id/rating/review_count/quan hệ. DELETE là **ẩn** (`is_active=false`), giữ toàn bộ khóa ngoại. Toggle không body dùng UPDATE nguyên tử; frontend gửi trạng thái đích để tránh đảo hai lần khi retry.
- Users chỉ admin; khóa/mở bằng trạng thái đích. Không cho khóa admin để tránh tự khóa/mất tài khoản quản trị cuối cùng.
- Seed chỉ chạy trên localhost/127.0.0.1/::1, không chạy NODE_ENV=production; kiểm tra cả DATABASE_URL và DIRECT_URL. Mật khẩu từ môi trường, hash trước khi ghi. Chạy lại chỉ thêm dữ liệu thiếu, không reset tên/quyền/trạng thái/đánh giá. Chỉ nâng cấp đúng placeholder `demo_hash_123456` của tài khoản mẫu có id/email khớp; không thay password thật. Kiểm tra xung đột ID/email trước khi ghi.
- Không thay schema/migration: các trường/quan hệ đã đủ và khớp migration ban đầu, không cần migration rỗng hoặc migration phá dữ liệu. Không chạy db push/reset/migrate/seed lên DB đã cấu hình.
- API client dùng Bearer, timeout, envelope/lỗi chung; token lưu bằng AsyncStorage (dependency có sẵn, web/mobile). Khôi phục bằng `/auth/me`, không tin role cache. Xóa session khi API báo token không hợp lệ hoặc tài khoản bị khóa. AsyncStorage không phải kho mã hóa.
- Home/Admin lấy dữ liệu thật qua PlacesContext; có tải/lỗi/rỗng/thử lại. Admin chỉ báo thành công sau khi API thành công; lỗi giữ form để sửa. Bỏ nút giả lập quyền; quên mật khẩu báo chưa hỗ trợ, không giả vờ đã gửi email.
- Theo bản Word: đã thêm `POST /api/places/reset-seed` chỉ admin, chỉ database local/test tại localhost và không ở production. Nút Khôi phục mẫu gốc có xác nhận, gọi API thật và báo kết quả sau khi thành công. Transaction upsert 16 ID mẫu khôi phục metadata/is_active, giữ rating/review_count hiện có, địa điểm tự thêm và toàn bộ quan hệ/dữ liệu người dùng. CLI seed và API dùng chung `backend/src/data/seedPlaces.ts`; import dữ liệu không chạy seed.
- communityApi dùng transport chung nhưng giữ return contract. Duyệt đề xuất chỉ gọi API duyệt (backend vốn đã tạo place), không POST place lần hai; xử lý report chờ backend thành công rồi tải lại places.

## File thay đổi/tạo mới

Backend:

- `backend/src/app.ts`, `backend/src/server.ts`: mount routes, CORS allowlist, health envelope, error middleware, kiểm tra JWT config.
- `backend/src/lib/auth.ts`, `backend/src/lib/http.ts`, `backend/src/middleware/auth.ts` (mới).
- `backend/src/routes/auth.routes.ts`, `places.routes.ts`, `users.routes.ts` (mới).
- `backend/prisma/seed.ts`, `backend/.env.example`, `backend/src/data/seedPlaces.ts` (mới, dữ liệu dùng chung).
- `backend/package.json`, `backend/package-lock.json`: bcryptjs (triển khai bcrypt), jsonwebtoken và typings cần cho auth; test script.
- `backend/tests/core.test.ts`, `backend/tsconfig.test.json` (mới): HTTP tests độc lập DB và typecheck seed.

Frontend:

- `mobile/src/services/api.ts` (mới), `mobile/src/services/communityApi.ts`.
- `mobile/src/context/AuthContext.tsx`, `mobile/src/context/PlacesContext.tsx`.
- `mobile/src/screens/AuthModal.tsx`, `HomeScreen.tsx`, `AdminScreen.tsx`.
- `mobile/.env.example` (mới), `mobile/package.json`, `mobile/package-lock.json`, `mobile/eslint.config.js` (Expo tạo khi chạy lint theo AGENTS.md).

Tài liệu: `.gitignore` (cache/test artifacts), `README.md`, `backend/README.md`, `docs/HOAN-BE-CORE.md`.
Không sửa file `.env` hiện có; không đưa secret thật vào báo cáo. Không sửa routes cộng đồng, schema hoặc các màn hình planner/itinerary/vision.

## Cấu hình và chạy

Backend `.env` (dùng `.env.example`; không ghi đè `.env` đã có):

| Biến | Ý nghĩa |
| --- | --- |
| DATABASE_URL | PostgreSQL local/test, ví dụ `postgresql://postgres:REPLACE_ME@localhost:5432/vivu_dev?schema=public` |
| DIRECT_URL | Cùng DB local; bắt buộc vì schema hiện có khai báo directUrl |
| JWT_SECRET | Secret ngẫu nhiên riêng ít nhất 32 bytes; không có default |
| PORT | 4000 |
| NODE_ENV | development hoặc test |
| CORS_ORIGINS | Các web origin cách nhau dấu phẩy, mặc định localhost:8081 và localhost:19006; không có `/api` |
| SEED_ADMIN_PASSWORD | Mật khẩu tự chọn cho admin demo |
| SEED_USER_PASSWORD | Mật khẩu tự chọn cho các users demo |
| GEMINI_API_KEY | Giữ cho Thành viên B, không cần cho phần core |

```powershell
cd backend
npm ci
# Tạo .env từ .env.example nếu chưa có, điền các giá trị riêng.
npm run prisma:generate
# CHỈ sau khi xác nhận cả hai URL trỏ database local/test dành cho dự án:
npm run prisma:migrate
npm run prisma:seed
npm run dev
# Hoặc: npm run build; npm start
```

Tài khoản mẫu: admin `admin@vivuai.vn`; user `dukhach@vivuai.vn`; user khóa sẵn `long.tran@outlook.com`. Mật khẩu theo hai biến seed trên, không hard-code. Đổi biến seed không đổi password thật của tài khoản đã tồn tại.

```powershell
cd mobile
npm ci
# Tạo .env từ .env.example nếu chưa có.
npm run web
# Hoặc npm start để chạy Expo Go trên thiết bị phù hợp SDK.
```

`EXPO_PUBLIC_API_URL` phải gồm `/api`:

- Web trên máy backend: `http://localhost:4000/api`.
- Android emulator: `http://10.0.2.2:4000/api`.
- Điện thoại thật: `http://<IP-LAN-máy-backend>:4000/api`, cùng mạng và cổng 4000 truy cập được.
- Web truy cập qua IP LAN: thêm origin thực tế, ví dụ `http://<IP-LAN>:8081`, vào CORS_ORIGINS. Native requests không có Origin được chấp nhận.
- Biến Expo public chỉ chứa URL, không chứa JWT secret hoặc DB URL. Dùng dot notation theo [tài liệu Expo](https://docs.expo.dev/guides/environment-variables/).

## API contract và thử nghiệm

Thành công `{ success: true, data: ... }`; lỗi `{ success: false, message: "..." }`.
HTTP 400 input, 401 không đăng nhập/sai credentials, 403 thiếu quyền/khóa, 404 không thấy, 409 trùng, 500 lỗi server.

| Endpoint | Quyền/body | data |
| --- | --- | --- |
| POST /api/auth/register | `{name,email,password}` | `{user,token}`, status 201 |
| POST /api/auth/login | `{email,password}` | `{user,token}` |
| GET /api/auth/me | Bearer | user an toàn |
| GET /api/places | Public; `area=danang/hoian`, `category=food/beach/checkin/culture/cafe`, `q=...` | Place[] active |
| GET /api/places?include_inactive=true | Admin Bearer | Place[] gồm ẩn |
| GET /api/places/:id | Public active; admin thêm `include_inactive=true` để đọc ẩn | Place |
| POST /api/places | Admin; bắt buộc name,type,description,image,area,category,lat,lng | Place, status 201 |
| PUT /api/places/:id | Admin; các trường cần sửa; không chấp nhận cập nhật rỗng | Place |
| DELETE /api/places/:id | Admin, ẩn và giữ quan hệ | Place |
| PATCH /api/places/:id/toggle | Admin; `{is_active:boolean}` hoặc không body để đảo | Place |
| POST /api/places/reset-seed | Admin, DB local/test; không body | `{restored_count,places}` |
| GET /api/users | Admin | User[] không hash |
| PATCH /api/users/:id/lock | Admin; `{is_locked:boolean}`, không khóa admin | User |

Ví dụ PowerShell (mật khẩu nhập tại terminal, không lưu vào source):

```powershell
$base = 'http://localhost:4000/api'
$demoPassword = Read-Host 'Mat khau admin seed'
$login = Invoke-RestMethod "$base/auth/login" -Method Post -ContentType 'application/json' -Body (@{email='admin@vivuai.vn'; password=$demoPassword} | ConvertTo-Json)
$headers = @{Authorization="Bearer $($login.data.token)"}
Invoke-RestMethod "$base/auth/me" -Headers $headers
Invoke-RestMethod "$base/places?include_inactive=true" -Headers $headers
Invoke-RestMethod "$base/users" -Headers $headers
$newPlace = @{name='Dia diem test'; type='Cafe'; description='Test local'; image=''; area='danang'; category='cafe'; lat=16.06; lng=108.22; avg_cost=30000}
$created = Invoke-RestMethod "$base/places" -Method Post -Headers $headers -ContentType 'application/json' -Body ($newPlace | ConvertTo-Json)
$id = $created.data.id
Invoke-RestMethod "$base/places/$id" -Method Put -Headers $headers -ContentType 'application/json' -Body '{"avg_cost":35000}'
Invoke-RestMethod "$base/places/$id/toggle" -Method Patch -Headers $headers -ContentType 'application/json' -Body '{"is_active":false}'
Invoke-RestMethod "$base/places/$id" -Method Delete -Headers $headers
# Sau khi lấy ID user thường từ GET /users:
# PATCH /users/<id>/lock body {"is_locked":true}, rồi thử /auth/me bằng JWT của user đó -> 403.
# Mở khóa bằng {"is_locked":false}.
```

Sau khi lấy lại bản clone có `.git`, kiểm tra status trước rồi chuyển/tạo `feat/be-core-auth-places` và đưa các file trên vào nhánh, không chép `.env`, node_modules, cache hay dist. Không tự tạo commit/push.

## Kiểm tra đã chạy

- Backend `npm run typecheck`: đạt.
- Backend `npm run build`: đạt.
- Backend `npm run prisma:generate`: đạt Prisma 5.22.
- Backend `prisma validate` từ thư mục backend: đạt (chỉ kiểm tra schema, không truy vấn DB).
- Backend `npm test`: 9 tests đạt; HTTP thực qua Express với Prisma double trong bộ nhớ. Bao gồm hash, email, role injection, JWT sai/hết hạn, admin ACL, active filter, validate, soft-delete, lock/unlock token hiện có, CORS, error envelope và reset-seed (ACL, chặn remote/production, không trùng khi chạy lại, giữ dữ liệu ngoài 16 mẫu và chỉ số review). Không thay thế kiểm thử PostgreSQL thật.
- Mobile `npm run typecheck`: đạt sau các chỉnh sửa cuối. ESLint riêng AuthContext, PlacesContext, api.ts, communityApi.ts và AdminScreen: đạt (0 lỗi/cảnh báo).
- Mobile `expo lint`: đã chạy; chưa đạt do các lỗi rules React/JSX trong code hiện có (AnimatedUI, AppDataContext, AuthModal, ItineraryScreen, SuggestPlaceModal...). Không sửa lan sang phần của thành viên khác để ép lint xanh. Expo đã thêm eslint/eslint-config-expo cần để chạy lệnh này.
- Lần đầu npm bị chặn cache ngoài workspace; đã dùng cache trong workspace và cài thành công. Không nâng framework hoặc tự động audit fix.
- `tsx --test` vướng `uv_os_get_passwd` trong sandbox Windows; script test hiện biên dịch bằng tsc rồi dùng Node test runner, đã chạy được. Dev vẫn giữ `tsx watch` theo cấu trúc dự án; có thể dùng build/start nếu gặp cùng lỗi môi trường.
- Chưa chạy migration/seed hoặc kiểm thử PostgreSQL thật: đã kiểm tra an toàn, DATABASE_URL và DIRECT_URL hiện đều trỏ remote, không xuất thông tin đăng nhập; không tìm thấy psql/docker trong PATH. Chưa kiểm thử UI trên thiết bị thật hoặc export bundle.

## Cần thống nhất trước merge

1. Đã có bản clone thật trong `Travel-git`, đang trên `feat/be-core-auth-places`, có `dev` cục bộ. Trưởng nhóm cần thống nhất/tạo nhánh tích hợp `dev` trên remote trước khi mở PR; chưa push nhánh nào.
2. Trưởng nhóm gắn `requireAuth`/`requireAdmin` cho routes cộng đồng/thống kê theo quyền phù hợp. Hiện chúng vẫn như code bàn giao ban đầu: chưa được bảo vệ, một số routes có thể tạo/ẩn Place. Vì vậy **chưa được coi toàn bộ backend đã an toàn để triển khai công khai**, dù core routes mới có ACL. Đây là điểm cần xử lý trước triển khai/merge tích hợp.
3. Phần cộng đồng/thống kê vẫn có fallback mock và optimistic updates cũ; Admin có nhãn demo rõ. Cần trưởng nhóm bỏ fallback/đồng bộ lại theo session khi tích hợp auth; transport đã gắn token, response contract không đổi.
4. Thành viên B dùng ID từ DB và chỉ dùng places active để lập lịch; favorite/itinerary/AI API vẫn là TODO hiện có. Schema/quan hệ không thay đổi. DELETE place không phá lịch trình đã lưu.
5. `/health` nay bọc service/timestamp trong `data` cho thống nhất; không tìm thấy caller frontend phụ thuộc shape cũ. `lock` và `toggle` frontend gửi boolean trạng thái đích; các caller mới cần theo contract trên.
6. Khóa tài khoản chặn JWT ngay khi khóa; mở khóa cho phép token cũ còn hạn hoạt động lại. Chưa có token version/revocation list; logout chỉ xóa token client, chưa thu hồi token bị sao chép. Nếu nhóm cần thu hồi vĩnh viễn sau khóa/logout, thống nhất migration token_version hoặc session store riêng.
7. Chạy migration/seed trên local, kiểm tra chạy seed hai lần không mất dữ liệu, thử CRUD/lock/session restore trên web/mobile trước khi merge. Lint toàn dự án còn cần nhóm thống nhất sửa các lỗi cũ.

## Đối chiếu bản Word sau yêu cầu bám sát phân công

Đã bổ sung endpoint reset-seed và nút khôi phục để đáp ứng mục II.1.4 và kịch bản demo chặng 4. Các phần Auth/Users/Places/FE core đã triển khai đúng trách nhiệm Thành viên A. Không thay phần AI/lịch trình của B hoặc routes cộng đồng của trưởng nhóm.

Cách thử bổ sung sau khi có DB local/test và admin JWT:

```powershell
Invoke-RestMethod "$base/places/reset-seed" -Method Post -Headers $headers
# Mong đợi success=true, data.restored_count=16.
# Chạy lần hai: không thêm trùng; địa điểm tự tạo và các quan hệ vẫn còn.
```

Git clone và nhánh `feat/be-core-auth-places` từ `dev` cục bộ đã hoàn tất. Tiêu chí nghiệm thu còn chờ: PostgreSQL local với seed thật; thử Postman/API thật; F5 khôi phục session và CRUD còn dữ liệu; demo Web/Mobile. Chưa commit/push và chưa tuyên bố các tiêu chí này đã đạt. Đã hỏi người dùng URL/đường dẫn bản clone và nơi cấu hình DB local/test, không yêu cầu gửi secret vào chat.
