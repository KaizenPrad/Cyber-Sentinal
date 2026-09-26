import { pool } from '../config/db.js';
import { ok, paginated, created } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listIncidents = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(100, Number(req.query.limit || 20));
  const offset = (page - 1) * limit;
  const conds = ['i.organization_id = $1'];
  const params = [req.user.organizationId];
  if (req.query.status) { params.push(req.query.status); conds.push(`i.status = $${params.length}`); }
  if (req.query.severity) { params.push(req.query.severity); conds.push(`i.severity = $${params.length}`); }
  const where = `WHERE ${conds.join(' AND ')}`;
  const total = Number((await pool.query(`SELECT COUNT(*) c FROM incidents i ${where}`, params)).rows[0].c);
  const rows = (await pool.query(
    `SELECT i.*, u.email AS assignee_email FROM incidents i LEFT JOIN users u ON u.id = i.assignee_id
     ${where} ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  )).rows;
  return paginated(res, rows, page, limit, total);
});

export const getIncident = asyncHandler(async (req, res) => {
  const r = await pool.query('SELECT * FROM incidents WHERE id=$1 AND organization_id=$2', [req.params.id, req.user.organizationId]);
  if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Incident not found' });
  const incident = r.rows[0];
  const remediation = (await pool.query('SELECT * FROM remediation_logs WHERE incident_id=$1 ORDER BY created_at ASC', [incident.id])).rows;
  let signals = [];
  if (incident.detection_id) {
    signals = (await pool.query(
      `SELECT s.*, ds.weight FROM detection_signals ds JOIN signals s ON s.id=ds.signal_id WHERE ds.detection_id=$1`,
      [incident.detection_id]
    )).rows;
  }
  return ok(res, { ...incident, remediation, signals });
});

export const updateIncident = asyncHandler(async (req, res) => {
  const { status, assigneeId } = req.validated;
  const sets = [];
  const params = [];
  if (status) { params.push(status); sets.push(`status = $${params.length}`); }
  if (assigneeId !== undefined) { params.push(assigneeId); sets.push(`assignee_id = $${params.length}`); }
  if (status === 'RESOLVED') sets.push(`resolved_at = NOW()`);
  if (sets.length === 0) return res.status(400).json({ success: false, error: 'Nothing to update' });
  params.push(req.params.id, req.user.organizationId);
  const r = await pool.query(
    `UPDATE incidents SET ${sets.join(', ')} WHERE id=$${params.length - 1} AND organization_id=$${params.length} RETURNING *`,
    params
  );
  if (r.rows.length === 0) return res.status(404).json({ success: false, error: 'Incident not found' });
  return ok(res, r.rows[0]);
});

export const addRemediation = asyncHandler(async (req, res) => {
  const { action, notes } = req.validated;
  const inc = await pool.query('SELECT id FROM incidents WHERE id=$1 AND organization_id=$2', [req.params.id, req.user.organizationId]);
  if (inc.rows.length === 0) return res.status(404).json({ success: false, error: 'Incident not found' });
  const r = await pool.query(
    `INSERT INTO remediation_logs (incident_id, user_id, action, notes) VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.params.id, req.user.id, action, notes || null]
  );
  return created(res, r.rows[0], 'Remediation logged');
});
