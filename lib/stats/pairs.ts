/**
 * Frequent pairs and triplets analysis
 */

import { PairFrequency, TripletFrequency } from './advanced-types';

/**
 * Calculate all pairs from historical draws
 */
export function calculatePairFrequencies(
  draws: { nums: number[] }[],
  topN: number = 50
): PairFrequency[] {
  const pairCounts = new Map<string, number>();
  
  for (const draw of draws) {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    
    // Générer toutes les paires possibles
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const [a, b] = [nums[i], nums[j]].sort((x, y) => x - y);
        const key = `${a}-${b}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }
  }
  
  // Convertir en tableau et trier
  const totalDraws = draws.length;
  const pairs: PairFrequency[] = [];
  
  for (const [key, count] of pairCounts.entries()) {
    const [a, b] = key.split('-').map(Number);
    pairs.push({
      pair: [a, b],
      count,
      percentage: (count / totalDraws) * 100
    });
  }
  
  // Trier par fréquence décroissante et prendre les top N
  return pairs
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Calculate all triplets from historical draws
 */
export function calculateTripletFrequencies(
  draws: { nums: number[] }[],
  topN: number = 30
): TripletFrequency[] {
  const tripletCounts = new Map<string, number>();
  
  for (const draw of draws) {
    const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
    
    // Générer tous les triplets possibles
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        for (let k = j + 1; k < nums.length; k++) {
          const [a, b, c] = [nums[i], nums[j], nums[k]].sort((x, y) => x - y);
          const key = `${a}-${b}-${c}`;
          tripletCounts.set(key, (tripletCounts.get(key) || 0) + 1);
        }
      }
    }
  }
  
  // Convertir en tableau et trier
  const totalDraws = draws.length;
  const triplets: TripletFrequency[] = [];
  
  for (const [key, count] of tripletCounts.entries()) {
    const [a, b, c] = key.split('-').map(Number);
    triplets.push({
      triplet: [a, b, c],
      count,
      percentage: (count / totalDraws) * 100
    });
  }
  
  // Trier par fréquence décroissante et prendre les top N
  return triplets
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Count how many frequent pairs are in a grid
 */
export function countFrequentPairs(
  nums: number[],
  frequentPairs: PairFrequency[]
): number {
  let count = 0;
  const sorted = [...nums].sort((a, b) => a - b);
  
  // Générer toutes les paires de la grille
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const [a, b] = [sorted[i], sorted[j]];
      
      // Vérifier si cette paire est dans les paires fréquentes
      const isFrequent = frequentPairs.some(fp => 
        fp.pair[0] === a && fp.pair[1] === b
      );
      
      if (isFrequent) count++;
    }
  }
  
  return count;
}

/**
 * Count how many frequent triplets are in a grid
 */
export function countFrequentTriplets(
  nums: number[],
  frequentTriplets: TripletFrequency[]
): number {
  let count = 0;
  const sorted = [...nums].sort((a, b) => a - b);
  
  // Générer tous les triplets de la grille
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      for (let k = j + 1; k < sorted.length; k++) {
        const [a, b, c] = [sorted[i], sorted[j], sorted[k]];
        
        // Vérifier si ce triplet est dans les triplets fréquents
        const isFrequent = frequentTriplets.some(ft => 
          ft.triplet[0] === a && ft.triplet[1] === b && ft.triplet[2] === c
        );
        
        if (isFrequent) count++;
      }
    }
  }
  
  return count;
}

/**
 * Calculate bonus score for frequent pairs
 */
export function calculatePairBonus(
  nums: number[],
  frequentPairs: PairFrequency[],
  bonusWeight: number = 5
): number {
  const pairCount = countFrequentPairs(nums, frequentPairs);
  return pairCount * bonusWeight;
}
