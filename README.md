# CyberSentinel — AI Cyber Threat Detection

An **intelligent cybersecurity platform** that monitors **network, user and device behaviour** to detect unusual activity such as **phishing, malware behaviour, ransomware indicators, or unauthorized access**.

Unlike signature-only tools (which miss zero-days), CyberSentinel **correlates multiple weak signals** into high-confidence detections with AI risk scoring and explainability.

> Evolution of `cyberLedger`: same PERN foundation (PostgreSQL + Express + React + Node), rebuilt around behavioral AI + correlation instead of static rules-only.

---

## 1. Navbar & Information Architecture

```
Home | Threat Monitor | Network Graph | AI Detection | Incidents | Security Report
```

| Route | Page | Purpose |
|---|---|---|
| `/` | **Home** | Landing + platform status: active threats, protection score, live stats, how it works |
| `/monitor` | **Threat Monitor** | Live feed of signals/events: network flows, logins, file activity, email/URL clicks. Filter by severity, category, device/user |
| `/graph` | **Network Graph** | Interactive graph of devices ↔ users ↔ IPs ↔ domains. Visualize lateral movement, C2, blast radius |
| `/detection` | **AI Detection** | AI engine view: risk scores (0-100), correlated detections, why-it-fired explanation, signal weights, model health |
| `/incidents` | **Incidents** | Case management: triage, assign, contain, remediate, resolve. Linked signals + timeline |
| `/report` | **Security Report** | Aggregated posture: threats by type/severity, top risky users/devices/IPs, MTTR, exportable summary |

User journey:
```
Onboard device/app → Ingest behaviour → Signals normalized → AI correlates → Detection → Incident → Remediate → Report
```

---

## 2. Key Capabilities

### a) Multi-source Behaviour Monitoring
- **Network:** flows (src/dst IP/port, bytes, geo, ASN), DNS queries, HTTP/S, unusual ports, beaconing
- **User:** logins, MFA failures, impossible travel, off-hours access, privilege escalation, file access
- **Device:** process spawn, persistence (registry/cron), USB, mass file ops, shadow-copy deletion, entropy spikes
- **Email/Web:** phishing link click, newly-registered domain, credential form submit, attachment open

### b) Correlation, Not Just Signatures
Single event = low confidence. Combined pattern = incident.

Example — **Ransomware**:
```
mass_file_rename (weight 0.35) + shadow_copy_delete (0.35) + high_entropy_writes (0.2) + outbound_Tor (0.1)
= risk 92 → Detection: "Probable Ransomware" → Incident (CRITICAL)
```

Example — **Phishing → Account Takeover**:
```
click_new_domain (0.3) + credential_form_post (0.3) + impossible_travel_login (0.25) + MFA_failure (0.15)
= risk 88 → Detection → Incident
```

Example — **Malware / C2**:
```
rare_process + periodic_beacon_60s + long_DNS_txt + outbound_to_new_ASN = risk 85
```

Example — **Unauthorized Access**:
```
off_hours_login + brute_force_burst + privilege_escalation + access_sensitive_share = risk 90
```

### c) AI Risk Scoring (0-100)
```
risk = w1*anomaly + w2*threat_intel + w3*behaviour_deviation + w4*asset_criticality
```
- `anomaly`: z-score / IsolationForest-style deviation from user/device baseline
- `threat_intel`: known-bad IP/domain/hash match
- `behaviour_deviation`: time/geo/device change
- Explainability: store `risk_factors[]` + `signal_weights{}` with every detection.

Thresholds: `0-39 LOW`, `40-69 MEDIUM`, `70-84 HIGH`, `85-100 CRITICAL` → auto-create Incident if ≥70.

---

## 3. Tech Stack (PERN)

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + React Router + Tailwind + DaisyUI + Lucide + Recharts + vis-network / react-force-graph for Network Graph |
| Backend | Express + helmet + cors + morgan + express-rate-limit + JWT + bcryptjs + pg + zod |
| DB | PostgreSQL (Neon hosted, local Postgres for dev) |
| AI | Rule + heuristic correlation engine now, pluggable ML later (IsolationForest / embeddings). No external AI API required for hackathon demo |
| Deploy | Frontend → Vercel, Backend → Railway/Render, DB → Neon |

