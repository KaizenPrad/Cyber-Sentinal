# CyberLedger PERN Stack Rebuild Guide

## What CyberLedger Is

A **security audit and monitoring platform** (like a simplified Splunk/Datadog). Organizations register, create applications, ingest security events via API keys, run detection rules against those events, generate alerts, and manage incident response. It's multi-tenant (organization-scoped).

---

# Part 1: Frontend UI Development

## Current Architecture (Next.js) vs Your Rebuild (React)

The current app uses **Next.js App Router** with `"use client"` on every page (it's fully client-rendered). Your React rebuild will use **React Router** instead of Next.js file-based routing. The UI logic stays identical.

## Component Library Stack

| Library | What It Provides | Install |
|---|---|---|
| **DaisyUI** | Pre-built Tailwind component classes (btn, card, badge, drawer, etc.) | `npm i -D daisyui` |
| **21st.dev** | Copy-paste animated/advanced components (bento grids, particle backgrounds, animated cards) | Browse and copy from 21st.dev |
| **React Bits** | Copy-paste UI patterns (split layouts, glass morphism, marquee, etc.) | Browse and copy from reactbits.dev |
| **Lucide React** | Icons (Shield, AlertTriangle, Activity, etc.) — already used in CyberLedger | `npm i lucide-react` |
| **Recharts** | Charts (BarChart, PieChart) — already used | `npm i recharts` |

### How They Fit Together

- **DaisyUI** provides base components: `btn`, `card`, `badge`, `input`, `select`, `table`, `drawer`, `modal`, `alert`, `tabs`, `tooltip`, `dropdown`
- **21st.dev** provides special animated components you copy into your project (e.g., animated gradient backgrounds, bento grids)
- **React Bits** provides layout patterns (e.g., glass morphism cards, split-screen auth)
- **Lucide** provides all icons
- **Recharts** provides data visualizations

### DaisyUI Installation & Configuration

```bash
npm i -D tailwindcss daisyui
```

In `tailwind.config.js`:
```js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark", "corporate"],  // dark for dashboard, corporate for auth
    darkTheme: "dark",
  },
};
```

### Theming

CyberLedger uses a **dark slate theme** (slate-900 backgrounds, slate-800 borders, blue-500 accents). With DaisyUI, you customize this via `data-theme` on `<html>` or via tailwind config:

```html
<html data-theme="dark" class="bg-slate-950">
```

Then override DaisyUI's CSS variables in your CSS:
```css
:root {
  --p: 217 91% 60%;      /* primary: blue */
  --b1: 222 47% 7%;       /* base-1: slate-950 */
  --b2: 217 33% 14%;      /* base-2: slate-900 */
  --b3: 215 25% 20%;      /* base-3: slate-800 */
  --bc: 210 40% 98%;      /* base content: white */
}
```

## Complete React Folder Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # API client layer
│   │   ├── client.js           # Axios/fetch wrapper with interceptors
│   │   ├── auth.js             # login(), register(), logout(), getSession()
│   │   ├── alerts.js           # getAlerts(), getAlert(), updateAlert(), addRemediation()
│   │   ├── events.js           # getEvents(), ingestEvents()
│   │   ├── rules.js            # getRules(), createRule(), updateRule(), deleteRule()
│   │   ├── apps.js             # getApps(), createApp(), updateApp(), deleteApp(), createAppKey()
│   │   ├── dashboard.js        # getDashboard()
│   │   ├── timeline.js         # getTimeline()
│   │   ├── reports.js          # getReport()
│   │   ├── members.js          # getMembers(), inviteMember()
│   │   └── settings.js         # getSettings(), updateSettings()
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx     # Navigation sidebar (Dashboard, Alerts, Events, Rules, etc.)
│   │   │   ├── TopBar.jsx      # Mobile hamburger + logo
│   │   │   └── DashboardLayout.jsx  # Wraps all /dashboard/* pages
│   │   ├── ui/                 # Base reusable components (DaisyUI-wrapped)
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   └── Spinner.jsx
│   │   ├── dashboard/
│   │   │   ├── StatsGrid.jsx     # 4 stat cards (Apps, Events, Rules, Alerts)
│   │   │   ├── SeverityChart.jsx # PieChart for alert severity
│   │   │   ├── EventTypeChart.jsx # BarChart for events by type
│   │   │   └── RecentAlerts.jsx  # Last 5 alerts list
│   │   ├── alerts/
│   │   │   ├── AlertFilters.jsx  # Search + status/severity selects
│   │   │   ├── AlertList.jsx     # Alert rows with links to detail
│   │   │   ├── AlertDetail.jsx   # Full alert view with events + remediation
│   │   │   └── RemediationForm.jsx # Add remediation action
│   │   ├── events/
│   │   │   ├── EventFilters.jsx
│   │   │   └── EventTable.jsx    # Table of all events
│   │   ├── rules/
│   │   │   ├── RuleList.jsx      # Rule cards with toggle/delete
│   │   │   └── CreateRuleModal.jsx # Dialog to create new rule
│   │   ├── apps/
│   │   │   ├── AppList.jsx
│   │   │   ├── AppDetail.jsx
│   │   │   └── CreateAppModal.jsx
│   │   ├── team/
│   │   │   └── MemberList.jsx
│   │   ├── settings/
│   │   │   └── SettingsForm.jsx
│   │   ├── timeline/
│   │   │   └── TimelineList.jsx
│   │   └── reports/
│   │       └── ReportView.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   └── dashboard/
│   │       ├── DashboardPage.jsx
│   │       ├── AlertsPage.jsx
│   │       ├── AlertDetailPage.jsx
│   │       ├── EventsPage.jsx
│   │       ├── RulesPage.jsx
│   │       ├── AppsPage.jsx
│   │       ├── AppDetailPage.jsx
│   │       ├── TimelinePage.jsx
│   │       ├── ReportsPage.jsx
│   │       ├── TeamPage.jsx
│   │       └── SettingsPage.jsx
│   ├── hooks/
│   │   ├── useAuth.js          # Auth state + login/logout/register
│   │   ├── usePagination.js    # Page state + fetch with pagination
│   │   └── useFetch.js         # Generic data fetching hook
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth state provider
│   ├── utils/
│   │   ├── colors.js           # severityColor(), statusColor()
│   │   ├── format.js           # formatDate(), formatDateTime(), timeAgo()
│   │   └── validation.js       # Shared validation schemas (zod)
│   ├── App.jsx                 # Router setup
│   ├── main.jsx                # ReactDOM.createRoot + providers
│   └── index.css               # Tailwind + DaisyUI + custom styles
├── package.json
├── vite.config.js              # Using Vite (not CRA)
├── tailwind.config.js
├── postcss.config.js
└── .env
```

## Pages & User Flow

### 1. Register Page (`/register`)
- Form: firstName, lastName, email, password, organizationName
- POST to `/api/auth/register`
- On success → redirect to `/dashboard`
- Shows error on failure

### 2. Login Page (`/login`)
- Form: email, password
- POST to `/api/auth/login`
- If MFA enabled → prompt for TOTP code → re-POST with totpCode
- On success → redirect to `/dashboard`

### 3. Dashboard Layout (wraps all dashboard pages)
- Sidebar with 9 nav items: Dashboard, Alerts, Events, Rules, Applications, Timeline, Reports, Team, Settings
- User info + logout button at bottom
- Checks `/api/auth/session` on mount; redirects to `/login` if unauthorized
- Mobile: hamburger menu opens drawer

### 4. Dashboard Page (`/dashboard`)
- 4 stat cards: Applications, Total Events, Active Rules, Open Alerts
- PieChart: alerts by severity (CRITICAL/HIGH/MEDIUM/LOW/INFO)
- BarChart: events by type (last 24h)
- Recent alerts list (last 5)

### 5. Alerts Page (`/dashboard/alerts`)
- Filter bar: search, status dropdown, severity dropdown
- List of alerts (clickable → detail page)
- Each shows: title, app name, rule name, severity badge, status badge, timestamp
- Pagination

### 6. Alert Detail Page (`/dashboard/alerts/:id`)
- Full alert info
- Linked security events
- Remediation log (add new remediation action)
- Timeline events

### 7. Events Page (`/dashboard/events`)
- Filter bar: search, severity, category
- Table: message, eventType, category, severity, sourceIp, application, timestamp
- Pagination

### 8. Rules Page (`/dashboard/rules`)
- List of rules as cards (toggle enable/disable, delete)
- "New Rule" button → modal with: name, description, ruleType, severity, conditions (JSON), actions (JSON)

### 9. Apps Page (`/dashboard/apps`)
- List of applications with event/alert counts
- "New App" button → create app
- Click app → detail page with app keys management

### 10. Timeline Page (`/dashboard/timeline`)
- Chronological list of organizational events

### 11. Reports Page (`/dashboard/reports`)
- Aggregated data: alerts by severity/status, events by type/category, top IPs, rule stats

### 12. Team Page (`/dashboard/team`)
- List of organization members
- Invite member form (admin/owner only)

### 13. Settings Page (`/dashboard/settings`)
- Edit profile (name)
- Edit organization name

## State Management

The current app uses **useState + useEffect + fetch** directly in components (no global state library). For your rebuild, keep it simple:

- **Auth state**: React Context (`AuthContext`) — stores user, organization, role
- **Page data**: Local `useState` + `useEffect` with `fetch` in each page
- **Server state**: Consider **TanStack Query** (`@tanstack/react-query`) for caching/refetching (the original has it as a dependency but doesn't use it)

## Data Flow Pattern

```
User Action → Component onChange → Local State
  → Form Submit → fetch("/api/...")
    → API calls backend
      → Response: { success: true, data: {...}, meta: {...} }
        → setState(data) → Re-render
```

## Loading/Error/Empty States

Every page implements three states:
1. **Loading**: "Loading..." text or spinner
2. **Error**: Red alert banner with error message
3. **Empty**: "No [items] found" with icon and helper text

```jsx
if (loading) return <Spinner />;
if (error) return <Alert type="error">{error}</Alert>;
if (items.length === 0) return <EmptyState icon={AlertTriangle} message="No alerts found" />;
```

---

# Part 2: Database Design (PostgreSQL)

## MongoDB → PostgreSQL Translation

| MongoDB Concept | PostgreSQL Equivalent |
|---|---|
| Database | Database |
| Collection | Table |
| Document | Row |
| Field | Column |
| `_id` | `id` (UUID or cuid) |
| `ObjectId` reference | Foreign key |
| Embedded subdocument | JSON column or separate table |
| Array of strings | `TEXT[]` array type |
| `$lookup` (join) | JOIN query |
| `$group` | GROUP BY |
| Schemaless flexibility | Strict schema + enums |

## Complete Schema

Here are all 16 tables from the Prisma schema, translated to pure SQL:

### 1. organizations
```sql
CREATE TABLE organizations (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  plan       TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE','STARTER','BUSINESS','ENTERPRISE')),
  logo_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. users
```sql
CREATE TABLE users (
  id                     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email                  TEXT NOT NULL UNIQUE,
  password_hash          TEXT NOT NULL,
  first_name             TEXT NOT NULL,
  last_name              TEXT NOT NULL,
  avatar_url             TEXT,
  email_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  email_verify_token     TEXT,
  reset_password_token   TEXT,
  reset_password_expires TIMESTAMPTZ,
  totp_secret            TEXT,
  totp_enabled           BOOLEAN NOT NULL DEFAULT FALSE,
  recovery_codes         TEXT,
  last_login_at          TIMESTAMPTZ,
  organization_id        TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, organization_id)
);
```

### 3. organization_members
```sql
CREATE TABLE organization_members (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  role            TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER','ADMIN','MEMBER','VIEWER')),
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);
```

### 4. sessions
```sql
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL UNIQUE,
  ip_address    TEXT,
  user_agent    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5. applications
```sql
CREATE TABLE applications (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  description     TEXT,
  platform        TEXT NOT NULL DEFAULT 'WEB' CHECK (platform IN ('WEB','MOBILE','API','DESKTOP','IOT','OTHER')),
  status          TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 6. app_keys (for event ingestion)
```sql
CREATE TABLE app_keys (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  key_hash        TEXT NOT NULL UNIQUE,
  key_prefix      TEXT NOT NULL,
  permissions     TEXT[] NOT NULL DEFAULT ARRAY['ingest'],
  rate_limit      INTEGER NOT NULL DEFAULT 1000,
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  revoked         BOOLEAN NOT NULL DEFAULT FALSE,
  application_id  TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7. api_keys (for management API)
```sql
CREATE TABLE api_keys (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  key_hash        TEXT NOT NULL UNIQUE,
  key_prefix      TEXT NOT NULL,
  permissions     TEXT[] NOT NULL,
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  revoked         BOOLEAN NOT NULL DEFAULT FALSE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 8. security_events (the big one — raw ingested events)
```sql
CREATE TABLE security_events (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  event_type        TEXT NOT NULL,
  category          TEXT NOT NULL,
  severity          TEXT NOT NULL DEFAULT 'INFO',
  source_ip         TEXT,
  source_port       INTEGER,
  destination_ip    TEXT,
  destination_port  INTEGER,
  user_id_field     TEXT,
  user_agent        TEXT,
  hostname          TEXT,
  message           TEXT NOT NULL,
  description       TEXT,
  raw_data          JSONB,
  tags              TEXT[] DEFAULT ARRAY[]::TEXT[],
  geo_country       TEXT,
  geo_city          TEXT,
  event_timestamp   TIMESTAMPTZ NOT NULL,
  ingested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at      TIMESTAMPTZ,
  application_id    TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  app_key_id        TEXT REFERENCES app_keys(id) ON DELETE SET NULL
);

CREATE INDEX idx_se_events_type_time ON security_events(event_type, event_timestamp);
CREATE INDEX idx_se_events_app_time ON security_events(application_id, event_timestamp);
CREATE INDEX idx_se_events_source_ip ON security_events(source_ip, event_timestamp);
CREATE INDEX idx_se_events_cat_sev ON security_events(category, severity);
```

### 9. normalized_events
```sql
CREATE TABLE normalized_events (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  raw_event_id     TEXT NOT NULL UNIQUE,
  event_type       TEXT NOT NULL,
  category         TEXT NOT NULL,
  severity         TEXT NOT NULL,
  source_ip        TEXT,
  user_identity    TEXT,
  target_resource  TEXT,
  action           TEXT,
  outcome          TEXT,
  risk_score       INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors     TEXT[] DEFAULT ARRAY[]::TEXT[],
  enrichment_data  JSONB,
  processed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ne_risk_score ON normalized_events(risk_score);
CREATE INDEX idx_ne_processed ON normalized_events(processed_at);
```

### 10. security_rules
```sql
CREATE TABLE security_rules (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name              TEXT NOT NULL,
  description       TEXT,
  rule_type         TEXT NOT NULL CHECK (rule_type IN ('THRESHOLD','PATTERN','ANOMALY_STATIC','COMPOUND','BLACKLIST','WHITELIST','TIME_BASED','GEO_BASED','CUSTOM')),
  enabled           BOOLEAN NOT NULL DEFAULT TRUE,
  conditions        JSONB NOT NULL,
  actions           JSONB[] NOT NULL,
  severity          TEXT NOT NULL DEFAULT 'MEDIUM',
  last_triggered_at TIMESTAMPTZ,
  trigger_count     INTEGER NOT NULL DEFAULT 0,
  organization_id   TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 11. rule_states
```sql
CREATE TABLE rule_states (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  rule_id      TEXT NOT NULL REFERENCES security_rules(id) ON DELETE CASCADE,
  event_count  INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL,
  window_end   TIMESTAMPTZ NOT NULL,
  state_data   JSONB,
  last_event_at TIMESTAMPTZ,
  UNIQUE(rule_id, window_start)
);
```

### 12. alerts
```sql
CREATE TABLE alerts (
  id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title              TEXT NOT NULL,
  description        TEXT,
  status             TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','INVESTIGATING','CONFIRMED','RESOLVED','FALSE_POSITIVE','DISMISSED')),
  severity           TEXT NOT NULL,
  confidence         INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  rule_id            TEXT REFERENCES security_rules(id) ON DELETE SET NULL,
  source_ip          TEXT,
  affected_users     TEXT[] DEFAULT ARRAY[]::TEXT[],
  affected_apps      TEXT[] DEFAULT ARRAY[]::TEXT[],
  evidence           JSONB,
  assignee_id        TEXT REFERENCES users(id) ON DELETE SET NULL,
  organization_id    TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  application_id     TEXT REFERENCES applications(id) ON DELETE SET NULL,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at        TIMESTAMPTZ,
  acknowledged_at    TIMESTAMPTZ
);

CREATE INDEX idx_alerts_status_sev ON alerts(status, severity);
CREATE INDEX idx_alerts_org_status ON alerts(organization_id, status);
CREATE INDEX idx_alerts_created ON alerts(created_at);
```

### 13. alert_events (many-to-many join)
```sql
CREATE TABLE alert_events (
  id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  alert_id TEXT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES security_events(id) ON DELETE CASCADE,
  UNIQUE(alert_id, event_id)
);
```

### 14. remediation_logs
```sql
CREATE TABLE remediation_logs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  alert_id    TEXT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL CHECK (action IN ('ACKNOWLEDGED','INVESTIGATING','CONTAINED','ERADICATED','RECOVERED','FALSE_POSITIVE','ESCALATED','BLOCKED_IP','DISABLED_USER','REVOKED_ACCESS','UPDATED_POLICY','CUSTOM')),
  notes       TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 15. timeline_events
```sql
CREATE TABLE timeline_events (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  event_type      TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  entity_type     TEXT,
  entity_id       TEXT,
  metadata        JSONB,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alert_id        TEXT REFERENCES alerts(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_org_time ON timeline_events(organization_id, created_at);
```

### 16. audit_logs
```sql
CREATE TABLE audit_logs (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  action          TEXT NOT NULL,
  resource        TEXT NOT NULL,
  resource_id     TEXT,
  old_values      JSONB,
  new_values      JSONB,
  ip_address      TEXT,
  user_agent      TEXT,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_org_time ON audit_logs(organization_id, created_at);
CREATE INDEX idx_audit_user_time ON audit_logs(user_id, created_at);
```

### 17. invitations
```sql
CREATE TABLE invitations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'MEMBER',
  token           TEXT NOT NULL UNIQUE,
  expires_at      TIMESTAMPTZ NOT NULL,
  accepted_at     TIMESTAMPTZ,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 18. webhooks
```sql
CREATE TABLE webhooks (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  url               TEXT NOT NULL,
  secret            TEXT NOT NULL,
  events            TEXT[] DEFAULT ARRAY[]::TEXT[],
  enabled           BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  failure_count     INTEGER NOT NULL DEFAULT 0,
  organization_id   TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Neon vs Supabase Comparison

| Feature | Neon | Supabase |
|---|---|---|
| PostgreSQL hosting | Yes | Yes (built on PostgreSQL) |
| Connection pooling | Built-in (uses PgBouncer) | Built-in (via Supavisor) |
| Free tier | 0.5 GB storage, 24/7 compute | 500 MB, 50K MAU auth |
| Dashboard | Web UI | Full dashboard + auth + storage + realtime |
| Best for | Pure PostgreSQL + your own auth | If you want built-in auth, storage, realtime |
| **Recommendation** | **Use Neon** — you're building your own auth | Use Supabase if you want their auth as backup |

## Neon Setup Steps

### Step 1: Create Account
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create a project: name = `cyberledger`, region = `US East`

### Step 2: Get Connection String
1. In Neon dashboard → Connection Details
2. Copy the connection string: `postgresql://neondb_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
3. Use the **pooled** connection string (port 5432) for your app

### Step 3: Local Environment Variables
```bash
# .env
DATABASE_URL="postgresql://neondb_owner:xxxx@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-64-char-random-string-here"
JWT_REFRESH_SECRET="your-other-64-char-random-string"
```

Generate secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Step 4: Push Schema to Neon
```bash
npx prisma db push
npx prisma generate
```

### Step 5: Seed Data
```bash
npx tsx prisma/seed.ts
```

## Backend Database Connection (pg Pool)

```javascript
// backend/src/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },  // Required for Neon
  max: 20,           // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Helper for transactions
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { pool, withTransaction };
```

---

# Part 3: Backend Architecture (Express)

## Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js            # PostgreSQL pool
│   │   └── env.js           # Environment variable validation
│   ├── middleware/
│   │   ├── auth.js           # JWT verification middleware
│   │   ├── authorize.js      # Role-based access control
│   │   ├── validate.js       # Zod schema validation middleware
│   │   ├── rateLimiter.js    # Rate limiting
│   │   ├── cors.js           # CORS configuration
│   │   ├── logger.js         # Request logging
│   │   └── errorHandler.js   # Global error handler
│   ├── routes/
│   │   ├── auth.js           # /api/auth/*
│   │   ├── dashboard.js      # /api/dashboard
│   │   ├── alerts.js         # /api/alerts/*
│   │   ├── events.js         # /api/events/*
│   │   ├── rules.js          # /api/rules/*
│   │   ├── apps.js           # /api/apps/*
│   │   ├── timeline.js       # /api/timeline
│   │   ├── reports.js        # /api/reports
│   │   ├── members.js        # /api/org/members
│   │   ├── settings.js       # /api/settings
│   │   └── ingest.js         # /api/events/ingest (API key auth)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── alertController.js
│   │   ├── eventController.js
│   │   ├── ruleController.js
│   │   ├── appController.js
│   │   ├── timelineController.js
│   │   ├── reportController.js
│   │   ├── memberController.js
│   │   └── settingsController.js
│   ├── services/
│   │   ├── authService.js        # Password hashing, JWT, session management
│   │   ├── normalizeService.js   # Event normalization + risk scoring
│   │   ├── ruleEngineService.js  # Rule evaluation
│   │   ├── apiKeyService.js      # API key generation + validation
│   │   └── emailService.js       # Email sending (future)
│   ├── utils/
│   │   ├── apiResponse.js    # Consistent response format
│   │   └── nanoid.js         # ID generation
│   └── app.js                # Express app setup + middleware stack
├── scripts/
│   └── seed.js               # Database seeding
├── package.json
└── .env
```

## Middleware Stack Order (Why Sequence Matters)

```javascript
// backend/src/app.js
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. SECURITY HEADERS (first — sets security headers before anything else)
app.use(helmet());

// 2. CORS (must come before routes so preflight OPTIONS requests work)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// 3. REQUEST LOGGING (early so every request is logged)
app.use(morgan('combined'));

// 4. BODY PARSING (before routes need to read body)
app.use(express.json({ limit: '10mb' }));

// 5. RATE LIMITING (before routes to protect them)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Too many requests' },
});
app.use('/api/', limiter);

// 6. ROUTES (after all middleware that needs to run first)
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/apps', appRoutes);
// ... etc

// 7. 404 HANDLER (after all routes)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// 8. ERROR HANDLER (very last — catches all errors from routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});
```

**Why this order matters:**
- Helmet sets security headers first
- CORS must handle OPTIONS preflight before routes
- Logging should capture every request
- Body parsing must happen before routes try to read `req.body`
- Rate limiting protects routes
- Routes handle actual logic
- Error handler is last to catch anything that slips through

## Complete API Endpoints

### Authentication

| Method | Endpoint | Body | Response | Status |
|---|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password, firstName, lastName, organizationName }` | `{ success, data: { user, organization, token }, message }` | 201 |
| POST | `/api/auth/login` | `{ email, password, totpCode? }` | `{ success, data: { user, organization, role, token, refreshToken } }` | 200 |
| GET | `/api/auth/session` | — (cookie) | `{ success, data: { user, organization, role } }` | 200 |
| POST | `/api/auth/logout` | — | `{ success, message }` | 200 |
| POST | `/api/auth/forgot-password` | `{ email }` | `{ success, message }` | 200 |
| POST | `/api/auth/reset-password` | `{ token, password }` | `{ success, message }` | 200 |
| POST | `/api/auth/mfa/enable` | `{ password }` | `{ success, data: { secret, qrCode } }` | 200 |
| POST | `/api/auth/mfa/verify` | `{ code, secret }` | `{ success, message }` | 200 |

### Dashboard
| Method | Endpoint | Response |
|---|---|---|
| GET | `/api/dashboard` | `{ stats, recentAlerts, severityDistribution, eventsPerHour }` |

### Alerts
| Method | Endpoint | Body | Notes |
|---|---|---|---|
| GET | `/api/alerts?page=1&limit=20&status=&severity=&search=` | — | Paginated, filtered |
| GET | `/api/alerts/:id` | — | Full detail with events, remediation, timeline |
| PATCH | `/api/alerts/:id` | `{ status?, assigneeId? }` | Update status/assignee |
| POST | `/api/alerts/:id/remediation` | `{ action, notes?, metadata? }` | Log remediation action |

### Events
| Method | Endpoint | Body/Params | Notes |
|---|---|---|---|
| GET | `/api/events?page=1&limit=50&severity=&category=&search=` | — | Paginated, filtered |
| POST | `/api/events/ingest` | `{ events: [...] }` | **API key auth** (Bearer token), bulk ingest |

### Rules
| Method | Endpoint | Body | Notes |
|---|---|---|---|
| GET | `/api/rules?page=1&limit=20` | — | Paginated |
| POST | `/api/rules` | `{ name, description, ruleType, severity, conditions, actions }` | Create |
| PATCH | `/api/rules/:id` | `{ enabled?, name?, ... }` | Update |
| DELETE | `/api/rules/:id` | — | Delete |

### Applications
| Method | Endpoint | Body | Notes |
|---|---|---|---|
| GET | `/api/apps?page=1&limit=20` | — | Paginated |
| POST | `/api/apps` | `{ name, description, platform }` | Create |
| GET | `/api/apps/:id` | — | Detail with keys |
| PATCH | `/api/apps/:id` | `{ name?, description?, status? }` | Update |
| DELETE | `/api/apps/:id` | — | Delete |
| POST | `/api/apps/:id/keys` | `{ name, permissions, rateLimit, expiresAt }` | Generate ingestion key |

### Other
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/timeline?page=1&limit=20` | Chronological org events |
| GET | `/api/reports?startDate=&endDate=` | Aggregated report |
| GET | `/api/org/members?page=1&limit=20` | List members |
| POST | `/api/org/members` | `{ email, role }` | Invite (admin only) |
| GET | `/api/settings` | Get user + org settings |
| PATCH | `/api/settings` | `{ firstName?, lastName?, organizationName? }` |

## Security Implementation

### JWT (in `services/authService.js`)
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
```

### Auth Middleware
```javascript
// middleware/auth.js
const { verifyToken } = require('../services/authService');
const { pool } = require('../config/db');

async function authMiddleware(req, res, next) {
  // Try cookie first, then Authorization header
  const token = req.cookies?.['cyberledger-token']
    || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Attach user to request
  const result = await pool.query(
    `SELECT u.*, o.id as org_id, o.name as org_name, o.slug as org_slug, o.plan as org_plan,
            om.role as member_role
     FROM users u
     JOIN organizations o ON o.id = u.organization_id
     LEFT JOIN organization_members om ON om.user_id = u.id AND om.organization_id = o.id
     WHERE u.id = $1`,
    [payload.userId]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const row = result.rows[0];
  req.user = {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    organizationId: row.org_id,
    organization: { id: row.org_id, name: row.org_name, slug: row.org_slug, plan: row.org_plan },
    role: row.member_role,
  };

  next();
}

module.exports = authMiddleware;
```

### Authorization Middleware
```javascript
// middleware/authorize.js
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
  };
}

// Usage: router.post('/members', auth, authorize('OWNER', 'ADMIN'), handler);
```

### Input Validation Middleware
```javascript
// middleware/validate.js
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.errors[0].message,
      });
    }
    req.validated = result.data;
    next();
  };
}

