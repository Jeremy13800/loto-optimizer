/**
 * SYSTÈME D'ANALYSE ULTRA-POUSSÉ DES TIRAGES HISTORIQUES
 *
 * Ce module extrait TOUS les patterns possibles des tirages historiques
 * pour générer des grilles ultra-optimisées basées sur des données réelles.
 */

import { Draw } from "./types";

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export interface HistoricalPattern {
  // Distributions statistiques
  sumDistribution: Map<number, number>;
  rangeDistribution: Map<number, number>;
  evenOddDistribution: Map<string, number>;
  lowHighDistribution: Map<string, number>;

  // Patterns de nombres
  numberFrequency: Map<number, number>;
  numberPairFrequency: Map<string, number>;
  numberTripletFrequency: Map<string, number>;

  // Patterns temporels
  hotNumbers: number[];
  coldNumbers: number[];
  cyclicNumbers: Map<number, CycleInfo>;

  // Patterns structurels
  decadeDistribution: Map<string, number>;
  endingDistribution: Map<number, number>;
  primeCountDistribution: Map<number, number>;

  // Patterns avancés
  gapPatterns: Map<string, number>;
  arithmeticProgressions: number;
  consecutivePatterns: Map<number, number>;

  // Méta-informations
  totalDraws: number;
  dateRange: { from: string; to: string };
  analysisDate: Date;
}

export interface CycleInfo {
  number: number;
  period: number;
  confidence: number;
  lastSeen: number;
  nextExpected: number;
}

export interface NumberWeight {
  number: number;
  baseWeight: number;
  frequencyWeight: number;
  recencyWeight: number;
  cycleWeight: number;
  pairWeight: number;
  finalWeight: number;
}

export interface PatternMatch {
  pattern: string;
  score: number;
  frequency: number;
  lastSeen: number;
}

// ============================================================================
// EXTRACTION DES PATTERNS HISTORIQUES
// ============================================================================

