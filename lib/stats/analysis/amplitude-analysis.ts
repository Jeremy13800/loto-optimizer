/**
 * Analyse de la distribution des amplitudes
 */

import { Draw } from '@/lib/types';

export interface AmplitudeDistribution {
  '10-20': number;
  '20-25': number;
  '25-30': number;
  '30-35': number;
  '35-40': number;
  '40-45': number;
  '45+': number;
}

export interface AmplitudeAnalysisResult {
  distribution: AmplitudeDistribution;
  total: number;
  average: number;
  mostCommonRange: string;
  percentage: Record<string, number>;
}

export function calculateAmplitude(nums: number[]): number {
  return Math.max(...nums) - Math.min(...nums);
}

function getAmplitudeRange(amplitude: number): keyof AmplitudeDistribution {
  if (amplitude < 20) return '10-20';
  if (amplitude < 25) return '20-25';
  if (amplitude < 30) return '25-30';
  if (amplitude < 35) return '30-35';
  if (amplitude < 40) return '35-40';
  if (amplitude < 45) return '40-45';
  return '45+';
}

export function analyzeAmplitudes(draws: Draw[]): AmplitudeAnalysisResult {
  const distribution: AmplitudeDistribution = {
    '10-20': 0,
    '20-25': 0,
    '25-30': 0,
    '30-35': 0,
    '35-40': 0,
    '40-45': 0,
    '45+': 0,
  };

  let totalAmplitude = 0;

  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const amplitude = calculateAmplitude(nums);
    totalAmplitude += amplitude;
    
    const range = getAmplitudeRange(amplitude);
    distribution[range]++;
  });

  const total = draws.length;
  const average = totalAmplitude / total;

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
