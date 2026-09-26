import { pool, withTransaction } from '../config/db.js';
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken, slugify, cookieOptions } from '../services/auth.service.js';
import { ok, created } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, organizationName } = req.validated;
  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (exists.rows.length > 0) return res.status(409).json({ success: false, error: 'Email already registered' });

  const data = await withTransaction(async (c) => {
    const org = await c.query(
      `INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id, name, slug`,
      [organizationName, slugify(organizationName)]
    );
    const organization = org.rows[0];
    const hash = await hashPassword(password);
    const u = await c.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, organization_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, email, first_name, last_name, organization_id`,
      [email.toLowerCase(), hash, firstName, lastName, organization.id]
    );
    const user = u.rows[0];
    await c.query(
      `INSERT INTO organization_members (user_id, organization_id, role) VALUES ($1,$2,'OWNER')`,
      [user.id, organization.id]
    );
    const refresh = signRefreshToken();
    await c.query(
      `INSERT INTO sessions (id, user_id, refresh_token, ip_address, user_agent, expires_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW() + INTERVAL '30 days')`,
      [user.id, refresh, req.ip, req.headers['user-agent'] || null]
    );
    return { organization, user, refresh };
  });

  const token = signAccessToken({ userId: data.user.id, orgId: data.organization.id });
  res.cookie((await import('../config/env.js')).env.tokenCookie, token, cookieOptions());
  return created(res, {
    user: { id: data.user.id, email: data.user.email, firstName: data.user.first_name, lastName: data.user.last_name },
    organization: data.organization,
    role: 'OWNER',
    token,
  }, 'Registered');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated;
  const r = await pool.query(
    `SELECT u.*, COALESCE(om.role,'OWNER') AS role, o.name AS org_name, o.slug AS org_slug
     FROM users u JOIN organizations o ON o.id = u.organization_id
     LEFT JOIN organization_members om ON om.user_id = u.id AND om.organization_id = o.id
     WHERE u.email = $1`, [email.toLowerCase()]
  );
  if (r.rows.length === 0) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const row = r.rows[0];
  if (!(await verifyPassword(password, row.password_hash))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  const token = signAccessToken({ userId: row.id, orgId: row.organization_id });
  const refresh = signRefreshToken();
  await pool.query(
    `INSERT INTO sessions (id, user_id, refresh_token, ip_address, user_agent, expires_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW() + INTERVAL '30 days')`,
    [row.id, refresh, req.ip, req.headers['user-agent'] || null]
  );
  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [row.id]);
  const { env } = await import('../config/env.js');
  res.cookie(env.tokenCookie, token, cookieOptions());
  return ok(res, {
    user: { id: row.id, email: row.email, firstName: row.first_name, lastName: row.last_name },
    organization: { id: row.organization_id, name: row.org_name, slug: row.org_slug },
    role: row.role, token, refreshToken: refresh,
  });
});

export const session = asyncHandler(async (req, res) => ok(res, req.user));

export const logout = asyncHandler(async (req, res) => {
  const { env } = await import('../config/env.js');
  res.clearCookie(env.tokenCookie, { path: '/' });
  return ok(res, null, 'Logged out');
});
