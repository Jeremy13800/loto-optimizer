/**
 * GÉNÉRATEUR AVANCÉ BASÉ SUR L'ANALYSE HISTORIQUE COMPLÈTE
 *
 * Utilise tous les patterns extraits des 2420+ tirages pour générer
 * des grilles ultra-optimisées avec scoring multi-dimensionnel.
 */

import { Draw, GenerateConstraints, GeneratedGrid } from "./types";
import {
  extractHistoricalPatterns,
  calculateNumberWeights,
  generateNumbersFromPatterns,
  validateAgainstPatterns,
  HistoricalPattern,
  NumberWeight,
} from "./advanced-pattern-analysis";

// ============================================================================
// GÉNÉRATEUR PRINCIPAL
// ============================================================================

export async function generateAdvancedGrids(
  draws: Draw[],
  count: number,
  constraints: GenerateConstraints,
): Promise<GeneratedGrid[]> {
  console.log(`🚀 Génération avancée de ${count} grilles...`);
  console.log(`📊 Analyse de ${draws.length} tirages historiques...`);

  // ÉTAPE 1: Extraire tous les patterns historiques
  const patterns = extractHistoricalPatterns(draws);
  console.log(`✅ Patterns extraits`);

  // ÉTAPE 2: Calculer les poids pour chaque numéro
  const weights = calculateNumberWeights(patterns, draws.slice(0, 200));
  console.log(`✅ Poids calculés pour 49 numéros`);

  // ÉTAPE 3: Générer les grilles candidates
  const candidates: GeneratedGrid[] = [];
  const maxAttempts = count * 100; // 100 tentatives par grille demandée
  let attempts = 0;

  while (candidates.length < count && attempts < maxAttempts) {
    attempts++;

    // Générer une grille basée sur les patterns
    const nums = generateNumbersFromPatterns(patterns, weights, 5);
    const chance = generateChanceNumber(patterns, draws[0]);

    // Vérifier les contraintes dures
    const hardCheck = checkHardConstraints(nums, chance, constraints, draws[0]);
    if (!hardCheck.valid) {
      continue;
    }

    // Valider contre les patterns historiques
    const validation = validateAgainstPatterns(nums, patterns);
    if (!validation.valid) {
      continue;
    }

    // Calculer le score avancé
    const score = calculateAdvancedScore(
      nums,
      chance,
      patterns,
      weights,
      validation,
    );

    // Calculer les métadonnées
    const metadata = calculateMetadata(nums);

    candidates.push({
      nums,
      chance,
      score,
      metadata,
    });
  }

  // ÉTAPE 4: Trier par score et retourner les meilleures
  const sorted = candidates.sort((a, b) => b.score - a.score);

  console.log(`✅ ${sorted.length} grilles générées (${attempts} tentatives)`);
  console.log(
    `📈 Score moyen: ${(sorted.reduce((sum, g) => sum + g.score, 0) / sorted.length).toFixed(1)}`,
  );
  console.log(`🏆 Meilleur score: ${sorted[0]?.score.toFixed(1)}`);

  return sorted.slice(0, count);
}

// ============================================================================
// GÉNÉRATION DU NUMÉRO CHANCE
// ============================================================================

function generateChanceNumber(
  patterns: HistoricalPattern,
  lastDraw: Draw,
): number {
  // Analyser la distribution des numéros chance
  const chanceFrequency = new Map<number, number>();

  // Pour l'instant, génération aléatoire pondérée
  // TODO: Analyser l'historique des numéros chance
  return Math.floor(Math.random() * 10) + 1;
}

// ============================================================================
// VÉRIFICATION DES CONTRAINTES DURES
// ============================================================================

