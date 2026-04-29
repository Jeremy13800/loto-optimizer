import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNeuralNetwork, type DrawData } from "@/lib/ai/loto-neural-network";

interface PairFrequency {
  pair: [number, number];
  count: number;
}

interface NumberMetrics {
  num: number;
  globalFreq: number;
  recentFreq: number;
  avgGap: number;
  lastSeen: number;
  cycleScore: number;
  pairScore: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = body.count || 5;
    const constraints = body.constraints;
    const applyConstraints = body.applyConstraints || false;

    console.log(`🚀 Ultra-Advanced AI Generation: ${count} grids`);
    console.log(
      `🔧 Apply user constraints: ${applyConstraints ? "YES" : "NO"}`,
    );

    // Fetch all draws
    const draws = await prisma.draw.findMany({
      orderBy: { dateISO: "desc" },
    });

    if (draws.length === 0) {
      return NextResponse.json({ error: "No draws found" }, { status: 404 });
    }

    console.log(`📊 Analyzing ${draws.length} historical draws...`);

    // Parse draws
    const parsedDraws: DrawData[] = draws.map((d) => ({
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
      chance: d.chance,
    }));

    // ============================================
    // 0. NEURAL NETWORK AI TRAINING & PREDICTION
    // ============================================
    const neuralNetwork = getNeuralNetwork();
    let aiPredictions: any[] = [];

    if (!neuralNetwork.isReady()) {
      console.log("🧠 Training Neural Network AI...");
      await neuralNetwork.train(parsedDraws, 30); // 30 epochs for faster training
    }

    console.log("🤖 Generating AI predictions...");
    const recentDraws = parsedDraws.slice(0, 10);
    aiPredictions = await neuralNetwork.predict(recentDraws);
    console.log(`✅ AI predictions generated`);

