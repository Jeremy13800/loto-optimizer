import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = body.count || 5;

    console.log(`🚀 Ultra-advanced generation: ${count} grids`);

    // Fetch all draws
    const draws = await prisma.draw.findMany({
      orderBy: { dateISO: "desc" },
    });

    if (draws.length === 0) {
      return NextResponse.json({ error: "No draws found" }, { status: 404 });
    }

    console.log(`📊 Analyzing ${draws.length} draws...`);

    // Parse draws
    const parsedDraws = draws.map((d) => ({
      ...d,
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
    }));

    // Calculate number frequencies
    const numberFrequency = new Map<number, number>();
    const recentDraws = parsedDraws.slice(0, 200);
    const recentFrequency = new Map<number, number>();

    parsedDraws.forEach((draw) => {
      draw.nums.forEach((num: number) => {
        numberFrequency.set(num, (numberFrequency.get(num) || 0) + 1);
      });
    });

    recentDraws.forEach((draw) => {
      draw.nums.forEach((num: number) => {
        recentFrequency.set(num, (recentFrequency.get(num) || 0) + 1);
      });
    });

    // Calculate weights
    const weights = new Map<number, number>();
    for (let num = 1; num <= 49; num++) {
      const globalFreq = numberFrequency.get(num) || 0;
      const recentFreq = recentFrequency.get(num) || 0;
      const globalWeight = globalFreq / parsedDraws.length;
      const recentWeight = recentFreq / 200;
      weights.set(num, globalWeight * 0.5 + recentWeight * 0.5);
    }

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

          for (let i = 0; i < testNums.length - 1; i++) {
            if (testNums[i + 1] - testNums[i] === 1) {
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

      // Calculate metadata
      const sum = nums.reduce((a, b) => a + b, 0);
      const range = nums[4] - nums[0];
      const evenCount = nums.filter((n) => n % 2 === 0).length;
      const lowCount = nums.filter((n) => n <= 24).length;

      // Simple score based on frequency
      const score = nums.reduce((total, num) => {
        return total + (weights.get(num) || 0.5) * 100;
      }, 0);

      grids.push({
        nums,
        chance,
        score: Math.round(score),
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

    // Get hot/cold numbers
    const hotNumbers = Array.from(recentFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([num]) => num);

    const coldNumbers = Array.from(recentFrequency.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([num]) => num);

    return NextResponse.json({
      success: true,
      grids,
      metadata: {
        totalDraws: parsedDraws.length,
        hotNumbers,
        coldNumbers,
        avgScore: grids.reduce((sum, g) => sum + g.score, 0) / grids.length,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate grids",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
