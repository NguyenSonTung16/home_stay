# Tài liệu Tab "Báo cáo doanh thu" (Màn hình Admin)

## 1. Tóm tắt tính năng
Tab **Báo cáo doanh thu** cung cấp cho bộ phận Kế toán và Admin cái nhìn toàn diện về tình hình tài chính của hệ thống FIT 4.0 HomeStay. Màn hình tổng hợp doanh thu thực nhận từ cả 3 nguồn (Đặt cọc, Phí định kỳ, Điện nước), ước tính dòng tiền sắp thu và đo lường hiệu quả thu hồi công nợ quá hạn.

## 2. Giao diện & Bố cục (UI/UX Layout)
Trang được thiết kế dạng Dashboard trực quan hiện đại, sử dụng thư viện biểu đồ tương tác **Recharts**:
- **Khối 3 Summary Cards đầu trang:**
  - **Tổng doanh thu thực tế:** Tổng số tiền đã thanh toán trong kỳ của cả 3 nguồn kèm % tăng/giảm so với tháng trước (mũi tên xanh/đỏ).
  - **Doanh thu dự kiến:** Tổng số tiền của các hóa đơn/phiếu cọc chưa thanh toán nhưng còn hạn.
  - **Tỷ lệ thu hồi công nợ:** Phần trăm tiền đã thu hồi trên tổng số tiền thực nhận cộng nợ xấu (kèm thanh tiến trình xanh lá).
- **Bộ lọc & Phân tích khoảng thời gian:**
  - Lựa chọn khoảng ngày tùy chỉnh (date range picker: Từ ngày - Đến ngày).
  - Lọc theo từng chi nhánh cụ thể hoặc xem toàn hệ thống.
  - Toggle Granularity: Chọn xem dữ liệu gom nhóm theo Ngày (D), Tuần (W), Tháng (M), Năm (Y).
- **Biểu đồ biến động doanh thu chính (Composed Chart):**
  - Cột xếp chồng (Stacked Bar) thể hiện tỷ trọng đóng góp của 3 nguồn doanh thu: Đặt cọc (Màu xanh đậm), Hóa đơn định kỳ (Màu xanh lá) và Điện nước (Màu cam).
  - Đường Line overlay (Màu tím) biểu diễn xu hướng trung bình động 7 kỳ (MA7) giúp nhận biết xu thế tài chính.
  - Cột cuối cùng (Hôm nay) được tự động highlight bằng viền đậm và màu nhấn đặc biệt.
- **Biểu đồ đóng góp của Chi nhánh:** Biểu đồ thanh ngang (Horizontal Bar Chart) so sánh tỷ lệ phần trăm đóng góp doanh thu của mỗi tòa nhà/chi nhánh.

## 3. Các chức năng & Hành vi
- **Ẩn/Hiện dữ liệu tương tác (Interactive Legend):** Người dùng có thể nhấp chuột vào từng nhãn chú thích dưới biểu đồ chính để bật/tắt hiển thị dòng dữ liệu của nguồn đó trên đồ thị thời gian thực.
- **Tooltip Hover:** Khi di chuột qua các điểm mốc thời gian trên biểu đồ, hệ thống sẽ hiện popup chi tiết số tiền đóng góp của từng nguồn doanh thu và tổng số tiền của kỳ đó.

## 4. Kiến trúc kỹ thuật & API
- **Endpoint Backend liên quan:**
  - `GET /api/bao-cao/doanh-thu?tuNgay={date}&denNgay={date}&granularity={g}&chiNhanh={c}`: Lấy dữ liệu biểu đồ phân rã kèm MA7 đã được tính toán ở Service.
  - `GET /api/bao-cao/summary?thang={m}&nam={y}&chiNhanh={c}`: Tính toán các chỉ số cho 3 thẻ thông tin.
  - `GET /api/bao-cao/doanh-thu-chi-nhanh?thang={m}&nam={y}`: Lấy đóng góp doanh thu của chi nhánh.
- **Phân quyền truy cập:**
  - Chỉ cho phép các tài khoản có vai trò `KeToan` hoặc `Admin` truy cập.
- **Tập tin liên quan phía Frontend:**
  - Component hiển thị: `BaoCaoDoanhThu.tsx` (sử dụng thư viện `recharts`).