// Usage: router.post('/login', validate(loginSchema), authController.login);
```

### SQL Injection Prevention

**Always use parameterized queries** (the `$1, $2` syntax):

```javascript
// SAFE — parameterized
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1 AND organization_id = $2',
  [email, orgId]
);

// DANGEROUS — never do this
const result = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`  // SQL INJECTION!
);
```

### Password Security
- **bcrypt** with 12 salt rounds (already in CyberLedger)
- Minimum 8 chars, uppercase, lowercase, number required
- Never log passwords
- Never return password hashes in responses

### Secret Management
- Use `dotenv` for development
- Use environment variables in production (set in Railway/Render dashboard)
- Never commit `.env` files
- Generate random secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### HTTPS
- Handled by your hosting provider (Railway/Render/Vercel all provide HTTPS by default)
- In Express, add: `app.set('trust proxy', 1)` for proper IP detection behind reverse proxies

---

# Part 4: Complete Step-by-Step Build Guide

## Phase 0: Project Initialization

### Step 1: Create Project Root
```bash
mkdir cyberledger-pern && cd cyberledger-pern
git init
```

### Step 2: Create Frontend (Vite + React)
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss @tailwindcss/vite daisyui
npm install lucide-react recharts react-router-dom axios zod react-hook-form @tanstack/react-query
```

Verify: `npm run dev` → opens browser on localhost:5173 with Vite welcome page

### Step 3: Create Backend
```bash
cd ..  # back to root
mkdir backend && cd backend
npm init -y
npm install express cors helmet morgan express-rate-limit bcryptjs jsonwebtoken pg nanoid zod dotenv cookie-parser
npm install -D nodemon
```

Verify: create `backend/src/app.js` with basic Express server, `npx nodemon src/app.js` → "Server running on port 3001"

### Step 4: Set Up Git
```bash
# From root
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

