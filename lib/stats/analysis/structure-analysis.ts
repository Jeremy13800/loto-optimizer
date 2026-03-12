/**
 * Analyse des structures de distribution par tranche
 */

import { Draw } from '@/lib/types';

export interface StructurePattern {
  pattern: string;
  count: number;
  percentage: number;
}

export interface StructureAnalysisResult {
  topPatterns: StructurePattern[];
  total: number;
}

/**
 * Détermine la structure de distribution d'un tirage
 * Exemple: [5, 12, 23, 35, 44] -> "1-1-1-1-1" (un numéro par tranche)
 */
function getStructurePattern(nums: number[]): string {
  const ranges = {
    '1-10': 0,
    '11-20': 0,
    '21-30': 0,
    '31-40': 0,
    '41-49': 0,
  };

  nums.forEach(n => {
    if (n <= 10) ranges['1-10']++;
    else if (n <= 20) ranges['11-20']++;
    else if (n <= 30) ranges['21-30']++;
    else if (n <= 40) ranges['31-40']++;
    else ranges['41-49']++;
  });

  // Trier les comptes et créer le pattern
  const counts = Object.values(ranges).filter(c => c > 0).sort((a, b) => b - a);
  return counts.join('-');
}

export function analyzeStructures(draws: Draw[]): StructureAnalysisResult {
  const patternCounts = new Map<string, number>();

  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    const pattern = getStructurePattern(nums);
    patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
  });

  const total = draws.length;

  // Convertir en tableau et trier par fréquence
  const topPatterns: StructurePattern[] = Array.from(patternCounts.entries())
    .map(([pattern, count]) => ({
      pattern,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 structures

  return {
    topPatterns,
    total,
  };
}

/**
 * Calcule la structure d'une grille
 */
export function getGridStructure(nums: number[]): string {
  return getStructurePattern(nums);
}
