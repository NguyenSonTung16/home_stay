import { db } from './src/config/db';

async function updateDb() {
  try {
    // 1. Convert NgayCoc to TIMESTAMP (If it fails, it might need USING cast, but since it's DATE we can cast it easily or drop default, alter type, set default)
    await db.query(`ALTER TABLE PhieuDatCoc ALTER COLUMN NgayCoc DROP DEFAULT;`);
    await db.query(`ALTER TABLE PhieuDatCoc ALTER COLUMN NgayCoc TYPE TIMESTAMP USING NgayCoc::timestamp;`);
    await db.query(`ALTER TABLE PhieuDatCoc ALTER COLUMN NgayCoc SET DEFAULT CURRENT_TIMESTAMP;`);
    console.log('Successfully altered NgayCoc to TIMESTAMP.');

    // 2. Add new columns
    const columnsToAdd = [
      'GioiTinh VARCHAR(10)',
      'SoNguoiO INT DEFAULT 1',
      'NgayDuKienVao DATE',
      'MinhChung VARCHAR(255)'
    ];

    for (const col of columnsToAdd) {
      try {
        await db.query(`ALTER TABLE PhieuDatCoc ADD COLUMN ${col};`);
        console.log(`Successfully added column: ${col}`);
      } catch (err: any) {
        if (err.code === '42701') {
          console.log(`Column already exists: ${col.split(' ')[0]}`);
        } else {
          console.error(`Error adding column ${col}:`, err);
        }
      }
    }
    console.log('Database update completed.');
  } catch (err) {
    console.error('Error during DB update:', err);
  } finally {
    process.exit(0);
  }
}

updateDb();
