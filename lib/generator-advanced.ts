/**
 * Advanced grid generator with explainable scoring
 * Integrates all 15 advanced statistical features
 */

import { Draw, GenerateConstraints, GeneratedGrid, Stats } from "./types";
import { calculateStats } from "./stats";
import {
  calculateExplainableScore,
  PairFrequency,
  calculateSpacingMetrics,
  isWithinCenterOfGravityRange,
  matchesDispersionProfile,
  matchesDecadeProfile,
  getPresetConfig,
  GridPreset,
} from "./stats/index";

interface GridCandidate {
  nums: number[];
  chance: number;
}

interface AdvancedGenerateContext {
  constraints: GenerateConstraints;
  stats: Stats;
  previousDraw: Draw | null;
  frequentPairs?: PairFrequency[];
}

/**
 * Check advanced hard constraints
 */
function checkAdvancedHardConstraints(
  candidate: GridCandidate,
  context: AdvancedGenerateContext,
): { valid: boolean; reason?: string } {
  const { nums } = candidate;
  const { constraints } = context;
  const advanced = constraints.advanced;

  if (!advanced) return { valid: true };

  // Center of gravity constraint
  if (advanced.centerOfGravity) {
    if (
      !isWithinCenterOfGravityRange(
        nums,
        advanced.centerOfGravity.min,
        advanced.centerOfGravity.max,
      )
    ) {
      return { valid: false, reason: "Center of gravity out of range" };
    }
  }

  // Dispersion profile constraint (if strict)
  if (advanced.dispersion?.profile && advanced.dispersion.profile !== "free") {
    const metrics = calculateSpacingMetrics(nums);
    if (!matchesDispersionProfile(metrics, advanced.dispersion.profile)) {
      return {
        valid: false,
        reason: `Dispersion doesn't match ${advanced.dispersion.profile} profile`,
      };
    }
  }

  // Repetition with previous draw
  if (advanced.repetition && context.previousDraw) {
    const previousNums = Array.isArray(context.previousDraw.nums)
      ? context.previousDraw.nums
      : JSON.parse(context.previousDraw.nums as any);

    const repetitions = nums.filter((n) => previousNums.includes(n)).length;

    if (
      advanced.repetition.minRepetitions !== undefined &&
      repetitions < advanced.repetition.minRepetitions
    ) {
      return {
        valid: false,
        reason: `Too few repetitions with previous draw (${repetitions})`,
      };
    }

    if (
      advanced.repetition.maxRepetitions !== undefined &&
      repetitions > advanced.repetition.maxRepetitions
    ) {
      return {
        valid: false,
        reason: `Too many repetitions with previous draw (${repetitions})`,
      };
    }

    if (advanced.repetition.favorExactlyOne && repetitions !== 1) {
      return {
        valid: false,
        reason: "Must have exactly 1 repetition with previous draw",
      };
    }
  }

  // Decade distribution profile (if strict)
  if (
    advanced.decadeDistribution?.preferredProfile &&
    advanced.decadeDistribution.preferredProfile !== "free"
  ) {
    if (
      !matchesDecadeProfile(nums, advanced.decadeDistribution.preferredProfile)
    ) {
      return {
        valid: false,
        reason: `Decade profile doesn't match ${advanced.decadeDistribution.preferredProfile}`,
      };
    }
  }

  // CRITICAL: No consecutive numbers allowed
  const sorted = [...nums].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      return {
        valid: false,
        reason: "Consecutive numbers are forbidden",
      };
    }
  }

  return { valid: true };
}

/**
 * Generate grid with advanced scoring
 */
