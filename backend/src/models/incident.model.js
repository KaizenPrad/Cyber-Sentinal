// Query helpers — tables: incidents + remediation_logs
import { pool } from '../config/db.js';

export async function findIncidentById(id, orgId) {
  const r = await pool.query('SELECT * FROM incidents WHERE id = $1 AND organization_id = $2', [id, orgId]);
  return r.rows[0] || null;
}
