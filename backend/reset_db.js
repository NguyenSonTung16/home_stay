const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'home_stay', password: '16102005', port: 5433 });
async function run() {
  try {
    const query = `
      TRUNCATE TABLE 
        PhieuDangKyHen,
        PhieuDatCoc,
        ChiSoDienNuoc,
        HopDong,
        YeuCauTraPhong,
        HoaDonDienNuoc,
        HoaDonPhiDinhKy,
        DonHang
      CASCADE;

      UPDATE Phong SET TrangThai = 1;
      UPDATE Giuong SET TrangThai = 1;
    `;
    await pool.query(query);
    console.log('Database reset successfully!');
  } catch (err) {
    console.error(err.message);
  } finally {
    pool.end();
  }
}
run();
