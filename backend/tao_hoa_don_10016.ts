import { db } from './src/config/db';

async function generate() {
  try {
    const thang = '2026-08';
    
    // 1. Sinh hoá đơn tiền phòng (Phí Định Kỳ) cho tháng 2026-08
    console.log(`Đang tạo hoá đơn Phí Định Kỳ tháng ${thang}...`);
    const resPDK = await db.query(`
      INSERT INTO HoaDonPhiDinhKy (MaHD, Thang, TienPhong, TienDichVu, TongTien, TrangThai)
      VALUES (10016, $1, 1000000, 0, 1000000, 'ChuaThanhToan')
      RETURNING MaPDK
    `, [thang]);
    const maPDK = resPDK.rows[0].mapdk;

    const maDH1 = 'TEST-PDK-' + maPDK;
    await db.query(`
      INSERT INTO DonHang (MaDH, MaHoaDon, LoaiHoaDon, TongTien, TrangThai, PhuongThuc, ThoiGianHetHan)
      VALUES ($1, $2, 'PhiDinhKy', 1000000, 'ChuaThanhToan', 'ChuyenKhoan', NOW() + INTERVAL '7 days')
    `, [maDH1, maPDK]);

    console.log('Tạo Phí Định Kỳ thành công! Mã PDK:', maPDK);

    // 2. Sinh hoá đơn điện nước cho tháng 2026-08
    console.log(`Đang tạo hoá đơn Điện Nước tháng ${thang}...`);
    const resHDDN = await db.query(`
      INSERT INTO HoaDonDienNuoc (MaPhong, Thang, CsDienCu, CsDienMoi, CsNuocCu, CsNuocMoi, TienDien, TienNuoc, TongTien, TrangThai)
      VALUES (4, $1, 250, 400, 15, 22, 525000, 140000, 665000, 'ChuaThanhToan')
      RETURNING MaHDDN
    `, [thang]);
    const maHDDN = resHDDN.rows[0].mahddn;

    const maDH2 = 'TEST-DN-' + maHDDN;
    await db.query(`
      INSERT INTO DonHang (MaDH, MaHoaDon, LoaiHoaDon, TongTien, TrangThai, PhuongThuc, ThoiGianHetHan)
      VALUES ($1, $2, 'DienNuoc', 665000, 'ChuaThanhToan', 'ChuyenKhoan', NOW() + INTERVAL '7 days')
    `, [maDH2, maHDDN]);
      
    console.log('Tạo hoá đơn Điện Nước thành công! Mã HDDN:', maHDDN);

  } catch (err) {
    console.error('Lỗi:', err);
  } finally {
    process.exit(0);
  }
}

generate();
