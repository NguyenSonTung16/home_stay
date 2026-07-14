import { db } from './src/config/db';

async function checkDb() {
  try {
    const res = await db.query("SELECT * FROM PhieuDatCoc ORDER BY MaCoc DESC LIMIT 5;");
    console.log('Result:', JSON.stringify(res.rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkDb();
