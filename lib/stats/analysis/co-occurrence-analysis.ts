/**
 * Analyse de co-occurrence (heatmap 49x49)
 */

import { Draw } from '@/lib/types';

export interface CoOccurrenceMatrix {
  [key: string]: number; // "1-2": count, "1-3": count, etc.
}

export interface CoOccurrenceAnalysisResult {
  matrix: CoOccurrenceMatrix;
  topPairs: Array<{ nums: [number, number]; count: number; percentage: number }>;
  total: number;
}

/**
 * Analyse la co-occurrence de toutes les paires de numéros
 */
export function analyzeCoOccurrence(draws: Draw[]): CoOccurrenceAnalysisResult {
  const matrix: CoOccurrenceMatrix = {};

  // Initialiser la matrice
  for (let i = 1; i <= 49; i++) {
    for (let j = i + 1; j <= 49; j++) {
      matrix[`${i}-${j}`] = 0;
    }
  }

  // Compter les co-occurrences
  draws.forEach(draw => {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    
    // Pour chaque paire de numéros dans le tirage
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const [n1, n2] = [nums[i], nums[j]].sort((a, b) => a - b);
        const key = `${n1}-${n2}`;
        matrix[key]++;
      }
    }
  });

  const total = draws.length;

  // Trouver les top paires
  const topPairs = Object.entries(matrix)
    .map(([key, count]) => {
      const [n1, n2] = key.split('-').map(Number);
      return {
        nums: [n1, n2] as [number, number],
        count,
        percentage: (count / total) * 100,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // Top 50 paires

  return {
    matrix,
    topPairs,
    total,
  };
}

/**
 * Vérifie si une grille contient une paire fréquente
 */
export function containsFrequentPair(
  gridNums: number[],
  topPairs: Array<{ nums: [number, number]; count: number }>
): boolean {
  for (let i = 0; i < gridNums.length; i++) {
    for (let j = i + 1; j < gridNums.length; j++) {
      const [n1, n2] = [gridNums[i], gridNums[j]].sort((a, b) => a - b);
      const isFrequent = topPairs.some(
        pair => pair.nums[0] === n1 && pair.nums[1] === n2
      );
      if (isFrequent) return true;
    }
  }
  return false;
}
