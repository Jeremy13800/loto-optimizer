/**
 * Advanced scoring engine with explainable scores
 */

import { ExplainableScore, ScoreContribution, AdvancedConstraints } from './advanced-types';
import { calculateSpacingMetrics, calculateDispersionScore } from './spacing';
import { calculateCenterOfGravityScore, calculateCenterOfGravity } from './center-of-gravity';
import { calculateHumanBiasPenalty, explainHumanBias } from './anti-human-bias';
import { countFrequentPairs } from './pairs';
import { calculateDecadeDistributionScore, getDecadeProfile } from './decades';
import { calculateModularSignature, calculateModularDiversityScore } from './modular';
import { PairFrequency } from './advanced-types';

interface ScoringContext {
  nums: number[];
  chance: number;
  previousDrawNums?: number[];
  frequentPairs?: PairFrequency[];
  constraints: AdvancedConstraints;
}

/**
 * Calculate comprehensive explainable score for a grid
 */
export function calculateExplainableScore(context: ScoringContext): ExplainableScore {
  const { nums, constraints } = context;
  const contributions: ScoreContribution[] = [];
  
  // ========================================================================
  // 1. SOMME (0-10 points)
  // ========================================================================
  const sum = nums.reduce((acc, n) => acc + n, 0);
  let sumScore = 10;
  
  // Plage optimale basée sur l'analyse : 104-145 (50% central)
  if (sum < 86 || sum > 163) sumScore = 0;
  else if (sum < 104 || sum > 145) sumScore = 5;
  
  contributions.push({
    category: 'Structure',
    label: 'Somme optimale',
    points: sumScore,
    maxPoints: 10,
    explanation: `Somme: ${sum} (optimal: 104-145)`
  });
  
  // ========================================================================
  // 2. DISPERSION (0-10 points)
  // ========================================================================
  const spacingMetrics = calculateSpacingMetrics(nums);
  const dispersionScore = calculateDispersionScore(spacingMetrics);
  
  contributions.push({
    category: 'Dispersion',
    label: 'Espacement naturel',
    points: dispersionScore,
    maxPoints: 10,
    explanation: `Écart moyen: ${spacingMetrics.avgGap.toFixed(1)}, variance: ${spacingMetrics.gapVariance.toFixed(1)}`
  });
  
  // ========================================================================
  // 3. CENTRE DE GRAVITÉ (0-10 points)
  // ========================================================================
  const cogScore = calculateCenterOfGravityScore(nums);
  const cog = calculateCenterOfGravity(nums);
  
  contributions.push({
    category: 'Structure',
    label: 'Centre de gravité',
    points: cogScore,
    maxPoints: 10,
    explanation: `Centre: ${cog.toFixed(1)} (optimal: 22-28)`
  });
  
  // ========================================================================
  // 4. RATIO PAIR/IMPAIR (0-8 points)
  // ========================================================================
  const evenCount = nums.filter(n => n % 2 === 0).length;
  const oddCount = 5 - evenCount;
  let evenOddScore = 0;
  
  // 2/3 ou 3/2 sont les plus fréquents (65% des tirages)
  if ((evenCount === 2 && oddCount === 3) || (evenCount === 3 && oddCount === 2)) {
    evenOddScore = 8;
  } else if (evenCount === 1 || evenCount === 4) {
    evenOddScore = 4;
  }
  
  contributions.push({
    category: 'Répartition',
    label: 'Ratio pair/impair',
    points: evenOddScore,
    maxPoints: 8,
    explanation: `${evenCount} pairs / ${oddCount} impairs`
  });
  
  // ========================================================================
  // 5. RATIO BAS/HAUT (0-8 points)
  // ========================================================================
  const lowCount = nums.filter(n => n <= 24).length;
  const highCount = 5 - lowCount;
  let lowHighScore = 0;
  
  // 2/3 ou 3/2 sont optimaux (66% des tirages)
  if ((lowCount === 2 && highCount === 3) || (lowCount === 3 && highCount === 2)) {
    lowHighScore = 8;
  } else if (lowCount === 1 || lowCount === 4) {
    lowHighScore = 4;
  }
  
  contributions.push({
    category: 'Répartition',
    label: 'Ratio bas/haut',
    points: lowHighScore,
    maxPoints: 8,
    explanation: `${lowCount} bas (1-24) / ${highCount} hauts (25-49)`
  });
  
  // ========================================================================
  // 6. NOMBRES PREMIERS (0-6 points)
  // ========================================================================
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  const primeCount = nums.filter(n => primes.includes(n)).length;
  let primeScore = 0;
  
  // 1-2 nombres premiers est optimal (70% des tirages)
  if (primeCount === 1 || primeCount === 2) primeScore = 6;
  else if (primeCount === 0 || primeCount === 3) primeScore = 3;
  
  contributions.push({
    category: 'Patterns',
    label: 'Nombres premiers',
    points: primeScore,
    maxPoints: 6,
    explanation: `${primeCount} nombres premiers (optimal: 1-2)`
  });
  
  // ========================================================================
  // 7. TERMINAISONS DIVERSIFIÉES (0-6 points)
  // ========================================================================
  const endings = new Set(nums.map(n => n % 10));
  let endingsScore = 0;
  
  // 4+ terminaisons différentes est optimal (49.5% des tirages)
  if (endings.size >= 4) endingsScore = 6;
  else if (endings.size === 3) endingsScore = 3;
  
  contributions.push({
    category: 'Diversité',
    label: 'Terminaisons uniques',
    points: endingsScore,
    maxPoints: 6,
    explanation: `${endings.size} terminaisons différentes (optimal: 4+)`
  });
  
  // ========================================================================
  // 8. PROFIL DE DIZAINES (0-6 points)
  // ========================================================================
  const decadeScore = calculateDecadeDistributionScore(
    nums,
    constraints.decadeDistribution?.preferredProfile,
    6
  );
  const decadeProfile = getDecadeProfile(nums);
  
  contributions.push({
    category: 'Répartition',
    label: 'Profil de dizaines',
    points: decadeScore,
    maxPoints: 6,
    explanation: `Profil: ${decadeProfile}`
  });
  
  // ========================================================================
  // 9. PAIRES FRÉQUENTES (0-8 points bonus)
  // ========================================================================
  if (constraints.frequentPairs?.enabled && context.frequentPairs) {
    const pairCount = countFrequentPairs(nums, context.frequentPairs);
    const pairBonus = Math.min(8, pairCount * (constraints.frequentPairs.bonusWeight || 2));
    
    contributions.push({
      category: 'Patterns',
      label: 'Paires fréquentes',
      points: pairBonus,
      maxPoints: 8,
      explanation: `${pairCount} paires fréquentes détectées`
    });
  }
  
  // ========================================================================
  // 10. RÉPÉTITION AVEC TIRAGE PRÉCÉDENT (0-5 points)
  // ========================================================================
  if (context.previousDrawNums && constraints.repetition) {
    const repetitions = nums.filter(n => context.previousDrawNums!.includes(n)).length;
    let repetitionScore = 0;
    
    // 0-1 répétition est naturel (92% des tirages)
    if (repetitions === 0 || repetitions === 1) repetitionScore = 5;
    else if (repetitions === 2) repetitionScore = 2;
    
    contributions.push({
      category: 'Historique',
      label: 'Répétition avec précédent',
      points: repetitionScore,
      maxPoints: 5,
      explanation: `${repetitions} numéros communs avec tirage précédent`
    });
  }
  
  // ========================================================================
  // 11. SIGNATURE MODULAIRE (0-4 points bonus)
  // ========================================================================
  if (constraints.modularSignature?.enabled) {
    const modSignature = calculateModularSignature(nums);
    const modScore = calculateModularDiversityScore(modSignature);
    const modBonus = Math.min(4, modScore * 0.4);
    
    contributions.push({
      category: 'Expérimental',
      label: 'Diversité modulaire',
      points: modBonus,
      maxPoints: 4,
      explanation: 'Distribution modulo 5 et 7'
    });
  }
  
  // ========================================================================
  // 12. ANTI-BIAIS HUMAIN (pénalités)
  // ========================================================================
  if (constraints.antiHumanBias?.enabled) {
    const biasPenalty = calculateHumanBiasPenalty(nums, constraints.antiHumanBias);
    const biasPatterns = explainHumanBias(nums, constraints.antiHumanBias);
    
    if (biasPenalty > 0) {
      contributions.push({
        category: 'Anti-partage',
        label: 'Pénalité biais humain',
        points: -biasPenalty,
        maxPoints: 0,
        explanation: biasPatterns.join(', ') || 'Patterns humains détectés'
      });
    }
  }
  
  // ========================================================================
  // CALCUL DU SCORE TOTAL
  // ========================================================================
  const totalPoints = contributions.reduce((sum, c) => sum + c.points, 0);
  const maxPossiblePoints = contributions
    .filter(c => c.maxPoints > 0)
    .reduce((sum, c) => sum + c.maxPoints, 0);
  
  // Normaliser sur 100
  const normalizedScore = Math.max(0, Math.min(100, (totalPoints / maxPossiblePoints) * 100));
  
  return {
    total: Math.round(normalizedScore),
    contributions,
    constraintType: 'soft' // La plupart sont des soft constraints
  };
}

/**
 * Format score explanation for display
 */
export function formatScoreExplanation(score: ExplainableScore): string {
  let text = `Score total: ${score.total}/100\n\n`;
  
  // Grouper par catégorie
  const byCategory = new Map<string, ScoreContribution[]>();
  
  for (const contrib of score.contributions) {
    if (!byCategory.has(contrib.category)) {
      byCategory.set(contrib.category, []);
    }
    byCategory.get(contrib.category)!.push(contrib);
  }
  
  // Afficher par catégorie
  for (const [category, contribs] of byCategory.entries()) {
    text += `${category}:\n`;
    for (const c of contribs) {
      const sign = c.points >= 0 ? '+' : '';
      text += `  ${sign}${c.points} ${c.label} - ${c.explanation}\n`;
    }
    text += '\n';
  }
  
  return text;
}
