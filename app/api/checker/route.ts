import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getRank(matched: number, chanceMatched: boolean): string {
  if (matched === 5 && chanceMatched) return "5+C";
  if (matched === 5) return "5";
  if (matched === 4 && chanceMatched) return "4+C";
  if (matched === 4) return "4";
  if (matched === 3 && chanceMatched) return "3+C";
  if (matched === 3) return "3";
  if (matched === 2 && chanceMatched) return "2+C";
  if (matched === 2) return "2";
  if (matched === 1 && chanceMatched) return "1+C";
  if (chanceMatched) return "0+C";
  return "0";
}

const RANK_ORDER = ["5+C", "5", "4+C", "4", "3+C", "3", "2+C", "2", "1+C", "0+C", "0"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const numsParam = searchParams.get("nums");
    const chanceParam = searchParams.get("chance");

    if (!numsParam || !chanceParam) {
      return NextResponse.json({ error: "Missing nums or chance" }, { status: 400 });
    }

    const inputNums = numsParam.split(",").map(Number);
    const inputChance = Number(chanceParam);

    if (
      inputNums.length !== 5 ||
      inputNums.some((n) => isNaN(n) || n < 1 || n > 49) ||
      new Set(inputNums).size !== 5 ||
      isNaN(inputChance) || inputChance < 1 || inputChance > 10
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const draws = await prisma.draw.findMany({
      orderBy: { dateISO: "desc" },
      select: { dateISO: true, dateLabel: true, nums: true, chance: true },
    });

    const inputSet = new Set(inputNums);

    const rankCounts: Record<string, number> = {};
    RANK_ORDER.forEach((r) => (rankCounts[r] = 0));

    const matches = draws.map((draw) => {
      const drawNums: number[] = Array.isArray(draw.nums)
        ? (draw.nums as unknown as number[])
        : JSON.parse(draw.nums as string);
      const matchedNums = drawNums.filter((n) => inputSet.has(n));
      const matchedChance = draw.chance === inputChance;
      const rank = getRank(matchedNums.length, matchedChance);
      rankCounts[rank]++;
      return {
        dateISO: draw.dateISO,
        dateLabel: draw.dateLabel,
        drawNums,
        drawChance: draw.chance,
        matchedNums,
        matchedChance,
        rank,
      };
    });

    const summary = RANK_ORDER.map((rank) => ({ rank, count: rankCounts[rank] }));

    return NextResponse.json({
      totalDraws: draws.length,
      matches,
      summary,
    });
  } catch (error) {
    console.error("Checker error:", error);
    return NextResponse.json(
      { error: "Failed to check grid", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
