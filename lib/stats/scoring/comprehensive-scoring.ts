/**
 * Moteur de scoring statistique complet des grilles
 * Score sur 100 points basé sur 11 composantes
 */

import { Draw } from '@/lib/types';
import { calculateSum, isOptimalSum } from '../analysis/sum-analysis';
import { calculateAmplitude } from '../analysis/amplitude-analysis';
import { calculateDispersion } from '../analysis/dispersion-analysis';
import { countUniqueDecades } from '../analysis/decade-coverage-analysis';
import { countRepetitionsWithPrevious } from '../analysis/repeat-analysis';
import { countHighNumbers } from '../analysis/high-numbers-analysis';
import { countConsecutivePairs } from '../analysis/consecutive-analysis';
import { countMultiplesOf5 } from '../analysis/multiples-analysis';
import { calculateCenterOfGravity } from '../analysis/center-gravity-analysis';

export interface ScoreComponent {
  name: string;
  score: number;
  maxScore: number;
  explanation: string;
}

export interface ComprehensiveScore {
  total: number;
  components: ScoreComponent[];
  grade: 'Excellent' | 'Bon' | 'Moyen' | 'Faible';
}

export interface ScoringContext {
  previousDraw: Draw | null;
  topPairs?: Array<{ nums: [number, number]; count: number }>;
  topTriplets?: Array<{ nums: [number, number, number]; count: number }>;
}

/**
 * Calcule le score complet d'une grille
 */
