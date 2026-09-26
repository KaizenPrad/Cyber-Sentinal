import { pool } from '../config/db.js';

// Build { nodes, edges } for the Network Graph page over a time window.
export async function buildGraph(organizationId, hours = 24) {
  const sig = await pool.query(
    `SELECT user_identity, hostname, source_ip, domain, signal_type, risk_score, severity
     FROM signals WHERE organization_id = $1 AND event_timestamp > NOW() - ($2 || ' hours')::INTERVAL LIMIT 500`,
    [organizationId, String(hours)]
  );
  const nodes = new Map();
  const edges = [];
  const add = (id, type, label, risk = 10) => {
    if (!id || nodes.has(id)) return;
    nodes.set(id, { id, type, label, risk });
  };
  for (const r of sig.rows) {
    if (r.user_identity) add(`user:${r.user_identity}`, 'user', r.user_identity, r.risk_score);
    if (r.hostname) add(`host:${r.hostname}`, 'device', r.hostname, r.risk_score);
    if (r.source_ip) add(`ip:${r.source_ip}`, 'ip', r.source_ip, r.risk_score);
    if (r.domain) add(`dom:${r.domain}`, 'domain', r.domain, r.risk_score);
    if (r.user_identity && r.hostname) edges.push({ from: `user:${r.user_identity}`, to: `host:${r.hostname}`, label: r.signal_type });
    if (r.user_identity && r.source_ip) edges.push({ from: `user:${r.user_identity}`, to: `ip:${r.source_ip}`, label: r.signal_type });
    if (r.user_identity && r.domain) edges.push({ from: `user:${r.user_identity}`, to: `dom:${r.domain}`, label: r.signal_type });
    if (r.hostname && r.source_ip) edges.push({ from: `host:${r.hostname}`, to: `ip:${r.source_ip}`, label: r.signal_type });
    if (r.hostname && r.domain) edges.push({ from: `host:${r.hostname}`, to: `dom:${r.domain}`, label: r.signal_type });
    if (r.source_ip && r.domain) edges.push({ from: `ip:${r.source_ip}`, to: `dom:${r.domain}`, label: 'resolves' });
  }
  return { nodes: [...nodes.values()], edges: edges.slice(0, 800) };
}
export default buildGraph;