Install frontend:
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm i react-router-dom axios recharts lucide-react zod
npm i -D tailwindcss daisyui
npm i vis-network
```

Install backend:
```bash
mkdir backend && cd backend && npm init -y
npm i express cors helmet morgan express-rate-limit bcryptjs jsonwebtoken pg zod dotenv cookie-parser nanoid
npm i -D nodemon
```

---

## 4. Folder Structure

```
frontend/src/
├── api/ { client.js, auth.js, monitor.js, graph.js, detection.js, incidents.js, reports.js }
├── components/
│   ├── layout/ { Navbar.jsx, AppLayout.jsx }
│   ├── home/ { HeroStats.jsx, ProtectionScore.jsx, HowItWorks.jsx }
│   ├── monitor/ { SignalFeed.jsx, SignalFilters.jsx }
│   ├── graph/ { NetworkCanvas.jsx, NodeDetail.jsx }
│   ├── detection/ { DetectionCard.jsx, RiskBadge.jsx, ExplainPanel.jsx }
│   ├── incidents/ { IncidentList.jsx, IncidentDetail.jsx, RemediationForm.jsx }
│   └── reports/ { ReportView.jsx, ThreatChart.jsx }
├── pages/ { HomePage.jsx, ThreatMonitorPage.jsx, NetworkGraphPage.jsx, AIDetectionPage.jsx, IncidentsPage.jsx, IncidentDetailPage.jsx, SecurityReportPage.jsx, LoginPage.jsx, RegisterPage.jsx }
├── context/ AuthContext.jsx
├── utils/ { colors.js, format.js }
├── App.jsx, main.jsx, index.css

backend/src/
├── config/ { db.js, env.js }
├── middleware/ { auth.js, authorize.js, validate.js, errorHandler.js }
├── routes/ { auth.js, monitor.js, graph.js, detection.js, incidents.js, reports.js, ingest.js }
├── controllers/ { authController.js, monitorController.js, graphController.js, detectionController.js, incidentController.js, reportController.js }
├── services/ { authService.js, normalizeService.js, correlationService.js, aiScoringService.js, graphService.js }
└── app.js
```

---

## 5. Pages Spec

### 5.1 Home (`/`)
- Hero: “AI that sees attacks signatures miss”
- Live counters: Active Detections, Critical Incidents, Devices Monitored, Avg Risk
- Protection Score (0-100 donut)
- 4 threat cards: Phishing / Malware / Ransomware / Unauthorized Access with counts
- CTA → Threat Monitor / Network Graph

### 5.2 Threat Monitor (`/monitor`)
- Live polling (5s) table: `time | category | message | user/device | ip | severity | risk`
- Filters: search, category (NETWORK/AUTH/ENDPOINT/EMAIL), severity, min-risk slider
- Click row → side drawer with raw JSON + linked detection
- Data: `GET /api/monitor/signals`

### 5.3 Network Graph (`/graph`)
- Canvas with nodes: `user | device | ip | domain`, edges: `connects | logins | resolves | sends_to`
- Node size = risk, color = severity. Click node → detail: risk, recent signals, linked incidents
- Time window selector: 1h / 24h / 7d
- Data: `GET /api/graph?window=24h` → `{ nodes[], edges[] }`
- Use `vis-network`. Build adjacency from `network_events` + `signals`.

### 5.4 AI Detection (`/detection`)
- List of detections: `title | type | risk bar | confidence | signals count | time`
- Filters by type: PHISHING / MALWARE / RANSOMWARE / UNAUTH_ACCESS / ANOMALY
- Detail panel: **Why it fired** — signal list with weights, risk_factors, suggested action
- Model health card: signals processed, correlation rate, false-positive rate
- Data: `GET /api/detections`, `GET /api/detections/:id`

### 5.5 Incidents (`/incidents`, `/incidents/:id`)
- Kanban/list by status: `OPEN → INVESTIGATING → CONTAINED → RESOLVED` (+ `FALSE_POSITIVE`)
- Create auto (risk ≥70) or manual from detection (“Promote to Incident”)
- Detail: severity, assignee, linked signals/detections, timeline, remediation log
- Actions: assign, change status, add remediation (`BLOCKED_IP`, `ISOLATED_HOST`, `DISABLED_USER`, `REVOKED_SESSION`, `QUARANTINED_FILE`)
- Data: `GET /api/incidents`, `PATCH /api/incidents/:id`, `POST /api/incidents/:id/remediation`

### 5.6 Security Report (`/report`)
- Date filter + summary: detections by type/severity, top risky users/devices/IPs, MTTR, incident trend (Recharts Bar/Pie/Line)
- Export JSON / Print
- Data: `GET /api/reports?start=&end=`

---

## 6. Database Design (PostgreSQL)

Core tables (org-scoped multi-tenant):

```sql
CREATE TABLE organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE devices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  hostname TEXT NOT NULL,
  os TEXT, ip_address TEXT,
  criticality INT DEFAULT 50 CHECK (criticality BETWEEN 0 AND 100),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ
);