## Phase 1: Database

### Step 5: Local PostgreSQL Setup
```bash
# Install PostgreSQL locally (or use Docker)
# Mac:
brew install postgresql@16
brew services start postgresql@16
createdb cyberledger

# Windows:
# Download installer from postgresql.org, create database

# Linux:
sudo apt install postgresql
sudo -u postgres createdb cyberledger
```

### Step 6: Create Schema
```bash
cd backend
# Create the SQL file with all table creation queries from Part 2
# Run it:
psql -U postgres -d cyberledger -f scripts/schema.sql
```

Verify: `psql -U postgres -d cyberledger -c "\dt"` → lists all 18 tables

### Step 7: Seed Local Database
```bash
# Create scripts/seed.js using the seed data from Part 2
node scripts/seed.js
```

Verify: `psql -U postgres -d cyberledger -c "SELECT * FROM users"` → shows demo user

### Step 8: Migrate to Neon
1. Create Neon account at https://neon.tech
2. Create project, copy connection string
3. Update `backend/.env`:
```
DATABASE_URL="postgresql://neondb_owner:xxxx@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```
4. Run schema on Neon:
```bash
psql "postgresql://neondb_owner:xxxx@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require" -f scripts/schema.sql
node scripts/seed.js
```

## Phase 2: Backend Build (In Dependency Order)

