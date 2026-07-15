const { Pool } = require('pg');
async function check() {
  const pool = new Pool({user:'postgres',host:'localhost',database:'home_stay',password:'16102005',port:5433});
  const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'donhang'`);
  console.log('donhang columns:', res.rows);
  await pool.end();
}
check();
