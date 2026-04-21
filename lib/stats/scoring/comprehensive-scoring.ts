/**
 * Comprehensive scoring module for grid evaluation
 * Wrapper around the scoring-engine to provide simplified API
 */

import { calculateExplainableScore } from '../scoring-engine';
import { AdvancedConstraints } from '../advanced-types';

interface ScoreGridOptions {
  previousDraw?: any;
  topPairs?: any[];
}

/**
 * Calculate comprehensive score for a grid
 * Simplified wrapper around the advanced scoring engine
 */
export function scoreGrid(nums: number[], options: ScoreGridOptions = {}) {
  // Use the existing scoring-engine with default constraints
  const context = {
    nums,
    chance: Math.floor(Math.random() * 10) + 1, // Default chance not used in scoring
    previousDrawNums: options.previousDraw?.nums,
    frequentPairs: options.topPairs,
    constraints: {
      // Default constraints - all enabled for comprehensive scoring
      decadeDistribution: { enabled: true },
      frequentPairs: { enabled: true, bonusWeight: 2 },
      repetition: { enabled: true },
      modularSignature: { enabled: true },
      antiHumanBias: { enabled: true }
    } as AdvancedConstraints
  };

  const result = calculateExplainableScore(context);

  return result;
}
