/**
 * Anti-human bias detection and scoring
 * Detects patterns that are statistically unlikely but commonly chosen by humans
 */

import { AntiHumanBiasConfig } from './advanced-types';

/**
 * Detect obvious sequences (1,2,3 or consecutive numbers)
 */
export function hasObviousSequence(nums: number[]): boolean {
  const sorted = [...nums].sort((a, b) => a - b);
  
  // Vérifier si au moins 3 numéros consécutifs
  for (let i = 0; i < sorted.length - 2; i++) {
    if (sorted[i + 1] === sorted[i] + 1 && sorted[i + 2] === sorted[i] + 2) {
      return true;
    }
  }
  
  return false;
}

/**
 * Detect arithmetic progressions (5,10,15 or 7,14,21)
 */
export function hasArithmeticProgression(nums: number[]): boolean {
  const sorted = [...nums].sort((a, b) => a - b);
  
  for (let i = 0; i < sorted.length - 2; i++) {
    for (let j = i + 1; j < sorted.length - 1; j++) {
      const diff = sorted[j] - sorted[i];
      if (sorted.includes(sorted[j] + diff)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if too many numbers are <=31 (birthday pattern)
 */
export function hasBirthdayPattern(nums: number[]): boolean {
  const lowNumbers = nums.filter(n => n <= 31).length;
  return lowNumbers >= 4; // 4 ou 5 numéros <=31 est suspect
}

/**
 * Count multiples of 5
 */
export function countMultiplesOf5(nums: number[]): number {
  return nums.filter(n => n % 5 === 0).length;
}

/**
 * Check if too many numbers share the same ending
 */
export function hasSameEndings(nums: number[]): boolean {
  const endings = nums.map(n => n % 10);
  const endingCounts = new Map<number, number>();
  
  for (const ending of endings) {
    endingCounts.set(ending, (endingCounts.get(ending) || 0) + 1);
  }
  
  // Si 3+ numéros ont la même terminaison, c'est suspect
  return Array.from(endingCounts.values()).some(count => count >= 3);
}

/**
 * Detect symmetrical patterns
 */
export function hasSymmetry(nums: number[]): boolean {
  const sorted = [...nums].sort((a, b) => a - b);
  
  // Vérifier symétrie autour de 25 (milieu de 1-49)
  const distances = sorted.map(n => Math.abs(n - 25));
  
  // Si les distances sont trop similaires, c'est suspect
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
  
  // Variance très faible = symétrie suspecte
  return variance < 10;
}

/**
 * Calculate comprehensive anti-human bias score
 * Returns a penalty score (0 = no bias, higher = more human-like patterns)
 */
export function calculateHumanBiasPenalty(
  nums: number[],
  config: AntiHumanBiasConfig
): number {
  if (!config.enabled) return 0;
  
  let penalty = 0;
  const weight = config.penaltyWeight || 1;
  
  // Séquences évidentes
  if (config.penalizeObviousSequences && hasObviousSequence(nums)) {
    penalty += 15 * weight;
  }
  
  // Progressions arithmétiques
  if (config.penalizeArithmeticProgressions && hasArithmeticProgression(nums)) {
    penalty += 12 * weight;
  }
  
  // Pattern anniversaire
  if (config.penalizeBirthdayPattern && hasBirthdayPattern(nums)) {
    penalty += 10 * weight;
  }
  
  // Multiples de 5
  if (config.penalizeMultiplesOf5) {
    const mult5Count = countMultiplesOf5(nums);
    if (mult5Count >= 3) {
      penalty += 8 * weight;
    } else if (mult5Count === 2) {
      penalty += 3 * weight;
    }
  }
  
  // Terminaisons répétitives
  if (config.penalizeSameEndings && hasSameEndings(nums)) {
    penalty += 7 * weight;
  }
  
  // Symétries
  if (config.penalizeSymmetries && hasSymmetry(nums)) {
    penalty += 6 * weight;
  }
  
  // Trop de numéros bas (<=31)
  if (config.penalizeTooManyLow) {
    const lowCount = nums.filter(n => n <= 31).length;
    if (lowCount >= 4) {
      penalty += 5 * weight;
    }
  }
  
  return penalty;
}

/**
 * Get detailed explanation of human bias patterns detected
 */
export function explainHumanBias(
  nums: number[],
  config: AntiHumanBiasConfig
): string[] {
  if (!config.enabled) return [];
  
  const patterns: string[] = [];
  
  if (config.penalizeObviousSequences && hasObviousSequence(nums)) {
    patterns.push('Séquence évidente détectée (ex: 1,2,3)');
  }
  
  if (config.penalizeArithmeticProgressions && hasArithmeticProgression(nums)) {
    patterns.push('Progression arithmétique détectée (ex: 5,10,15)');
  }
  
  if (config.penalizeBirthdayPattern && hasBirthdayPattern(nums)) {
    patterns.push('Pattern type anniversaire (trop de numéros ≤31)');
  }
  
  if (config.penalizeMultiplesOf5) {
    const mult5Count = countMultiplesOf5(nums);
    if (mult5Count >= 2) {
      patterns.push(`${mult5Count} multiples de 5 (suspect)`);
    }
  }
  
  if (config.penalizeSameEndings && hasSameEndings(nums)) {
    patterns.push('Terminaisons répétitives');
  }
  
  if (config.penalizeSymmetries && hasSymmetry(nums)) {
    patterns.push('Pattern symétrique détecté');
  }
  
  return patterns;
}

/**
 * Default anti-human bias configuration
 */
export const DEFAULT_ANTI_HUMAN_BIAS: AntiHumanBiasConfig = {
  enabled: false,
  penalizeObviousSequences: true,
  penalizeArithmeticProgressions: true,
  penalizeTooManyLow: true,
  penalizeMultiplesOf5: true,
  penalizeSameEndings: true,
  penalizeSymmetries: true,
  penalizeBirthdayPattern: true,
  penaltyWeight: 1
};