-- Raw ingested behaviour
CREATE TABLE signals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  signal_type TEXT NOT NULL, -- e.g. AUTH_FAILURE, MASS_FILE_RENAME, DNS_TUNNEL, PHISH_CLICK
  category TEXT NOT NULL CHECK (category IN ('NETWORK','AUTH','ENDPOINT','EMAIL','WEB')),
  severity TEXT NOT NULL DEFAULT 'INFO',
  message TEXT NOT NULL,
  source_ip TEXT, user_identity TEXT, hostname TEXT, domain TEXT,
  raw_data JSONB,
  risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
  risk_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id TEXT REFERENCES devices(id) ON DELETE SET NULL,
  event_timestamp TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_signals_org_time ON signals(organization_id, event_timestamp);
CREATE INDEX idx_signals_type ON signals(signal_type);

CREATE TABLE network_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  src_ip TEXT NOT NULL, dst_ip TEXT NOT NULL,
  src_port INT, dst_port INT, bytes BIGINT,
  domain TEXT, country TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_timestamp TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_net_org_time ON network_events(organization_id, event_timestamp);

-- Correlated AI output
CREATE TABLE detections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  detection_type TEXT NOT NULL CHECK (detection_type IN ('PHISHING','MALWARE','RANSOMWARE','UNAUTH_ACCESS','ANOMALY')),
  risk_score INT NOT NULL, confidence INT,
  severity TEXT NOT NULL,
  explanation JSONB NOT NULL, -- { weights, matched_signals, reasoning }
  status TEXT DEFAULT 'OPEN',
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE detection_signals (
  detection_id TEXT REFERENCES detections(id) ON DELETE CASCADE,
  signal_id TEXT REFERENCES signals(id) ON DELETE CASCADE,
  weight FLOAT NOT NULL,
  PRIMARY KEY (detection_id, signal_id)
);

CREATE TABLE incidents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL, description TEXT,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN','INVESTIGATING','CONTAINED','RESOLVED','FALSE_POSITIVE','DISMISSED')),
  severity TEXT NOT NULL,
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  detection_id TEXT REFERENCES detections(id) ON DELETE SET NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_incidents_org_status ON incidents(organization_id, status);

CREATE TABLE remediation_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Backend API

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | no | `{email,password,firstName,lastName,organizationName}` |
| POST | `/api/auth/login` | no | `{email,password}` → JWT |
| GET | `/api/auth/session` | JWT | current user |
| POST | `/api/ingest` | API key | `{ signals: [...] }` → normalize → score → correlate |
| GET | `/api/monitor/signals?page&limit&severity&category&search&minRisk` | JWT | Threat Monitor feed |
| GET | `/api/graph?window=24h` | JWT | `{nodes, edges}` for Network Graph |
| GET | `/api/detections?type&severity` | JWT | AI Detection list |
| GET | `/api/detections/:id` | JWT | detail + signals + weights |
| POST | `/api/detections/:id/promote` | JWT | create Incident from detection |
| GET | `/api/incidents?status&severity` | JWT | Incidents list |
| GET | `/api/incidents/:id` | JWT | detail + signals + remediation |
| PATCH | `/api/incidents/:id` | JWT | `{status, assigneeId}` |
| POST | `/api/incidents/:id/remediation` | JWT | `{action, notes}` |
| GET | `/api/reports?start&end` | JWT | aggregated report |

Ingest response:
```json
{ "success": true, "data": { "processed": 5, "detectionsTriggered": 1, "incidentsCreated": 1 } }
```

---

## 8. AI / Correlation Engine

`backend/src/services/correlationService.js` (hackathon-simple, no ML dependency):

