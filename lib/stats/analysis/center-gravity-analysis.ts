/**
 * Analyse du centre de gravité des tirages
 */

import { Draw } from '@/lib/types';

export interface CenterGravityDistribution {
  '10-15': number;
  '15-20': number;
  '20-25': number;
  '25-30': number;
  '30-35': number;
  '35+': number;
}

export interface CenterGravityAnalysisResult {
  distribution: CenterGravityDistribution;
  total: number;
  average: number;
  mostCommonRange: string;
  percentage: Record<string, number>;
}

/**
 * Calcule le centre de gravité (moyenne des numéros)
 */
export function calculateCenterOfGravity(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function getCenterRange(center: number): keyof CenterGravityDistribution {
  if (center < 15) return '10-15';
  if (center < 20) return '15-20';
  if (center < 25) return '20-25';
  if (center < 30) return '25-30';
  if (center < 35) return '30-35';
  return '35+';
}

export function analyzeCenterOfGravity(draws: Draw[]): CenterGravityAnalysisResult {
  const distribution: CenterGravityDistribution = {
    '10-15': 0,
    '15-20': 0,
    '20-25': 0,
    '25-30': 0,
    '30-35': 0,
    '35+': 0,
  };

  let totalCenter = 0;

  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const center = calculateCenterOfGravity(nums);
    totalCenter += center;
    
    const range = getCenterRange(center);
    distribution[range]++;
  });

  const total = draws.length;
  const average = totalCenter / total;

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
    mostCommonRange,
    percentage,
  };
}