export function extractHistoricalPatterns(draws: Draw[]): HistoricalPattern {
  console.log(`🔍 Extraction des patterns de ${draws.length} tirages...`);

  const pattern: HistoricalPattern = {
    sumDistribution: new Map(),
    rangeDistribution: new Map(),
    evenOddDistribution: new Map(),
    lowHighDistribution: new Map(),
    numberFrequency: new Map(),
    numberPairFrequency: new Map(),
    numberTripletFrequency: new Map(),
    hotNumbers: [],
    coldNumbers: [],
    cyclicNumbers: new Map(),
    decadeDistribution: new Map(),
    endingDistribution: new Map(),
    primeCountDistribution: new Map(),
    gapPatterns: new Map(),
    arithmeticProgressions: 0,
    consecutivePatterns: new Map(),
    totalDraws: draws.length,
    dateRange: {
      from: draws[draws.length - 1]?.dateISO || "",
      to: draws[0]?.dateISO || "",
    },
    analysisDate: new Date(),
  };

  // Analyser chaque tirage
  draws.forEach((draw, index) => {
    const nums = Array.isArray(draw.nums)
      ? draw.nums
      : JSON.parse(draw.nums as string);
    const sorted = [...nums].sort((a, b) => a - b);

    // 1. DISTRIBUTION DES SOMMES
    const sum = sorted.reduce((a, b) => a + b, 0);
    pattern.sumDistribution.set(
      sum,
      (pattern.sumDistribution.get(sum) || 0) + 1,
    );

    // 2. DISTRIBUTION DES AMPLITUDES
    const range = sorted[4] - sorted[0];
    pattern.rangeDistribution.set(
      range,
      (pattern.rangeDistribution.get(range) || 0) + 1,
    );

    // 3. RATIO PAIR/IMPAIR
    const evenCount = sorted.filter((n) => n % 2 === 0).length;
    const evenOddKey = `${evenCount}/${5 - evenCount}`;
    pattern.evenOddDistribution.set(
      evenOddKey,
      (pattern.evenOddDistribution.get(evenOddKey) || 0) + 1,
    );

    // 4. RATIO BAS/HAUT
    const lowCount = sorted.filter((n) => n <= 24).length;
    const lowHighKey = `${lowCount}/${5 - lowCount}`;
    pattern.lowHighDistribution.set(
      lowHighKey,
      (pattern.lowHighDistribution.get(lowHighKey) || 0) + 1,
    );

    // 5. FRÉQUENCE DES NUMÉROS
    sorted.forEach((num) => {
      pattern.numberFrequency.set(
        num,
        (pattern.numberFrequency.get(num) || 0) + 1,
      );
    });

    // 6. FRÉQUENCE DES PAIRES
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const pairKey = `${sorted[i]}-${sorted[j]}`;
        pattern.numberPairFrequency.set(
          pairKey,
          (pattern.numberPairFrequency.get(pairKey) || 0) + 1,
        );
      }
    }

    // 7. FRÉQUENCE DES TRIPLETS
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        for (let k = j + 1; k < sorted.length; k++) {
          const tripletKey = `${sorted[i]}-${sorted[j]}-${sorted[k]}`;
          pattern.numberTripletFrequency.set(
            tripletKey,
            (pattern.numberTripletFrequency.get(tripletKey) || 0) + 1,
          );
        }
      }
    }

    // 8. DISTRIBUTION PAR DIZAINE
    const decades = sorted.map((n) => Math.floor((n - 1) / 10));
    const decadeKey = decades.join("-");
    pattern.decadeDistribution.set(
      decadeKey,
      (pattern.decadeDistribution.get(decadeKey) || 0) + 1,
    );

    // 9. DISTRIBUTION DES TERMINAISONS
    sorted.forEach((num) => {
      const ending = num % 10;
      pattern.endingDistribution.set(
        ending,
        (pattern.endingDistribution.get(ending) || 0) + 1,
      );
    });

    // 10. DISTRIBUTION DES NOMBRES PREMIERS
    const primeCount = sorted.filter(isPrime).length;
    pattern.primeCountDistribution.set(
      primeCount,
      (pattern.primeCountDistribution.get(primeCount) || 0) + 1,
    );

    // 11. PATTERNS D'ÉCARTS
    const gaps = sorted.slice(1).map((n, i) => n - sorted[i]);
    const gapKey = gaps.join("-");
    pattern.gapPatterns.set(gapKey, (pattern.gapPatterns.get(gapKey) || 0) + 1);

    // 12. PROGRESSIONS ARITHMÉTIQUES
    if (hasArithmeticProgression(sorted)) {
      pattern.arithmeticProgressions++;
    }

    // 13. PATTERNS CONSÉCUTIFS
    const consecutiveCount = countConsecutivePairs(sorted);
    pattern.consecutivePatterns.set(
      consecutiveCount,
      (pattern.consecutivePatterns.get(consecutiveCount) || 0) + 1,
    );
  });

  // ANALYSE TEMPORELLE (200 derniers tirages)
  const recentDraws = draws.slice(0, 200);
  const recentFrequency = new Map<number, number>();

  recentDraws.forEach((draw) => {
    const nums = Array.isArray(draw.nums)
      ? draw.nums
      : JSON.parse(draw.nums as string);
    nums.forEach((num: number) => {
      recentFrequency.set(num, (recentFrequency.get(num) || 0) + 1);
    });
  });

  // HOT NUMBERS (top 10 des 200 derniers tirages)
  pattern.hotNumbers = Array.from(recentFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([num]) => num);

  // COLD NUMBERS (bottom 10 des 200 derniers tirages)
  pattern.coldNumbers = Array.from(recentFrequency.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10)
    .map(([num]) => num);

  // DÉTECTION DES CYCLES
  pattern.cyclicNumbers = detectCycles(draws);

  console.log(
    `✅ Patterns extraits: ${pattern.numberPairFrequency.size} paires, ${pattern.numberTripletFrequency.size} triplets`,
  );

  return pattern;
}

// ============================================================================
// CALCUL DES POIDS POUR CHAQUE NUMÉRO
// ============================================================================

export function calculateNumberWeights(
  patterns: HistoricalPattern,
  recentDraws: Draw[],
): Map<number, NumberWeight> {
  const weights = new Map<number, NumberWeight>();
  const totalDraws = patterns.totalDraws;

  for (let num = 1; num <= 49; num++) {
    // 1. POIDS DE BASE (fréquence globale)
    const frequency = patterns.numberFrequency.get(num) || 0;
    const baseWeight = frequency / totalDraws;

    // 2. POIDS DE FRÉQUENCE (normalisé 0-1)
    const maxFreq = Math.max(...Array.from(patterns.numberFrequency.values()));
    const frequencyWeight = frequency / maxFreq;

    // 3. POIDS DE RÉCENCE (200 derniers tirages)
    const recentFreq = countInRecentDraws(num, recentDraws, 200);
    const recencyWeight = recentFreq / 200;

    // 4. POIDS CYCLIQUE
    const cycleInfo = patterns.cyclicNumbers.get(num);
    const cycleWeight = cycleInfo ? cycleInfo.confidence : 0.5;

    // 5. POIDS DES PAIRES (combien de paires fréquentes contiennent ce numéro)
    const pairWeight = calculatePairWeight(num, patterns.numberPairFrequency);

    // 6. POIDS FINAL (moyenne pondérée)
    const finalWeight =
      baseWeight * 0.25 +
      frequencyWeight * 0.2 +
      recencyWeight * 0.25 +
      cycleWeight * 0.15 +
      pairWeight * 0.15;

    weights.set(num, {
      number: num,
      baseWeight,
      frequencyWeight,
      recencyWeight,
      cycleWeight,
      pairWeight,
      finalWeight,
    });
  }

  return weights;
}

