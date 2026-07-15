# Tài liệu Tab "Đối soát dòng tiền" (Màn hình Admin)

## 1. Tóm tắt tính năng
Tab **Đối soát dòng tiền** giúp bộ phận Kế toán của FIT 4.0 HomeStay theo dõi, kiểm tra chi tiết và đối chiếu các khoản thu chi phát sinh trong hệ thống. Bộ phận quản lý có thể đối soát từng phiếu đặt cọc của khách hàng, các hóa đơn định kỳ hàng tháng và hóa đơn thanh toán điện nước của các phòng thuê.

## 2. Giao diện & Bố cục (UI/UX Layout)
Trang được chia làm 3 phân hệ chính tương ứng với 3 nguồn doanh thu:
- **Đặt cọc:** Quản lý phiếu đặt cọc giữ chỗ.
- **Hóa đơn định kỳ:** Quản lý tiền thuê phòng và phí dịch vụ cố định hàng tháng của hợp đồng.
- **Hóa đơn điện nước:** Quản lý các hóa đơn tính theo chỉ số sử dụng điện và nước của phòng thuê.

Mỗi phân hệ có bố cục:
- **Khối 3 thẻ chỉ số (Summary Cards):**
  - **Tổng doanh thu thực nhận:** Số tiền của các phiếu/hóa đơn đã hoàn thành thanh toán.
  - **Chờ thanh toán:** Tổng số tiền và số lượng hóa đơn đang ở trạng thái chờ/chưa thanh toán.
  - **Tỷ lệ đối soát:** Phần trăm số phiếu/hóa đơn đã hoàn thành giao dịch trên tổng số lượng phát sinh.
- **Thanh lọc dữ liệu:**
  - Lọc theo Tháng / Năm.
  - Lọc theo Tòa nhà / Chi nhánh.
  - Lọc theo trạng thái thanh toán cụ thể (Đã hoàn tất / Chờ thanh toán / Chờ xác nhận tiền mặt / Đã hủy).
- **Bảng dữ liệu giao dịch (Reconciliation Table):**
  - Hiển thị các cột thông tin tùy chỉnh theo loại phân hệ đang chọn (Ví dụ: tab Điện nước hiển thị thêm cột chỉ số điện/nước cũ và mới của phòng).
  - Trạng thái thanh toán hiển thị dưới dạng Badge màu trực quan.
  - Cột Hành động có nút biểu tượng xem chi tiết (mắt đọc).
- **Phân trang (Pagination):** Hiển thị số lượng giao dịch và cho phép chuyển trang mượt mà (10 bản ghi/trang).

## 3. Các chức năng & Hành vi
- **Xuất báo cáo Excel (Export Excel):** Cho phép Kế toán tải xuống tệp Excel chứa toàn bộ dữ liệu đối soát của kỳ hiện tại. File Excel được xuất trực tiếp từ backend sử dụng thư viện `xlsx` (SheetJS) đảm bảo tốc độ và cấu trúc bảng rõ ràng, hỗ trợ đầy đủ tiếng Việt có dấu.
- **Xem chi tiết giao dịch (Read-only Detail view):** Khi nhấn biểu tượng mắt đọc, hệ thống sẽ điều hướng kế toán đến trang chi tiết của hóa đơn định kỳ hoặc điện nước đó ở chế độ chỉ đọc để rà soát dòng tiền. Với phiếu cọc, hệ thống sẽ mở liên kết kết quả đặt cọc ở phía client.

## 4. Kiến trúc kỹ thuật & API
- **Endpoint Backend liên quan:**
  - `GET /api/doi-soat/dat-coc`: Danh sách phiếu cọc phân trang.
  - `GET /api/doi-soat/hoa-don-dinh-ky`: Danh sách hóa đơn thuê phòng phân trang.
  - `GET /api/doi-soat/hoa-don-dien-nuoc`: Danh sách hóa đơn điện nước phân trang.
  - `GET /api/doi-soat/summary`: Lấy số liệu cho 3 thẻ thống kê đối soát dòng tiền.
  - `GET /api/doi-soat/:loai/export`: Tải file Excel đối soát dòng tiền.
- **Phân quyền truy cập:**
  - Chỉ cho phép các tài khoản có vai trò `KeToan` hoặc `Admin` truy cập.
- **Tập tin liên quan phía Frontend:**
  - Component hiển thị: `DoiSoat.tsx` (tích hợp các tab đối soát và liên kết chi tiết).
