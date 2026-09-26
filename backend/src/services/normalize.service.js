// Map raw signalType -> normalized severity/category defaults + base risk.
const BASE_RISK = {
  MASS_FILE_RENAME: 45, SHADOW_COPY_DELETE: 55, HIGH_ENTROPY_WRITE: 40,
  OUTBOUND_TOR: 35, PHISH_CLICK: 35, CREDENTIAL_FORM_POST: 45,
  IMPOSSIBLE_TRAVEL: 50, MFA_FAILURE: 30, BRUTE_FORCE_BURST: 45,
  OFF_HOURS_LOGIN: 20, PRIV_ESCALATION: 50, SENSITIVE_SHARE_ACCESS: 35,
  RARE_PROCESS: 35, BEACONING: 40, SUSPICIOUS_DNS: 35, NEW_ASN_CONN: 25,
};

export function normalizeSignal(input) {
  const type = String(input.signalType || '').toUpperCase().trim();
  const base = BASE_RISK[type] ?? 15;
  return {
    signalType: type,
    category: input.category,
    severity: input.severity,
    message: input.message,
    sourceIp: input.sourceIp || null,
    userIdentity: input.userIdentity || null,
    hostname: input.hostname || null,
    domain: input.domain || null,
    rawData: input.rawData || {},
    baseRisk: base,
    eventTimestamp: new Date(input.eventTimestamp),
  };
}
export default normalizeSignal;
