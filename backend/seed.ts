import fs from 'fs';
import path from 'path';
import { db } from './src/config/db';

async function seed() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf-8');
    await db.query(sql);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
