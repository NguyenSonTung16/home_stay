import { db } from './src/config/db';

async function fixBeds() {
  try {
    const res = await db.query(`
      SELECT p.MaPhong, p.TenPhong, lp.SucChua 
      FROM Phong p 
      JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai
    `);
    const rooms = res.rows;

    for (const room of rooms) {
      const countRes = await db.query('SELECT COUNT(*) as count FROM Giuong WHERE MaPhong = $1', [room.maphong]);
      const tongGiuongHienCo = parseInt(countRes.rows[0].count);
      const sucChua = parseInt(room.succhua);

      if (tongGiuongHienCo < sucChua) {
        const bedsToInsert = sucChua - tongGiuongHienCo;
        console.log(`Room ${room.tenphong} (ID: ${room.maphong}): Inserting ${bedsToInsert} missing beds.`);
        for (let i = 0; i < bedsToInsert; i++) {
          await db.query(
            'INSERT INTO Giuong (TenGiuong, TrangThai, MaPhong) VALUES ($1, 0, $2)',
            [`Giường ${tongGiuongHienCo + i + 1} phòng ${room.tenphong}`, room.maphong]
          );
        }
      }
    }
    console.log('Fixed all missing beds successfully.');
  } catch (err) {
    console.error('Error fixing beds:', err);
  } finally {
    process.exit(0);
  }
}

fixBeds();
