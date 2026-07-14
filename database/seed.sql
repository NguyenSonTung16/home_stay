-- Bảng Tài Khoản (Username: 'admin', 'quanly', 'ketoan', 'nvsale', 'khach...')
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('admin', '123', 'Admin', 1);
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('quanly', '123', 'QuanLy', 1);
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('nvsale', '123', 'Sale', 1);
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('ketoan', '123', 'KeToan', 1);

-- Nhân viên
INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Admin', 'Admin', 1);
INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Quan ly 1', 'Quan Ly', 2);
INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Nhân viên Sale 1', 'Sale', 3);
INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Ke toan 1', 'Ke Toan', 4);

-- Tạo loại phòng
INSERT INTO LoaiPhong(TenLoai, GiaTien, SucChua) VALUES ('Standard', 500000, 2), ('VIP', 1000000, 4);-- Tạo khách hàng mẫu (để test)
INSERT INTO KhachHang(MaKH, HoTen, CCCD, Email, SDT, MaTK) VALUES (99, 'Nguyễn Văn A', '079199000123', 'nguyenvana@gmail.com', '0901234567', 1);

-- Data cho khách 1
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach1', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach1', '00000000001', 'khach1@test.com', '090000001', (SELECT MaTK FROM TaiKhoan WHERE Username = 'khach1'));
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.101', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.101', 1, 1);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 1, 1);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1001, '2026-12-31', 1, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1001);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1001, 1);

-- Data cho khách 2
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach2', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach2', '00000000002', 'khach2@test.com', '090000002', (SELECT MaTK FROM TaiKhoan WHERE Username = 'khach2'));
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.102', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.102', 1, 2);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 2, 2);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1002, '2026-12-31', 2, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1002);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1002, 2);

-- Data cho khách 3
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach3', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach3', '00000000003', 'khach3@test.com', '090000003', (SELECT MaTK FROM TaiKhoan WHERE Username = 'khach3'));
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.103', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.103', 1, 3);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 3, 3);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1003, '2026-12-31', 3, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1003);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1003, 3);

-- Data cho khách 4
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach4', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach4', '00000000004', 'khach4@test.com', '090000004', (SELECT MaTK FROM TaiKhoan WHERE Username = 'khach4'));
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.104', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.104', 1, 4);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 4, 4);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1004, '2026-12-31', 4, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1004);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1004, 4);

-- Data cho khách 5
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach5', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach5', '00000000005', 'khach5@test.com', '090000005', (SELECT MaTK FROM TaiKhoan WHERE Username = 'khach5'));
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.105', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.105', 1, 5);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 5, 5);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1005, '2026-12-31', 5, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1005);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1005, 5);

-- Data cho khách 6
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach6', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach6', '00000000006', 'khach6@test.com', '090000006', 8);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.106', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.106', 1, 6);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 6, 6);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1006, '2026-12-31', 6, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1006);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1006, 6);

-- Data cho khách 7
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach7', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach7', '00000000007', 'khach7@test.com', '090000007', 9);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.107', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.107', 1, 7);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 7, 7);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1007, '2026-12-31', 7, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1007);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1007, 7);

-- Data cho khách 8
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach8', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach8', '00000000008', 'khach8@test.com', '090000008', 10);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.108', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.108', 1, 8);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 8, 8);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1008, '2026-12-31', 8, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1008);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1008, 8);

-- Data cho khách 9
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach9', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach9', '00000000009', 'khach9@test.com', '090000009', 11);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.109', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.109', 1, 9);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 9, 9);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1009, '2026-12-31', 9, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1009);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1009, 9);

-- Data cho khách 10
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach10', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, Email, SDT, MaTK) VALUES ('khach10', '000000000010', 'khach10@test.com', '0900000010', 12);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.110', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.110', 1, 10);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 10, 10);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1010, '2026-12-31', 10, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1010);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1010, 10);

-- Tạo giường & Chi tiết giường (để lấy danh sách thiết bị bàn giao)
INSERT INTO Giuong(MaGiuong, TenGiuong, TrangThai, MaPhong) VALUES (1, 'Giường 1', 1, 102) 
ON CONFLICT (MaGiuong) DO UPDATE SET TenGiuong = EXCLUDED.TenGiuong;

INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (9999, '2026-12-31', 99, 1) ON CONFLICT DO NOTHING;
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

INSERT INTO Phong(MaPhong, TenPhong, TrangThai, ChiNhanh, TieuChiGioiTinh, HinhAnh, MaLoai) VALUES (101, 'Studio Cao Cấp - T12', 1, 'Quận 1, TP. HCM', 'Nam/Nữ', 'http://localhost:3000/room_images/P101.jpg', 4) 
ON CONFLICT (MaPhong) DO UPDATE SET TenPhong = EXCLUDED.TenPhong, ChiNhanh = EXCLUDED.ChiNhanh, TieuChiGioiTinh = EXCLUDED.TieuChiGioiTinh, HinhAnh = EXCLUDED.HinhAnh;

INSERT INTO Phong(MaPhong, TenPhong, TrangThai, ChiNhanh, TieuChiGioiTinh, HinhAnh, MaLoai) VALUES (102, 'Căn Hộ Deluxe - B04', 1, 'Quận 3, TP. HCM', 'Nam/Nữ', 'http://localhost:3000/room_images/P102.jpg', 2) 
ON CONFLICT (MaPhong) DO UPDATE SET TenPhong = EXCLUDED.TenPhong, ChiNhanh = EXCLUDED.ChiNhanh, TieuChiGioiTinh = EXCLUDED.TieuChiGioiTinh, HinhAnh = EXCLUDED.HinhAnh;