```js
const PATTERNS = {
  RANSOMWARE: [
    { signal: 'MASS_FILE_RENAME', weight: 0.35 },
    { signal: 'SHADOW_COPY_DELETE', weight: 0.35 },
    { signal: 'HIGH_ENTROPY_WRITE', weight: 0.2 },
    { signal: 'OUTBOUND_TOR', weight: 0.1 },
  ],
  PHISHING: [
    { signal: 'PHISH_CLICK', weight: 0.3 },
    { signal: 'CREDENTIAL_FORM_POST', weight: 0.3 },
    { signal: 'IMPOSSIBLE_TRAVEL', weight: 0.25 },
    { signal: 'MFA_FAILURE', weight: 0.15 },
  ],
  MALWARE: [
    { signal: 'RARE_PROCESS', weight: 0.3 },
    { signal: 'BEACONING', weight: 0.3 },
    { signal: 'SUSPICIOUS_DNS', weight: 0.2 },
    { signal: 'NEW_ASN_CONN', weight: 0.2 },
  ],
  UNAUTH_ACCESS: [
    { signal: 'BRUTE_FORCE_BURST', weight: 0.3 },
    { signal: 'OFF_HOURS_LOGIN', weight: 0.2 },
    { signal: 'PRIV_ESCALATION', weight: 0.3 },
    { signal: 'SENSITIVE_SHARE_ACCESS', weight: 0.2 },
  ]
};
// If sum(weights of signals seen in last 30 min for same user/host) * 100 >= 70 → detection
```

`aiScoringService.js`: adds baseline deviation (e.g., login hour z-score) + asset criticality boost (+10 if critical device). Store `explanation = { matched, weights, score }`.

Extend later with IsolationForest (python microservice) or TF.js — schema already supports it via `confidence` + `explanation`.

---

## 9. Build Order (Hackathon)

1. **DB:** create Neon project `cybersentinel`, run §6 SQL, `DATABASE_URL` in `backend/.env`
2. **Backend base:** `app.js` + `db.js` + auth (register/login/session)
3. **Ingest + normalize:** `POST /api/ingest` with demo seed script
4. **Correlation + AI scoring:** implement §8, verify detection fires on seeded ransomware pattern
5. **Monitor + Incidents APIs:** signals list, incidents CRUD + remediation
6. **Graph + Detection + Report APIs**
7. **Frontend:** Navbar → Home → Threat Monitor → AI Detection → Incidents → Network Graph → Security Report
8. **Seed demo:** 1 user, 3 devices, 50 signals, 3 detections, 2 incidents — so every page has data on first load
9. **Deploy:** backend Railway, frontend Vercel, update CORS + `VITE_API_URL`

Demo script (2 min):
```
Home (score 62, 2 critical) → Monitor (phish click feed) → Graph (user→evil domain→device) → AI Detection (why: 4 signals = 88) → Promote → Incidents (assign + isolate host) → Report (ransomware +40% this week)
```

---

## 10. Seed Example

```bash
curl -X POST http://localhost:3001/api/ingest \
 -H "Authorization: Bearer <device-key>" -H "Content-Type: application/json" \
 -d '{"signals":[
   {"signalType":"PHISH_CLICK","category":"EMAIL","severity":"MEDIUM","message":"User clicked newly-registered domain xn--paypa1.com","userIdentity":"adi@corp.com","rawData":{},"eventTimestamp":"2026-09-26T10:00:00Z"},
   {"signalType":"CREDENTIAL_FORM_POST","category":"WEB","severity":"HIGH","message":"Credential submit to xn--paypa1.com","userIdentity":"adi@corp.com","rawData":{},"eventTimestamp":"2026-09-26T10:02:00Z"},
   {"signalType":"IMPOSSIBLE_TRAVEL","category":"AUTH","severity":"HIGH","message":"Login IN then NG in 12 min","userIdentity":"adi@corp.com","sourceIp":"103.21.244.10","rawData":{},"eventTimestamp":"2026-09-26T10:14:00Z"}
 ]}'
# → triggers PHISHING detection (risk ~85) → auto Incident
```

---

## 11. Glossary

| Term | Meaning |
|---|---|
| Signal | Single behavioural event (login, DNS, file op) |
| Detection | Correlated set of signals with AI risk score |
| Incident | Operational case opened from a detection, needs human triage |
| Risk score | 0-100 likelihood+impact, with explainable weights |
| Network Graph | Nodes (user/device/ip/domain) + edges (interactions) over a time window |
| MTTR | Mean time to resolve incidents (shown in Security Report) |
