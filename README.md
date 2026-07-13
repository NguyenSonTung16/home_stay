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
Dự án sử dụng PostgreSQL. Cách nhanh nhất để có Database với đầy đủ dữ liệu mẫu (Seed Data) là sử dụng Docker.

1. Mở Terminal tại thư mục gốc của dự án (thư mục chứa file `docker-compose.yml`).
2. Chạy lệnh sau để khởi động Database:
   ```bash
   docker-compose up -d
   ```
   *Lưu ý: Docker sẽ tự động nạp cấu trúc bảng từ file `database/init.sql`.*
3. Chạy lệnh nạp dữ liệu test (Seed Data) vào CSDL:
   ```bash
   cd backend
   npx ts-node -T seed_10_rooms.ts
   ```

---

### Bước 2: Cài đặt và cấu hình Backend
Backend của dự án được xây dựng bằng Node.js (Express + TypeScript).

1. Mở Terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Tạo file cấu hình môi trường `.env`:
   - Copy nội dung từ file `.env.example` và tạo ra một file mới tên là `.env` nằm trong thư mục `backend`.
   - Nếu bạn sử dụng Docker ở Bước 1, thông số kết nối mặc định như sau:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_USERNAME=homestay_user
     DB_PASSWORD=homestay_password
     DB_NAME=homestay_db
     PORT=3000
     ```
4. Khởi động Backend server (Chạy chế độ development):
   ```bash
   npm run dev
   ```
   *Server sẽ bắt đầu chạy ở địa chỉ `http://localhost:3000`.*

---

### Bước 3: Cài đặt và chạy Frontend
Frontend của dự án được xây dựng bằng React.js (Vite + TailwindCSS + TypeScript).

1. Mở một cửa sổ Terminal **mới** và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện Frontend:
   ```bash
   npm install
   ```
3. Khởi động Frontend server:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt web truy cập địa chỉ `http://localhost:5173`.

---

## B. Thông tin Tài khoản Đăng nhập (Test Data)

Sau khi chạy xong lệnh `seed_10_rooms.ts` ở Bước 1, hệ thống đã nạp sẵn 2 tài khoản để bạn kiểm thử phân quyền Role Guard.

| Chức vụ (VaiTro) | Tên đăng nhập (Username) | Mật khẩu (Password) | Phân quyền hiển thị (Menu) |
| :--- | :--- | :--- | :--- |
| Quản lý | `admin` | `123` | Có quyền xem menu **Xử lý trả phòng**. Không thấy phần Hoàn cọc. |
| Kế toán | `ketoan` | `123` | Có quyền xem menu **Xử lý hoàn cọc**. Không thấy phần Trả phòng. |

---

## C. Hướng dẫn thêm Tài khoản hoặc Role khác để Test

Nếu bạn muốn tạo thêm một nhân viên mới với Vai trò (Role) khác, hãy mở file `backend/seed_10_rooms.ts` bằng VS Code và làm theo 2 bước sau:

**Bước 1:** Tìm đến dòng mã tạo tài khoản (khoảng dòng 24), bạn sẽ thấy đoạn code tương tự:
```javascript
// Tạo tài khoản và nhân viên
await db.query(`INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('admin', '123', 'QuanLy', 1)`);
await db.query(`INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Quan ly 1', 'Quan Ly', 1)`);

await db.query(`INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('ketoan', '123', 'KeToan', 1)`);
await db.query(`INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Ke toan 1', 'Ke Toan', 2)`);
```

**Bước 2:** Copy và paste thêm một đoạn mã tương tự để tạo tài khoản mới. Chú ý:
- Sửa giá trị `Username` và `VaiTro` ở lệnh `INSERT INTO TaiKhoan`. (Ví dụ `VaiTro` là `'LeTan'`).
- Ở lệnh `INSERT INTO NhanVien`, chú ý trường `MaTK` (Mã tài khoản) phải là số tự tăng theo thứ tự của tài khoản vừa tạo (nếu tạo thêm người thứ 3 thì `MaTK` là `3`). Đồng thời, phải cập nhật lại biến `maTK` của nhóm Khách Hàng (ví dụ `const maTK = i + 3;`) nếu bạn chèn thêm tài khoản nhân viên thứ 3.

**Ví dụ thêm 1 tài khoản Lễ tân:**
```javascript
await db.query(`INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('letan', '123', 'LeTan', 1)`);
await db.query(`INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Le Tan 1', 'Le Tan', 3)`);
```
*(Nếu thêm 1 nhân viên nữa thành 3 người, nhớ sửa ở dòng 43 phần Khách hàng: `const maTK = i + 3;`)*

**Bước 3:** Sau khi sửa xong file `seed_10_rooms.ts`, mở terminal ở thư mục `backend` và chạy lệnh:
```bash
npx ts-node -T seed_10_rooms.ts
```
Dữ liệu sẽ được tự động xóa và nạp lại từ đầu với tài khoản mới của bạn!

**Cấu hình Phân quyền Frontend:** 
Để Role mới có thể nhìn thấy menu, hãy mở `frontend/src/components/Sidebar.tsx` và `frontend/src/App.tsx`, copy khối code Navbar/Route đã có sẵn và đổi tên `allowedRoles={['TenRole']}` thành role của bạn.