INSERT INTO Phong(MaPhong, TenPhong, TrangThai, ChiNhanh, TieuChiGioiTinh, HinhAnh, MaLoai) VALUES (103, 'Phòng Suite View Sông', 1, 'Bình Thạnh, TP. HCM', 'Nam/Nữ', 'http://localhost:3000/room_images/P103.jpg', 3) 
ON CONFLICT (MaPhong) DO UPDATE SET TenPhong = EXCLUDED.TenPhong, ChiNhanh = EXCLUDED.ChiNhanh, TieuChiGioiTinh = EXCLUDED.TieuChiGioiTinh, HinhAnh = EXCLUDED.HinhAnh;

INSERT INTO Phong(MaPhong, TenPhong, TrangThai, ChiNhanh, TieuChiGioiTinh, HinhAnh, MaLoai) VALUES (104, 'Căn Hộ Duplex - Tầng Thượng', 1, 'Quận 2, TP. HCM', 'Nam/Nữ', 'http://localhost:3000/room_images/P104.jpg', 1) 
ON CONFLICT (MaPhong) DO UPDATE SET TenPhong = EXCLUDED.TenPhong, ChiNhanh = EXCLUDED.ChiNhanh, TieuChiGioiTinh = EXCLUDED.TieuChiGioiTinh, HinhAnh = EXCLUDED.HinhAnh;

-- Liên kết khách hàng vào hợp đồng để test lấy hoá đơn
INSERT INTO ThanhVienThue(MaHD, MaKH) VALUES (9999, 99) ON CONFLICT DO NOTHING;

-- Hóa đơn định kỳ
INSERT INTO HoaDonDinhKy(MaHDDK, TienPhong, TienDichVu, PhiQuanLy, TrangThai, HanThanhToan, MaHD) VALUES (1, 3500000, 1250000, 200000, 1, '2023-11-20', 9999) ON CONFLICT DO NOTHING;
INSERT INTO HoaDonDinhKy(MaHDDK, TienPhong, TienDichVu, PhiQuanLy, TrangThai, HanThanhToan, ThoiGianTT, PTThanhToan, MaHD) VALUES (2, 3500000, 1200000, 200000, 2, '2023-10-20', '2023-10-15', 'Chuyển khoản', 9999) ON CONFLICT DO NOTHING;
INSERT INTO HoaDonDinhKy(MaHDDK, TienPhong, TienDichVu, PhiQuanLy, TrangThai, HanThanhToan, ThoiGianTT, PTThanhToan, MaHD) VALUES (3, 3500000, 1300000, 200000, 2, '2023-09-20', '2023-09-14', 'Chuyển khoản', 9999) ON CONFLICT DO NOTHING;

-- Dữ liệu mẫu Phiếu đăng ký hẹn xem phòng và CT_LichHen (Các phòng quan tâm)
INSERT INTO PhieuDangKyHen(MaPhieu, SoNguoi, NgayHen, GioHen, GhiChu, TrangThai, MaKH) 
VALUES 
(1, 2, '2026-07-15 09:30:00', '09:30:00', 'Xin xem kỹ phòng bếp và vệ sinh', 1, 99),
(2, 1, '2026-07-16 14:00:00', '14:00:00', 'Muốn xem phòng studio hướng sáng', 0, 99)
ON CONFLICT (MaPhieu) DO UPDATE SET GhiChu = EXCLUDED.GhiChu;

INSERT INTO CT_LichHen(MaPhieu, MaPhong) 
VALUES 
(1, 101),
(1, 102),
(2, 103)
ON CONFLICT DO NOTHING;

-- Seed dữ liệu cho Hóa đơn điện nước
INSERT INTO HoaDonDienNuoc(MaPhong, Thang, CSDienCu, CSDienMoi, CSNuocCu, CSNuocMoi, TienDien, TienNuoc, TongTien, TrangThai)
VALUES (1, '2026-07', 100, 250, 10, 25, 375000, 150000, 525000, 'ChuaThanhToan');

INSERT INTO HoaDonDienNuoc(MaPhong, Thang, CSDienCu, CSDienMoi, CSNuocCu, CSNuocMoi, TienDien, TienNuoc, TongTien, TrangThai)
VALUES (1, '2026-06', 0, 100, 0, 10, 250000, 100000, 350000, 'DaThanhToan');

-- Seed dữ liệu cho Hóa đơn phí định kỳ
INSERT INTO HoaDonPhiDinhKy(MaHD, Thang, TienPhong, TienDichVu, TongTien, TrangThai)
VALUES (1001, '2026-07', 2000000, 200000, 2200000, 'ChuaThanhToan');

INSERT INTO HoaDonPhiDinhKy(MaHD, Thang, TienPhong, TienDichVu, TongTien, TrangThai)
VALUES (1001, '2026-06', 2000000, 200000, 2200000, 'DaThanhToan');

-- Đồng bộ sequence sau khi seed dữ liệu ID cố định
SELECT setval('taikhoan_matk_seq', COALESCE((SELECT MAX(MaTK) FROM TaiKhoan), 1));
SELECT setval('khachhang_makh_seq', COALESCE((SELECT MAX(MaKH) FROM KhachHang), 1));
SELECT setval('hoadondiennuoc_mahddn_seq', COALESCE((SELECT MAX(MaHDDN) FROM HoaDonDienNuoc), 1));
SELECT setval('hoadonphidinhky_mapdk_seq', COALESCE((SELECT MAX(MaPDK) FROM HoaDonPhiDinhKy), 1));



