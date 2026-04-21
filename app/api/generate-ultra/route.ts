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

    console.log(`🚀 Ultra-Advanced AI Generation: ${count} grids`);

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
    // 3. ADVANCED WEIGHT CALCULATION (6 criteria including AI)
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

    // Generate grids
    const grids = [];
    for (let i = 0; i < count; i++) {
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

      // Select 5 unique numbers with NO consecutive numbers allowed
      let attempts = 0;
      const maxAttempts = 1000;

      while (nums.length < 5 && attempts < maxAttempts) {
        attempts++;
        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        const num = weightedPool[randomIndex];

        if (!nums.includes(num)) {
          // Check if adding this number would create consecutive numbers
          const testNums = [...nums, num].sort((a, b) => a - b);
          let hasConsecutive = false;

          for (let k = 0; k < testNums.length - 1; k++) {
            if (testNums[k + 1] - testNums[k] === 1) {
              hasConsecutive = true;
              break;
            }
          }

          // Only add if NO consecutive numbers
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

      // Generate chance
      const chance = Math.floor(Math.random() * 10) + 1;

      // ============================================
      // 4. MULTI-AXIS SCORING
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

      // Frequency score (how "hot" the numbers are)
      nums.forEach((num) => {
        const metrics = numberMetrics.get(num)!;
        frequencyScore += metrics.recentFreq / 10;
      });

      // Pair score (how many frequent pairs are in the grid)
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
          pairScore += pairData.count;
        }
      });

      // Cycle score (how regular the numbers' patterns are)
      nums.forEach((num) => {
        const metrics = numberMetrics.get(num)!;
        cycleScore += metrics.cycleScore * 10;
      });

      // Diversity score (spread across decades, parity, ranges)
      const decades = new Set(nums.map((n) => Math.floor((n - 1) / 10)));
      diversityScore += decades.size * 5;

      // Optimal sum bonus
      if (sum >= 104 && sum <= 145) {
        diversityScore += 10;
      }

      // Optimal pair/impair ratio bonus
      if (evenCount === 2 || evenCount === 3) {
        diversityScore += 5;
      }

      // Combined multi-axis score
      const totalScore =
        frequencyScore * 0.3 +
        pairScore * 0.25 +
        cycleScore * 0.25 +
        diversityScore * 0.2;

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

    // Get hot/cold numbers based on recent frequency
    const sortedByRecentFreq = Array.from(numberMetrics.entries()).sort(
      (a, b) => b[1].recentFreq - a[1].recentFreq,
    );

    const hotNumbers = sortedByRecentFreq.slice(0, 10).map(([num]) => num);
    const coldNumbers = sortedByRecentFreq
      .slice(-10)
      .reverse()
      .map(([num]) => num);

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
