import bcrypt from "bcryptjs";
import { pool, query } from "../src/db.js";

const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";

if (!email || password.length < 8) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters).");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

await query(
  `INSERT INTO users (email, password_hash) VALUES ($1, $2)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
  [email, hash]
);
// Only one admin ever exists
await query("DELETE FROM users WHERE email <> $1", [email]);

console.log(`Admin ready: ${email}`);
await pool.end();