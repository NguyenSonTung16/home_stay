-- ====================================================
-- PHẦN 1: TẠO CÁC BẢNG GỐC (LEVEL 0 - Không chứa FK)
-- ====================================================

CREATE TABLE TaiKhoan (
    MaTK SERIAL PRIMARY KEY,
    Username VARCHAR(50) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    VaiTro VARCHAR(20) NOT NULL,
    TrangThai INT NOT NULL,
    NgayTao DATE DEFAULT CURRENT_DATE,
    LanDangNhapCuoi TIMESTAMP,
    Token VARCHAR(255)
);

CREATE TABLE LoaiPhong (
    MaLoai SERIAL PRIMARY KEY,
    TenLoai VARCHAR(50) NOT NULL,
    GiaTien DECIMAL(10,2) NOT NULL,
    SucChua INT NOT NULL
);

CREATE TABLE DichVuPhong (
    MaDVP SERIAL PRIMARY KEY,
    TenDichVu VARCHAR(100) NOT NULL,
    GiaTien DECIMAL(10,2) NOT NULL
);

CREATE TABLE DichVuKhac (
    MaDV SERIAL PRIMARY KEY,
    TenDichVu VARCHAR(100) NOT NULL,
    DonGia DECIMAL(10,2) NOT NULL
);

-- ====================================================
-- PHẦN 2: TẠO BẢNG LEVEL 1 (Phụ thuộc 1 Bảng gốc)
-- ====================================================

CREATE TABLE NhanVien (
    MaNV SERIAL PRIMARY KEY,
    TenNV VARCHAR(100) NOT NULL,
    ChucVu VARCHAR(50),
    MaTK INT NOT NULL,
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
);

CREATE TABLE KhachHang (
    MaKH SERIAL PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    CCCD VARCHAR(20) NOT NULL,
    SDT VARCHAR(15),
    Email VARCHAR(100),
    DiaChi VARCHAR(200),
    Avatar VARCHAR(255),
    STKNhanCoc VARCHAR(50),
    MaTK INT NOT NULL,
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
);

CREATE TABLE Phong (
    MaPhong SERIAL PRIMARY KEY,
    TenPhong VARCHAR(50) NOT NULL,
    TrangThai INT NOT NULL,
    ChiNhanh VARCHAR(100),
    TieuChiGioiTinh VARCHAR(20),
    MaLoai INT NOT NULL,
    FOREIGN KEY (MaLoai) REFERENCES LoaiPhong(MaLoai)
);

-- Bảng trung gian n-n giữa LoaiPhong và DichVuPhong
CREATE TABLE ChiTietDichVuPhong (
    MaLoai INT,
    MaDVP INT,
    PRIMARY KEY (MaLoai, MaDVP),
    FOREIGN KEY (MaLoai) REFERENCES LoaiPhong(MaLoai),
    FOREIGN KEY (MaDVP) REFERENCES DichVuPhong(MaDVP)
);

-- ====================================================
-- PHẦN 3: TẠO BẢNG LEVEL 2 (Chi tiết tài sản & Đặt chỗ)
-- ====================================================

CREATE TABLE Giuong (
    MaGiuong SERIAL PRIMARY KEY,
    TenGiuong VARCHAR(50) NOT NULL,
    TrangThai INT NOT NULL,
    MaPhong INT NOT NULL,
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
);

CREATE TABLE PhieuDangKyHen (
    MaPhieu SERIAL PRIMARY KEY,
    SoNguoi INT,
    NgayHen TIMESTAMP,
    GioHen TIME,
    GhiChu VARCHAR(255),
    TrangThai INT NOT NULL,
    MaKH INT NOT NULL,
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH)
);

CREATE TABLE CT_LichHen (
    MaPhieu INT NOT NULL,
    MaPhong INT NOT NULL,
    PRIMARY KEY (MaPhieu, MaPhong),
    FOREIGN KEY (MaPhieu) REFERENCES PhieuDangKyHen(MaPhieu) ON DELETE CASCADE,
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong) ON DELETE CASCADE
);


