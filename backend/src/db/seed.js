import { pool } from '../config/db.js';
import { hashPassword, slugify } from '../services/auth.service.js';

// Demo seed: 1 org + user + devices + phishing signals (triggers correlation on next ingest)
const email = 'demo@cybersentinel.local';
await pool.query('DELETE FROM users WHERE email = $1', [email]);
const orgName = 'Demo SOC';
const org = (await pool.query('INSERT INTO organizations (name, slug) VALUES ($1,$2) RETURNING *', [orgName, slugify(orgName)])).rows[0];
const hash = await hashPassword('Demo1234!');
const user = (await pool.query(
  'INSERT INTO users (email, password_hash, first_name, last_name, organization_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
  [email, hash, 'Demo', 'Analyst', org.id]
)).rows[0];
await pool.query('INSERT INTO organization_members (user_id, organization_id, role) VALUES ($1,$2,$3)', [user.id, org.id, 'OWNER']);
for (const h of ['WS-101', 'WS-102', 'SRV-01']) {
  await pool.query('INSERT INTO devices (hostname, os, criticality, organization_id) VALUES ($1,$2,$3,$4)', [h, 'Windows 11', 70, org.id]);
}
console.log(`Seeded org=${org.id} user=${email} / Demo1234!`);
await pool.end();
