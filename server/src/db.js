import pg from "pg";
import "dotenv/config";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 15_000, // allows time for the database to wake up
});

// Neon closes idle connections; without this handler, that would crash the process
pool.on("error", (err) => console.error("Database pool error:", err.message));

export const query = (text, params) => pool.query(text, params);