CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  role TEXT NOT NULL DEFAULT 'MEMBER',
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  hostname TEXT NOT NULL,
  os TEXT,
  ip_address TEXT,
  criticality INT DEFAULT 50,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  signal_type TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'INFO',
  message TEXT NOT NULL,
  source_ip TEXT,
  user_identity TEXT,
  hostname TEXT,
  domain TEXT,
  raw_data JSONB DEFAULT '{}',
  risk_score INT,
  risk_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id TEXT REFERENCES devices(id) ON DELETE SET NULL,
  event_timestamp TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_signals_org_time ON signals(organization_id, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(signal_type);

CREATE TABLE IF NOT EXISTS network_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  src_ip TEXT NOT NULL,
  dst_ip TEXT NOT NULL,
  src_port INT,
  dst_port INT,
  bytes BIGINT,
  domain TEXT,
  country TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_timestamp TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS detections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  detection_type TEXT NOT NULL,
  risk_score INT NOT NULL,
  confidence INT,
  severity TEXT NOT NULL,
  explanation JSONB NOT NULL,
  status TEXT DEFAULT 'OPEN',
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS detection_signals (
  detection_id TEXT REFERENCES detections(id) ON DELETE CASCADE,
  signal_id TEXT REFERENCES signals(id) ON DELETE CASCADE,
  weight FLOAT NOT NULL,
  PRIMARY KEY (detection_id, signal_id)
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'OPEN',
  severity TEXT NOT NULL,
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  detection_id TEXT REFERENCES detections(id) ON DELETE SET NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_incidents_org_status ON incidents(organization_id, status);

CREATE TABLE IF NOT EXISTS remediation_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
