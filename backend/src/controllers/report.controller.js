import { pool } from '../config/db.js';
import { ok } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getGraphOnly = asyncHandler(async (req, res) => {
  const { buildGraph } = await import('../services/graph.service.js');
  const hours = req.query.window === '7d' ? 168 : req.query.window === '1h' ? 1 : 24;
  return ok(res, await buildGraph(req.user.organizationId, hours));
});

export const getReport = asyncHandler(async (req, res) => {
  const org = req.user.organizationId;
  const start = req.query.start ? new Date(req.query.start) : new Date(Date.now() - 7 * 864e5);
  const end = req.query.end ? new Date(req.query.end) : new Date();
  const byType = (await pool.query(
    `SELECT detection_type, COUNT(*) c FROM detections WHERE organization_id=$1 AND created_at BETWEEN $2 AND $3 GROUP BY 1`,
    [org, start, end]
  )).rows;
  const bySeverity = (await pool.query(
    `SELECT severity, COUNT(*) c FROM detections WHERE organization_id=$1 AND created_at BETWEEN $2 AND $3 GROUP BY 1`,
    [org, start, end]
  )).rows;
  const topUsers = (await pool.query(
    `SELECT user_identity, AVG(risk_score)::INT avg_risk, COUNT(*) c FROM signals
     WHERE organization_id=$1 AND event_timestamp BETWEEN $2 AND $3 AND user_identity IS NOT NULL
     GROUP BY 1 ORDER BY avg_risk DESC LIMIT 5`,
    [org, start, end]
  )).rows;
  const incidents = (await pool.query(
    `SELECT status, COUNT(*) c FROM incidents WHERE organization_id=$1 AND created_at BETWEEN $2 AND $3 GROUP BY 1`,
    [org, start, end]
  )).rows;
  return ok(res, { range: { start, end }, byType, bySeverity, topRiskyUsers: topUsers, incidents });
});
