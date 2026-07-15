const { Pool } = require('pg');
async function check() {
  const pool = new Pool({user:'postgres',host:'localhost',database:'home_stay',password:'16102005',port:5433});
  const res = await pool.query(`SELECT
    tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' AND (tc.table_name='hopdong' OR tc.table_name='phieudatcoc' OR ccu.table_name='hopdong' OR ccu.table_name='phieudatcoc');`);
  console.log(res.rows);
  await pool.end();
}
check();
