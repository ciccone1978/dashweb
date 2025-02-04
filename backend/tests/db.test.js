// usage: npm test

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

describe('Database Connection', () => {
  test('Should connect to the database successfully', async () => {
    let client;
    try {
      client = await pool.connect();
      const res = await client.query('SELECT NOW()');
      expect(res.rows.length).toBeGreaterThan(0);
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    } finally {
      if (client) client.release();
    }
  });
});