export function scoreGrid(
  nums: number[],
  context: ScoringContext
): ComprehensiveScore {
  const components: ScoreComponent[] = [];

  // 1️⃣ Somme des numéros (max 10 points)
  const sum = calculateSum(nums);
  let sumScore = 0;
  if (sum >= 104 && sum <= 145) {
    sumScore = 10;
  } else if (sum >= 86 && sum <= 163) {
    sumScore = 6;
  } else {
    sumScore = 2;
  }
  components.push({
    name: 'Somme optimale',
    score: sumScore,
    maxScore: 10,
    explanation: `Somme: ${sum} (optimal: 104-145)`,
  });

  // 2️⃣ Amplitude (max 8 points)
  const amplitude = calculateAmplitude(nums);
  let amplitudeScore = 0;
  if (amplitude >= 25 && amplitude <= 40) {
    amplitudeScore = 8;
  } else if (amplitude >= 20 && amplitude <= 45) {
    amplitudeScore = 5;
  } else {
    amplitudeScore = 2;
  }
  components.push({
    name: 'Amplitude',
    score: amplitudeScore,
    maxScore: 8,
    explanation: `Amplitude: ${amplitude} (optimal: 25-40)`,
  });

  // 3️⃣ Ratio pair/impair (max 8 points)
  const evenCount = nums.filter(n => n % 2 === 0).length;
  const oddCount = 5 - evenCount;
  let parityScore = 0;
  if ((evenCount === 2 && oddCount === 3) || (evenCount === 3 && oddCount === 2)) {
    parityScore = 8;
  } else if (evenCount === 1 || evenCount === 4) {
    parityScore = 5;
  } else {
    parityScore = 2;
  }
  components.push({
    name: 'Ratio pair/impair',
    score: parityScore,
    maxScore: 8,
    explanation: `${evenCount} pairs / ${oddCount} impairs`,
  });

  // 4️⃣ Ratio bas/haut (max 8 points)
  const lowCount = nums.filter(n => n <= 24).length;
  const highCount = 5 - lowCount;
  let rangeScore = 0;
  if ((lowCount === 2 && highCount === 3) || (lowCount === 3 && highCount === 2)) {
    rangeScore = 8;
  } else if (lowCount === 1 || lowCount === 4) {
    rangeScore = 5;
  } else {
    rangeScore = 2;
  }
  components.push({
    name: 'Ratio bas/haut',
    score: rangeScore,
    maxScore: 8,
    explanation: `${lowCount} bas (1-24) / ${highCount} hauts (25-49)`,
  });

  // 5️⃣ Dispersion (max 10 points)
  const dispersion = calculateDispersion(nums);
  let dispersionScore = 0;
  if (dispersion >= 8 && dispersion <= 14) {
    dispersionScore = 10;
  } else if (dispersion >= 6 && dispersion <= 16) {
    dispersionScore = 6;
  } else {
    dispersionScore = 3;
  }
  components.push({
    name: 'Dispersion équilibrée',
    score: dispersionScore,
    maxScore: 10,
    explanation: `Écart moyen: ${dispersion.toFixed(1)} (optimal: 8-14)`,
  });

  // 6️⃣ Dizaines couvertes (max 8 points)
  const uniqueDecades = countUniqueDecades(nums);
  let decadeScore = 0;
  if (uniqueDecades === 3 || uniqueDecades === 4) {
    decadeScore = 8;
  } else if (uniqueDecades === 2 || uniqueDecades === 5) {
    decadeScore = 5;
  } else {
    decadeScore = 2;
  }
  components.push({
    name: 'Dizaines couvertes',
    score: decadeScore,
    maxScore: 8,
    explanation: `${uniqueDecades} dizaines différentes (optimal: 3-4)`,
  });

  // 7️⃣ Répétition avec tirage précédent (max 6 points)
  const repetitions = countRepetitionsWithPrevious(nums, context.previousDraw);
  let repetitionScore = 0;
  if (repetitions === 0 || repetitions === 1) {
    repetitionScore = 6;
  } else if (repetitions === 2) {
    repetitionScore = 3;
  } else {
    repetitionScore = 1;
  }
  components.push({
    name: 'Répétition avec précédent',
    score: repetitionScore,
    maxScore: 6,
    explanation: `${repetitions} numéros communs avec tirage précédent`,
  });

  // 8️⃣ Numéros >31 (max 6 points)
  const highNumbers = countHighNumbers(nums);
  let highNumbersScore = 0;
  if (highNumbers === 1 || highNumbers === 2) {
    highNumbersScore = 6;
  } else if (highNumbers === 0 || highNumbers === 3) {
    highNumbersScore = 4;
  } else {
    highNumbersScore = 2;
  }
  components.push({
    name: 'Numéros >31',
    score: highNumbersScore,
    maxScore: 6,
    explanation: `${highNumbers} numéros >31 (optimal: 1-2)`,
  });

  // 9️⃣ Paires fréquentes (max 8 points bonus)
  let pairScore = 0;
  if (context.topPairs) {
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const [n1, n2] = [nums[i], nums[j]].sort((a, b) => a - b);
        const isFrequent = context.topPairs.some(
          pair => pair.nums[0] === n1 && pair.nums[1] === n2
        );
        if (isFrequent) pairScore += 4;
      }
    }
    pairScore = Math.min(pairScore, 8);
  }
  components.push({
    name: 'Paires fréquentes',
    score: pairScore,
    maxScore: 8,
    explanation: pairScore > 0 ? `${pairScore / 4} paire(s) fréquente(s) détectée(s)` : 'Aucune paire fréquente',
  });

  // 🔟 Centre de gravité (max 8 points)
  const center = calculateCenterOfGravity(nums);
  let centerScore = 0;
  if (center >= 22 && center <= 28) {
    centerScore = 8;
  } else if (center >= 20 && center <= 30) {
    centerScore = 5;
  } else {
    centerScore = 2;
  }
  components.push({
    name: 'Centre de gravité',
    score: centerScore,
    maxScore: 8,
    explanation: `Centre: ${center.toFixed(1)} (optimal: 22-28)`,
  });

  // 1️⃣1️⃣ Anti-biais humain (pénalités)
  let biasPenalty = 0;
  const penalties: string[] = [];

  // Séquences évidentes (3+ consécutifs)
  const consecutives = countConsecutivePairs(nums);
  if (consecutives >= 2) {
    biasPenalty += 8;
    penalties.push('séquences consécutives');
  } else if (consecutives === 1) {
    biasPenalty += 3;
    penalties.push('1 paire consécutive');
  }

  // Multiples de 5 excessifs
  const multiplesOf5 = countMultiplesOf5(nums);
  if (multiplesOf5 >= 3) {
    biasPenalty += 6;
    penalties.push('trop de multiples de 5');
  } else if (multiplesOf5 === 2) {
    biasPenalty += 2;
  }

  // Terminaisons répétées
  const endings = nums.map(n => n % 10);
  const uniqueEndings = new Set(endings).size;
  if (uniqueEndings <= 2) {
    biasPenalty += 5;
    penalties.push('terminaisons répétitives');
  }

  // Pattern anniversaire (4+ numéros ≤31)
  const birthdayNumbers = nums.filter(n => n <= 31).length;
  if (birthdayNumbers >= 4) {
    biasPenalty += 4;
    penalties.push('pattern anniversaire');
  }

  components.push({
    name: 'Anti-biais humain',
    score: -biasPenalty,
    maxScore: 0,
    explanation: penalties.length > 0 
      ? `Pénalités: ${penalties.join(', ')}`
      : 'Aucun biais détecté',
  });

  // Calcul du score total
  const total = Math.max(0, Math.min(100, 
    components.reduce((sum, c) => sum + c.score, 0)
  ));

  // Détermination du grade
  let grade: 'Excellent' | 'Bon' | 'Moyen' | 'Faible';
  if (total >= 85) grade = 'Excellent';
  else if (total >= 70) grade = 'Bon';
  else if (total >= 40) grade = 'Moyen';
  else grade = 'Faible';

  return {
    total,
    components,
    grade,
  };
}

/**
 * Calcule le score d'une liste de grilles et les trie
 */
export function scoreAndSortGrids(
  grids: Array<{ nums: number[]; chance: number }>,
  context: ScoringContext
): Array<{ nums: number[]; chance: number; score: ComprehensiveScore }> {
  return grids
    .map(grid => ({
      ...grid,
      score: scoreGrid(grid.nums, context),
    }))
    .sort((a, b) => b.score.total - a.score.total);
}
