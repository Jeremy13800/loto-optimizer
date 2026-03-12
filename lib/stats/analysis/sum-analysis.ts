/**
 * Analyse de la distribution des sommes des tirages
 */

import { Draw } from '@/lib/types';

export interface SumDistribution {
  '60-80': number;
  '80-100': number;
  '100-120': number;
  '120-140': number;
  '140-160': number;
  '160-180': number;
  '180-200': number;
}

export interface SumAnalysisResult {
  distribution: SumDistribution;
  total: number;
  average: number;
  median: number;
  mostCommonRange: string;
  percentage: Record<string, number>;
}

/**
 * Calcule la somme des numéros d'un tirage
 */
export function calculateSum(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0);
}

/**
 * Détermine la tranche de somme
 */
function getSumRange(sum: number): keyof SumDistribution {
  if (sum < 80) return '60-80';
  if (sum < 100) return '80-100';
  if (sum < 120) return '100-120';
  if (sum < 140) return '120-140';
  if (sum < 160) return '140-160';
  if (sum < 180) return '160-180';
  return '180-200';
}

/**
 * Analyse la distribution des sommes dans l'historique
 */
export function analyzeSums(draws: Draw[]): SumAnalysisResult {
  const distribution: SumDistribution = {
    '60-80': 0,
    '80-100': 0,
    '100-120': 0,
    '120-140': 0,
    '140-160': 0,
    '160-180': 0,
    '180-200': 0,
  };

  const sums: number[] = [];

  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) 
      ? draw.nums 
      : JSON.parse(draw.nums as any);
    
    const sum = calculateSum(nums);
    sums.push(sum);
    
    const range = getSumRange(sum);
    distribution[range]++;
  });

  const total = draws.length;
  const average = sums.reduce((a, b) => a + b, 0) / total;
  
  // Calcul de la médiane
  const sortedSums = [...sums].sort((a, b) => a - b);
  const median = sortedSums[Math.floor(sortedSums.length / 2)];

  const percentage: Record<string, number> = {};
  Object.entries(distribution).forEach(([key, value]) => {
    percentage[key] = (value / total) * 100;
  });

  const mostCommonRange = Object.entries(distribution).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0];

  return {
    distribution,
    total,
    average,
    median,
    mostCommonRange,
    percentage,
  };
}

/**
 * Vérifie si une somme est dans la plage optimale (P25-P75)
 */
export function isOptimalSum(sum: number, analysis: SumAnalysisResult): boolean {
  // Plage optimale approximative basée sur la distribution
  return sum >= 104 && sum <= 145;
}
