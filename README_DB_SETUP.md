# Hướng dẫn Cài đặt Database PostgreSQL cho Hệ thống Home Stay

Tài liệu này hướng dẫn bạn cách thiết lập và cài đặt database PostgreSQL dựa trên Docker, đồng thời tự động nạp cấu trúc database từ file script.

## Yêu cầu hệ thống
* Cần cài đặt **Docker** và **Docker Compose** trên máy tính của bạn.

## Các file đã chuẩn bị
* `database/init.sql`: File chứa script tạo các bảng database (đã được chuyển đổi từ cú pháp SQL Server sang chuẩn PostgreSQL).
* `docker-compose.yml`: File cấu hình tạo container cho PostgreSQL database.

## Các bước thực hiện

### Bước 1: Khởi chạy database bằng Docker
Mở terminal/command prompt tại thư mục gốc của dự án (thư mục chứa file `docker-compose.yml`), và chạy lệnh sau:

```bash
docker-compose up -d
```

Lệnh này sẽ:
1. Tải image PostgreSQL về máy.
2. Khởi tạo một container tên là `homestay_db`.
3. Tự động đọc và thực thi file `database/init.sql` (nhờ vào volume mapping `docker-entrypoint-initdb.d`).
4. Chạy ngầm trong nền (`-d`).

### Bước 2: Kiểm tra database
Bạn có thể kết nối vào database thông qua bất kỳ công cụ quản lý Database nào (như DBeaver, pgAdmin, DataGrip, v.v...) với các thông số sau:

* **Host**: `localhost`
* **Port**: `5432`
* **Database**: `homestay_db`
* **User**: `homestay_user`
* **Password**: `homestay_password`

Hoặc nếu muốn kiểm tra trực tiếp từ terminal, bạn chạy lệnh:
```bash
docker exec -it homestay_db psql -U homestay_user -d homestay_db
```
Khi đã vào màn hình psql, dùng lệnh `\dt` để xem danh sách các bảng đã được tạo.

### Bước 3: Dừng và Xóa Database (Nếu cần thiết)
Nếu bạn muốn dừng container:
```bash
docker-compose stop
```

Nếu bạn muốn xóa container (Dữ liệu vẫn được giữ lại do đã ánh xạ vào volume `pgdata`):
```bash
docker-compose down
```

Nếu bạn muốn reset hoàn toàn database (xóa cả data đã tạo) để chạy lại script mới:
```bash
docker-compose down -v
```

---
*Lưu ý: PostgreSQL sẽ tự động thay thế `IDENTITY(1,1)` bằng `SERIAL`, `NVARCHAR` thành `VARCHAR` và `BIT` thành `BOOLEAN` để phù hợp với chuẩn của hệ quản trị CSDL này.*
