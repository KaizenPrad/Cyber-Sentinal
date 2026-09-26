// Query helpers — tables: detections + detection_signals
import { pool } from '../config/db.js';

export async function findDetectionById(id, orgId) {
  const r = await pool.query('SELECT * FROM detections WHERE id = $1 AND organization_id = $2', [id, orgId]);
  return r.rows[0] || null;
}