function checkHardConstraints(
  nums: number[],
  chance: number,
  constraints: GenerateConstraints,
  lastDraw: Draw | null,
): { valid: boolean; reason?: string } {
  const sorted = [...nums].sort((a, b) => a - b);

  // 1. Vérifier l'unicité
  if (new Set(nums).size !== 5) {
    return { valid: false, reason: "Duplicate numbers" };
  }

  // 2. Vérifier la plage
  for (const num of nums) {
    if (num < 1 || num > 49) {
      return { valid: false, reason: "Number out of range" };
    }
  }

  if (chance < 1 || chance > 10) {
    return { valid: false, reason: "Chance out of range" };
  }

  // 3. Contraintes utilisateur
  if (constraints.excludePreviousDraw && lastDraw) {
    const lastNums = Array.isArray(lastDraw.nums)
      ? lastDraw.nums
      : JSON.parse(lastDraw.nums as string);
    for (const num of nums) {
      if (lastNums.includes(num)) {
        return { valid: false, reason: "Contains number from previous draw" };
      }
    }
  }

  if (
    constraints.excludePreviousChance &&
    lastDraw &&
    chance === lastDraw.chance
  ) {
    return { valid: false, reason: "Same chance as previous draw" };
  }

  // 4. Ratio pair/impair
  if (constraints.evenOddRatio) {
    const evenCount = nums.filter((n) => n % 2 === 0).length;
    const oddCount = 5 - evenCount;
    const ratio = `${evenCount}/${oddCount}`;

    if (constraints.evenOddRatio !== ratio) {
      return {
        valid: false,
        reason: `Even/odd ratio not ${constraints.evenOddRatio}`,
      };
    }
  }

  // 5. Ratio bas/haut
  if (constraints.lowHighRatio) {
    const lowCount = nums.filter((n) => n <= 24).length;
    const highCount = 5 - lowCount;
    const ratio = `${lowCount}/${highCount}`;

    if (constraints.lowHighRatio !== ratio) {
      return {
        valid: false,
        reason: `Low/high ratio not ${constraints.lowHighRatio}`,
      };
    }
  }

  // 6. Maximum par dizaine
  if (constraints.maxPerDecade !== undefined) {
    const decades = new Map<number, number>();
    nums.forEach((n) => {
      const decade = Math.floor((n - 1) / 10);
      decades.set(decade, (decades.get(decade) || 0) + 1);
    });

    for (const count of decades.values()) {
      if (count > constraints.maxPerDecade) {
        return { valid: false, reason: `Too many numbers in one decade` };
      }
    }
  }

  // 7. Consécutifs
  if (constraints.maxConsecutive !== undefined) {
    let consecutiveCount = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        consecutiveCount++;
      }
    }

    if (consecutiveCount > constraints.maxConsecutive) {
      return { valid: false, reason: `Too many consecutive pairs` };
    }
  }

  // 8. Nombres premiers
  if (
    constraints.minPrimes !== undefined ||
    constraints.maxPrimes !== undefined
  ) {
    const primeCount = nums.filter(isPrime).length;

    if (
      constraints.minPrimes !== undefined &&
      primeCount < constraints.minPrimes
    ) {
      return { valid: false, reason: `Not enough prime numbers` };
    }

    if (
      constraints.maxPrimes !== undefined &&
      primeCount > constraints.maxPrimes
    ) {
      return { valid: false, reason: `Too many prime numbers` };
    }
  }

  return { valid: true };
}

// ============================================================================
// CALCUL DU SCORE AVANCÉ
// ============================================================================

function calculateAdvancedScore(
  nums: number[],
  chance: number,
  patterns: HistoricalPattern,
  weights: Map<number, NumberWeight>,
  validation: { valid: boolean; score: number; matches: any[] },
): number {
  let totalScore = 0;

  // 1. SCORE DE VALIDATION HISTORIQUE (40%)
  totalScore += validation.score * 400;

  // 2. SCORE DES POIDS INDIVIDUELS (25%)
  const weightScore = calculateWeightedScore(nums, weights);
  totalScore += weightScore * 250;

  // 3. SCORE DE DIVERSITÉ (15%)
  const diversityScore = calculateDiversityScore(nums);
  totalScore += diversityScore * 150;

  // 4. SCORE D'ÉQUILIBRE (10%)
  const balanceScore = calculateBalanceScore(nums);
  totalScore += balanceScore * 100;

  // 5. SCORE DE RARETÉ (10%)
  const rarityScore = calculateRarityScore(nums, patterns);
  totalScore += rarityScore * 100;

  return totalScore;
}