// ============================================================================
// GÉNÉRATION BASÉE SUR LES PATTERNS
// ============================================================================

export function generateNumbersFromPatterns(
  patterns: HistoricalPattern,
  weights: Map<number, NumberWeight>,
  count: number = 5,
): number[] {
  const selected: number[] = [];
  const availableNumbers = Array.from({ length: 49 }, (_, i) => i + 1);

  // Créer un tableau pondéré
  const weightedPool: number[] = [];
  availableNumbers.forEach((num) => {
    const weight = weights.get(num)?.finalWeight || 0.5;
    const copies = Math.max(1, Math.floor(weight * 100));
    for (let i = 0; i < copies; i++) {
      weightedPool.push(num);
    }
  });

  // Sélectionner les numéros
  while (selected.length < count) {
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    const num = weightedPool[randomIndex];

    if (!selected.includes(num)) {
      // Vérifier la compatibilité avec les numéros déjà sélectionnés
      if (
        selected.length === 0 ||
        isCompatibleWithSelected(num, selected, patterns)
      ) {
        selected.push(num);
      }
    }
  }

  return selected.sort((a, b) => a - b);
}

// ============================================================================
// VALIDATION PAR RAPPORT AUX PATTERNS HISTORIQUES
// ============================================================================

export function validateAgainstPatterns(
  nums: number[],
  patterns: HistoricalPattern,
): { valid: boolean; score: number; matches: PatternMatch[] } {
  const sorted = [...nums].sort((a, b) => a - b);
  const matches: PatternMatch[] = [];
  let totalScore = 0;

  // 1. VÉRIFIER LA SOMME
  const sum = sorted.reduce((a, b) => a + b, 0);
  const sumFreq = patterns.sumDistribution.get(sum) || 0;
  const sumScore = sumFreq / patterns.totalDraws;
  totalScore += sumScore * 0.15;
  if (sumFreq > 0) {
    matches.push({
      pattern: `Sum ${sum}`,
      score: sumScore,
      frequency: sumFreq,
      lastSeen: 0,
    });
  }

  // 2. VÉRIFIER L'AMPLITUDE
  const range = sorted[4] - sorted[0];
  const rangeFreq = patterns.rangeDistribution.get(range) || 0;
  const rangeScore = rangeFreq / patterns.totalDraws;
  totalScore += rangeScore * 0.1;

  // 3. VÉRIFIER LE RATIO PAIR/IMPAIR
  const evenCount = sorted.filter((n) => n % 2 === 0).length;
  const evenOddKey = `${evenCount}/${5 - evenCount}`;
  const evenOddFreq = patterns.evenOddDistribution.get(evenOddKey) || 0;
  const evenOddScore = evenOddFreq / patterns.totalDraws;
  totalScore += evenOddScore * 0.15;

  // 4. VÉRIFIER LE RATIO BAS/HAUT
  const lowCount = sorted.filter((n) => n <= 24).length;
  const lowHighKey = `${lowCount}/${5 - lowCount}`;
  const lowHighFreq = patterns.lowHighDistribution.get(lowHighKey) || 0;
  const lowHighScore = lowHighFreq / patterns.totalDraws;
  totalScore += lowHighScore * 0.15;

  // 5. VÉRIFIER LES PAIRES FRÉQUENTES
  let pairScore = 0;
  let pairMatches = 0;
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const pairKey = `${sorted[i]}-${sorted[j]}`;
      const pairFreq = patterns.numberPairFrequency.get(pairKey) || 0;
      if (pairFreq > 5) {
        // Paire vue au moins 5 fois
        pairScore += pairFreq / patterns.totalDraws;
        pairMatches++;
      }
    }
  }
  totalScore += (pairScore / 10) * 0.2; // Normaliser

  // 6. VÉRIFIER LES TRIPLETS FRÉQUENTS
  let tripletScore = 0;
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      for (let k = j + 1; k < sorted.length; k++) {
        const tripletKey = `${sorted[i]}-${sorted[j]}-${sorted[k]}`;
        const tripletFreq =
          patterns.numberTripletFrequency.get(tripletKey) || 0;
        if (tripletFreq > 2) {
          // Triplet vu au moins 2 fois
          tripletScore += tripletFreq / patterns.totalDraws;
        }
      }
    }
  }
  totalScore += (tripletScore / 10) * 0.15; // Normaliser

  // 7. VÉRIFIER LES NOMBRES PREMIERS
  const primeCount = sorted.filter(isPrime).length;
  const primeFreq = patterns.primeCountDistribution.get(primeCount) || 0;
  const primeScore = primeFreq / patterns.totalDraws;
  totalScore += primeScore * 0.1;

  return {
    valid: totalScore > 0.3, // Seuil minimum de validité
    score: totalScore,
    matches,
  };
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function hasArithmeticProgression(nums: number[]): boolean {
  const sorted = [...nums].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 2; i++) {
    for (let j = i + 1; j < sorted.length - 1; j++) {
      const diff = sorted[j] - sorted[i];
      if (sorted.includes(sorted[j] + diff)) {
        return true;
      }
    }
  }
  return false;
}

