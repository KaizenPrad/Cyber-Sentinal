// Query helpers — table: users / organizations / sessions
import { pool } from '../config/db.js';

export async function findUserByEmail(email) {
  const r = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return r.rows[0] || null;
}
export async function findUserById(id) {
  const r = await pool.query('SELECT id, email, first_name, last_name, organization_id FROM users WHERE id = $1', [id]);
  return r.rows[0] || null;
}
