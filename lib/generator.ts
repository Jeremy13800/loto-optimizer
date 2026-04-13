import { Draw, GenerateConstraints, GeneratedGrid, Stats } from "./types";
import { calculateStats } from "./stats";

interface GridCandidate {
  nums: number[];
  chance: number;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
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

function hasConsecutiveTriplet(nums: number[]): boolean {
  const sorted = [...nums].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 2; i++) {
    if (
      sorted[i + 1] - sorted[i] === 1 &&
      sorted[i + 2] - sorted[i + 1] === 1
    ) {
      return true;
    }
  }
  return false;
}

function countPerDecade(nums: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const num of nums) {
    const decade = Math.floor((num - 1) / 10);
    counts.set(decade, (counts.get(decade) || 0) + 1);
  }
  return counts;
}

function checkHardConstraints(
  candidate: GridCandidate,
  constraints: GenerateConstraints,
  previousDraw: Draw | null,
): { valid: boolean; reason?: string } {
  const { nums, chance } = candidate;

  if (new Set(nums).size !== 5) {
    return { valid: false, reason: "Duplicate numbers" };
  }

  for (const num of nums) {
    if (num < 1 || num > 49) {
      return { valid: false, reason: "Number out of range" };
    }
  }

  if (chance < 1 || chance > 10) {
    return { valid: false, reason: "Chance out of range" };
  }

  if (constraints.excludePreviousDraw && previousDraw) {
    for (const num of nums) {
      if (previousDraw.nums.includes(num)) {
        return { valid: false, reason: "Contains number from previous draw" };
      }
    }
  }

  if (
    constraints.excludePreviousChance &&
    previousDraw &&
    chance === previousDraw.chance
  ) {
    return { valid: false, reason: "Same chance as previous draw" };
  }

  const evenCount = nums.filter((n) => n % 2 === 0).length;
  const oddCount = 5 - evenCount;

  if (
    constraints.evenOddRatio === "1/4" &&
    !(evenCount === 1 && oddCount === 4)
  ) {
    return { valid: false, reason: "Even/odd ratio not 1/4" };
  }
  if (
    constraints.evenOddRatio === "2/3" &&
    !(evenCount === 2 && oddCount === 3)
  ) {
    return { valid: false, reason: "Even/odd ratio not 2/3" };
  }
  if (
    constraints.evenOddRatio === "3/2" &&
    !(evenCount === 3 && oddCount === 2)
  ) {
    return { valid: false, reason: "Even/odd ratio not 3/2" };
  }
  if (
    constraints.evenOddRatio === "4/1" &&
    !(evenCount === 4 && oddCount === 1)
  ) {
    return { valid: false, reason: "Even/odd ratio not 4/1" };
  }

  const lowCount = nums.filter((n) => n <= 24).length;
  const highCount = 5 - lowCount;

  if (
    constraints.lowHighRatio === "1/4" &&
    !(lowCount === 1 && highCount === 4)
  ) {
    return { valid: false, reason: "Low/high ratio not 1/4" };
  }
  if (
    constraints.lowHighRatio === "2/3" &&
    !(lowCount === 2 && highCount === 3)
  ) {
    return { valid: false, reason: "Low/high ratio not 2/3" };
  }
  if (
    constraints.lowHighRatio === "3/2" &&
    !(lowCount === 3 && highCount === 2)
  ) {
    return { valid: false, reason: "Low/high ratio not 3/2" };
  }
  if (
    constraints.lowHighRatio === "4/1" &&
    !(lowCount === 4 && highCount === 1)
  ) {
    return { valid: false, reason: "Low/high ratio not 4/1" };
  }

  const maxPerDecade = constraints.maxPerDecade ?? 2;
  const decadeCounts = countPerDecade(nums);
  for (const count of decadeCounts.values()) {
    if (count > maxPerDecade) {
      return {
        valid: false,
        reason: `Too many numbers in one decade (max ${maxPerDecade})`,
      };
    }
  }

  const maxConsecutive = constraints.maxConsecutive ?? 1;
  const consecutiveCount = countConsecutivePairs(nums);
  if (consecutiveCount > maxConsecutive) {
    return {
      valid: false,
      reason: `Too many consecutive pairs (max ${maxConsecutive})`,
    };
  }

  if (hasConsecutiveTriplet(nums)) {
    return { valid: false, reason: "Contains consecutive triplet" };
  }

  if (hasArithmeticProgression(nums)) {
    return { valid: false, reason: "Contains arithmetic progression" };
  }

  // Advanced constraints
  if (
    constraints.minPrimes !== undefined ||
    constraints.maxPrimes !== undefined
  ) {
    const primeCount = nums.filter((n) => isPrime(n)).length;
    if (
      constraints.minPrimes !== undefined &&
      primeCount < constraints.minPrimes
    ) {
      return {
        valid: false,
        reason: `Not enough prime numbers (${primeCount} < ${constraints.minPrimes})`,
      };
    }
    if (
      constraints.maxPrimes !== undefined &&
      primeCount > constraints.maxPrimes
    ) {
      return {
        valid: false,
        reason: `Too many prime numbers (${primeCount} > ${constraints.maxPrimes})`,
      };
    }
  }

  if (constraints.minDigitEndings !== undefined) {
    const endings = new Set(nums.map((n) => n % 10));
    if (endings.size < constraints.minDigitEndings) {
      return {
        valid: false,
        reason: `Not enough different digit endings (${endings.size} < ${constraints.minDigitEndings})`,
      };
    }
  }

  if (
    constraints.minConsecutiveGap !== undefined ||
    constraints.maxConsecutiveGap !== undefined
  ) {
    const sorted = [...nums].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1] - sorted[i];
      if (
        constraints.minConsecutiveGap !== undefined &&
        gap < constraints.minConsecutiveGap
      ) {
        return {
          valid: false,
          reason: `Gap too small (${gap} < ${constraints.minConsecutiveGap})`,
        };
      }
      if (
        constraints.maxConsecutiveGap !== undefined &&
        gap > constraints.maxConsecutiveGap
      ) {
        return {
          valid: false,
          reason: `Gap too large (${gap} > ${constraints.maxConsecutiveGap})`,
        };
      }
    }
  }

  if (
    constraints.targetSumMin !== undefined ||
    constraints.targetSumMax !== undefined
  ) {
    const sum = nums.reduce((a, b) => a + b, 0);
    if (
      constraints.targetSumMin !== undefined &&
      sum < constraints.targetSumMin
    ) {
      return {
        valid: false,
        reason: `Sum too low (${sum} < ${constraints.targetSumMin})`,
      };
    }
    if (
      constraints.targetSumMax !== undefined &&
      sum > constraints.targetSumMax
    ) {
      return {
        valid: false,
        reason: `Sum too high (${sum} > ${constraints.targetSumMax})`,
      };
    }
  }

  return { valid: true };
}

