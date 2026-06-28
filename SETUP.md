# Hướng dẫn cài đặt và chạy dự án (Setup Guide)

Tài liệu này sẽ hướng dẫn bạn các bước chi tiết để cài đặt, cấu hình và chạy dự án Home Stay sau khi clone/pull mã nguồn về máy.

## Yêu cầu hệ thống (Prerequisites)
Để chạy được dự án, máy tính của bạn cần cài đặt sẵn:
- **Node.js** (Khuyến nghị phiên bản v18.x trở lên)
- **NPM** hoặc **Yarn** (Thường đi kèm khi cài Node.js)
- **Docker** và **Docker Compose** (Dành cho việc chạy Database PostgreSQL cục bộ)

---

## Bước 1: Khởi tạo Cơ sở dữ liệu (Database)
Dự án sử dụng PostgreSQL. Cách nhanh nhất để có Database với đầy đủ dữ liệu mẫu (Seed Data) là sử dụng Docker.

1. Mở Terminal tại thư mục gốc của dự án (thư mục chứa file `docker-compose.yml`).
2. Chạy lệnh sau để khởi động Database:
   ```bash
   docker-compose up -d
   ```
   *Lưu ý: Docker sẽ tự động nạp cấu trúc bảng từ file `database/init.sql`.*
3. (Tùy chọn) Chạy lệnh nạp 10 mẫu dữ liệu test (Seed Data) vào CSDL:
   ```bash
   cd backend
   npx ts-node -T seed_10_rooms.ts
   ```

---

## Bước 2: Cài đặt và cấu hình Backend
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
   - *(Lưu ý: Nếu bạn kết nối với CSDL Postgres khác, hãy sửa lại cấu hình trong file `.env` cho phù hợp).*
4. Khởi động Backend server (Chạy chế độ development):
   ```bash
   npm run dev
   ```
   *Server sẽ bắt đầu chạy ở địa chỉ `http://localhost:3000`.*

---

## Bước 3: Cài đặt và chạy Frontend
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
4. Terminal sẽ hiển thị một đường dẫn Local (thường là `http://localhost:5173`). Bạn mở link này trên trình duyệt (Chrome, Edge...) để trải nghiệm ứng dụng.

---

## Ghi chú thêm
- Khi phát triển, bạn cần chạy **song song 3 thứ**: Container Docker (cho Database), Terminal chạy lệnh dev của Backend, và Terminal chạy lệnh dev của Frontend.
- Để reset lại DB và nạp lại dữ liệu gốc, bạn có thể chạy file script hỗ trợ ở thư mục backend: `node reset_db.js`, sau đó chạy lại lệnh seed `npx ts-node -T seed_10_rooms.ts`.
