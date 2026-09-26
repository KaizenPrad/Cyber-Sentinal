import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../config/db.js';

export async function authenticate(req, res, next) {
  try {
    const token =
      req.cookies?.[env.tokenCookie] ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    const r = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.organization_id,
              o.name AS org_name, o.slug AS org_slug,
              COALESCE(om.role, 'OWNER') AS role
       FROM users u
       JOIN organizations o ON o.id = u.organization_id
       LEFT JOIN organization_members om ON om.user_id = u.id AND om.organization_id = o.id
       WHERE u.id = $1`,
      [payload.userId]
    );
    if (r.rows.length === 0) return res.status(401).json({ success: false, error: 'User not found' });

    const row = r.rows[0];
    req.user = {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      organizationId: row.organization_id,
      organization: { id: row.organization_id, name: row.org_name, slug: row.org_slug },
      role: row.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}
