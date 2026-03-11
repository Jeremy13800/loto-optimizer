/**
 * Spacing and dispersion analysis for lottery grids
 */

import { SpacingMetrics, DispersionProfile } from "./advanced-types";

/**
 * Calculate spacing metrics for a grid
 */
export function calculateSpacingMetrics(nums: number[]): SpacingMetrics {
  const sorted = [...nums].sort((a, b) => a - b);
  const gaps: number[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    gaps.push(sorted[i + 1] - sorted[i]);
  }

  const gapSum = gaps.reduce((sum, gap) => sum + gap, 0);
  const avgGap = gapSum / gaps.length;
  const minGap = Math.min(...gaps);
  const maxGap = Math.max(...gaps);

  // Variance des écarts
  const variance =
    gaps.reduce((sum, gap) => {
      return sum + Math.pow(gap - avgGap, 2);
    }, 0) / gaps.length;

  return {
    gaps,
    avgGap,
    minGap,
    maxGap,
    gapVariance: variance,
    gapSum,
  };
}

/**
 * Determine dispersion profile based on spacing metrics
 */
export function getDispersionProfile(
  metrics: SpacingMetrics,
): DispersionProfile {
  const { avgGap, gapVariance } = metrics;

  // Compact: écart moyen faible et variance faible
  if (avgGap < 8 && gapVariance < 15) {
    return "compact";
  }

  // Dispersé: écart moyen élevé et/ou variance élevée
  if (avgGap > 14 || gapVariance > 50) {
    return "dispersed";
  }

  // Équilibré: entre les deux
  return "balanced";
}

/**
 * Check if spacing matches desired profile
 */
export function matchesDispersionProfile(
  metrics: SpacingMetrics,
  targetProfile: DispersionProfile,
): boolean {
  if (targetProfile === "free") return true;

  const actualProfile = getDispersionProfile(metrics);
  return actualProfile === targetProfile;
}

/**
 * Calculate dispersion score (0-10)
 * Higher score = better match with natural distribution
 */
export function calculateDispersionScore(metrics: SpacingMetrics): number {
  const { avgGap, gapVariance } = metrics;

  // Optimal range based on analysis: avgGap ~10-12, variance ~20-40
  let score = 10;

  // Pénaliser les écarts moyens trop faibles ou trop élevés
  if (avgGap < 6) score -= 3;
  else if (avgGap < 8) score -= 1;
  else if (avgGap > 16) score -= 3;
  else if (avgGap > 14) score -= 1;

  // Pénaliser les variances extrêmes
  if (gapVariance < 10)
    score -= 2; // Trop régulier (suspect)
  else if (gapVariance > 60) score -= 2; // Trop chaotique

  return Math.max(0, score);
}

/**
 * Detect obvious spacing patterns (anti-human bias)
 */
export function hasObviousSpacingPattern(nums: number[]): boolean {
  const sorted = [...nums].sort((a, b) => a - b);
  const gaps: number[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    gaps.push(sorted[i + 1] - sorted[i]);
  }

  // Tous les écarts identiques = progression arithmétique
  const allSame = gaps.every((gap) => gap === gaps[0]);
  if (allSame) return true;

  // Écarts multiples de 5 (5, 10, 15, 20...)
  const allMultiplesOf5 = gaps.every((gap) => gap % 5 === 0);
  if (allMultiplesOf5) return true;

  return false;
}
