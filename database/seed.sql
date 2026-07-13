-- Tạo tài khoản
INSERT INTO TaiKhoan(MaTK, Username, Password, VaiTro, TrangThai) VALUES (1, 'khach', '123', 'Khach', 1) ON CONFLICT DO NOTHING;

-- Tạo khách hàng
INSERT INTO KhachHang(MaKH, HoTen, CCCD, Email, SDT, MaTK) VALUES (1, 'Nguyễn Văn A', '079199000123', 'nguyenvana@gmail.com', '0901234567', 1) 
ON CONFLICT (MaKH) DO UPDATE SET HoTen = EXCLUDED.HoTen, Email = EXCLUDED.Email, SDT = EXCLUDED.SDT;

-- Tạo loại phòng và phòng
INSERT INTO LoaiPhong(MaLoai, TenLoai, GiaTien, SucChua) VALUES (1, 'VIP', 1000000, 2) 
ON CONFLICT (MaLoai) DO UPDATE SET TenLoai = EXCLUDED.TenLoai;

INSERT INTO Phong(MaPhong, TenPhong, TrangThai, MaLoai) VALUES (102, 'P.102', 1, 1) 
ON CONFLICT (MaPhong) DO UPDATE SET TenPhong = EXCLUDED.TenPhong;

-- Tạo nhân viên
INSERT INTO NhanVien(MaNV, TenNV, ChucVu, MaTK) VALUES (1, 'Nhân viên 1', 'Lễ Tân', 1) 
ON CONFLICT (MaNV) DO UPDATE SET TenNV = EXCLUDED.TenNV, ChucVu = EXCLUDED.ChucVu;

-- Tạo hợp đồng 9999
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (9999, '2027-01-01', 1, 1) ON CONFLICT DO NOTHING;

-- Tạo yêu cầu trả phòng (để UI có danh sách chờ trả phòng)
INSERT INTO YeuCauTraPhong(MaYC, TrangThai, MaHD) VALUES (1, 1, 9999) ON CONFLICT DO NOTHING;

-- Tạo giường & Chi tiết giường (để lấy danh sách thiết bị bàn giao)
INSERT INTO Giuong(MaGiuong, TenGiuong, TrangThai, MaPhong) VALUES (1, 'Giường 1', 1, 102) 
ON CONFLICT (MaGiuong) DO UPDATE SET TenGiuong = EXCLUDED.TenGiuong;

INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (9999, 1) ON CONFLICT DO NOTHING;

-- Tạo phiếu đặt cọc
INSERT INTO PhieuDatCoc(MaCoc, SoTien, TrangThai, MaKH, MaPhong) VALUES (1, 4000000, 1, 1, 102) ON CONFLICT DO NOTHING;

-- Dữ liệu mở rộng cho phần Tìm kiếm phòng và Hóa đơn
INSERT INTO LoaiPhong(MaLoai, TenLoai, GiaTien, SucChua) VALUES (2, 'Thường 4 người', 2500000, 4) 
ON CONFLICT (MaLoai) DO UPDATE SET TenLoai = EXCLUDED.TenLoai;

INSERT INTO LoaiPhong(MaLoai, TenLoai, GiaTien, SucChua) VALUES (3, 'Cao cấp 2 người', 3800000, 2) 
ON CONFLICT (MaLoai) DO UPDATE SET TenLoai = EXCLUDED.TenLoai;

INSERT INTO LoaiPhong(MaLoai, TenLoai, GiaTien, SucChua) VALUES (4, 'Studio 1 người', 8500000, 1) 
ON CONFLICT (MaLoai) DO UPDATE SET TenLoai = EXCLUDED.TenLoai;

INSERT INTO DichVuPhong(MaDVP, TenDichVu, GiaTien) VALUES (1, 'Wi-Fi Tốc độ cao', 100000) 
ON CONFLICT (MaDVP) DO UPDATE SET TenDichVu = EXCLUDED.TenDichVu;

INSERT INTO DichVuPhong(MaDVP, TenDichVu, GiaTien) VALUES (2, 'Máy lạnh Inverter', 0) 
ON CONFLICT (MaDVP) DO UPDATE SET TenDichVu = EXCLUDED.TenDichVu;

INSERT INTO DichVuPhong(MaDVP, TenDichVu, GiaTien) VALUES (3, 'Tủ cá nhân Khóa từ', 0) 
ON CONFLICT (MaDVP) DO UPDATE SET TenDichVu = EXCLUDED.TenDichVu;

INSERT INTO DichVuPhong(MaDVP, TenDichVu, GiaTien) VALUES (4, 'Giường tầng Nệm cao su', 0) 
ON CONFLICT (MaDVP) DO UPDATE SET TenDichVu = EXCLUDED.TenDichVu;

INSERT INTO DichVuPhong(MaDVP, TenDichVu, GiaTien) VALUES (5, 'Dịch vụ dọn phòng 2 lần/tuần', 150000) 
ON CONFLICT (MaDVP) DO UPDATE SET TenDichVu = EXCLUDED.TenDichVu;

