import { db } from './src/config/db';
import fs from 'fs';
import path from 'path';

async function resetDB() {
  try {
    console.log('Reading init.sql...');
    const initSql = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf8');
    
    console.log('Executing init.sql (This will drop and recreate tables)...');
    // Drop all tables first by dropping public schema
    await db.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO homestay_user;
      GRANT ALL ON SCHEMA public TO public;
    `);
    await db.query(initSql);
    console.log('init.sql executed successfully.');

    console.log('Reading seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');
    
    console.log('Executing seed.sql...');
    await db.query(seedSql);
    console.log('seed.sql executed successfully.');

    console.log('Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDB();