function calculateWeightedScore(
  nums: number[],
  weights: Map<number, NumberWeight>,
): number {
  const totalWeight = nums.reduce((sum, num) => {
    const weight = weights.get(num);
    return sum + (weight?.finalWeight || 0.5);
  }, 0);

  return totalWeight / nums.length; // Moyenne des poids
}

function calculateDiversityScore(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);

  // Vérifier la diversité des dizaines
  const decades = new Set(nums.map((n) => Math.floor((n - 1) / 10)));
  const decadeScore = decades.size / 5; // Max 5 dizaines différentes

  // Vérifier la diversité des terminaisons
  const endings = new Set(nums.map((n) => n % 10));
  const endingScore = endings.size / 5; // Max 5 terminaisons différentes

  // Vérifier l'espacement
  const gaps = sorted.slice(1).map((n, i) => n - sorted[i]);
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const spacingScore = Math.min(avgGap / 10, 1); // Espacement idéal ~10

  return (decadeScore + endingScore + spacingScore) / 3;
}

function calculateBalanceScore(nums: number[]): number {
  const evenCount = nums.filter((n) => n % 2 === 0).length;
  const lowCount = nums.filter((n) => n <= 24).length;
  const primeCount = nums.filter(isPrime).length;

  // Pénaliser les déséquilibres extrêmes
  const evenBalance = 1 - Math.abs(evenCount - 2.5) / 2.5; // Idéal: 2-3
  const lowBalance = 1 - Math.abs(lowCount - 2.5) / 2.5; // Idéal: 2-3
  const primeBalance = 1 - Math.abs(primeCount - 2) / 2; // Idéal: 2

  return (evenBalance + lowBalance + primeBalance) / 3;
}

function calculateRarityScore(
  nums: number[],
  patterns: HistoricalPattern,
): number {
  // Favoriser les combinaisons rares mais pas impossibles
  const sorted = [...nums].sort((a, b) => a - b);

  // Vérifier si cette combinaison exacte existe
  // (peu probable, donc on vérifie les paires)
  let rarePairs = 0;
  let commonPairs = 0;

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const pairKey = `${sorted[i]}-${sorted[j]}`;
      const freq = patterns.numberPairFrequency.get(pairKey) || 0;

      if (freq === 0) {
        rarePairs++;
      } else if (freq > 10) {
        commonPairs++;
      }
    }
  }

  // Équilibre: ni trop rare (suspect), ni trop commun (partagé)
  const totalPairs = (5 * 4) / 2; // 10 paires
  const rareRatio = rarePairs / totalPairs;
  const commonRatio = commonPairs / totalPairs;

  // Idéal: 20-40% de paires rares, 30-50% de paires communes
  const rareScore = rareRatio >= 0.2 && rareRatio <= 0.4 ? 1 : 0.5;
  const commonScore = commonRatio >= 0.3 && commonRatio <= 0.5 ? 1 : 0.5;

  return (rareScore + commonScore) / 2;
}

// ============================================================================
// CALCUL DES MÉTADONNÉES
// ============================================================================

function calculateMetadata(nums: number[]) {
  const sorted = [...nums].sort((a, b) => a - b);
  const evenCount = nums.filter((n) => n % 2 === 0).length;
  const lowCount = nums.filter((n) => n <= 24).length;

  return {
    sum: sorted.reduce((a, b) => a + b, 0),
    range: sorted[4] - sorted[0],
    evenCount,
    oddCount: 5 - evenCount,
    lowCount,
    highCount: 5 - lowCount,
    highNumbers: sorted.filter((n) => n >= 31),
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

function countConsecutivePairs(sorted: number[]): number {
  let count = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) count++;
  }
  return count;
}

// ============================================================================
// EXPORT POUR API
// ============================================================================

export {
  extractHistoricalPatterns,
  calculateNumberWeights,
  exportPatternStats,
} from "./advanced-pattern-analysis";
