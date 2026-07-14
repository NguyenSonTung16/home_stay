import { db } from './src/config/db';

async function addSoGiuong() {
  try {
    await db.query(`ALTER TABLE PhieuDatCoc ADD COLUMN SoGiuong INT DEFAULT 1;`);
    console.log('Successfully added SoGiuong column to PhieuDatCoc.');
  } catch (error: any) {
    if (error.code === '42701') {
      console.log('Column SoGiuong already exists.');
    } else {
      console.error('Error adding column:', error);
    }
  } finally {
    process.exit(0);
  }
}

addSoGiuong();
