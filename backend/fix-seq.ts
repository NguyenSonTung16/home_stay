import { db } from './src/config/db';

async function fixSeq() {
  try {
    await db.query(`
      SELECT setval(pg_get_serial_sequence('"phieukiemtraphong"', 'mapkt'), coalesce(max(mapkt), 0) + 1, false) FROM "phieukiemtraphong";
    `);
    console.log('Fixed sequence successfully');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

fixSeq();