function scoreCandidate(
  candidate: GridCandidate,
  constraints: GenerateConstraints,
  stats: Stats,
): number {
  let score = 100;
  const { nums, chance } = candidate;

  const sum = nums.reduce((a, b) => a + b, 0);
  const range = Math.max(...nums) - Math.min(...nums);
  const highNumbers = nums.filter((n) => n >= 31);
  const multiplesOf5 = nums.filter((n) => n % 5 === 0);

  // Sum optimization (existing)
  const targetSum = (stats.sumPercentiles.p10 + stats.sumPercentiles.p90) / 2;
  const sumDiff = Math.abs(sum - targetSum);
  score -= sumDiff * 0.5;

  // Range optimization (existing)
  const minRange = constraints.minRange ?? 25;
  if (range >= minRange) {
    score += 10;
  } else {
    score -= (minRange - range) * 2;
  }

  // High numbers optimization (existing)
  const minHighNumbers = constraints.minHighNumbers ?? 2;
  if (highNumbers.length >= minHighNumbers) {
    score += 5;
  } else {
    score -= (minHighNumbers - highNumbers.length) * 5;
  }

  // Multiples of 5 optimization (existing)
  const maxMultiplesOf5 = constraints.maxMultiplesOf5 ?? 1;
  if (multiplesOf5.length <= maxMultiplesOf5) {
    score += 5;
  } else {
    score -= (multiplesOf5.length - maxMultiplesOf5) * 10;
  }

  // Popular numbers penalty (existing)
  if (constraints.avoidPopular && constraints.avoidPopular.length > 0) {
    const popularCount = nums.filter((n) =>
      constraints.avoidPopular!.includes(n),
    ).length;
    score -= popularCount * 8;
  }

  // Chance optimization (existing)
  const avgChanceFreq = stats.totalDraws / 10;
  const chanceFreq =
    stats.chanceFrequencies.find((cf) => cf.number === chance)?.count || 0;
  const chanceDiff = Math.abs(chanceFreq - avgChanceFreq);
  score -= chanceDiff * 0.3;

  if (constraints.avoidChances && constraints.avoidChances.includes(chance)) {
    score -= 15;
  }

  // NEW ADVANCED OPTIMIZATIONS

  // Hot/Cold numbers balance
  if (stats.hotNumbers && stats.coldNumbers) {
    const hotCount = nums.filter((n) => stats.hotNumbers!.includes(n)).length;
    const coldCount = nums.filter((n) => stats.coldNumbers!.includes(n)).length;

    // Bonus for having 1-2 hot numbers
    if (hotCount >= 1 && hotCount <= 2) score += 8;
    // Penalty for too many hot numbers (overplayed)
    if (hotCount > 3) score -= 10;
    // Slight penalty for too many cold numbers
    if (coldCount > 2) score -= 5;
  }

  // Gap analysis - prefer numbers with average gaps
  if (stats.numberStatsAdvanced) {
    let gapScore = 0;
    for (const num of nums) {
      const numStats = stats.numberStatsAdvanced.find(
        (ns) => ns.number === num,
      );
      if (numStats) {
        // Prefer numbers with current gap close to their average gap
        const gapRatio =
          numStats.avgGap > 0 ? numStats.lastGap / numStats.avgGap : 1;
        if (gapRatio >= 0.8 && gapRatio <= 1.5) {
          gapScore += 3;
        } else if (gapRatio > 2) {
          gapScore -= 2; // Very overdue, might be risky
        }
      }
    }
    score += gapScore;
  }

  // Triplet frequency bonus
  if (stats.topTriplets && stats.topTriplets.length > 0) {
    const sortedNums = [...nums].sort((a, b) => a - b);
    for (let i = 0; i < sortedNums.length - 2; i++) {
      for (let j = i + 1; j < sortedNums.length - 1; j++) {
        for (let k = j + 1; k < sortedNums.length; k++) {
          const triplet = [sortedNums[i], sortedNums[j], sortedNums[k]];
          const found = stats.topTriplets.find(
            (t) =>
              t.triplet[0] === triplet[0] &&
              t.triplet[1] === triplet[1] &&
              t.triplet[2] === triplet[2],
          );
          if (found) {
            // Small bonus for frequent triplets
            score += 4;
          }
        }
      }
    }
  }

  // Decade distribution balance
  if (stats.decadeDistribution) {
    const decadeCounts = new Map<number, number>();
    for (const num of nums) {
      const decade = Math.floor((num - 1) / 10);
      decadeCounts.set(decade, (decadeCounts.get(decade) || 0) + 1);
    }

    // Bonus for good decade spread (no more than 2 per decade)
    const maxPerDecade = Math.max(...Array.from(decadeCounts.values()));
    if (maxPerDecade <= 2) score += 6;
  }

  // Prime numbers balance
  const primeNums = nums.filter((n) => isPrime(n));
  const primeCount = primeNums.length;
  // Optimal is 2-3 prime numbers based on historical data
  if (primeCount >= 2 && primeCount <= 3) {
    score += 5;
  } else if (primeCount === 0 || primeCount === 5) {
    score -= 5;
  }

  // Digit ending diversity
  const endings = new Set(nums.map((n) => n % 10));
  if (endings.size >= 4) {
    score += 5; // Good diversity in endings
  } else if (endings.size <= 2) {
    score -= 5; // Too repetitive
  }

  // Consecutive gap optimization
  const sortedNums = [...nums].sort((a, b) => a - b);
  const gaps = [];
  for (let i = 0; i < sortedNums.length - 1; i++) {
    gaps.push(sortedNums[i + 1] - sortedNums[i]);
  }

  // Prefer varied gaps (not all the same)
  const uniqueGaps = new Set(gaps);
  if (uniqueGaps.size >= 3) {
    score += 4;
  }

  // Avoid too many large gaps
  const largeGaps = gaps.filter((g) => g > 10).length;
  if (largeGaps > 2) {
    score -= 3;
  }

  return Math.max(0, score);
}

