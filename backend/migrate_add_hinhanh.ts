import { db } from './src/config/db';

async function migrate() {
  try {
    console.log('Checking and adding HinhAnh column to Phong table...');
    await db.query(`ALTER TABLE Phong ADD COLUMN IF NOT EXISTS HinhAnh VARCHAR(255);`);
    console.log('Column HinhAnh added successfully.');

    // Cập nhật ảnh cho các phòng nếu chưa có
    const roomsResult = await db.query(`SELECT MaPhong FROM Phong ORDER BY MaPhong`);
    const rooms = roomsResult.rows || [];
    for (let i = 0; i < rooms.length; i++) {
      const maPhong = rooms[i].maphong || rooms[i].MaPhong;
      const imgIdx = (i % 6) + 1;
      const hinhAnh = `http://localhost:3000/room_images/P10${imgIdx}.jpg`;
      await db.query(`UPDATE Phong SET HinhAnh = $1 WHERE MaPhong = $2`, [hinhAnh, maPhong]);
    }
    console.log('Updated existing room images successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
