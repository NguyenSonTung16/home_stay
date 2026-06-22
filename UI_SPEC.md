# Quy định Thiết kế UI (UI Design System Specification)

Tài liệu này quy định chi tiết về style thiết kế UI dùng chung cho toàn hệ thống.

## 1. Bảng màu (Color Palette)

*   **Primary (#1E3A8A)**: Xanh dương đậm, dùng cho các hành động chính, nhận diện thương hiệu.
*   **Secondary (#64748B)**: Xám xanh, dùng cho các yếu tố phụ, icon không hoạt động.
*   **Surface (#F7F9FB)**: Màu nền chính của ứng dụng, tạo cảm giác sạch sẽ.

**Trạng thái hệ thống:**
*   **Success (#10B981)**: Phòng trống, thanh toán thành công.
*   **Danger (#EF4444)**: Lỗi, phòng đã khóa, quá hạn.
*   **Warning (#F59E0B)**: Chờ duyệt, nhắc nhở.
*   **Info (#3B82F6)**: Thông tin chung, chỉ dẫn.

## 2. Hệ thống chữ (Typography)

*   **Font chính**: Inter / Google Sans.
*   **H1 (Headline)**: 24px, Bold - Tiêu đề màn hình.
*   **H2 (Sub-headline)**: 18px, Semi-bold - Tiêu đề phân đoạn.
*   **Body**: 14px, Regular - Nội dung văn bản chính.
*   **Caption**: 12px, Medium - Chú thích, thời gian.

## 3. Thành phần giao diện (UI Components)

### Bộ nút (Buttons)
*   **Primary Button**: Nền xanh (`#1E3A8A`), chữ trắng, bo góc 8px. Padding 12px 24px.
*   **Secondary Button**: Viền xám (`#64748B`), nền trắng, chữ xám.
*   **Danger Button**: Nền đỏ (`#EF4444`), chữ trắng.

### Ô nhập liệu (Input Fields)
*   **Mặc định**: Viền xám nhạt (`#D1D5DB`), nền trắng, bo góc 8px.
*   **Focus**: Viền xanh Primary (`#1E3A8A`), độ dày viền 2px.
*   **Error**: Viền đỏ (`#EF4444`), kèm text thông báo lỗi nhỏ màu đỏ phía dưới.

### Bảng dữ liệu (Table/List)
*   **Mobile**: Bảng được chuyển đổi thành dạng danh sách (Card-based list) để tối ưu không gian.
*   **Header**: Chữ in đậm, kích thước nhỏ (12px), màu xám đậm.
*   **Row**: Phân tách bằng đường kẻ mảnh (`#E5E7EB`) hoặc đổ bóng nhẹ.

### Thông báo (Alert/Toast)
*   **Cấu trúc**: Icon bên trái + Nội dung chữ + Nút đóng bên phải.
*   **Màu sắc**: Phối hợp theo màu trạng thái (Success, Danger, Warning, Info) với nền nhạt hơn để dễ đọc.
