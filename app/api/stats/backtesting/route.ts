/**
 * API endpoint for backtesting strategies
 * Tests different strategies against historical data
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface StrategyResult {
  name: string;
  description: string;
  totalMatches: number;
  totalWins: number;
  winRate: number;
  avgReturn: number;
  bestDraw: { date: string; matched: number };
  worstDraw: { date: string; matched: number };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testPeriod = parseInt(searchParams.get("testPeriod") || "100"); // Number of draws to test against

    // Fetch draws
    const draws = await prisma.draw.findMany({
      orderBy: { dateISO: "desc" },
      take: testPeriod,
    });

    if (draws.length === 0) {
      return NextResponse.json({ error: "No draws found" }, { status: 404 });
    }

    // Parse draws
    const parsedDraws = draws
      .map((d) => ({
        nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
        chance: d.chance,
        dateISO: d.dateISO,
      }))
      .reverse();

    // Calculate number frequencies from earlier period for strategy generation
    const trainingDraws = await prisma.draw.findMany({
      orderBy: { dateISO: "desc" },
      skip: testPeriod,
      take: 500,
    });

    const parsedTrainingDraws = trainingDraws
      .map((d) => ({
        nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
      }))
      .reverse();

    const frequencyMap = new Map<number, number>();
    parsedTrainingDraws.forEach((draw) => {
      draw.nums.forEach((num: number) => {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
      });
    });

    // Get hot numbers (top 10 by frequency)
    const hotNumbers = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([num]) => num);

    // Get cold numbers (bottom 10 by frequency)
    const coldNumbers = Array.from(frequencyMap.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([num]) => num);

    // Define strategies
    const strategies: StrategyResult[] = [];

    // Strategy 1: Hot Numbers Only
    let hotStrategyWins = 0;
    let hotStrategyBest: number = 0;
    let hotStrategyWorst: number = 5;
    let hotStrategyBestDraw: {
      nums: number[];
      chance: number;
      dateISO: string;
    } = parsedDraws[0];
    let hotStrategyWorstDraw: {
      nums: number[];
      chance: number;
      dateISO: string;
    } = parsedDraws[0];

    parsedDraws.forEach((draw) => {
      const matched = draw.nums.filter((n: number) =>
        hotNumbers.includes(n),
      ).length;
      if (matched >= 3) hotStrategyWins++;
      if (matched > hotStrategyBest) {
        hotStrategyBest = matched;
        hotStrategyBestDraw = draw;
      }
      if (matched < hotStrategyWorst) {
        hotStrategyWorst = matched;
        hotStrategyWorstDraw = draw;
      }
    });

    strategies.push({
      name: "Numéros Chauds",
      description: "Sélectionne les 10 numéros les plus fréquents",
      totalMatches: parsedDraws.length,
      totalWins: hotStrategyWins,
      winRate: (hotStrategyWins / parsedDraws.length) * 100,
      avgReturn: (hotNumbers.length * 5) / parsedDraws.length,
      bestDraw: { date: hotStrategyBestDraw.dateISO, matched: hotStrategyBest },
      worstDraw: {
        date: hotStrategyWorstDraw.dateISO,
        matched: hotStrategyWorst,
      },
    });

    // Strategy 2: Cold Numbers (Due)
    let coldStrategyWins = 0;
    let coldStrategyBest: number = 0;
    let coldStrategyWorst: number = 5;
    let coldStrategyBestDraw = parsedDraws[0];
    let coldStrategyWorstDraw = parsedDraws[0];

    parsedDraws.forEach((draw) => {
      const matched = draw.nums.filter((n: number) =>
        coldNumbers.includes(n),
      ).length;
      if (matched >= 3) coldStrategyWins++;
      if (matched > coldStrategyBest) {
        coldStrategyBest = matched;
        coldStrategyBestDraw = draw;
      }
      if (matched < coldStrategyWorst) {
        coldStrategyWorst = matched;
        coldStrategyWorstDraw = draw;
      }
    });

    strategies.push({
      name: "Numéros Froids (En Retard)",
      description: "Sélectionne les 10 numéros les moins fréquents",
      totalMatches: parsedDraws.length,
      totalWins: coldStrategyWins,
      winRate: (coldStrategyWins / parsedDraws.length) * 100,
      avgReturn: (coldNumbers.length * 5) / parsedDraws.length,
      bestDraw: {
        date: coldStrategyBestDraw.dateISO,
        matched: coldStrategyBest,
      },
      worstDraw: {
        date: coldStrategyWorstDraw.dateISO,
        matched: coldStrategyWorst,
      },
    });

    // Strategy 3: Balanced (5 hot + 5 cold)
    const balancedNumbers = [
      ...hotNumbers.slice(0, 5),
      ...coldNumbers.slice(0, 5),
    ];
    let balancedStrategyWins = 0;
    let balancedStrategyBest: number = 0;
    let balancedStrategyWorst: number = 5;
    let balancedStrategyBestDraw: {
      nums: number[];
      chance: number;
      dateISO: string;
    } = parsedDraws[0];
    let balancedStrategyWorstDraw: {
      nums: number[];
      chance: number;
      dateISO: string;
    } = parsedDraws[0];

    parsedDraws.forEach((draw) => {
      const matched = draw.nums.filter((n: number) =>
        balancedNumbers.includes(n),
      ).length;
      if (matched >= 3) balancedStrategyWins++;
      if (matched > balancedStrategyBest) {
        balancedStrategyBest = matched;
        balancedStrategyBestDraw = draw;
      }
      if (matched < balancedStrategyWorst) {
        balancedStrategyWorst = matched;
        balancedStrategyWorstDraw = draw;
      }
    });

    strategies.push({
      name: "Équilibré (Chauds + Froids)",
      description: "5 numéros chauds + 5 numéros froids",
      totalMatches: parsedDraws.length,
      totalWins: balancedStrategyWins,
      winRate: (balancedStrategyWins / parsedDraws.length) * 100,
      avgReturn: (balancedNumbers.length * 5) / parsedDraws.length,
      bestDraw: {
        date: balancedStrategyBestDraw.dateISO,
        matched: balancedStrategyBest,
      },
      worstDraw: {
        date: balancedStrategyWorstDraw.dateISO,
        matched: balancedStrategyWorst,
      },
    });

    // Strategy 4: Random Selection (Baseline)
    let randomStrategyWins = 0;
    const randomIterations = 10;
    let randomAvgMatches = 0;

    for (let iter = 0; iter < randomIterations; iter++) {
      let matches = 0;
      parsedDraws.forEach((draw) => {
        const randomSelection: number[] = [];
        while (randomSelection.length < 10) {
          const num = Math.floor(Math.random() * 49) + 1;
          if (!randomSelection.includes(num)) {
            randomSelection.push(num);
          }
        }
        const matched = draw.nums.filter((n) =>
          randomSelection.includes(n),
        ).length;
        matches += matched;
      });
      randomAvgMatches += matches / parsedDraws.length;
    }
    randomAvgMatches /= randomIterations;
    randomStrategyWins = Math.round(
      (randomAvgMatches / 5) * parsedDraws.length,
    ); // Approximate

    strategies.push({
      name: "Aléatoire (Référence)",
      description: "Sélection aléatoire de 10 numéros",
      totalMatches: parsedDraws.length,
      totalWins: randomStrategyWins,
      winRate: (randomStrategyWins / parsedDraws.length) * 100,
      avgReturn: randomAvgMatches,
      bestDraw: { date: "N/A", matched: Math.round(randomAvgMatches + 1) },
      worstDraw: { date: "N/A", matched: Math.round(randomAvgMatches - 1) },
    });

    // Sort strategies by win rate
    strategies.sort((a, b) => b.winRate - a.winRate);

    return NextResponse.json({
      success: true,
      metadata: {
        testPeriod: parsedDraws.length,
        trainingPeriod: parsedTrainingDraws.length,
        testDateRange: {
          start: parsedDraws[0]?.dateISO,
          end: parsedDraws[parsedDraws.length - 1]?.dateISO,
        },
      },
      strategies,
      bestStrategy: strategies[0],
      worstStrategy: strategies[strategies.length - 1],
      recommendation: `La stratégie "${strategies[0].name}" a montré les meilleurs résultats avec un taux de réussite de ${strategies[0].winRate.toFixed(1)}%`,
    });
  } catch (error) {
    console.error("Error in backtesting:", error);
    return NextResponse.json(
      {
        error: "Failed to run backtesting",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
