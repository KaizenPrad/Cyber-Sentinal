export const PATTERNS = {
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
  ],
};

const TITLES = {
  RANSOMWARE: 'Probable Ransomware Activity',
  PHISHING: 'Probable Phishing → Account Takeover',
  MALWARE: 'Probable Malware / C2 Beaconing',
  UNAUTH_ACCESS: 'Probable Unauthorized Access',
};

function severityFor(score) {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

// Correlate a batch of freshly-inserted signals (same org/user/host, last 30 min window).
// Returns array of { detectionType, score, matched: [{signal_id, signal_type, weight}] }
export function correlateBatch(insertedSignals) {
  const byEntity = new Map();
  for (const s of insertedSignals) {
    const key = `${s.organization_id}|${s.user_identity || ''}|${s.hostname || ''}`;
    if (!byEntity.has(key)) byEntity.set(key, []);
    byEntity.get(key).push(s);
  }
  const detections = [];
  for (const [, group] of byEntity) {
    const present = new Set(group.map((g) => g.signal_type));
    for (const [type, pattern] of Object.entries(PATTERNS)) {
      const matched = pattern.filter((p) => present.has(p.signal));
      if (matched.length === 0) continue;
      const weightSum = matched.reduce((a, m) => a + m.weight, 0);
      // Require at least 2 distinct signals OR one very strong single (>=0.35) to avoid noise
      if (matched.length < 2 && weightSum < 0.35) continue;
      const score = Math.round(weightSum * 100);
      if (score < 55) continue; // below threshold — not worth a detection
      const rows = matched.flatMap((m) => group.filter((g) => g.signal_type === m.signal));
      detections.push({
        detectionType: type,
        title: TITLES[type],
        score,
        severity: severityFor(score),
        confidence: Math.min(95, 55 + matched.length * 12),
        matched: rows.map((r) => ({ signal_id: r.id, signal_type: r.signal_type, weight: pattern.find((p) => p.signal === r.signal_type).weight })),
        explanation: {
          matchedSignals: matched.map((m) => m.signal),
          weights: Object.fromEntries(matched.map((m) => [m.signal, m.weight])),
          reasoning: `${matched.length} correlated signals for ${type} within 30-min window (score ${score})`,
        },
        sample: group[0],
      });
    }
  }
  return detections;
}
export default correlateBatch;
