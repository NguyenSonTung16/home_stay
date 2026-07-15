// ============================================================
// PhieuDatCocDTO.ts
// Định nghĩa TypeScript interface sau khi tách bảng 1-1
// ============================================================

/** Bảng chính PhieuDatCoc — 8 cột gốc */
export interface PhieuDatCoc {
  macoc: number;
  sotien: number;
  ngaycoc: Date;
  trangthaimoi: string;       // 'ChoDuyet' | 'ChoThanhToan' | 'ChoXacNhanTienMat' | 'DaThanhToan' | 'DaHuy'
  magiaodich: string | null;
  ptthanhtoan: string | null; // 'TienMat' | 'ChuyenKhoan'
  makh: number;
  maphong: number;
}

/** Bảng con ChiTietXuLyDatCoc — 7 cột chi tiết xử lý (1-1 với PhieuDatCoc) */
export interface ChiTietXuLyDatCoc {
  macoc: number;
  magiuong: number | null;
  sogiuongthue: number;
  thoigianhethan: Date | null;
  minhchung: string | null;
  nguoixacnhan: number | null;
  thoigianxacnhan: Date | null;
}

/**
 * View kết quả LEFT JOIN giữa PhieuDatCoc và ChiTietXuLyDatCoc.
 * Dùng cho tất cả API response trả ra frontend — KHÔNG thay đổi shape cũ.
 */
export interface PhieuDatCocChiTietView extends PhieuDatCoc, Omit<ChiTietXuLyDatCoc, 'macoc'> {
  // Joined fields từ bảng khác (tuỳ query)
  hoten?: string;
  email?: string;
  tengiuong?: string;
  tenphong?: string;
  maphong_join?: number;
  avatar?: string;
  chinhanh?: string;
  // Legacy aliases (giữ nguyên field name mà frontend/service đang dùng)
  urlchungtu?: string | null;  // alias của minhchung
  tiencoc?: number;            // alias của sotien
  thoigiantao?: Date | null;   // đã dời sang bảng con, giữ type để runtime không báo lỗi
}