### Step 9: Database Connection (`src/config/db.js`)
```bash
# Create backend/src/config/db.js with the pool code from Part 3
```
Verify: `node -e "const {pool} = require('./src/config/db'); pool.query('SELECT 1').then(r => console.log('DB OK')).catch(e => console.error(e))"`

### Step 10: Auth Service (`src/services/authService.js`)
```bash
# Create with hashPassword, verifyPassword, generateToken, verifyToken, etc.
```

### Step 11: Auth Middleware (`src/middleware/auth.js`)
```bash
# Create JWT verification middleware from Part 3
```

### Step 12: Auth Routes (`src/routes/auth.js` + `src/controllers/authController.js`)
Build in order:
1. `POST /api/auth/register` — create org + user + member + session + JWT
2. `POST /api/auth/login` — verify credentials + MFA check + session + JWT
3. `GET /api/auth/session` — verify token, return user data
4. `POST /api/auth/logout` — invalidate session, clear cookie

Verify: Use curl/Postman:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Admin123!","firstName":"John","lastName":"Doe","organizationName":"Test Corp"}'
```

### Step 13: Dashboard Route
```bash
# GET /api/dashboard — count apps, events, alerts, rules + recent alerts + charts
```

### Step 14: Apps Routes
```bash
# GET /api/apps, POST /api/apps, GET /api/apps/:id, PATCH /api/apps/:id, DELETE /api/apps/:id
# POST /api/apps/:id/keys — generate ingestion API key
```

### Step 15: Event Normalization Service
```bash
# src/services/normalizeService.js — map raw event types to enums, infer category/severity, compute risk score
```

### Step 16: Rule Engine Service
```bash
# src/services/ruleEngineService.js — evaluate conditions, create alerts when triggered
```

### Step 17: Events Routes
```bash
# GET /api/events — paginated, filtered
# POST /api/events/ingest — API key auth, bulk ingest, normalize, evaluate rules
```

### Step 18: Alerts Routes
```bash
# GET /api/alerts, GET /api/alerts/:id, PATCH /api/alerts/:id
# POST /api/alerts/:id/remediation
```

### Step 19: Rules Routes
```bash
# GET /api/rules, POST /api/rules, PATCH /api/rules/:id, DELETE /api/rules/:id
```

### Step 20: Remaining Routes
```bash
# GET /api/timeline, GET /api/reports
# GET /api/org/members, POST /api/org/members
# GET /api/settings, PATCH /api/settings
```

### Step 21: Error Handler (`src/middleware/errorHandler.js`)
```bash
# Global error handler as last middleware
```

## Phase 3: Frontend Build (In User Flow Order)

### Step 22: Configure Tailwind + DaisyUI
```bash
# frontend/tailwind.config.js — add DaisyUI plugin
# frontend/src/index.css — @import "tailwindcss";
# frontend/vite.config.js — proxy /api to localhost:3001
```

### Step 23: API Client (`src/api/client.js`)
```bash
# Axios instance with baseURL, interceptors for auth
```

### Step 24: Auth Context + Hook
```bash
# src/context/AuthContext.jsx — login, logout, register, user state
# src/hooks/useAuth.js
```

### Step 25: Login Page
```bash
# src/pages/LoginPage.jsx — form → POST /api/auth/login → redirect
```

### Step 26: Register Page
```bash
# src/pages/RegisterPage.jsx — form → POST /api/auth/register → redirect
```

### Step 27: Dashboard Layout
```bash
# src/components/layout/Sidebar.jsx — 9 nav items
# src/components/layout/DashboardLayout.jsx — sidebar + main content
```

### Step 28: Dashboard Page
```bash
# src/pages/dashboard/DashboardPage.jsx — stats + charts + recent alerts
```

### Step 29: Alerts Pages
```bash
# src/pages/dashboard/AlertsPage.jsx — filters + list + pagination
# src/pages/dashboard/AlertDetailPage.jsx — detail + remediation
```

### Step 30: Events Page
```bash
# src/pages/dashboard/EventsPage.jsx — filters + table + pagination
```

### Step 31: Rules Page
```bash
# src/pages/dashboard/RulesPage.jsx — list + create modal + toggle/delete
```

### Step 32: Apps Pages
```bash
# src/pages/dashboard/AppsPage.jsx — list + create
# src/pages/dashboard/AppDetailPage.jsx — detail + keys
```

### Step 33: Remaining Pages
```bash
# Timeline, Reports, Team, Settings pages
```

### Step 34: Router Setup
```bash
# src/App.jsx — React Router with routes, protected routes, redirects
```

## Phase 4: Integration & Testing

### Step 35: Connect Frontend to Backend
```bash
# frontend/vite.config.js:
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
```

### Step 36: Test Full Flow
1. Start backend: `cd backend && npx nodemon src/app.js`
2. Start frontend: `cd frontend && npm run dev`
3. Register → Login → Dashboard → Create App → Create Rule → Check alerts

## Phase 5: Deployment

### Step 37: Deploy Backend to Railway
1. Push code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Set environment variables in Railway dashboard:
   - `DATABASE_URL` (from Neon)
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `PORT` (Railway sets this automatically)
4. Railway auto-detects and deploys
5. Get your backend URL: `https://cyberledger-api.up.railway.app`

