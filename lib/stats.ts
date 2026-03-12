import {
  Draw,
  Stats,
  NumberFrequency,
  PairFrequency,
  TripletFrequency,
  NumberStats,
} from "./types";

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function calculateStats(draws: Draw[]): Stats {
  const totalDraws = draws.length;

  const numberCounts = new Map<number, number>();
  const chanceCounts = new Map<number, number>();
  const pairCounts = new Map<string, number>();
  const tripletCounts = new Map<string, number>();
  const sumCounts = new Map<number, number>();
  const rangeCounts = new Map<number, number>();
  const evenOddCounts = new Map<string, number>();
  const lowHighCounts = new Map<string, number>();
  const highNumberCounts = new Map<number, number>();
  const decadeCounts = new Map<number, number>();
  const digitEndingCounts = new Map<number, number>();
  const primeCountPerDraw = new Map<number, number>();
  const consecutiveGapCounts = new Map<number, number>();
  const chanceStats = new Map<
    number,
    { sumTotal: number; rangeTotal: number; count: number }
  >();
  let drawsWithHighNumbers = 0;

  const lastSeen = new Map<number, number>();
  const numberGapHistory = new Map<number, number[]>();

  for (let i = 0; i < draws.length; i++) {
    const draw = draws[i];
    const { nums, chance } = draw;

    chanceCounts.set(chance, (chanceCounts.get(chance) || 0) + 1);

    let evenCount = 0;
    let oddCount = 0;
    let lowCount = 0;
    let highCount = 0;
    let highNumsInDraw = 0;
    let primeCount = 0;

    const sortedNums = [...nums].sort((a, b) => a - b);

    for (const num of nums) {
      numberCounts.set(num, (numberCounts.get(num) || 0) + 1);

      // Track gaps
      const prevIndex = lastSeen.get(num);
      if (prevIndex !== undefined) {
        const gap = i - prevIndex;
        if (!numberGapHistory.has(num)) {
          numberGapHistory.set(num, []);
        }
        numberGapHistory.get(num)!.push(gap);
      }
      lastSeen.set(num, i);

      if (num % 2 === 0) evenCount++;
      else oddCount++;

      if (num <= 24) lowCount++;
      else highCount++;

      if (num >= 31) highNumsInDraw++;

      // Decade distribution
      const decade = Math.floor((num - 1) / 10);
      decadeCounts.set(decade, (decadeCounts.get(decade) || 0) + 1);

      // Digit ending
      const ending = num % 10;
      digitEndingCounts.set(ending, (digitEndingCounts.get(ending) || 0) + 1);

      // Prime numbers
      if (isPrime(num)) primeCount++;
    }

    // Prime count per draw
    primeCountPerDraw.set(
      primeCount,
      (primeCountPerDraw.get(primeCount) || 0) + 1,
    );

    // Consecutive gaps
    for (let j = 0; j < sortedNums.length - 1; j++) {
      const gap = sortedNums[j + 1] - sortedNums[j];
      consecutiveGapCounts.set(gap, (consecutiveGapCounts.get(gap) || 0) + 1);
    }

    if (highNumsInDraw > 0) drawsWithHighNumbers++;
    highNumberCounts.set(
      highNumsInDraw,
      (highNumberCounts.get(highNumsInDraw) || 0) + 1,
    );

    const eoKey = `${evenCount}/${oddCount}`;
    evenOddCounts.set(eoKey, (evenOddCounts.get(eoKey) || 0) + 1);

    const lhKey = `${lowCount}/${highCount}`;
    lowHighCounts.set(lhKey, (lowHighCounts.get(lhKey) || 0) + 1);

    const sum = nums.reduce((a, b) => a + b, 0);
    sumCounts.set(sum, (sumCounts.get(sum) || 0) + 1);

    const range = Math.max(...nums) - Math.min(...nums);
    rangeCounts.set(range, (rangeCounts.get(range) || 0) + 1);

    // Chance correlation
    if (!chanceStats.has(chance)) {
      chanceStats.set(chance, { sumTotal: 0, rangeTotal: 0, count: 0 });
    }
    const cs = chanceStats.get(chance)!;
    cs.sumTotal += sum;
    cs.rangeTotal += range;
    cs.count++;

    // Pairs
    for (let j = 0; j < nums.length; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        const pair = [nums[j], nums[k]].sort((a, b) => a - b);
        const pairKey = `${pair[0]}-${pair[1]}`;
        pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1);
      }
    }

    // Triplets
    for (let j = 0; j < nums.length; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        for (let l = k + 1; l < nums.length; l++) {
          const triplet = [nums[j], nums[k], nums[l]].sort((a, b) => a - b);
          const tripletKey = `${triplet[0]}-${triplet[1]}-${triplet[2]}`;
          tripletCounts.set(
            tripletKey,
            (tripletCounts.get(tripletKey) || 0) + 1,
          );
        }
      }
    }
  }

  const numberFrequencies: NumberFrequency[] = [];
  for (let i = 1; i <= 49; i++) {
    const count = numberCounts.get(i) || 0;
    numberFrequencies.push({
      number: i,
      count,
      percentage: totalDraws > 0 ? (count / totalDraws) * 100 : 0,
    });
  }

  const chanceFrequencies: NumberFrequency[] = [];
  for (let i = 1; i <= 10; i++) {
    const count = chanceCounts.get(i) || 0;
    chanceFrequencies.push({
      number: i,
      count,
      percentage: totalDraws > 0 ? (count / totalDraws) * 100 : 0,
    });
  }

  const highNumberDistribution = Array.from(highNumberCounts.entries())
    .map(([count, frequency]) => ({ count, frequency }))
    .sort((a, b) => a.count - b.count);

  const evenOddDistribution = Array.from(evenOddCounts.entries())
    .map(([key, count]) => {
      const [even, odd] = key.split("/").map(Number);
      return { even, odd, count };
    })
    .sort((a, b) => b.count - a.count);

  const lowHighDistribution = Array.from(lowHighCounts.entries())
    .map(([key, count]) => {
      const [low, high] = key.split("/").map(Number);
      return { low, high, count };
    })
    .sort((a, b) => b.count - a.count);

  const sumDistribution = Array.from(sumCounts.entries())
    .map(([sum, count]) => ({ sum, count }))
    .sort((a, b) => a.sum - b.sum);

  const rangeDistribution = Array.from(rangeCounts.entries())
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => a.range - b.range);

  const currentGaps: { number: number; gap: number }[] = [];
  for (let i = 1; i <= 49; i++) {
    const lastSeenIndex = lastSeen.get(i);
    const gap =
      lastSeenIndex !== undefined
        ? draws.length - 1 - lastSeenIndex
        : draws.length;
    currentGaps.push({ number: i, gap });
  }
  currentGaps.sort((a, b) => b.gap - a.gap);

  const topPairs: PairFrequency[] = Array.from(pairCounts.entries())
    .map(([key, count]) => {
      const [n1, n2] = key.split("-").map(Number);
      return { pair: [n1, n2] as [number, number], count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const topTriplets: TripletFrequency[] = Array.from(tripletCounts.entries())
    .map(([key, count]) => {
      const [n1, n2, n3] = key.split("-").map(Number);
      return { triplet: [n1, n2, n3] as [number, number, number], count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const sums = Array.from(sumCounts.keys()).sort((a, b) => a - b);
  const p10Index = Math.floor(sums.length * 0.1);
  const p90Index = Math.floor(sums.length * 0.9);
  const sumPercentiles = {
    p10: sums[p10Index] || 0,
    p90: sums[p90Index] || 0,
  };

  // Decade distribution
  const decadeDistribution = Array.from(decadeCounts.entries())
    .map(([decade, count]) => ({
      decade,
      count,
      percentage: totalDraws > 0 ? (count / (totalDraws * 5)) * 100 : 0,
    }))
    .sort((a, b) => a.decade - b.decade);

  // Prime number stats
  const primeNumberStats = Array.from(primeCountPerDraw.entries())
    .map(([primeCount, frequency]) => ({ primeCount, frequency }))
    .sort((a, b) => a.primeCount - b.primeCount);

  // Digit ending distribution
  const digitEndingDistribution = Array.from(digitEndingCounts.entries())
    .map(([digit, count]) => ({ digit, count }))
    .sort((a, b) => a.digit - b.digit);

  // Consecutive gap distribution
  const consecutiveGapDistribution = Array.from(consecutiveGapCounts.entries())
    .map(([gap, count]) => ({ gap, count }))
    .sort((a, b) => a.gap - b.gap);

  // Chance correlation
  const chanceCorrelation = Array.from(chanceStats.entries())
    .map(([chance, stats]) => ({
      chance,
      avgSum: stats.count > 0 ? stats.sumTotal / stats.count : 0,
      avgRange: stats.count > 0 ? stats.rangeTotal / stats.count : 0,
    }))
    .sort((a, b) => a.chance - b.chance);

  // Advanced number stats with hot/cold detection
  const recentWindow = Math.min(100, totalDraws);
  const recentDraws = draws.slice(0, recentWindow);
  const recentCounts = new Map<number, number>();

  for (const draw of recentDraws) {
    for (const num of draw.nums) {
      recentCounts.set(num, (recentCounts.get(num) || 0) + 1);
    }
  }

  const avgFrequency = totalDraws > 0 ? (totalDraws * 5) / 49 : 0;
  const recentAvgFrequency = recentWindow > 0 ? (recentWindow * 5) / 49 : 0;

  const numberStatsAdvanced: NumberStats[] = [];

  // Build array with all numbers and their recent frequencies
  const numbersWithFreq: Array<{
    number: number;
    recentFreq: number;
    frequency: number;
    avgGap: number;
    stdDevGap: number;
    lastGap: number;
  }> = [];

  for (let i = 1; i <= 49; i++) {
    const frequency = numberCounts.get(i) || 0;
    const recentFreq = recentCounts.get(i) || 0;
    const gaps = numberGapHistory.get(i) || [];

    let avgGap = 0;
    let stdDevGap = 0;

    if (gaps.length > 0) {
      avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const variance =
        gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) /
        gaps.length;
      stdDevGap = Math.sqrt(variance);
    }

    const lastSeenIndex = lastSeen.get(i);
    const lastGap =
      lastSeenIndex !== undefined
        ? draws.length - 1 - lastSeenIndex
        : draws.length;

    numbersWithFreq.push({
      number: i,
      recentFreq,
      frequency,
      avgGap,
      stdDevGap,
      lastGap,
    });
  }

  // Sort by recent frequency and select top 7 hot and bottom 7 cold
  const sortedByRecentFreq = [...numbersWithFreq].sort(
    (a, b) => b.recentFreq - a.recentFreq,
  );
  const hotNumbers = sortedByRecentFreq.slice(0, 7).map((n) => n.number);
  const coldNumbers = sortedByRecentFreq.slice(-7).map((n) => n.number);

  // Build numberStatsAdvanced with isHot and isCold flags
  for (const numData of numbersWithFreq) {
    const isHot = hotNumbers.includes(numData.number);
    const isCold = coldNumbers.includes(numData.number);

    numberStatsAdvanced.push({
      number: numData.number,
      frequency: numData.frequency,
      avgGap: numData.avgGap,
      stdDevGap: numData.stdDevGap,
      lastGap: numData.lastGap,
      isHot,
      isCold,
    });
  }

  return {
    totalDraws,
    numberFrequencies,
    chanceFrequencies,
    drawsWithHighNumbers,
    highNumberDistribution,
    evenOddDistribution,
    lowHighDistribution,
    sumDistribution,
    rangeDistribution,
    currentGaps,
    topPairs,
    sumPercentiles,
    topTriplets,
    decadeDistribution,
    primeNumberStats,
    digitEndingDistribution,
    hotNumbers,
    coldNumbers,
    numberStatsAdvanced,
    consecutiveGapDistribution,
    chanceCorrelation,
  };
}
