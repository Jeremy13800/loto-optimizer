/**
 * Analyse de la distribution des multiples de 5
 */

import { Draw } from '@/lib/types';

export interface MultiplesDistribution {
  '0': number;
  '1': number;
  '2': number;
  '3+': number;
}

export interface MultiplesAnalysisResult {
  distribution: MultiplesDistribution;
  total: number;
  average: number;
  mostCommon: string;
  percentage: Record<string, number>;
}

const MULTIPLES_OF_5 = [5, 10, 15, 20, 25, 30, 35, 40, 45];

/**
 * Compte le nombre de multiples de 5 dans un tirage
 */
export function countMultiplesOf5(nums: number[]): number {
  return nums.filter(n => MULTIPLES_OF_5.includes(n)).length;
}

export function analyzeMultiplesOf5(draws: Draw[]): MultiplesAnalysisResult {
  const distribution: MultiplesDistribution = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3+': 0,
  };

  let totalMultiples = 0;

  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const count = countMultiplesOf5(nums);
    totalMultiples += count;
    
    if (count >= 3) {
      distribution['3+']++;
    } else {
      distribution[count.toString() as keyof MultiplesDistribution]++;
    }
  });

  const total = draws.length;
  const average = totalMultiples / total;

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
