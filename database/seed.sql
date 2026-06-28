-- Tạo tài khoản
INSERT INTO TaiKhoan(MaTK, Username, Password, VaiTro, TrangThai) VALUES (1, 'khach', '123', 'Khach', 1) ON CONFLICT DO NOTHING;

-- Tạo khách hàng
INSERT INTO KhachHang(MaKH, HoTen, CCCD, MaTK) VALUES (1, 'Nguyễn Văn A', '123456789', 1) ON CONFLICT DO NOTHING;

-- Tạo loại phòng và phòng
INSERT INTO LoaiPhong(MaLoai, TenLoai, GiaTien, SucChua) VALUES (1, 'VIP', 1000000, 2) ON CONFLICT DO NOTHING;
INSERT INTO Phong(MaPhong, TenPhong, TrangThai, MaLoai) VALUES (102, 'P.102', 1, 1) ON CONFLICT DO NOTHING;

-- Tạo nhân viên
INSERT INTO NhanVien(MaNV, TenNV, ChucVu, MaTK) VALUES (1, 'NV1', 'Le Tan', 1) ON CONFLICT DO NOTHING;

-- Tạo hợp đồng 9999
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (9999, '2027-01-01', 1, 1) ON CONFLICT DO NOTHING;

-- Tạo yêu cầu trả phòng (để UI có danh sách chờ trả phòng)
INSERT INTO YeuCauTraPhong(MaYC, TrangThai, MaHD) VALUES (1, 1, 9999) ON CONFLICT DO NOTHING;

-- Tạo giường & Chi tiết giường (để lấy danh sách thiết bị bàn giao)
INSERT INTO Giuong(MaGiuong, TenGiuong, TrangThai, MaPhong) VALUES (1, 'Giuong 1', 1, 102) ON CONFLICT DO NOTHING;
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (9999, 1) ON CONFLICT DO NOTHING;

-- Tạo phiếu đặt cọc
INSERT INTO PhieuDatCoc(MaCoc, SoTien, TrangThai, MaKH, MaPhong) VALUES (1, 4000000, 1, 1, 102) ON CONFLICT DO NOTHING;
