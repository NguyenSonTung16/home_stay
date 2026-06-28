import { db } from './src/config/db';

async function check() {
  try {
    const res = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name ILIKE 'hopdong' OR table_name ILIKE 'yeucautraphong'`);
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();