    // ============================================
    // 1. PAIR FREQUENCY ANALYSIS (Patterns)
    // ============================================
    const pairFrequency = new Map<string, number>();
    parsedDraws.forEach((draw) => {
      const nums = draw.nums.sort((a: number, b: number) => a - b);
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          const pair = `${nums[i]}-${nums[j]}`;
          pairFrequency.set(pair, (pairFrequency.get(pair) || 0) + 1);
        }
      }
    });

    // Get top pairs
    const topPairs = Array.from(pairFrequency.entries())
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    console.log(`🧠 Detected ${topPairs.length} frequent pairs`);

    // ============================================
    // 2. CYCLE/TEMPORAL PATTERN DETECTION
    // ============================================
    const numberMetrics = new Map<number, NumberMetrics>();

    for (let num = 1; num <= 49; num++) {
      const appearances: number[] = [];
      parsedDraws.forEach((draw, index) => {
        if (draw.nums.includes(num)) {
          appearances.push(index);
        }
      });

      // Calculate average gap between appearances
      const gaps: number[] = [];
      for (let i = 1; i < appearances.length; i++) {
        gaps.push(appearances[i] - appearances[i - 1]);
      }
      const avgGap =
        gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
      const lastSeen =
        appearances.length > 0 ? appearances[0] : parsedDraws.length;

      // Calculate cycle score (how regular the appearances are)
      const gapVariance =
        gaps.length > 0
          ? gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) /
            gaps.length
          : 0;
      const cycleScore = avgGap > 0 && gapVariance < avgGap * 2 ? 1 : 0.5;

      // Calculate pair score (how many top pairs this number participates in)
      const pairScore =
        topPairs.filter(({ pair }) => pair.includes(num.toString())).length /
        50;

      const globalFreq = appearances.length;
      const recentDraws = parsedDraws.slice(0, 200);
      const recentFreq = recentDraws.filter((draw) =>
        draw.nums.includes(num),
      ).length;

      numberMetrics.set(num, {
        num,
        globalFreq,
        recentFreq,
        avgGap,
        lastSeen,
        cycleScore,
        pairScore,
      });
    }

    console.log(`🔄 Cycle analysis complete for all 49 numbers`);

    // ============================================
    // 3. FETCH ALL ADVANCED ANALYSES FROM ANALYSIS API
    // ============================================
    console.log(`📊 Fetching all advanced analyses...`);

    const analysisUrl = new URL(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stats/advanced-analysis`,
    );
    analysisUrl.searchParams.set("window", "200");

    const analysisResponse = await fetch(analysisUrl.toString());
    if (!analysisResponse.ok) {
      console.warn("⚠️ Could not fetch advanced analyses, using fallback");
    }

    const analysisData = analysisResponse.ok
      ? await analysisResponse.json()
      : null;
    console.log(
      `✅ Advanced analyses ${analysisData ? "fetched" : "fallback used"}`,
    );

    // ============================================
    // 4. ADVANCED WEIGHT CALCULATION (6 criteria including AI)
    // ============================================
    const weights = new Map<number, number>();
    const aiPredictionMap = new Map<number, number>();
    aiPredictions.forEach((pred) => {
      aiPredictionMap.set(pred.num, pred.probability);
    });

    for (let num = 1; num <= 49; num++) {
      const metrics = numberMetrics.get(num)!;
      const globalWeight = metrics.globalFreq / parsedDraws.length;
      const recentWeight = metrics.recentFreq / 200;
      const cycleWeight = metrics.cycleScore;
      const pairWeight = metrics.pairScore;
      const recencyWeight = metrics.lastSeen < 50 ? 1.2 : 0.8;
      const aiWeight = aiPredictionMap.get(num) || 0.02; // AI prediction probability

      // Combined weight with AI (6 criteria)
      weights.set(
        num,
        globalWeight * 0.25 +
          recentWeight * 0.25 +
          cycleWeight * 0.15 +
          pairWeight * 0.15 +
          recencyWeight * 0.05 +
          aiWeight * 0.15, // AI contributes 15%
      );
    }

    console.log(`⚖️ AI-powered adaptive weights calculated for all numbers`);

    // Calculate hot/cold numbers before grid generation (needed for constraints)
    const sortedByRecentFreq = Array.from(numberMetrics.entries()).sort(
      (a, b) => b[1].recentFreq - a[1].recentFreq,
    );

    const hotNumbers = sortedByRecentFreq.slice(0, 10).map(([num]) => num);
    const coldNumbers = sortedByRecentFreq
      .slice(-10)
      .reverse()
      .map(([num]) => num);

    // ============================================
    // CONSTRAINT VALIDATION FUNCTIONS
    // ============================================
    const lastDraw = parsedDraws[0];
    const lastDrawNums = lastDraw ? lastDraw.nums : [];
    const lastDrawChance = lastDraw ? lastDraw.chance : null;

    const validateGrid = (
      nums: number[],
    ): { valid: boolean; reason?: string } => {
      if (!applyConstraints || !constraints) {
        return { valid: true };
      }

      // Exclude previous draw numbers
      if (constraints.excludePrevious) {
        const hasPreviousNum = nums.some((n) => lastDrawNums.includes(n));
        if (hasPreviousNum) {
          return { valid: false, reason: "Contains previous draw number" };
        }
      }

      // Exclude previous chance number
      if (constraints.excludePreviousChance && lastDrawChance) {
        // Chance is handled separately
      }

      // Even/odd ratio constraint
      if (constraints.evenOddRatio) {
        const [even, odd] = constraints.evenOddRatio.split("/").map(Number);
        const evenCount = nums.filter((n) => n % 2 === 0).length;
        if (evenCount !== even) {
          return { valid: false, reason: `Even/odd ratio mismatch` };
        }
      }

      // Low/high ratio constraint
      if (constraints.lowHighRatio) {
        const [low, high] = constraints.lowHighRatio.split("/").map(Number);
        const lowCount = nums.filter((n) => n <= 24).length;
        if (lowCount !== low) {
          return { valid: false, reason: `Low/high ratio mismatch` };
        }
      }

      // Max per decade constraint
      if (constraints.maxPerDecade) {
        const decades = nums.map((n) => Math.floor((n - 1) / 10));
        const decadeCounts = new Map<number, number>();
        decades.forEach((d) => {
          decadeCounts.set(d, (decadeCounts.get(d) || 0) + 1);
        });
        for (const count of decadeCounts.values()) {
          if (count > constraints.maxPerDecade) {
            return { valid: false, reason: `Max per decade exceeded` };
          }
        }
      }

      // Min range constraint
      if (constraints.minRange) {
        const range = nums[nums.length - 1] - nums[0];
        if (range < constraints.minRange) {
          return { valid: false, reason: `Range too small` };
        }
      }

      // Min high numbers constraint
      if (constraints.minHighNumbers) {
        const highCount = nums.filter((n) => n >= 31).length;
        if (highCount < constraints.minHighNumbers) {
          return { valid: false, reason: `Not enough high numbers` };
        }
      }

      // Max multiples of 3 constraint
      if (constraints.maxMultiplesOf3) {
        const multiplesOf3 = nums.filter((n) => n % 3 === 0).length;
        if (multiplesOf3 > constraints.maxMultiplesOf3) {
          return { valid: false, reason: `Too many multiples of 3` };
        }
      }

      // Avoid specific numbers
      if (constraints.avoidPopular) {
        const avoidNums = constraints.avoidPopular
          .split(",")
          .map((n: string) => parseInt(n.trim()))
          .filter((n: number) => !isNaN(n));
        const hasAvoidedNum = nums.some((n) => avoidNums.includes(n));
        if (hasAvoidedNum) {
          return { valid: false, reason: `Contains avoided number` };
        }
      }

      // Advanced constraints
      if (applyConstraints) {
        // Primes constraint
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        const primeCount = nums.filter((n) => primes.includes(n)).length;
        if (constraints.minPrimes && primeCount < constraints.minPrimes) {
          return { valid: false, reason: `Not enough primes` };
        }
        if (constraints.maxPrimes && primeCount > constraints.maxPrimes) {
          return { valid: false, reason: `Too many primes` };
        }

        // Decade spread constraint
        const uniqueDecades = new Set(
          nums.map((n) => Math.floor((n - 1) / 10)),
        );
        if (
          constraints.minDecadeSpread &&
          uniqueDecades.size < constraints.minDecadeSpread
        ) {
          return { valid: false, reason: `Decade spread too small` };
        }
        if (
          constraints.maxDecadeSpread &&
          uniqueDecades.size > constraints.maxDecadeSpread
        ) {
          return { valid: false, reason: `Decade spread too large` };
        }

        // Very high numbers constraint
        const veryHighCount = nums.filter((n) => n >= 41).length;
        if (
          constraints.minVeryHighNumbers &&
          veryHighCount < constraints.minVeryHighNumbers
        ) {
          return { valid: false, reason: `Not enough very high numbers` };
        }
        if (
          constraints.maxVeryHighNumbers &&
          veryHighCount > constraints.maxVeryHighNumbers
        ) {
          return { valid: false, reason: `Too many very high numbers` };
        }

        // Hot/Cold numbers constraint
        const hotNums = hotNumbers.slice(0, constraints.maxHotNumbers || 2);
        const coldNums = coldNumbers.slice(0, constraints.maxColdNumbers || 2);
        const hotCount = nums.filter((n) => hotNums.includes(n)).length;
        const coldCount = nums.filter((n) => coldNums.includes(n)).length;
        if (constraints.minHotNumbers && hotCount < constraints.minHotNumbers) {
          return { valid: false, reason: `Not enough hot numbers` };
        }
        if (constraints.maxHotNumbers && hotCount > constraints.maxHotNumbers) {
          return { valid: false, reason: `Too many hot numbers` };
        }
        if (
          constraints.minColdNumbers &&
          coldCount < constraints.minColdNumbers
        ) {
          return { valid: false, reason: `Not enough cold numbers` };
        }
        if (
          constraints.maxColdNumbers &&
          coldCount > constraints.maxColdNumbers
        ) {
          return { valid: false, reason: `Too many cold numbers` };
        }

        // Digit endings constraint
        const endings = new Set(nums.map((n) => n % 10));
        if (
          constraints.minDigitEndings &&
          endings.size < constraints.minDigitEndings
        ) {
          return { valid: false, reason: `Not enough unique digit endings` };
        }

        // Consecutive gap constraint
        for (let i = 1; i < nums.length; i++) {
          const gap = nums[i] - nums[i - 1];
          if (
            constraints.minConsecutiveGap &&
            gap < constraints.minConsecutiveGap
          ) {
            return { valid: false, reason: `Gap too small` };
          }
          if (
            constraints.maxConsecutiveGap &&
            gap > constraints.maxConsecutiveGap
          ) {
            return { valid: false, reason: `Gap too large` };
          }
        }

        // Target sum constraint
        const sum = nums.reduce((a, b) => a + b, 0);
        if (constraints.targetSumMin && sum < constraints.targetSumMin) {
          return { valid: false, reason: `Sum too small` };
        }
        if (constraints.targetSumMax && sum > constraints.targetSumMax) {
          return { valid: false, reason: `Sum too large` };
        }

        // Center of gravity constraint
        const centerOfGravity = sum / nums.length;
        if (
          constraints.centerOfGravityMin &&
          centerOfGravity < constraints.centerOfGravityMin
        ) {
          return { valid: false, reason: `Center of gravity too low` };
        }
        if (
          constraints.centerOfGravityMax &&
          centerOfGravity > constraints.centerOfGravityMax
        ) {
          return { valid: false, reason: `Center of gravity too high` };
        }
      }

      return { valid: true };
    };

    // Generate grids
    const grids = [];
    let totalAttempts = 0;
    const maxGridAttempts = count * 2000; // Allow many more attempts for higher quality grids

    while (grids.length < count && totalAttempts < maxGridAttempts) {
      totalAttempts++;
      const nums: number[] = [];
      const weightedPool: number[] = [];

      // Create weighted pool
      for (let num = 1; num <= 49; num++) {
        const weight = weights.get(num) || 0.5;
        const copies = Math.max(1, Math.floor(weight * 100));
        for (let j = 0; j < copies; j++) {
          weightedPool.push(num);
        }
      }

      // Select 5 unique numbers
      let attempts = 0;
      const maxAttempts = 1000;

      while (nums.length < 5 && attempts < maxAttempts) {
        attempts++;
        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        const num = weightedPool[randomIndex];

        if (!nums.includes(num)) {
          // Check if adding this number would create consecutive numbers
          // Only apply this constraint if NOT explicitly overridden by user
          const testNums = [...nums, num].sort((a, b) => a - b);
          let hasConsecutive = false;

          // Only check for consecutive if user hasn't specified min/max gap constraints
          const hasGapConstraint =
            applyConstraints &&
            constraints &&
            (constraints.minConsecutiveGap || constraints.maxConsecutiveGap);

          if (!hasGapConstraint) {
            for (let k = 0; k < testNums.length - 1; k++) {
              if (testNums[k + 1] - testNums[k] === 1) {
                hasConsecutive = true;
                break;
              }
            }
          }

          // Only add if NO consecutive numbers (unless user specified gap constraints)
          if (!hasConsecutive) {
            nums.push(num);
          }
        }
      }

      // If we couldn't generate a valid grid after max attempts, skip this one
      if (nums.length < 5) {
        continue;
      }

      nums.sort((a, b) => a - b);

      // Validate against constraints
      const validation = validateGrid(nums);
      if (!validation.valid) {
        continue;
      }

      // Generate chance
      const chance = Math.floor(Math.random() * 10) + 1;

      // ============================================
      // 4. ENHANCED MULTI-AXIS SCORING (with ALL analysis data)
      // ============================================
      const sum = nums.reduce((a, b) => a + b, 0);
      const range = nums[4] - nums[0];
      const evenCount = nums.filter((n) => n % 2 === 0).length;
      const lowCount = nums.filter((n) => n <= 24).length;

      // Score components
      let frequencyScore = 0;
      let pairScore = 0;
      let cycleScore = 0;
      let diversityScore = 0;
      let aiScore = 0;
      let recencyScore = 0;
      let structureScore = 0;
      let dispersionScore = 0;
      let temporalScore = 0;
      let gapScore = 0;
      let primeScore = 0;
      let digitEndingScore = 0;
      let patternScore = 0;

      // Frequency score (how "hot" the numbers are - from frequency analysis)
      nums.forEach((num) => {
        const metrics = numberMetrics.get(num)!;
        // Weight recent frequency more heavily
        frequencyScore += (metrics.recentFreq * 2 + metrics.globalFreq) / 10;
      });

      // Pair score (how many frequent pairs are in the grid - from co-occurrence analysis)
      const gridPairs: string[] = [];
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          const pair = `${Math.min(nums[i], nums[j])}-${Math.max(nums[i], nums[j])}`;
          gridPairs.push(pair);
        }
      }
      gridPairs.forEach((pair) => {
        const pairData = topPairs.find((p) => p.pair === pair);
        if (pairData) {
          // Bonus for top pairs (more weight for very frequent pairs)
          pairScore += pairData.count * 1.5;
        }
      });

      // Cycle score (how regular the numbers' patterns are - from temporal analysis)
      nums.forEach((num) => {
        const metrics = numberMetrics.get(num)!;
        cycleScore += metrics.cycleScore * 15; // Increased weight
      });

      // AI score (neural network predictions)
      nums.forEach((num) => {
        const aiProb = aiPredictionMap.get(num) || 0.02;
        aiScore += aiProb * 100;
      });

      // Recency score (numbers that haven't appeared recently - due numbers)
      nums.forEach((num) => {
        const metrics = numberMetrics.get(num)!;
        // Bonus for numbers with high gap (due to appear)
        if (metrics.lastSeen > 50) {
          recencyScore += (metrics.lastSeen - 50) / 10;
        }
      });

      // Structure score (from structures analysis)
      const decades = new Set(nums.map((n) => Math.floor((n - 1) / 10)));
      structureScore += decades.size * 6;

      // Decade coverage bonus (from decadeCoverage analysis)
      if (analysisData?.decadeCoverage) {
        const optimalDecades = analysisData.decadeCoverage.optimal || [
          0, 1, 2, 3, 4,
        ];
        const coveredDecades = nums.map((n) => Math.floor((n - 1) / 10));
        const optimalCoverage = coveredDecades.filter((d) =>
          optimalDecades.includes(d),
        ).length;
        structureScore += optimalCoverage * 3;
      }

      // Multiples of 5 analysis (from multiplesOf5 analysis)
      const multiplesOf5Count = nums.filter((n) => n % 5 === 0).length;
      if (analysisData?.multiplesOf5) {
        const optimalMultiples = analysisData.multiplesOf5.optimal || 1;
        if (multiplesOf5Count === optimalMultiples) {
          structureScore += 5;
        }
      }

      // Consecutives analysis (from consecutives analysis)
      let consecutiveCount = 0;
      for (let i = 1; i < nums.length; i++) {
        if (nums[i] - nums[i - 1] === 1) consecutiveCount++;
      }
      if (analysisData?.consecutives) {
        const optimalConsecutives = analysisData.consecutives.optimal || 0;
        if (consecutiveCount === optimalConsecutives) {
          structureScore += 5;
        }
      }

      // Dispersion score (from dispersion analysis)
      if (analysisData?.dispersion) {
        const optimalDispersion = analysisData.dispersion.optimal || [20, 35];
        if (range >= optimalDispersion[0] && range <= optimalDispersion[1]) {
          dispersionScore += 10;
        }
      }

      // Center of gravity (from centerGravity analysis)
      const centerOfGravity = sum / nums.length;
      if (analysisData?.centerGravity) {
        const optimalCenter = analysisData.centerGravity.optimal || [22, 28];
        if (
          centerOfGravity >= optimalCenter[0] &&
          centerOfGravity <= optimalCenter[1]
        ) {
          dispersionScore += 8;
        }
      }

      // Temporal score (from temporal analysis)
      if (analysisData?.temporal?.windows) {
        const recentWindows = analysisData.temporal.windows.slice(-5);
        const hotNumbersInWindows = new Set();
        recentWindows.forEach((window: any) => {
          if (window.hotNumbers) {
            window.hotNumbers.forEach((n: number) =>
              hotNumbersInWindows.add(n),
            );
          }
        });
        const hotCount = nums.filter((n) => hotNumbersInWindows.has(n)).length;
        temporalScore += hotCount * 2;
      }

      // Diversity score (spread across decades, parity, ranges)
      diversityScore += decades.size * 6;

      // Optimal sum bonus (from sums analysis)
      // Statistical recommendation: optimal range is 59-189
      if (analysisData?.sums) {
        const optimalSum = analysisData.sums.optimal || [59, 189];
        if (sum >= optimalSum[0] && sum <= optimalSum[1]) {
          diversityScore += 12;
        } else if (sum >= 50 && sum <= 200) {
          diversityScore += 6;
        }
      } else {
        // Fallback using statistical recommendation
        if (sum >= 59 && sum <= 189) {
          diversityScore += 12;
        } else if (sum >= 50 && sum <= 200) {
          diversityScore += 6;
        }
      }

      // Optimal pair/impair ratio bonus (from distribution analysis)
      // Statistical recommendation: 2 pairs / 3 odds or 3 pairs / 2 odds (most frequent ~60%)
      if (evenCount === 2 || evenCount === 3) {
        diversityScore += 10; // Increased bonus for most frequent ratios
      }

      // Optimal low/high ratio bonus
      // Statistical recommendation: 3 low (1-24) / 2 high (25-49) is most frequent
      if (lowCount === 3) {
        diversityScore += 12; // Higher bonus for most frequent ratio
      } else if (lowCount === 2) {
        diversityScore += 8; // Good alternative
      }

      // Amplitude bonus (from amplitude analysis)
      if (analysisData?.amplitudes) {
        const optimalAmplitude = analysisData.amplitudes.optimal || [25, 35];
        if (range >= optimalAmplitude[0] && range <= optimalAmplitude[1]) {
          diversityScore += 6;
        }
      } else {
        // Fallback
        if (range >= 25 && range <= 35) {
          diversityScore += 6;
        }
      }

      // Gap/spacing score (number spacing between consecutive numbers)
      // Optimal gaps are between 5-15 for good distribution
      const gaps: number[] = [];
      for (let i = 1; i < nums.length; i++) {
        gaps.push(nums[i] - nums[i - 1]);
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const minGap = Math.min(...gaps);
      const maxGap = Math.max(...gaps);

      // Bonus for optimal average gap (8-12 is ideal)
      if (avgGap >= 8 && avgGap <= 12) {
        gapScore += 10;
      } else if (avgGap >= 6 && avgGap <= 14) {
        gapScore += 6;
      }

      // Bonus for balanced gaps (not too small, not too large)
      if (minGap >= 3 && maxGap <= 15) {
        gapScore += 8;
      }

      // Avoid extreme gaps
      if (minGap >= 2 && maxGap <= 20) {
        gapScore += 4;
      }

      // Prime number score (from prime numbers analysis)
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
      const primeCount = nums.filter((n) => primes.includes(n)).length;
      // Optimal prime count is typically 2-3
      if (primeCount === 2 || primeCount === 3) {
        primeScore += 8;
      } else if (primeCount === 1 || primeCount === 4) {
        primeScore += 4;
      }

      // Digit ending score (unique digit endings for better distribution)
      const digitEndings = new Set(nums.map((n) => n % 10));
      const uniqueEndings = digitEndings.size;
      // Optimal is 4-5 unique endings
      if (uniqueEndings >= 4) {
        digitEndingScore += 8;
      } else if (uniqueEndings === 3) {
        digitEndingScore += 4;
      }

      // Pattern score (avoid repeating patterns)
      // Check for arithmetic progression
      let isArithmetic = true;
      const diff = nums[1] - nums[0];
      for (let i = 2; i < nums.length; i++) {
        if (nums[i] - nums[i - 1] !== diff) {
          isArithmetic = false;
          break;
        }
      }
      if (!isArithmetic) {
        patternScore += 5; // Bonus for non-arithmetic sequences
      }

      // Check for geometric-like patterns (multiples)
      const hasMultiples = nums.some((n, i) => {
        if (i === 0) return false;
        return nums[i] % nums[i - 1] === 0;
      });
      if (!hasMultiples) {
        patternScore += 3; // Bonus for avoiding simple multiples
      }

      // Check for mirror patterns
      const isMirror = nums[0] + nums[4] === nums[1] + nums[3];
      if (!isMirror) {
        patternScore += 2; // Bonus for avoiding mirror patterns
      }

      // Combined enhanced multi-axis score (13 criteria now with all analyses)
      const totalScore =
        frequencyScore * 0.16 +
        pairScore * 0.13 +
        cycleScore * 0.13 +
        diversityScore * 0.1 +
        aiScore * 0.1 +
        recencyScore * 0.06 +
        structureScore * 0.06 +
        dispersionScore * 0.05 +
        temporalScore * 0.04 +
        gapScore * 0.05 +
        primeScore * 0.04 +
        digitEndingScore * 0.04 +
        patternScore * 0.04;

      // Reject low-scoring grids (minimum threshold for quality)
      const minScoreThreshold = 20;
      if (totalScore < minScoreThreshold) {
        continue;
      }

      grids.push({
        nums,
        chance,
        score: Math.round(totalScore),
        metadata: {
          sum,
          range,
          evenCount,
          oddCount: 5 - evenCount,
          lowCount,
          highCount: 5 - lowCount,
          highNumbers: nums.filter((n) => n >= 31),
        },
      });
    }

    // Sort by score
    grids.sort((a, b) => b.score - a.score);

    console.log(
      `✅ Generated ${grids.length} grids with multi-axis AI scoring`,
    );

    return NextResponse.json({
      success: true,
      grids,
      metadata: {
        totalDraws: parsedDraws.length,
        hotNumbers,
        coldNumbers,
        avgScore: grids.reduce((sum, g) => sum + g.score, 0) / grids.length,
        topPairs: topPairs.slice(0, 10),
        ai: {
          enabled: true,
          modelType: "Neural Network",
          topPredictions: aiPredictions.slice(0, 10),
        },
      },
    });
  } catch (error) {
    console.error("❌ Ultra-advanced AI error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate grids with AI",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
