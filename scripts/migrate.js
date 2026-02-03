require('dotenv').config();
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function run() {
  const sqlPath = path.join(__dirname, '..', 'migrations', '001_create_tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    console.log('Running migration:', sqlPath);
    await pool.query(sql);
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  }
}

run();
