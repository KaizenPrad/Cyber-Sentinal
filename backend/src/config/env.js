import 'dotenv/config';

function required(name, fallback = undefined) { 
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    console.warn(`[env] Missing ${name} — set it in backend/.env (see .env.example)`);
  }
  return v;
}

export const env = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: required('DATABASE_URL', ''),
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-change-me'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev-only-refresh-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  tokenCookie: process.env.TOKEN_COOKIE_NAME || 'cybersentinel-token',
};

export default env;
