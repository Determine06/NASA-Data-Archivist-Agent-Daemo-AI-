export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export function calculateRiskLevel(args: {
  hazardousFlag: boolean;
  diameterMeters: number;
  relativeVelocityKps: number;
  missDistanceKm: number;
}): RiskLevel {
  const { hazardousFlag, diameterMeters, relativeVelocityKps, missDistanceKm } = args;

  let score = 0;

  if (hazardousFlag) score += 2;

  // Size thresholds
  if (diameterMeters >= 140) score += 2;
  else if (diameterMeters >= 50) score += 1;

  // Speed thresholds
  if (relativeVelocityKps >= 25) score += 2;
  else if (relativeVelocityKps >= 15) score += 1;

  // Miss distance thresholds
  if (missDistanceKm <= 500_000) score += 2;
  else if (missDistanceKm <= 2_000_000) score += 1;

  if (score >= 5) return "HIGH";
  if (score >= 3) return "MEDIUM";
  return "LOW";
}