### Step 38: Deploy Frontend to Vercel
1. Go to https://vercel.com → Import GitHub repo → select `frontend/` as root
2. Set environment variable: `VITE_API_URL=https://cyberledger-api.up.railway.app`
3. Update `src/api/client.js` to use `import.meta.env.VITE_API_URL`
4. Deploy

### Step 39: Final Configuration
- Update CORS in backend to allow Vercel URL
- Set `cookie` domain settings for cross-origin auth
- Test production deployment end-to-end

## Issues to Avoid from Original Code

1. **Exposed `.env` with real credentials** — The original `.env` has a real Neon connection string. Never commit real secrets.
2. **`console.log` of tokens** — The original logs tokens in development. Remove in production.
3. **No middleware layer** — Original has auth checks duplicated in every route handler. Use middleware.
4. **`any` types everywhere** — TypeScript was barely used. Define proper types.
5. **No rate limiting on auth routes** — Login/register should have stricter limits.
6. **`prompt()` for MFA** — The login page uses `prompt()` for MFA codes. Build a proper modal.
7. **Hardcoded dark theme** — Every component manually sets `bg-slate-900`. Use DaisyUI theme system instead.
8. **No error boundaries** — Add React error boundaries for graceful error handling.
9. **No testing** — Add Vitest + React Testing Library for frontend, Jest for backend.
10. **Rules engine bug** — In `rule-engine.ts:183`, the `applicationId` filter is set to `undefined`. This means threshold rules count events across ALL applications, not just the relevant one.

