/**
 * Analyse des répétitions de numéros entre tirages consécutifs
 */

import { Draw } from '@/lib/types';

export interface RepeatDistribution {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4+': number;
}

export interface RepeatAnalysisResult {
  distribution: RepeatDistribution;
  total: number;
  mostCommon: string;
  percentage: Record<string, number>;
}

/**
 * Analyse combien de numéros d'un tirage apparaissent dans le tirage suivant
 */
export function analyzeRepetitions(draws: Draw[]): RepeatAnalysisResult {
  const distribution: RepeatDistribution = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    '4+': 0,
  };

  for (let i = 1; i < draws.length; i++) {
    const currentNums = Array.isArray(draws[i].nums) 
      ? draws[i].nums 
      : JSON.parse(draws[i].nums as any);
    
    const previousNums = Array.isArray(draws[i - 1].nums)
      ? draws[i - 1].nums
      : JSON.parse(draws[i - 1].nums as any);

    const intersection = currentNums.filter((n: number) => previousNums.includes(n));
    const count = intersection.length;

    if (count >= 4) {
      distribution['4+']++;
    } else {
      distribution[count.toString() as keyof RepeatDistribution]++;
    }
  }

  const total = draws.length - 1;
  const percentage: Record<string, number> = {};
  
  Object.entries(distribution).forEach(([key, value]) => {
    percentage[key] = (value / total) * 100;
  });

  // Trouver le plus commun
  const mostCommon = Object.entries(distribution).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0];

  return {
    distribution,
    total,
    mostCommon,
    percentage,
  };
}

/**
 * Calcule le nombre de répétitions entre une grille et le tirage précédent
 */
export function countRepetitionsWithPrevious(
  gridNums: number[],
  previousDraw: Draw | null
): number {
  if (!previousDraw) return 0;

  const previousNums = Array.isArray(previousDraw.nums)
    ? previousDraw.nums
    : JSON.parse(previousDraw.nums as any);

  return gridNums.filter(n => previousNums.includes(n)).length;
}
