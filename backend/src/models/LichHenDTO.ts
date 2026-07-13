/**
 * DTO (Data Transfer Object) đại diện cho thực thể Lịch Hẹn Xem Phòng
 * Tuân thủ dạng chuẩn 3NF: Sử dụng MaKH thay cho thông tin lặp lại của khách hàng
 */
export interface LichHenDTO {
    MaLichHen?: number | string;
    MaKH: number | string; // Mã khách hàng đặt lịch hẹn (Foreign Key tới bảng KhachHang)
    DanhSachMaPhong: number[]; // Mảng mã các phòng được chọn hẹn xem
    NgayHen: string;
    GioHen: string;
    TrangThai?: string | number;
    GhiChu?: string;
}
