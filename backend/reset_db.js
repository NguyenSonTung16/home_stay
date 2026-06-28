const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function resetDB() {
  try {
    console.log('Connecting to database...');
    // Drop all tables in public schema
    console.log('Dropping public schema...');
    await pool.query('DROP SCHEMA public CASCADE;');
    await pool.query('CREATE SCHEMA public;');
    await pool.query('GRANT ALL ON SCHEMA public TO postgres;');
    await pool.query('GRANT ALL ON SCHEMA public TO public;');

    console.log('Running init.sql...');
    const initSql = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf-8');
    await pool.query(initSql);

    console.log('Running seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf-8');
    await pool.query(seedSql);

    console.log('Database reset successfully!');
  } catch (err) {
    console.error('Error resetting database:', err);
  } finally {
    await pool.end();
  }
}

resetDB();
