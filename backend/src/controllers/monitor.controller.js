import { pool } from '../config/db.js';
import { paginated, ok } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSignals = asyncHandler(async (req, res) => {
  const { page, limit, severity, category, search, minRisk } = req.query;
  const offset = (page - 1) * limit;
  const conds = ['organization_id = $1', 'risk_score >= $2'];
  const params = [req.user.organizationId, Number(minRisk) || 0];
  if (severity) { params.push(severity); conds.push(`severity = $${params.length}`); }
  if (category) { params.push(category); conds.push(`category = $${params.length}`); }
  if (search) { params.push(`%${search}%`); conds.push(`(message ILIKE $${params.length} OR signal_type ILIKE $${params.length} OR user_identity ILIKE $${params.length})`); }
  const where = `WHERE ${conds.join(' AND ')}`;
  const total = (await pool.query(`SELECT COUNT(*) FROM signals ${where}`, params)).rows[0].count;
  const rows = (await pool.query(
    `SELECT * FROM signals ${where} ORDER BY event_timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  )).rows;
  return paginated(res, rows, Number(page), Number(limit), Number(total));
});

export const dashboardStats = asyncHandler(async (req, res) => {
  const org = req.user.organizationId;
  const [sig, det, inc, dev] = await Promise.all([
    pool.query('SELECT COUNT(*) c FROM signals WHERE organization_id=$1', [org]),
    pool.query(`SELECT COUNT(*) c FROM detections WHERE organization_id=$1 AND created_at > NOW() - INTERVAL '24 hours'`, [org]),
    pool.query(`SELECT COUNT(*) c FROM incidents WHERE organization_id=$1 AND status IN ('OPEN','INVESTIGATING')`, [org]),
    pool.query('SELECT COUNT(*) c FROM devices WHERE organization_id=$1', [org]),
  ]);
  return ok(res, {
    totalSignals: Number(sig.rows[0].c),
    detections24h: Number(det.rows[0].c),
    openIncidents: Number(inc.rows[0].c),
    devices: Number(dev.rows[0].c),
  });
});