---

# Appendix A: Application User Manual

## A1. Core Application Purpose & Workflow

### What It Does (Plain Terms)

CyberLedger is a **security monitoring platform**. Think of it as a simplified version of tools like Splunk, Datadog, or SentinelOne.

**The problem it solves:** When you run software (websites, mobile apps, APIs, servers), those systems generate events — login attempts, data access, errors, network connections. Individually, these events are meaningless. But together, patterns emerge: someone failing to log in 50 times from the same IP is probably a brute force attack. CyberLedger collects these events, runs detection rules against them, and tells you when something looks dangerous.

**Who it's for:** Security teams at companies that run software. A 5-person startup might use it. A 500-person enterprise would use a more expensive tool like Splunk instead.

### The Complete User Journey

**Day 1 — Setup:**
1. You (the security lead) go to the CyberLedger website and register
2. You create an "organization" — this is your company's workspace
3. You land on the dashboard — it's empty because nothing is connected yet

**Day 1 — Connect Your First Application:**
4. You go to the Applications page and click "New App"
5. You enter "Web Portal" and select "WEB" as the platform
6. CyberLedger generates an **ingestion API key** (looks like `clapp_xxxxxxxxxxxx`)
7. You copy this key and give it to your development team
8. Your developers add code to your web application that sends security events to CyberLedger's API using that key

**Day 2+ — Monitoring:**
9. Events start flowing in — login successes, failures, data access, etc.
10. The dashboard now shows charts and numbers
11. You create **detection rules** (e.g., "alert me if there are more than 10 failed logins in 5 minutes from the same IP")
12. When a rule matches, CyberLedger creates an **alert**
13. You see the alert on the Alerts page
14. You investigate, assign it to a team member, add remediation notes
15. You resolve the alert

**Ongoing:**
- You check the dashboard daily
- You adjust rules as threats evolve
- You generate reports for management
- You invite team members to help investigate

---

## A2. Key Concepts Defined

### What Are "Alerts"?

An **alert** is a notification that something suspicious happened. It is the central object you interact with.

