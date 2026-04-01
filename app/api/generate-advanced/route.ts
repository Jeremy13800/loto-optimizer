/**
 * API endpoint for ULTRA-ADVANCED grid generation
 * Uses complete historical pattern analysis of all 2420+ draws
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GenerateConstraints } from "@/lib/types";
import { generateAdvancedGrids } from "@/lib/advanced-generator";
import {
  extractHistoricalPatterns,
  exportPatternStats,
} from "@/lib/advanced-pattern-analysis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const constraints: GenerateConstraints = body.constraints || body;
    const count = constraints.count || body.count || 5;

    // Validate count
    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: "Count must be between 1 and 20" },
        { status: 400 },
      );
    }

    console.log(`🚀 Advanced generation requested: ${count} grids`);

    // Fetch ALL draws for maximum pattern analysis
    const draws = await prisma.draw.findMany({
      orderBy: { dateISO: "desc" },
    });

    if (draws.length === 0) {
      return NextResponse.json(
        { error: "No draws found in database" },
        { status: 404 },
      );
    }

    console.log(`📊 Analyzing ${draws.length} historical draws...`);

    // Parse nums (stored as JSON strings)
    const parsedDraws = draws.map((d) => ({
      ...d,
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
      rawDateText: d.rawDateText || undefined,
    }));

    // Generate grids with ultra-advanced pattern analysis
    const startTime = Date.now();
    const grids = await generateAdvancedGrids(parsedDraws, count, constraints);
    const generationTime = Date.now() - startTime;

    // Extract patterns for metadata
    const patterns = extractHistoricalPatterns(parsedDraws);

    return NextResponse.json({
      success: true,
      grids,
      metadata: {
        totalDraws: parsedDraws.length,
        generationTime: `${generationTime}ms`,
        patternsAnalyzed: {
          pairs: patterns.numberPairFrequency.size,
          triplets: patterns.numberTripletFrequency.size,
          cyclicNumbers: patterns.cyclicNumbers.size,
        },
        hotNumbers: patterns.hotNumbers,
        coldNumbers: patterns.coldNumbers,
        avgScore: grids.reduce((sum, g) => sum + g.score, 0) / grids.length,
      },
    });
  } catch (error) {
    console.error("❌ Error generating advanced grids:", error);
    return NextResponse.json(
      {
        error: "Failed to generate grids",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
