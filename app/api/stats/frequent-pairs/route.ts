/**
 * API endpoint for frequent pairs analysis
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculatePairFrequencies,
  calculateTripletFrequencies,
} from "@/lib/stats/pairs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const window = searchParams.get("window") || "all";
    const topN = parseInt(searchParams.get("topN") || "50");

    // Fetch draws based on window
    let draws;
    if (window === "200") {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
        take: 200,
        select: { nums: true },
      });
    } else if (window === "1000") {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
        take: 1000,
        select: { nums: true },
      });
    } else {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
        select: { nums: true },
      });
    }

    // Parse nums (stored as JSON strings)
    const parsedDraws = draws.map((d) => ({
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
    }));

    // Calculate frequent pairs
    const frequentPairs = calculatePairFrequencies(parsedDraws, topN);

    // Calculate frequent triplets (top 30)
    const frequentTriplets = calculateTripletFrequencies(parsedDraws, 30);

    return NextResponse.json({
      pairs: frequentPairs,
      triplets: frequentTriplets,
      totalDraws: parsedDraws.length,
      window,
    });
  } catch (error) {
    console.error("Error calculating frequent pairs:", error);
    return NextResponse.json(
      { error: "Failed to calculate frequent pairs" },
      { status: 500 },
    );
  }
}
