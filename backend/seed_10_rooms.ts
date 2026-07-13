import { db } from './src/config/db';

async function seedData() {
  try {
    console.log('Truncating tables...');
    await db.query(`
      TRUNCATE TABLE 
        BangDoiSoat,
        PhieuKiemTraPhong, 
        YeuCauTraPhong, 
        ChiTietGiuong, 
        PhieuDatCoc, 
        HopDong, 
        NhanVien, 
        KhachHang, 
        Giuong, 
        Phong, 
        LoaiPhong, 
        TaiKhoan
      RESTART IDENTITY CASCADE;
    `);

    console.log('Inserting basic data...');
    // Tạo tài khoản và nhân viên
    await db.query(`INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('admin', '123', 'QuanLy', 1)`);
    await db.query(`INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Quan ly 1', 'Quan Ly', 1)`);
    
    await db.query(`INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('ketoan', '123', 'KeToan', 1)`);
    await db.query(`INSERT INTO NhanVien(TenNV, ChucVu, MaTK) VALUES ('Ke toan 1', 'Ke Toan', 2)`);

    // Tạo loại phòng
    await db.query(`INSERT INTO LoaiPhong(TenLoai, GiaTien, SucChua) VALUES ('Standard', 500000, 2), ('VIP', 1000000, 4)`);

    console.log('Inserting 10 sample records for Room check...');
    for (let i = 1; i <= 10; i++) {
      // Tài khoản khách
      await db.query(`INSERT INTO TaiKhoan(Username, Password, VaiTro, TrangThai) VALUES ('khach${i}', '123', 'Khach', 1)`);
      
      // Khách hàng
      const maTK = i + 2; 
      await db.query(`INSERT INTO KhachHang(HoTen, CCCD, SDT, MaTK) VALUES ('Khách Hàng ${i}', '0000000000${i}', '09000000${i}', ${maTK})`);
      
      // Phòng (chia ra Standard và VIP)
      const maLoai = i <= 5 ? 1 : 2;
      const tenPhong = `P.${100 + i}`;
      const imgIdx = ((i - 1) % 6) + 1;
      const hinhAnh = `http://localhost:3001/room_images/P10${imgIdx}.jpg`;
      await db.query(`INSERT INTO Phong(TenPhong, TrangThai, HinhAnh, MaLoai) VALUES ('${tenPhong}', 1, '${hinhAnh}', ${maLoai})`);

      // Phân bổ mã
      const maKH = i;
      const maPhong = i;
      const maNV = 1;

      // Giường
      await db.query(`INSERT INTO Giuong(TenGiuong, TrangThai, MaPhong) VALUES ('Giường chính phòng ${tenPhong}', 1, ${maPhong})`);

      // Phiếu đặt cọc (Tiền cọc = 3tr hoặc 5tr tùy loại)
      const tienCoc = maLoai === 1 ? 3000000 : 5000000;
      await db.query(`INSERT INTO PhieuDatCoc(SoTien, TrangThai, MaKH, MaPhong) VALUES (${tienCoc}, 1, ${maKH}, ${maPhong})`);

      // Hợp đồng
      // Hợp đồng có mã HD ngẫu nhiên lớn để dễ phân biệt, ví dụ 1001 đến 1010
      const maHD = 1000 + i;
      await db.query(`INSERT INTO HopDong(MaHD, NgayHetHan, MaKHDaiDien, MaNV) VALUES (${maHD}, '2026-12-31', ${maKH}, ${maNV})`);

      // Yêu cầu trả phòng (TrangThai = 1 là đang chờ xử lý trả phòng)
      await db.query(`INSERT INTO YeuCauTraPhong(NgayDuKien, TrangThai, MaHD) VALUES ('2024-01-01', 1, ${maHD})`);

      // Chi tiết giường (gắn giường vào hợp đồng để trả phòng có thiết bị hiển thị lên)
      await db.query(`INSERT INTO ChiTietGiuong(MaHD, MaGiuong) VALUES (${maHD}, ${i})`);
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Lỗi khi seed data:', error);
  } finally {
    process.exit(0);
  }
}

seedData();
