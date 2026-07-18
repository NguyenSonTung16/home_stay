# Dự án Home Stay - Quản lý Ký túc xá & Nhà trọ thông minh

Dự án này là hệ thống quản lý ký túc xá và nhà trọ (FIT 4.0) với đầy đủ Backend (Express, PostgreSQL) và Frontend (React, Vite, TailwindCSS).

## A. Hướng dẫn cài đặt và chạy dự án (Setup Guide)

Tài liệu này sẽ hướng dẫn bạn các bước chi tiết để cài đặt, cấu hình và chạy dự án Home Stay sau khi clone/pull mã nguồn về máy.

### Yêu cầu hệ thống (Prerequisites)
Để chạy được dự án, máy tính của bạn cần cài đặt sẵn:
- **Node.js** (Khuyến nghị phiên bản v18.x trở lên)
- **NPM** hoặc **Yarn** (Thường đi kèm khi cài Node.js)
- **Docker** và **Docker Compose** (Dành cho việc chạy Database PostgreSQL cục bộ)

---

### Bước 1: Khởi tạo Cơ sở dữ liệu (Database)
Dữ liệu của dự án sử dụng PostgreSQL. Cách nhanh nhất là sử dụng Docker.

1. Mở Terminal tại thư mục gốc của dự án.
2. Chạy lệnh sau để khởi động Database:
   ```bash
   docker-compose up -d
   ```
   *Lưu ý: Docker sẽ tự động nạp cấu trúc bảng từ file `database/init.sql`.*
3. Chạy lệnh nạp dữ liệu mẫu (Seed Data) vào CSDL:
   ```bash
   cd backend
   npx ts-node seed.ts
   ```
   *File `seed.ts` này sẽ thực thi trực tiếp các câu lệnh SQL từ `database/seed.sql`.*
4. **Xóa toàn bộ các phiếu đã test (Reset checkouts):**
   ```bash
   cd backend
   npm run db:reset
   ```

---

### Bước 2: Cài đặt và cấu hình Backend

1. Mở Terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Tạo file cấu hình môi trường `.env`:
   - Copy nội dung từ file `.env.example` và tạo file `.env`.
   - Nếu bạn sử dụng Docker ở Bước 1, thông số kết nối mặc định thường là:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_USERNAME=homestay_user
     DB_PASSWORD=homestay_password
     DB_NAME=homestay_db
     PORT=3000
     ```
4. Khởi động Backend server:
   ```bash
   npm run dev
   ```
   *Server sẽ chạy ở `http://localhost:3000`.*

---

### Bước 3: Cài đặt và chạy Frontend (Admin) và Frontend Client

Dự án hiện bao gồm 2 phần Frontend (Admin cho nhân viên và Client cho khách).

**Chạy Frontend Admin:**
1. Mở một cửa sổ Terminal **mới** và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(Truy cập `http://localhost:5173`)*

**Chạy Frontend Client:**
2. Mở một cửa sổ Terminal **mới** và di chuyển vào thư mục `frontend_client`:
   ```bash
   cd frontend_client
   npm install
   npm run dev
   ```
   *(Truy cập `http://localhost:5174`)*

---

## B. Thông tin Tài khoản Đăng nhập Hệ Thống (Frontend Admin)

Sau khi chạy xong lệnh nạp dữ liệu (seed) ở Bước 1, hệ thống đã cung cấp sẵn các tài khoản với từng quyền (Role) như sau (Tất cả đều dùng mật khẩu `123`):

| Quyền (Role) | Tài khoản (Username) | Mật khẩu | Quyền hạn và Hiển thị Menu |
| :--- | :--- | :--- | :--- |
| **Quản trị viên hệ thống (Admin)** | `admin` | `123` | Có toàn quyền. Nhìn thấy và truy cập được **TẤT CẢ** các tab của mọi chức năng. |
| **Quản lý (QuanLy)** | `quanly` | `123` | Chỉ có quyền xem và thao tác ở tab **Xử lý trả phòng**. |
| **Nhân viên Sale (Sale)** | `nvsale` | `123` | Chỉ có quyền xem và thao tác ở tab **Xử lý lịch hẹn**. |
| **Kế toán (KeToan)** | `ketoan` | `123` | Có quyền xem và thao tác ở tab **Xử lý hoàn cọc**. |

---

## C. Hướng dẫn thêm Tài khoản hoặc Role khác

Nếu bạn muốn tạo thêm một vai trò (Role) mới:

**Bước 1: Cập nhật cơ sở dữ liệu (`database/seed.sql`)**
1. Mở file `database/seed.sql`.
2. Thêm một câu lệnh `INSERT INTO TaiKhoan` với `VaiTro` mới.
   ```sql
   INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('letan', '123', 'LeTan', 1);
   ```
3. Khai báo nhân viên tương ứng trong `INSERT INTO NhanVien` với `MaTK` tương ứng mã vừa tạo.
4. Chạy lại lệnh `npx ts-node seed.ts` trong thư mục `backend`.

**Bước 2: Cấu hình Phân quyền ở Frontend (React)**
Để Role mới có thể nhìn thấy menu, bạn cần khai báo quyền ở 2 nơi trong thư mục `frontend`:
1. `src/App.tsx`: Bao bọc Route của bạn bằng component `ProtectedRoute`:
   ```tsx
   <Route element={<ProtectedRoute allowedRoles={['LeTan', 'Admin']} />}>
     <Route path="/le-tan" element={<LeTanComponent />} />
   </Route>
   ```
2. `src/components/Sidebar.tsx`: Chèn điều kiện kiểm tra vai trò để hiển thị NavLink trên menu:
   ```tsx
   {(user?.role === 'LeTan' || user?.role === 'Admin') && (
     <NavLink to="/le-tan">...</NavLink>
   )}
   ```
   *(Chú ý: Đừng quên thêm `user?.role === 'Admin'` nếu bạn muốn tài khoản Admin có thể thấy tab này)*
