# Tài liệu Tab "Lịch sử cọc" (`/thanh-toan-coc`)

## 1. Tóm tắt tính năng
Tab **Lịch sử cọc** cho phép khách hàng theo dõi toàn bộ các phiếu đặt cọc của mình từ trước đến nay (bao gồm các phiếu đang chờ thanh toán, đã thanh toán thành công và phiếu đã hủy), tránh tình trạng phiếu biến mất sau khi thanh toán xong.

## 2. Giao diện & Bố cục (UI/UX Layout)
Trang thiết kế theo kiểu danh sách một cột xếp chồng (Single-column Stacked Card Layout), thân thiện với thiết bị di động:
- **Thanh phân loại (Sub-tabs):** Bộ lọc nhanh ở đầu danh sách giúp phân loại phiếu cọc theo 4 trạng thái:
  - **Tất cả:** Toàn bộ phiếu cọc của khách hàng.
  - **Chờ thanh toán:** Các phiếu cọc có trạng thái `ChoThanhToan` hoặc `ChoXacNhanTienMat`.
  - **Đã thanh toán:** Các phiếu cọc đã xác nhận thành công (`DaThanhToan`).
  - **Đã hủy:** Các phiếu cọc đã quá hạn hoặc chủ động hủy (`DaHuy`).
- **Thẻ thông tin phiếu cọc (Deposit Slip Card):**
  - Hiển thị tên phòng, số giường thuê, số tiền cọc cần đóng.
  - Nhãn trạng thái (Badge) với màu sắc trực quan (Đỏ: Đã hủy, Xanh lá: Đã thanh toán, Cam: Chờ thanh toán).
  - Phương thức thanh toán lựa chọn (Chuyển khoản / Tiền mặt).
  - Thời gian tạo phiếu.
- **Bộ khung xương tải dữ liệu (Skeletons):** Hiệu ứng nhấp nháy chuyển động khi dữ liệu đang được tải từ server, tăng trải nghiệm người dùng.

## 3. Các chức năng & Hành vi
- **Bộ đếm thời gian ngược (Live Countdown Timer):** Đối với các phiếu cọc có trạng thái `ChoThanhToan`, hệ thống hiển thị thời gian còn lại để thanh toán (giới hạn trong vòng 24 giờ kể từ thời điểm tạo). Khi đếm ngược về `00:00:00`, phiếu cọc sẽ tự động chuyển sang trạng thái đã quá hạn và bị hủy.
- **Nút hành động thông minh (Contextual CTA):**
  - Phiếu đang chờ thanh toán: Hiển thị nút **"Thanh toán ngay"** đưa khách hàng trực tiếp sang trang cổng thanh toán trực tuyến.
  - Phiếu đã thanh toán/Đã hủy: Hiển thị nút **"Xem chi tiết"** đưa sang trang Kết quả đặt cọc để kiểm tra biên nhận.

## 4. Kiến trúc kỹ thuật & API
- **Endpoint Backend liên quan:**
  - `GET /api/booking/dat-coc/lich-su?maKH={maKH}&trangThai={trangThai}`
- **Cơ sở dữ liệu:**
  - Lấy thông tin từ bảng `PhieuDatCoc` kết nối với bảng `Phong` và lọc theo `maKH` đang đăng nhập, sắp xếp theo thời gian tạo mới nhất lên trên.
- **Tập tin liên quan phía Frontend Client:**
  - Component hiển thị: `ThanhToanCoc.tsx`
  - Custom Hook quản lý trạng thái: `useLichSuDatCoc.ts`
  - Service API: `bookingApi.ts`
