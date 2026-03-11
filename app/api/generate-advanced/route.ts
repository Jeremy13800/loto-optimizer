/**
 * API endpoint for advanced grid generation with explainable scoring
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GenerateConstraints } from "@/lib/types";
import { generateAdvancedGrids } from "@/lib/generator-advanced";
import { calculateStats } from "@/lib/stats";
import { calculatePairFrequencies } from "@/lib/stats/pairs";

export async function POST(request: Request) {
  try {
    const constraints: GenerateConstraints = await request.json();

    // Validate constraints
    if (!constraints.count || constraints.count < 1 || constraints.count > 20) {
      return NextResponse.json(
        { error: "Count must be between 1 and 20" },
        { status: 400 },
      );
    }

    // Fetch draws based on window
    const window = constraints.window?.window || "all";
    let draws;

    if (window === "200") {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
        take: 200,
      });
    } else if (window === "1000") {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
        take: 1000,
      });
    } else {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
      });
    }

    if (draws.length === 0) {
      return NextResponse.json(
        { error: "No draws found in database" },
        { status: 404 },
      );
    }

    // Parse nums (stored as JSON strings)
    const parsedDraws = draws.map((d) => ({
      ...d,
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
      rawDateText: d.rawDateText || undefined,
    }));

    // Calculate statistics
    const stats = calculateStats(parsedDraws);

    // Get previous draw
    const previousDraw = parsedDraws[0] || null;

    // Calculate frequent pairs if enabled
    let frequentPairs;
    if (constraints.advanced?.frequentPairs?.enabled) {
      const topN = constraints.advanced.frequentPairs.topN || 50;
      frequentPairs = calculatePairFrequencies(parsedDraws, topN);
    }

    // Generate grids with advanced scoring
    const result = await generateAdvancedGrids(
      constraints,
      stats,
      previousDraw,
      frequentPairs,
    );

    return NextResponse.json({
      grids: result.grids,
      stats: result.stats,
      warnings: result.warnings,
      metadata: {
        totalDraws: parsedDraws.length,
        window,
        preset: constraints.advanced?.preset || "custom",
      },
    });
  } catch (error) {
    console.error("Error generating advanced grids:", error);
    return NextResponse.json(
      {
        error: "Failed to generate grids",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
