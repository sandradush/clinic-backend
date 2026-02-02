import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

/* 🔍 DEBUG: WHAT ENV VARS ARE ACTUALLY LOADED */
console.log("🔍 DB_USER =", process.env.DB_USER);
console.log("🔍 DB_HOST =", process.env.DB_HOST);
console.log("🔍 DB_PORT =", process.env.DB_PORT);
console.log("🔍 DB_NAME =", process.env.DB_NAME);

const { Pool } = pg;

console.log("🟡 Initializing database connection...");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Supabase PostgreSQL connected successfully");
  } catch (error) {
    console.error("❌ Supabase connection failed:", error.message);
  }
})();

export default pool;
