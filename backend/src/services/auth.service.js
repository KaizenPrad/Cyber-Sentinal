import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}
export function signRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}
export function slugify(name) {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) +
    '-' +
    crypto.randomBytes(3).toString('hex')
  );
}
export function cookieOptions() {
  const isProd = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000, // 1h, matches JWT_EXPIRES_IN default
    path: '/',
  };
}
