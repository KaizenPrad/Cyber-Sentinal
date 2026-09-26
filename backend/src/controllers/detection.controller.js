import { pool } from '../config/db.js';
import { buildGraph } from '../services/graph.service.js';
import { ok, paginated } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getGraph = asyncHandler(async (req, res) => {
  const hours = req.query.window === '7d' ? 168 : req.query.window === '1h' ? 1 : 24;
  const data = await buildGraph(req.user.organizationId, hours);
  return ok(res, data);
});

export const listDetections = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(100, Number(req.query.limit || 20));
  const offset = (page - 1) * limit;
  const conds = ['organization_id = $1'];
  const params = [req.user.organizationId];
  if (req.query.type) { params.push(req.query.type); conds.push(`detection_type = $${params.length}`); }
  if (req.query.severity) { params.push(req.query.severity); conds.push(`severity = $${params.length}`); }
  const where = `WHERE ${conds.join(' AND ')}`;
  const total = Number((await pool.query(`SELECT COUNT(*) c FROM detections ${where}`, params)).rows[0].c);
  const rows = (await pool.query(
    `SELECT d.*, (SELECT COUNT(*) FROM detection_signals ds WHERE ds.detection_id = d.id) AS signals_count
     FROM detections d ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  )).rows;
  return paginated(res, rows, page, limit, total);
});

export const getDetection = asyncHandler(async (req, res) => {
  const d = await pool.query('SELECT * FROM detections WHERE id=$1 AND organization_id=$2', [req.params.id, req.user.organizationId]);
  if (d.rows.length === 0) return res.status(404).json({ success: false, error: 'Detection not found' });
  const sigs = await pool.query(
    `SELECT s.*, ds.weight FROM detection_signals ds JOIN signals s ON s.id = ds.signal_id WHERE ds.detection_id=$1`,
    [req.params.id]
  );
  return ok(res, { ...d.rows[0], signals: sigs.rows });
});

export const promoteDetection = asyncHandler(async (req, res) => {
  const d = await pool.query('SELECT * FROM detections WHERE id=$1 AND organization_id=$2', [req.params.id, req.user.organizationId]);
  if (d.rows.length === 0) return res.status(404).json({ success: false, error: 'Detection not found' });
  const det = d.rows[0];
  const inc = await pool.query(
    `INSERT INTO incidents (title, description, status, severity, detection_id, organization_id)
     VALUES ($1,$2,'OPEN',$3,$4,$5) RETURNING *`,
    [det.title, det.explanation?.reasoning || det.title, det.severity, det.id, req.user.organizationId]
  );
  return res.status(201).json({ success: true, data: inc.rows[0] });
});
