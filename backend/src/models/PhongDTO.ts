/**
 * DTO (Data Transfer Object) đại diện cho thực thể Phòng trong hệ thống HomeStay
 * Các thuộc tính được đặt theo chuẩn PascalCase (Hoa chữ cái đầu của mỗi từ)
 */
export interface PhongDTO {
    MaPhong: number;
    TenPhong: string;
    ChiNhanh?: string;
    TrangThai: number | string;
    TenLoai?: string;
    GiaTien: number;
    SucChua?: number;
    DienTich?: number;
    TienIch?: string[];
    HinhAnh?: string | string[];
}