CREATE TABLE PhieuDatCoc (
    MaCoc SERIAL PRIMARY KEY,
    SoTien DECIMAL(10,2) NOT NULL,
    NgayCoc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TrangThai INT NOT NULL,
    MaGiaoDich VARCHAR(100),
    PTThanhToan VARCHAR(50),
    SoGiuong INT DEFAULT 1,
    GioiTinh VARCHAR(10),
    SoNguoiO INT DEFAULT 1,
    NgayDuKienVao DATE,
    MinhChung VARCHAR(255),
    MaKH INT NOT NULL,
    MaPhong INT NOT NULL,
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
);

CREATE TABLE ChiSoDienNuoc (
    MaCS SERIAL PRIMARY KEY,
    Thang VARCHAR(7),
    CSDienCu INT,
    CSDienMoi INT,
    CSNuocCu INT,
    CSNuocMoi INT,
    MaPhong INT NOT NULL,
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
);

-- ====================================================
-- PHẦN 4: TẠO BẢNG HỢP ĐỒNG & CÁC CHI TIẾT THEO HĐ
-- ====================================================

CREATE TABLE HopDong (
    MaHD SERIAL PRIMARY KEY,
    NgayKy DATE DEFAULT CURRENT_DATE,
    NgayHetHan DATE NOT NULL,
    MaKHDaiDien INT NOT NULL,
    MaNV INT NOT NULL,
    FOREIGN KEY (MaKHDaiDien) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

CREATE TABLE ThanhVienThue (
    MaHD INT,
    MaKH INT,
    PRIMARY KEY (MaHD, MaKH),
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD),
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH)
);

CREATE TABLE ChiTietGiuong (
    MaHD INT,
    MaGiuong INT,
    PRIMARY KEY (MaHD, MaGiuong),
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD),
    FOREIGN KEY (MaGiuong) REFERENCES Giuong(MaGiuong)
);

CREATE TABLE ChiTietDichVu (
    MaHD INT,
    MaDV INT,
    SoLuong INT,
    PRIMARY KEY (MaHD, MaDV),
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD),
    FOREIGN KEY (MaDV) REFERENCES DichVuKhac(MaDV)
);

CREATE TABLE HoaDonDinhKy (
    MaHDDK SERIAL PRIMARY KEY,
    TienPhong DECIMAL(10,2),
    TienDichVu DECIMAL(10,2),
    PhiQuanLy DECIMAL(10,2),
    TrangThai INT NOT NULL,
    HanThanhToan DATE,
    ThoiGianTT TIMESTAMP,
    MaGiaoDich VARCHAR(100),
    PTThanhToan VARCHAR(50),
    MaHD INT NOT NULL,
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD)
);

CREATE TABLE LichSuGiaDichVu (
    MaHDDK INT,
    MaDV INT,
    GiaTien DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (MaHDDK, MaDV),
    FOREIGN KEY (MaHDDK) REFERENCES HoaDonDinhKy(MaHDDK),
    FOREIGN KEY (MaDV) REFERENCES DichVuKhac(MaDV)
);

-- ====================================================
-- PHẦN 5: TẠO CÁC BẢNG LUỒNG TRẢ PHÒNG & ĐỐI SOÁT
-- ====================================================

CREATE TABLE YeuCauTraPhong (
    MaYC SERIAL PRIMARY KEY,
    NgayDuKien DATE,
    STKNhanCoc VARCHAR(50),
    TrangThai INT NOT NULL,
    LyDo VARCHAR(255),
    MaHD INT NOT NULL,
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD)
);

CREATE TABLE PhieuKiemTraPhong (
    MaPKT SERIAL PRIMARY KEY,
    TinhTrang VARCHAR(255),
    ChiTietHuHong VARCHAR(255),
    PhiHuHong DECIMAL(10,2),
    PhiVeSinh DECIMAL(10,2),
    ThuHoiKhoa BOOLEAN,
    KyBienBan BOOLEAN,
    MaYC INT NOT NULL,
    MaNV INT NOT NULL,
    FOREIGN KEY (MaYC) REFERENCES YeuCauTraPhong(MaYC),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

CREATE TABLE BangDoiSoat (
    MaBDS SERIAL PRIMARY KEY,
    TienCoc DECIMAL(10,2),
    KhauTru DECIMAL(10,2),
    ThucNhanChi DECIMAL(10,2),
    MaPKT INT NOT NULL,
    MaNV INT NOT NULL,
    FOREIGN KEY (MaPKT) REFERENCES PhieuKiemTraPhong(MaPKT),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);