export async function generateAdvancedGrids(
  constraints: GenerateConstraints,
  stats: Stats,
  previousDraw: Draw | null,
  frequentPairs?: PairFrequency[],
): Promise<{
  grids: GeneratedGrid[];
  stats: { iterations: number; rejections: number; avgScore: number };
  warnings: string[];
}> {
  const count = constraints.count || 5;
  const grids: GeneratedGrid[] = [];
  const warnings: string[] = [];
  let iterations = 0;
  let rejections = 0;

  const context: AdvancedGenerateContext = {
    constraints,
    stats,
    previousDraw,
    frequentPairs,
  };

  // Apply preset if specified
  if (
    constraints.advanced?.preset &&
    constraints.advanced.preset !== "custom"
  ) {
    const presetConfig = getPresetConfig(constraints.advanced.preset);
    constraints.advanced = {
      ...presetConfig,
      ...constraints.advanced,
      preset: constraints.advanced.preset,
    };
  }

  const maxIterations = count * 10000;

  while (grids.length < count && iterations < maxIterations) {
    iterations++;

    // Generate candidate (reuse existing logic from generator.ts)
    const candidate = generateCandidateGrid(context);

    if (!candidate) {
      rejections++;
      continue;
    }

    // Check advanced hard constraints
    const advancedCheck = checkAdvancedHardConstraints(candidate, context);
    if (!advancedCheck.valid) {
      rejections++;
      continue;
    }

    // Check overlap with existing grids
    const maxOverlap = constraints.maxOverlap ?? 1;
    const hasOverlap = grids.some((g) => {
      const overlap = g.nums.filter((n) => candidate.nums.includes(n)).length;
      return overlap > maxOverlap;
    });

    if (hasOverlap) {
      rejections++;
      continue;
    }

    // Calculate explainable score
    const previousDrawNums = previousDraw
      ? Array.isArray(previousDraw.nums)
        ? previousDraw.nums
        : JSON.parse(previousDraw.nums as any)
      : undefined;

    const explainableScore = calculateExplainableScore({
      nums: candidate.nums,
      chance: candidate.chance,
      previousDrawNums,
      frequentPairs,
      constraints: constraints.advanced || {},
    });

    // Create grid with metadata
    const sum = candidate.nums.reduce((a, b) => a + b, 0);
    const range = Math.max(...candidate.nums) - Math.min(...candidate.nums);
    const evenCount = candidate.nums.filter((n) => n % 2 === 0).length;
    const oddCount = 5 - evenCount;
    const lowCount = candidate.nums.filter((n) => n <= 24).length;
    const highCount = 5 - lowCount;
    const highNumbers = candidate.nums.filter((n) => n >= 31);

    const grid: GeneratedGrid = {
      nums: candidate.nums,
      chance: candidate.chance,
      score: explainableScore.total,
      metadata: {
        sum,
        range,
        evenCount,
        oddCount,
        lowCount,
        highCount,
        highNumbers,
      },
      explainableScore,
    };

    grids.push(grid);
  }

  if (grids.length < count) {
    warnings.push(
      `Only generated ${grids.length} grids out of ${count} requested. ` +
        `Constraints may be too strict. Try relaxing some parameters.`,
    );
  }

  const avgScore = grids.reduce((sum, g) => sum + g.score, 0) / grids.length;

  return {
    grids,
    stats: {
      iterations,
      rejections,
      avgScore,
    },
    warnings,
  };
}

/**
 * Generate a single candidate grid
 * Reuses logic from existing generator
 */
function generateCandidateGrid(
  context: AdvancedGenerateContext,
): GridCandidate | null {
  const { constraints, previousDraw } = context;

  // Build available numbers
  let availableNums = Array.from({ length: 49 }, (_, i) => i + 1);

  // Exclude previous draw numbers if requested
  if (constraints.excludePreviousDraw && previousDraw) {
    const prevNums = Array.isArray(previousDraw.nums)
      ? previousDraw.nums
      : JSON.parse(previousDraw.nums as any);
    availableNums = availableNums.filter((n) => !prevNums.includes(n));
  }

  // Exclude specific numbers
  if (constraints.avoidPopular && constraints.avoidPopular.length > 0) {
    availableNums = availableNums.filter(
      (n) => !constraints.avoidPopular!.includes(n),
    );
  }

  if (availableNums.length < 5) {
    return null; // Not enough numbers available
  }

  // Shuffle and pick 5
  const shuffled = shuffle(availableNums);
  const nums = shuffled.slice(0, 5).sort((a, b) => a - b);

  // Generate chance number
  let availableChances = Array.from({ length: 10 }, (_, i) => i + 1);

  if (constraints.excludePreviousChance && previousDraw) {
    availableChances = availableChances.filter(
      (c) => c !== previousDraw.chance,
    );
  }

  if (constraints.avoidChances && constraints.avoidChances.length > 0) {
    const nonAvoided = availableChances.filter(
      (c) => !constraints.avoidChances!.includes(c),
    );
    if (nonAvoided.length > 0) {
      availableChances = nonAvoided;
    }
  }

  const chance =
    availableChances[Math.floor(Math.random() * availableChances.length)];

  return { nums, chance };
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