INSERT INTO ChiTietDichVuPhong(MaLoai, MaDVP) VALUES (2, 1), (2, 2), (2, 3), (2, 4) ON CONFLICT DO NOTHING;
INSERT INTO ChiTietDichVuPhong(MaLoai, MaDVP) VALUES (3, 1), (3, 2), (3, 3), (3, 5) ON CONFLICT DO NOTHING;
INSERT INTO ChiTietDichVuPhong(MaLoai, MaDVP) VALUES (4, 1), (4, 2), (4, 3), (4, 4), (4, 5) ON CONFLICT DO NOTHING;

INSERT INTO Phong(MaPhong, TenPhong, TrangThai, ChiNhanh, TieuChiGioiTinh, MaLoai) VALUES (101, 'Studio Cao Cấp - T12', 1, 'Quận 1, TP. HCM', 'Nam/Nữ', 4) 
ON CONFLICT (MaPhong) DO UPDATE SET TenPhong = EXCLUDED.TenPhong, ChiNhanh = EXCLUDED.ChiNhanh, TieuChiGioiTinh = EXCLUDED.TieuChiGioiTinh;

INSERT INTO Phong(MaPhong, TenPhong, TrangThai, ChiNhanh, TieuChiGioiTinh, MaLoai) VALUES (102, 'Căn Hộ Deluxe - B04', 1, 'Quận 3, TP. HCM', 'Nam/Nữ', 2) 
ON CONFLICT (MaPhong) DO UPDATE SET TenPhong = EXCLUDED.TenPhong, ChiNhanh = EXCLUDED.ChiNhanh, TieuChiGioiTinh = EXCLUDED.TieuChiGioiTinh;

INSERT INTO Phong(MaPhong, TenPhong, TrangThai, ChiNhanh, TieuChiGioiTinh, MaLoai) VALUES (103, 'Phòng Suite View Sông', 1, 'Bình Thạnh, TP. HCM', 'Nam/Nữ', 3) 
ON CONFLICT (MaPhong) DO UPDATE SET TenPhong = EXCLUDED.TenPhong, ChiNhanh = EXCLUDED.ChiNhanh, TieuChiGioiTinh = EXCLUDED.TieuChiGioiTinh;

INSERT INTO Phong(MaPhong, TenPhong, TrangThai, ChiNhanh, TieuChiGioiTinh, MaLoai) VALUES (104, 'Căn Hộ Duplex - Tầng Thượng', 1, 'Quận 2, TP. HCM', 'Nam/Nữ', 1) 
ON CONFLICT (MaPhong) DO UPDATE SET TenPhong = EXCLUDED.TenPhong, ChiNhanh = EXCLUDED.ChiNhanh, TieuChiGioiTinh = EXCLUDED.TieuChiGioiTinh;

-- Liên kết khách hàng vào hợp đồng để test lấy hoá đơn
INSERT INTO ThanhVienThue(MaHD, MaKH) VALUES (9999, 1) ON CONFLICT DO NOTHING;

-- Hóa đơn định kỳ
INSERT INTO HoaDonDinhKy(MaHDDK, TienPhong, TienDichVu, PhiQuanLy, TrangThai, HanThanhToan, MaHD) VALUES (1, 3500000, 1250000, 200000, 1, '2023-11-20', 9999) ON CONFLICT DO NOTHING;
INSERT INTO HoaDonDinhKy(MaHDDK, TienPhong, TienDichVu, PhiQuanLy, TrangThai, HanThanhToan, ThoiGianTT, PTThanhToan, MaHD) VALUES (2, 3500000, 1200000, 200000, 2, '2023-10-20', '2023-10-15', 'Chuyển khoản', 9999) ON CONFLICT DO NOTHING;
INSERT INTO HoaDonDinhKy(MaHDDK, TienPhong, TienDichVu, PhiQuanLy, TrangThai, HanThanhToan, ThoiGianTT, PTThanhToan, MaHD) VALUES (3, 3500000, 1300000, 200000, 2, '2023-09-20', '2023-09-14', 'Chuyển khoản', 9999) ON CONFLICT DO NOTHING;

-- Dữ liệu mẫu Phiếu đăng ký hẹn xem phòng và CT_LichHen (Các phòng quan tâm)
INSERT INTO PhieuDangKyHen(MaPhieu, SoNguoi, NgayHen, GioHen, GhiChu, TrangThai, MaKH) 
VALUES 
(1, 2, '2026-07-15 09:30:00', '09:30:00', 'Xin xem kỹ phòng bếp và vệ sinh', 1, 1),
(2, 1, '2026-07-16 14:00:00', '14:00:00', 'Muốn xem phòng studio hướng sáng', 0, 1)
ON CONFLICT (MaPhieu) DO UPDATE SET GhiChu = EXCLUDED.GhiChu;

INSERT INTO CT_LichHen(MaPhieu, MaPhong) 
VALUES 
(1, 101),
(1, 102),
(2, 103)
ON CONFLICT DO NOTHING;

-- Đồng bộ sequence sau khi seed dữ liệu ID cố định
SELECT setval('taikhoan_matk_seq', COALESCE((SELECT MAX(MaTK) FROM TaiKhoan), 1));
SELECT setval('khachhang_makh_seq', COALESCE((SELECT MAX(MaKH) FROM KhachHang), 1));