function generateCandidate(
  constraints: GenerateConstraints,
  stats: Stats,
  previousDraw: Draw | null,
  existingGrids: GridCandidate[],
): GridCandidate | null {
  const maxAttempts = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const availableNums = Array.from({ length: 49 }, (_, i) => i + 1);

    if (constraints.excludePreviousDraw && previousDraw) {
      for (const num of previousDraw.nums) {
        const index = availableNums.indexOf(num);
        if (index > -1) availableNums.splice(index, 1);
      }
    }

    const shuffled = shuffle(availableNums);
    const nums = shuffled.slice(0, 5).sort((a, b) => a - b);

    let availableChances = Array.from({ length: 10 }, (_, i) => i + 1);
    if (constraints.excludePreviousChance && previousDraw) {
      availableChances = availableChances.filter(
        (c) => c !== previousDraw.chance,
      );
    }
    if (constraints.avoidChances) {
      const nonAvoided = availableChances.filter(
        (c) => !constraints.avoidChances!.includes(c),
      );
      if (nonAvoided.length > 0) availableChances = nonAvoided;
    }

    const chance =
      availableChances[Math.floor(Math.random() * availableChances.length)];

    const candidate: GridCandidate = { nums, chance };

    const hardCheck = checkHardConstraints(
      candidate,
      constraints,
      previousDraw,
    );
    if (!hardCheck.valid) continue;

    const maxOverlap = constraints.maxOverlap ?? 1;
    let hasHighOverlap = false;
    for (const existing of existingGrids) {
      const overlap = nums.filter((n) => existing.nums.includes(n)).length;
      if (overlap > maxOverlap) {
        hasHighOverlap = true;
        break;
      }
    }
    if (hasHighOverlap) continue;

    const isDuplicate = existingGrids.some(
      (g) =>
        JSON.stringify(g.nums) === JSON.stringify(nums) && g.chance === chance,
    );
    if (isDuplicate) continue;

    return candidate;
  }

  return null;
}

