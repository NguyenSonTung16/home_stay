import { db } from './src/config/db';

async function fixDB() {
  try {
    await db.query(`
      INSERT INTO PhieuKiemTraPhong(MaPKT, TinhTrang, ChiTietHuHong, PhiHuHong, PhiVeSinh, ThuHoiKhoa, KyBienBan, MaYC, MaNV) 
      VALUES (1, 'Tot', '', 0, 200000, true, true, 1, 1) ON CONFLICT DO NOTHING
    `);
    console.log('Fixed DB successfully');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

fixDB();