**What triggers an alert:**
- A **detection rule** matches an incoming event. For example, a rule says "if more than 10 AUTH_FAILURE events happen in 5 minutes from the same IP, create an alert." When event #11 arrives, the rule fires and creates an alert.
- Alerts can also be created manually (though the UI doesn't currently support this).

**Where alerts appear:**
- On the **Dashboard page** — the "Open Alerts" stat card and the "Recent Alerts" list
- On the **Alerts page** — a full paginated list with filters
- On the **Alert Detail page** — complete information about one alert

**Who receives alerts:**
- Anyone in the organization who has access to the dashboard
- Alerts can be **assigned** to a specific team member (the `assignee`)
- In a future version, alerts could be sent via email, Slack, or webhook

**What actions can be taken on an alert:**

| Action | What It Means |
|---|---|
| Change status to `INVESTIGATING` | "We're looking into this" |
| Change status to `CONFIRMED` | "This is a real threat" |
| Change status to `RESOLVED` | "We fixed it" |
| Change status to `FALSE_POSITIVE` | "This was a false alarm" |
| Change status to `DISMISSED` | "We don't care about this" |
| **Add remediation** | Log a specific action taken (e.g., "Blocked IP 203.0.113.45", "Disabled user account", "Reset password") |
| **Assign to someone** | Delegate investigation to a team member |

**Alert lifecycle:**
```
OPEN → INVESTIGATING → CONFIRMED → RESOLVED
  ↓                       ↓
FALSE_POSITIVE          DISMISSED
```

### What Are "Rules"?

A **rule** is a condition that you define. It watches incoming events and decides whether to create an alert.

**How rules are created:**
1. You go to the Rules page
2. Click "New Rule"
3. Fill in: name, description, rule type, severity, conditions (JSON), actions (JSON)
4. Click "Create Rule"

**What conditions rules evaluate:**

A rule's `conditions` field is a JSON object. Here are the key fields:

```json
{
  "eventType": ["AUTH_FAILURE", "AUTH_MFA_FAILURE"],
  "threshold": 10,
  "windowMinutes": 5,
  "sourceIp": "203.0.113.45",
  "category": "AUTHENTICATION",
  "severity": "HIGH",
  "tags": ["suspicious"]
}
```

| Field | What It Checks |
|---|---|
| `eventType` | Only trigger for these event types (e.g., AUTH_FAILURE) |
| `threshold` | Minimum number of matching events needed |
| `windowMinutes` | Time window for the threshold (sliding window) |
| `sourceIp` | Only trigger from this specific IP |
| `category` | Only trigger for this event category |
| `severity` | Only trigger for this severity level |
| `tags` | Only trigger if event has one of these tags |

**Rule types:**

| Type | What It Does |
|---|---|
| `THRESHOLD` | "If X events happen within Y minutes" — most common |
| `PATTERN` | "If events match a specific pattern" |
| `GEO_BASED` | "If events come from unusual geographic locations" |
| `TIME_BASED` | "If events happen outside business hours" |
| `BLACKLIST` | "If an event matches a blacklisted IP/user" |
| `ANOMALY_STATIC` | "If event count deviates from a baseline" |

**What outputs rules produce:**

When a rule matches, it creates an alert with:
- `title`: "{rule name} - Triggered"
- `severity`: taken from the rule's action or the rule's default severity
- `status`: `OPEN`
- `evidence`: JSON with the triggering event details
- `sourceIp`: from the triggering event
- `affectedUsers`: from the triggering event

### Relationship Between Alerts and Rules

```
Rule watches events → Rule matches → Rule creates Alert
```

- A **rule** is the cause; an **alert** is the effect
- One rule can create many alerts (each time it triggers)
- One alert can be linked back to one rule (the `ruleId` field)
- Rules are configured once and run continuously
- Alerts are ephemeral — you investigate and resolve them

---

## A3. Page-by-Page Interface Reference

### Login (`/login`)
- Email + password form
- MFA code prompt if enabled
- Links to Register and Forgot Password
- On success → `/dashboard`

### Register (`/register`)
- firstName, lastName, email, password, organizationName
- Creates org + user + OWNER membership
- On success → `/dashboard`

### Dashboard (`/dashboard`)
- 4 stat cards: Applications, Total Events, Active Rules, Open Alerts
- Pie chart: alerts by severity
- Bar chart: events by type (last 24h)
- Recent alerts list (last 5)

### Alerts (`/dashboard/alerts`)
- Filter bar: search, status dropdown, severity dropdown
- Clickable alert rows → detail page
- Pagination

### Alert Detail (`/dashboard/alerts/:id`)
- Full alert info + status controls
- Linked security events table
- Remediation log + add form
- Timeline events

### Events (`/dashboard/events`)
- Filter bar: search, severity, category
- Table: message, type, category, severity, sourceIp, app, time
- Pagination

### Rules (`/dashboard/rules`)
- Rule cards with toggle/delete
- "New Rule" modal: name, description, ruleType, severity, conditions (JSON), actions (JSON)

### Applications (`/dashboard/apps`)
- App cards with event/alert counts
- "New App" modal
- Click → detail page with API key management

### App Detail (`/dashboard/apps/:id`)
- App info + API keys list
- "Generate Key" modal (key shown ONCE)

### Timeline, Reports, Team, Settings
- **Timeline**: chronological org events
- **Reports**: aggregated alerts/events/stats with date filter
- **Team**: member list + invite form (admin only)
- **Settings**: edit profile + org name

---

## A4. Common User Tasks

### Task 1: Set Up Monitoring
1. Applications → New App → fill in → Create
2. Click app → Generate Key → copy key
3. Give key to developers → they add `Authorization: Bearer <key>` to event ingestion calls

### Task 2: Create a Detection Rule
1. Rules → New Rule
2. Name, type (Threshold), severity (High)
3. Conditions: `{"eventType": ["AUTH_FAILURE"], "threshold": 10, "windowMinutes": 5}`
4. Actions: `[{"type": "alert", "severity": "HIGH"}]`
5. Create → rule is now active

### Task 3: Investigate an Alert
1. Alerts → click alert
2. Read details, check linked events
3. Change status → "Investigating"
4. Add Remediation → select action (e.g., BLOCKED_IP) → notes → Submit
5. After fix → change status → "Resolved"

### Task 4: Invite a Team Member
1. Team → Invite Member
2. Email + role → Send Invitation

### Task 5: Generate a Report
1. Reports → set date range (optional)
2. View aggregated data for management

---

## A5. Database & Schema Development Workflow

### How Schemas Work

CyberLedger uses **Prisma** as its ORM. The schema file is at `prisma/schema.prisma`.

**Workflow:**
1. Edit `prisma/schema.prisma`
2. `npx prisma db push` — pushes changes to database
3. `npx prisma generate` — regenerates TypeScript client
4. Test in pgAdmin / Neon SQL Editor / psql

### Connecting to Neon from pgAdmin

1. Open pgAdmin → Servers → Register → Server
2. **General tab:** Name = "CyberLedger Neon"
3. **Connection tab:**
   - Host: `ep-xxx-pooler.us-east-2.aws.neon.tech`
   - Port: `5432`
   - Database: `neondb`
   - Username: `neondb_owner`
   - Password: (from `DATABASE_URL`)
   - SSL mode: `Require`
4. Right-click → Query Tool → write SQL → Execute

### Connecting from Command Line
```bash
psql "postgresql://neondb_owner:xxxx@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
\dt              # list tables
\d alerts        # describe table
SELECT count(*) FROM alerts;
\q               # quit
```

### Neon Web SQL Editor
1. https://console.neon.tech → SQL Editor
2. Write and run SQL directly in browser

### Recommended Schema Workflow
```
1. Edit prisma/schema.prisma
2. npx prisma db push
3. npx prisma generate
4. Test in pgAdmin/Neon SQL Editor
5. If issues, fix schema and repeat
6. When done: npx prisma migrate dev --name <description>
```

---

## A6. Application ↔ Neon Integration

### What Gets Stored in Neon

| Data | Table |
|---|---|
| Organizations | `organizations` |
| Users | `users` |
| User roles | `organization_members` |
| Sessions | `sessions` |
| Applications | `applications` |
| API keys (ingestion) | `app_keys` |
| API keys (management) | `api_keys` |
| Raw events | `security_events` |
| Normalized events | `normalized_events` |
| Detection rules | `security_rules` |
| Rule state | `rule_states` |
| Alerts | `alerts` |
| Alert-event links | `alert_events` |
| Remediation logs | `remediation_logs` |
| Timeline events | `timeline_events` |
| Audit logs | `audit_logs` |
| Invitations | `invitations` |
| Webhooks | `webhooks` |

### What Lives in Application Code
- Auth logic (JWT, bcrypt)
- Event normalization (mapping raw types → enums)
- Rule evaluation (condition checking)
- Risk scoring (0-100 algorithm)
- API key hashing (SHA-256)

### Schema Change Propagation
```
prisma/schema.prisma → npx prisma db push → Neon database
                   → npx prisma generate → TypeScript client
```

For production:
```
prisma/schema.prisma → npx prisma migrate dev → migration.sql (committed to git)
                    → npx prisma migrate deploy → applied in production
```

---

## A7. Concrete Example: End-to-End

### Scenario
**You are Sarah, security lead at Acme Corp. You want to detect brute force attacks.**

### Step 1: Register
1. Open `http://localhost:3000` → redirected to `/login`
2. Click "Sign up" → fill in Sarah's info → "Create account"
3. **Behind the scenes:** org + user + membership created in Neon, JWT cookie set

### Step 2: Create Application
1. Empty dashboard → Applications → New App → "Web Portal" → Create
2. **Behind the scenes:** `INSERT INTO applications (...)` + audit log + timeline event

### Step 3: Generate Key
1. Click "Web Portal" → Generate Key → "Production Ingestion" → Create
2. **Key shown ONCE:** `clapp_a1b2c3d4e5f6...`
3. Key is SHA-256 hashed and stored in `app_keys`

### Step 4: Developer Sends Events
Mike adds code to send events:
```javascript
await fetch('https://cyberledger-api.up.railway.app/api/events/ingest', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer clapp_a1b2c3d4e5f6...',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    events: [{
      eventType: 'auth.failure',
      category: 'authentication',
      severity: 'high',
      sourceIp: request.ip,
      message: 'Invalid password attempt',
      eventTimestamp: new Date().toISOString(),
    }]
  })
});
```

**Behind the scenes:** key validated → event normalized → risk score computed → stored in `security_events` + `normalized_events` → all rules evaluated

### Step 5: Create Rule
1. Sarah → Rules → New Rule → "Brute Force Detection"
2. Conditions: `{"eventType": ["AUTH_FAILURE"], "threshold": 10, "windowMinutes": 5}`
3. Create → `INSERT INTO security_rules (...)`

### Step 6: Rule Fires
Attacker tries 10 passwords in 5 minutes. Event #10 arrives:
- Rule engine counts: 10 AUTH_FAILURE events in last 5 minutes
- 10 >= threshold (10) → **Rule fires!**
- `INSERT INTO alerts (...)` + `INSERT INTO alert_events (...)` + timeline event

### Step 7: Sarah Investigates
1. Dashboard shows "Open Alerts: 1"
2. Clicks alert → sees details, 10 linked events
3. Changes status → "Investigating"
4. Adds remediation → "BLOCKED_IP" → notes → Submit
5. After fix → changes status → "Resolved"
6. Dashboard: "Open Alerts: 0"

---

## A8. Data Flow Diagram

```
YOUR APPLICATION (Web Portal, Mobile App, API)
  User fails login → app generates event
  POST /api/events/ingest
  Authorization: Bearer clapp_xxxxxxxx
  { eventType: "auth.failure", ... }
        │
        ▼
CYBERLEDGER API (Express)
  1. Validate API key (SHA-256 hash lookup)
  2. Normalize event (map raw type → enum)
  3. Compute risk score
  4. Store in security_events
  5. Store in normalized_events
  6. Evaluate ALL enabled rules
  7. If rule matches → create alert
  8. Return { processed: 1, alertsTriggered: N }
        │
        ▼
NEON DATABASE (PostgreSQL)
  security_events, normalized_events,
  security_rules, alerts, alert_events,
  timeline_events, audit_logs
        │
        ▼
CYBERLEDGER DASHBOARD (React)
  Dashboard: stats + charts + recent alerts
  Alerts: filtered list + detail + remediation
  Events: searchable table
  Rules: create/toggle/delete
  Apps: manage + API keys
```

---

## A9. Glossary

| Term | Definition |
|---|---|
| **Organization** | A company's workspace. All data is scoped to an org. |
| **User** | A person who can log in and use the dashboard. |
| **Application** | A software system being monitored (web app, API, mobile app). |
| **Event** | A single security-related occurrence (login attempt, data access, etc.). |
| **Rule** | A condition that watches events and creates alerts when matched. |
| **Alert** | A notification that a rule fired. Requires investigation. |
| **Remediation** | An action taken on an alert (blocked IP, disabled user, etc.). |
| **Timeline** | A chronological log of organizational activities. |
| **Audit Log** | A record of who did what and when (for compliance). |
| **API Key** | A secret token used to authenticate event ingestion. |
| **MFA** | Multi-Factor Authentication (TOTP codes from authenticator apps). |
| **JWT** | JSON Web Token — used for session authentication. |
| **Neon** | A managed PostgreSQL database service (like AWS RDS but serverless). |
| **Prisma** | An ORM that lets you write TypeScript instead of SQL. |
| **Risk Score** | A 0-100 number indicating how dangerous an event is. |
| **Normalization** | Converting raw event types (e.g., "auth.failure") to standard enums (e.g., AUTH_FAILURE). |
| **Sliding Window** | A time period that moves forward (e.g., "last 5 minutes from now"). |

---

## A10. Troubleshooting

| Problem | Solution |
|---|---|
| Dashboard shows all zeros | No events being ingested. Check app is sending events to correct URL with valid API key. |
| "Unauthorized" error on API calls | API key may be revoked/expired. Generate new one on App Detail page. |
| Alerts not triggering | Check rule is enabled. Verify conditions match events. Check threshold and time window. |
| Can't log in | Verify email/password. Check if MFA enabled (need authenticator app). |
| Database connection errors | Check `DATABASE_URL` in `.env`. For Neon, ensure SSL mode is `require`. |
| "Column does not exist" errors | Run `npx prisma db push` to sync schema with database. |
| Slow queries | Check indexes. Schema includes indexes on `security_events(event_type, event_timestamp)` and `alerts(organization_id, status)`. |
