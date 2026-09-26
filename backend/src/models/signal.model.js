// Query helpers — table: signals
import { pool } from '../config/db.js';

export async function countSignals(orgId) {
  const r = await pool.query('SELECT COUNT(*) c FROM signals WHERE organization_id = $1', [orgId]);
  return Number(r.rows[0].c);
}
