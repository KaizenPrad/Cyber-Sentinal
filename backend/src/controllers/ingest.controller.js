import { pool } from '../config/db.js';
import { normalizeSignal } from '../services/normalize.service.js';
import { scoreSignal } from '../services/aiScoring.service.js';
import { correlateBatch } from '../services/correlation.service.js';
import { created } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/ingest — bulk signal ingest (API-key auth skipped for hackathon; JWT required in routes)
export const ingest = asyncHandler(async (req, res) => {
  const orgId = req.user.organizationId;
  const inputs = req.validated.signals;
  const inserted = [];

  for (const input of inputs) {
    const n = normalizeSignal(input);
    const { risk_score, risk_factors } = scoreSignal(n, {});
    const r = await pool.query(
      `INSERT INTO signals (signal_type, category, severity, message, source_ip, user_identity, hostname, domain, raw_data, risk_score, risk_factors, organization_id, device_id, event_timestamp)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id, signal_type, user_identity, hostname, organization_id`,
      [n.signalType, n.category, n.severity, n.message, n.sourceIp, n.userIdentity, n.hostname, n.domain,
       JSON.stringify(n.rawData), risk_score, risk_factors, orgId, input.deviceId || null, n.eventTimestamp]
    );
    inserted.push(r.rows[0]);
  }

  // Correlate → detections → auto-incidents (risk >= 70)
  const candidates = correlateBatch(inserted);
  let detectionsTriggered = 0;
  let incidentsCreated = 0;

  for (const c of candidates) {
    const d = await pool.query(
      `INSERT INTO detections (title, detection_type, risk_score, confidence, severity, explanation, organization_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [c.title, c.detectionType, c.score, c.confidence, c.severity, JSON.stringify(c.explanation), orgId]
    );
    const detectionId = d.rows[0].id;
    for (const m of c.matched) {
      await pool.query(
        `INSERT INTO detection_signals (detection_id, signal_id, weight) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [detectionId, m.signal_id, m.weight]
      );
    }
    detectionsTriggered++;
    if (c.score >= 70) {
      await pool.query(
        `INSERT INTO incidents (title, description, status, severity, detection_id, organization_id)
         VALUES ($1,$2,'OPEN',$3,$4,$5)`,
        [c.title, c.explanation.reasoning, c.severity, detectionId, orgId]
      );
      incidentsCreated++;
    }
  }

  return created(res, { processed: inserted.length, detectionsTriggered, incidentsCreated });
});
