/**
 * Analyse de la distribution des numéros > 31
 */

import { Draw } from '@/lib/types';

export interface HighNumbersDistribution {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface HighNumbersAnalysisResult {
  distribution: HighNumbersDistribution;
  total: number;
  average: number;
  mostCommon: string;
  percentage: Record<string, number>;
}

/**
 * Compte le nombre de numéros > 31 dans un tirage
 */
export function countHighNumbers(nums: number[]): number {
  return nums.filter(n => n > 31).length;
}

export function analyzeHighNumbers(draws: Draw[]): HighNumbersAnalysisResult {
  const distribution: HighNumbersDistribution = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  };

  let totalHigh = 0;

  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const count = countHighNumbers(nums);
    totalHigh += count;
    
    distribution[count.toString() as keyof HighNumbersDistribution]++;
  });

  const total = draws.length;
  const average = totalHigh / total;

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
