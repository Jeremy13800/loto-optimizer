/**
 * Analyse de l'indice de dispersion des tirages
 */

import { Draw } from '@/lib/types';

export interface DispersionDistribution {
  'compact': number;      // < 8
  'équilibré': number;    // 8-14
  'dispersé': number;     // > 14
}

export interface DispersionAnalysisResult {
  distribution: DispersionDistribution;
  total: number;
  average: number;
  mostCommon: string;
  percentage: Record<string, number>;
}

/**
 * Calcule l'indice de dispersion (moyenne des écarts entre numéros consécutifs)
 */
export function calculateDispersion(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const gaps: number[] = [];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    gaps.push(sorted[i + 1] - sorted[i]);
  }
  
  return gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
}

function getDispersionCategory(dispersion: number): keyof DispersionDistribution {
  if (dispersion < 8) return 'compact';
  if (dispersion <= 14) return 'équilibré';
  return 'dispersé';
}

export function analyzeDispersion(draws: Draw[]): DispersionAnalysisResult {
  const distribution: DispersionDistribution = {
    'compact': 0,
    'équilibré': 0,
    'dispersé': 0,
  };

  let totalDispersion = 0;

  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const dispersion = calculateDispersion(nums);
    totalDispersion += dispersion;
    
    const category = getDispersionCategory(dispersion);
    distribution[category]++;
  });

  const total = draws.length;
  const average = totalDispersion / total;

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
