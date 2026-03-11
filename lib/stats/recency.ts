/**
 * Temporal weighting and recency-based statistics
 */

import { RecencyMode, RecencyWeighting } from './advanced-types';

/**
 * Calculate weight for a draw based on its position and recency mode
 * @param position - Position from most recent (0 = most recent)
 * @param totalDraws - Total number of draws
 * @param mode - Recency weighting mode
 * @param exponentialFactor - Factor for exponential mode (0.9-0.99)
 */
export function calculateRecencyWeight(
  position: number,
  totalDraws: number,
  mode: RecencyMode,
  exponentialFactor: number = 0.95
): number {
  switch (mode) {
    case 'uniform':
      return 1; // Tous les tirages ont le même poids
    
    case 'light':
      // Pondération linéaire légère: 1.0 pour le plus récent, 0.7 pour le plus ancien
      return 1 - (position / totalDraws) * 0.3;
    
    case 'strong':
      // Pondération linéaire forte: 1.0 pour le plus récent, 0.3 pour le plus ancien
      return 1 - (position / totalDraws) * 0.7;
    
    case 'exponential':
      // Pondération exponentielle: décroissance rapide
      return Math.pow(exponentialFactor, position);
    
    default:
      return 1;
  }
}

/**
 * Apply recency weighting to frequency counts
 */
export function applyRecencyWeighting<T>(
  items: T[],
  getWeight: (item: T, index: number) => number
): Map<string, number> {
  const weightedCounts = new Map<string, number>();
  
  items.forEach((item, index) => {
    const weight = getWeight(item, index);
    const key = JSON.stringify(item);
    weightedCounts.set(key, (weightedCounts.get(key) || 0) + weight);
  });
  
  return weightedCounts;
}

/**
 * Calculate weighted number frequencies
 */
export function calculateWeightedFrequencies(
  draws: { nums: number[] }[],
  weighting: RecencyWeighting
): Map<number, number> {
  const frequencies = new Map<number, number>();
  
  draws.forEach((draw, index) => {
    const weight = calculateRecencyWeight(
      index,
      draws.length,
      weighting.mode,
      weighting.exponentialFactor
    );
    
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    
    nums.forEach((num: number) => {
      frequencies.set(num, (frequencies.get(num) || 0) + weight);
    });
  });
  
  return frequencies;
}

/**
 * Get hot numbers based on weighted frequencies
 */
export function getWeightedHotNumbers(
  draws: { nums: number[] }[],
  weighting: RecencyWeighting,
  topN: number = 10
): number[] {
  const frequencies = calculateWeightedFrequencies(draws, weighting);
  
  return Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([num]) => num);
}

/**
 * Get cold numbers based on weighted frequencies
 */
export function getWeightedColdNumbers(
  draws: { nums: number[] }[],
  weighting: RecencyWeighting,
  bottomN: number = 10
): number[] {
  const frequencies = calculateWeightedFrequencies(draws, weighting);
  
  return Array.from(frequencies.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, bottomN)
    .map(([num]) => num);
}

/**
 * Default recency weighting (uniform)
 */
export const DEFAULT_RECENCY_WEIGHTING: RecencyWeighting = {
  mode: 'uniform'
};