export async function generateGrids(
  draws: Draw[],
  constraints: GenerateConstraints,
): Promise<{
  grids: GeneratedGrid[];
  stats: { iterations: number; rejections: number; avgScore: number };
  warnings: string[];
}> {
  const warnings: string[] = [];
  const count = constraints.count ?? 5;
  const stats = calculateStats(draws);

  const previousDraw = draws.length > 0 ? draws[0] : null;

  const candidates: GridCandidate[] = [];
  let iterations = 0;
  let rejections = 0;
  const maxIterations = count * 2000;

  while (candidates.length < count && iterations < maxIterations) {
    iterations++;

    const candidate = generateCandidate(
      constraints,
      stats,
      previousDraw,
      candidates,
    );

    if (candidate) {
      candidates.push(candidate);
    } else {
      rejections++;
    }

    if (iterations % 500 === 0 && candidates.length === 0) {
      warnings.push(
        `Difficulty generating grids after ${iterations} iterations. Constraints may be too strict.`,
      );
    }
  }

  if (candidates.length < count) {
    warnings.push(
      `Only generated ${candidates.length} grids out of ${count} requested. Consider relaxing constraints.`,
    );
  }

  const grids: GeneratedGrid[] = candidates.map((candidate) => {
    const score = scoreCandidate(candidate, constraints, stats);
    const sum = candidate.nums.reduce((a, b) => a + b, 0);
    const range = Math.max(...candidate.nums) - Math.min(...candidate.nums);
    const evenCount = candidate.nums.filter((n) => n % 2 === 0).length;
    const oddCount = 5 - evenCount;
    const lowCount = candidate.nums.filter((n) => n <= 24).length;
    const highCount = 5 - lowCount;
    const highNumbers = candidate.nums.filter((n) => n >= 31);

    return {
      nums: candidate.nums,
      chance: candidate.chance,
      score,
      metadata: {
        sum,
        range,
        evenCount,
        oddCount,
        lowCount,
        highCount,
        highNumbers,
      },
    };
  });

  grids.sort((a, b) => b.score - a.score);

  const avgScore =
    grids.length > 0
      ? grids.reduce((sum, g) => sum + g.score, 0) / grids.length
      : 0;

  return {
    grids,
    stats: { iterations, rejections, avgScore },
    warnings,
  };
}
