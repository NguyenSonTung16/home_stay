# Tài liệu Trang "Kết quả đặt cọc" (`/ket-qua-dat-coc/:maPDC`)

## 1. Tóm tắt tính năng
Trang **Kết quả đặt cọc** hiển thị trạng thái và thông tin chi tiết của một phiếu đặt cọc cụ thể sau khi khách hàng thực hiện giao dịch thanh toán trực tuyến (PayPal) hoặc chọn phương thức thanh toán tiền mặt.

## 2. Giao diện & Bố cục (UI/UX Layout)
Trang được tối ưu hóa theo ngôn ngữ thiết kế modern mobile-first kết hợp hiển thị hai cột cân đối trên màn hình Desktop lớn (tránh hiện tượng nội dung bị nén cột hẹp):
- **Thanh điều hướng (Breadcrumbs):** Giúp người dùng biết vị trí hiện tại (Trang chủ ➔ Lịch sử đặt cọc ➔ Kết quả đặt cọc).
- **Trạng thái giao dịch:** Sử dụng biểu tượng tích xanh hoặc thông tin nổi bật thể hiện trạng thái (Đã thanh toán / Chờ thanh toán / Đã hủy).
- **Cột thông tin chi tiết:**
  - **Mã cọc:** Mã định danh phiếu đặt cọc (`maPDC`).
  - **Mã giao dịch (Transaction Code):** Hiển thị mã thanh toán trực tuyến từ PayPal (ví dụ: `PAYID-...`) hoặc mã hệ thống giúp đối chiếu tiền mặt.
  - **Thông tin phòng thuê:** Tên phòng, số giường thuê, chi nhánh.
  - **Thông tin thanh toán:** Số tiền cọc cần đóng (VND), phương thức thanh toán lựa chọn, thời gian tạo, thời gian xác nhận.
- **Kêu gọi hành động (CTA):** Nút quay lại danh sách phòng hoặc xem lịch sử cọc.

## 3. Các chức năng & Hành vi
- **Đồng bộ dữ liệu thời gian thực:** Tự động gọi API truy vấn trạng thái mới nhất từ backend.
- **Tích hợp PayPal Capture:** Hỗ trợ kiểm tra và cập nhật trạng thái đơn hàng trực tuyến của hệ thống qua việc bắt các webhook hoặc capture đơn hàng thành công từ PayPal.
- **Hiển thị trực quan:** Ẩn các nút hành động thanh toán nếu phiếu đã ở trạng thái hoàn tất (`DaThanhToan`).

## 4. Kiến trúc kỹ thuật & API
- **Endpoint Backend liên quan:**
  - `GET /api/booking/dat-coc/detail/:maPDC`
- **Cơ sở dữ liệu:**
  - Truy vấn dữ liệu từ bảng `PhieuDatCoc` kết hợp với bảng `Phong` và `DonHang` để lấy mã giao dịch PayPal.