function countConsecutivePairs(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  let count = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) count++;
  }
  return count;
}

function detectCycles(draws: Draw[]): Map<number, CycleInfo> {
  const cycles = new Map<number, CycleInfo>();

  // Tester des périodes de 3, 7, 14, 30 tirages
  const periods = [3, 7, 14, 30];

  for (const period of periods) {
    for (let num = 1; num <= 49; num++) {
      const occurrences: number[] = [];

      draws.forEach((draw, index) => {
        const nums = Array.isArray(draw.nums)
          ? draw.nums
          : JSON.parse(draw.nums as string);
        if (nums.includes(num)) {
          occurrences.push(index);
        }
      });

      // Vérifier si les occurrences suivent un cycle
      if (occurrences.length >= 3) {
        const intervals = occurrences
          .slice(1)
          .map((occ, i) => occ - occurrences[i]);
        const avgInterval =
          intervals.reduce((a, b) => a + b, 0) / intervals.length;

        if (Math.abs(avgInterval - period) < period * 0.3) {
          // Tolérance de 30%
          const confidence = 1 - Math.abs(avgInterval - period) / period;
          const lastSeen = occurrences[0];
          const nextExpected = lastSeen + Math.round(avgInterval);

          if (!cycles.has(num) || cycles.get(num)!.confidence < confidence) {
            cycles.set(num, {
              number: num,
              period: Math.round(avgInterval),
              confidence,
              lastSeen,
              nextExpected,
            });
          }
        }
      }
    }
  }

  return cycles;
}

function countInRecentDraws(num: number, draws: Draw[], count: number): number {
  const recentDraws = draws.slice(0, count);
  let frequency = 0;

  recentDraws.forEach((draw) => {
    const nums = Array.isArray(draw.nums)
      ? draw.nums
      : JSON.parse(draw.nums as string);
    if (nums.includes(num)) {
      frequency++;
    }
  });

  return frequency;
}

function calculatePairWeight(
  num: number,
  pairFrequency: Map<string, number>,
): number {
  let totalPairFreq = 0;
  let pairCount = 0;

  for (let other = 1; other <= 49; other++) {
    if (other === num) continue;

    const pairKey1 = `${Math.min(num, other)}-${Math.max(num, other)}`;
    const freq = pairFrequency.get(pairKey1) || 0;

    if (freq > 0) {
      totalPairFreq += freq;
      pairCount++;
    }
  }

  return pairCount > 0 ? totalPairFreq / pairCount / 100 : 0.5;
}

function isCompatibleWithSelected(
  num: number,
  selected: number[],
  patterns: HistoricalPattern,
): boolean {
  // Vérifier que l'ajout de ce numéro ne crée pas de pattern invalide

  // 1. Pas plus de 2 numéros consécutifs
  const withNum = [...selected, num].sort((a, b) => a - b);
  let consecutiveCount = 0;
  for (let i = 0; i < withNum.length - 1; i++) {
    if (withNum[i + 1] - withNum[i] === 1) {
      consecutiveCount++;
      if (consecutiveCount >= 2) return false;
    } else {
      consecutiveCount = 0;
    }
  }

  // 2. Vérifier que les paires formées sont raisonnables
  for (const selectedNum of selected) {
    const pairKey = `${Math.min(num, selectedNum)}-${Math.max(num, selectedNum)}`;
    const pairFreq = patterns.numberPairFrequency.get(pairKey) || 0;

    // Si cette paire n'a JAMAIS été vue, c'est suspect
    if (pairFreq === 0 && Math.random() > 0.7) {
      return false; // 30% de chance de rejeter une paire jamais vue
    }
  }

  return true;
}

// ============================================================================
// EXPORT DES STATISTIQUES POUR DEBUGGING
// ============================================================================

export function exportPatternStats(patterns: HistoricalPattern): string {
  const stats = {
    totalDraws: patterns.totalDraws,
    dateRange: patterns.dateRange,
    topSums: Array.from(patterns.sumDistribution.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    topEvenOdd: Array.from(patterns.evenOddDistribution.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    topLowHigh: Array.from(patterns.lowHighDistribution.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    hotNumbers: patterns.hotNumbers,
    coldNumbers: patterns.coldNumbers,
    topPairs: Array.from(patterns.numberPairFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20),
    cyclicNumbers: Array.from(patterns.cyclicNumbers.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10),
  };

  return JSON.stringify(stats, null, 2);
}
