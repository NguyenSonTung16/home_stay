-- Tạo tài khoản và nhân viên
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('admin', '123', 'QuanLy', 1);
INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Quan ly 1', 'Quan Ly', 1);
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('ketoan', '123', 'KeToan', 1);
INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Ke toan 1', 'Ke Toan', 2);

-- Tạo loại phòng
INSERT INTO LoaiPhong(TenLoai, GiaTien, SucChua) VALUES ('Standard', 500000, 2), ('VIP', 1000000, 4);

-- Data cho khách 1
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach1', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach1', '00000000001', '090000001', 3);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.101', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.101', 1, 1);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 1, 1);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1001, '2026-12-31', 1, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1001);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1001, 1);

-- Data cho khách 2
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach2', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach2', '00000000002', '090000002', 4);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.102', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.102', 1, 2);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 2, 2);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1002, '2026-12-31', 2, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1002);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1002, 2);

-- Data cho khách 3
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach3', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach3', '00000000003', '090000003', 5);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.103', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.103', 1, 3);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 3, 3);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1003, '2026-12-31', 3, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1003);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1003, 3);

-- Data cho khách 4
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach4', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach4', '00000000004', '090000004', 6);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.104', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.104', 1, 4);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 4, 4);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1004, '2026-12-31', 4, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1004);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1004, 4);

-- Data cho khách 5
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach5', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach5', '00000000005', '090000005', 7);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.105', 1, 1);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.105', 1, 5);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (3000000, 1, 5, 5);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1005, '2026-12-31', 5, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1005);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1005, 5);

-- Data cho khách 6
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach6', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach6', '00000000006', '090000006', 8);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.106', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.106', 1, 6);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 6, 6);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1006, '2026-12-31', 6, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1006);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1006, 6);

-- Data cho khách 7
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach7', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach7', '00000000007', '090000007', 9);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.107', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.107', 1, 7);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 7, 7);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1007, '2026-12-31', 7, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1007);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1007, 7);

-- Data cho khách 8
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach8', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach8', '00000000008', '090000008', 10);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.108', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.108', 1, 8);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 8, 8);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1008, '2026-12-31', 8, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1008);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1008, 8);

-- Data cho khách 9
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach9', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach9', '00000000009', '090000009', 11);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.109', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.109', 1, 9);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 9, 9);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1009, '2026-12-31', 9, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1009);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1009, 9);

-- Data cho khách 10
INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach10', '123', 'Khach', 1);
INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('khach10', '000000000010', '0900000010', 12);
INSERT INTO Phong(TenPhong, TrangThai, MaLoai) VALUES ('P.110', 1, 2);
INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng P.110', 1, 10);
INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (5000000, 1, 10, 10);
INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (1010, '2026-12-31', 10, 1);
INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, 1010);
INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (1010, 10);

