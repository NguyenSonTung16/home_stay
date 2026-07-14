// @ts-ignore
import { Pool } from 'pg';

import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  client_encoding: 'UTF8',
});


export const db = {
  query: async (text: string, params?: any[]) => {
    return await pool.query(text, params);
  },
  connect: () => pool.connect()
};
