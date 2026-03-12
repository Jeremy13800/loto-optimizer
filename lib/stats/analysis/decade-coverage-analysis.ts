/**
 * Analyse du nombre de dizaines différentes par tirage
 */

import { Draw } from '@/lib/types';

export interface DecadeCoverageDistribution {
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface DecadeCoverageResult {
  distribution: DecadeCoverageDistribution;
  total: number;
  average: number;
  mostCommon: string;
  percentage: Record<string, number>;
}

/**
 * Détermine la dizaine d'un numéro (1-10, 11-20, 21-30, 31-40, 41-49)
 */
function getDecade(num: number): number {
  if (num <= 10) return 1;
  if (num <= 20) return 2;
  if (num <= 30) return 3;
  if (num <= 40) return 4;
  return 5;
}

/**
 * Compte le nombre de dizaines différentes dans un tirage
 */
export function countUniqueDecades(nums: number[]): number {
  const decades = new Set(nums.map(n => getDecade(n)));
  return decades.size;
}

export function analyzeDecadeCoverage(draws: Draw[]): DecadeCoverageResult {
  const distribution: DecadeCoverageDistribution = {
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  };

  let totalDecades = 0;

  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const uniqueDecades = countUniqueDecades(nums);
    totalDecades += uniqueDecades;
    
    if (uniqueDecades >= 2 && uniqueDecades <= 5) {
      distribution[uniqueDecades.toString() as keyof DecadeCoverageDistribution]++;
    }
  });

  const total = draws.length;
  const average = totalDecades / total;

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
