// Simple explainable risk scorer: base + criticality + intel boosts, capped 0-100.
export function scoreSignal(normalized, opts = {}) {
  const factors = [];
  let score = normalized.baseRisk;
  factors.push(`base:${normalized.signalType}=${normalized.baseRisk}`);

  if (opts.deviceCriticality >= 80) {
    score += 10;
    factors.push('critical-asset:+10');
  }
  if (normalized.severity === 'CRITICAL') {
    score += 10;
    factors.push('severity-critical:+10');
  } else if (normalized.severity === 'HIGH') {
    score += 5;
    factors.push('severity-high:+5');
  }
  if (normalized.sourceIp && opts.badIps?.has(normalized.sourceIp)) {
    score += 15;
    factors.push('threat-intel-ip:+15');
  }
  if (normalized.domain && opts.badDomains?.has(normalized.domain)) {
    score += 15;
    factors.push('threat-intel-domain:+15');
  }
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { risk_score: score, risk_factors: factors };
}
export default scoreSignal;
