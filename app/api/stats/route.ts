import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Draw } from "@/lib/types";
import { calculateStats } from "@/lib/stats";
import { getCached, setCached } from "@/lib/stats-cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const window = searchParams.get("window") || "all";
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const lastNDraws = searchParams.get("lastNDraws");

    const cacheKey = `stats:${window}:${lastNDraws || ""}:${from || ""}:${to || ""}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    let dbDraws;

    if (window === "custom" && lastNDraws) {
      // Use lastNDraws parameter for custom window
      const n = parseInt(lastNDraws);
      dbDraws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
        take: n,
      });
    } else if (window === "custom" && from && to) {
      // Fallback to date range if provided
      dbDraws = await prisma.draw.findMany({
        where: {
          dateISO: {
            gte: from,
            lte: to,
          },
        },
        orderBy: { dateISO: "desc" },
      });
    } else if (window === "1000") {
      dbDraws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
        take: 1000,
      });
    } else if (window === "200") {
      dbDraws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
        take: 200,
      });
    } else {
      dbDraws = await prisma.draw.findMany({
        orderBy: { dateISO: "desc" },
      });
    }

    const draws: Draw[] = dbDraws.map((draw) => ({
      id: draw.id,
      dateISO: draw.dateISO,
      dateLabel: draw.dateLabel,
      nums: JSON.parse(draw.nums) as number[],
      chance: draw.chance,
      source: draw.source,
      rawDateText: draw.rawDateText || undefined,
    }));

    const stats = calculateStats(draws);

    const result = { window, from: from || null, to: to || null, stats };
    await setCached(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error calculating stats:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
