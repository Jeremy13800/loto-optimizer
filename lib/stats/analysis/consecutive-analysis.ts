/**
 * Analyse de la distribution des numéros consécutifs
 */

import { Draw } from '@/lib/types';

export interface ConsecutiveDistribution {
  '0': number;
  '1': number;
  '2': number;
  '3+': number;
}

export interface ConsecutiveAnalysisResult {
  distribution: ConsecutiveDistribution;
  total: number;
  average: number;
  mostCommon: string;
  percentage: Record<string, number>;
}

/**
 * Compte le nombre de paires consécutives dans un tirage
 */
export function countConsecutivePairs(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  let count = 0;
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      count++;
    }
  }
  
  return count;
}

export function analyzeConsecutives(draws: Draw[]): ConsecutiveAnalysisResult {
  const distribution: ConsecutiveDistribution = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3+': 0,
  };

  let totalConsecutives = 0;

  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const count = countConsecutivePairs(nums);
    totalConsecutives += count;
    
    if (count >= 3) {
      distribution['3+']++;
    } else {
      distribution[count.toString() as keyof ConsecutiveDistribution]++;
    }
  });

  const total = draws.length;
  const average = totalConsecutives / total;

  const percentage: Record<string, number> = {};
  Object.entries(distribution).forEach(([key, value]) => {
    percentage[key] = (value / total) * 100;
  });

  const mostCommon = Object.entries(distribution).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0];

  return {
    distribution,
    total,
    average,
    mostCommon,
    percentage,
  };
}
