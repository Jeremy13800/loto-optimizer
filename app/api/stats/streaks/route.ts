/**
 * API endpoint for hot/cold streaks analysis
 * Analyzes consecutive appearance streaks for each number
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Streak {
  length: number;
  startIndex: number;
  endIndex: number;
  type: "hot" | "cold";
}

interface NumberStreak {
  num: number;
  currentStreak: Streak;
  longestHotStreak: Streak;
  longestColdStreak: Streak;
  averageHotStreak: number;
  averageColdStreak: number;
  streakHistory: Streak[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastNDraws = parseInt(searchParams.get("lastNDraws") || "500");

    // Fetch draws
    const draws = await prisma.draw.findMany({
      orderBy: { dateISO: "desc" },
      take: lastNDraws,
    });

    if (draws.length === 0) {
      return NextResponse.json({ error: "No draws found" }, { status: 404 });
    }

    // Parse and reverse to get chronological order
    const parsedDraws = draws
      .map((d) => ({
        nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
      }))
      .reverse();

    // Analyze streaks for each number
    const numberStreaks: NumberStreak[] = [];

    for (let num = 1; num <= 49; num++) {
      const streakHistory: Streak[] = [];
      let currentStreak: Streak | null = null;
      let longestHotStreak: Streak = {
        length: 0,
        startIndex: 0,
        endIndex: 0,
        type: "hot",
      };
      let longestColdStreak: Streak = {
        length: 0,
        startIndex: 0,
        endIndex: 0,
        type: "cold",
      };
      const hotStreaks: number[] = [];
      const coldStreaks: number[] = [];

      parsedDraws.forEach((draw, index) => {
        const appeared = draw.nums.includes(num);

        if (appeared) {
          if (currentStreak && (currentStreak as any).type === "hot") {
            currentStreak.length++;
            currentStreak.endIndex = index;
          } else {
            // End previous cold streak
            if (currentStreak && (currentStreak as any).type === "cold") {
              streakHistory.push({
                length: currentStreak.length,
                startIndex: currentStreak.startIndex,
                endIndex: currentStreak.endIndex,
                type: "cold",
              });
              coldStreaks.push(currentStreak.length);
              if (currentStreak.length > longestColdStreak.length) {
                longestColdStreak = {
                  length: currentStreak.length,
                  startIndex: currentStreak.startIndex,
                  endIndex: currentStreak.endIndex,
                  type: "cold",
                };
              }
            }
            // Start new hot streak
            currentStreak = {
              length: 1,
              startIndex: index,
              endIndex: index,
              type: "hot",
            };
          }
        } else {
          if (currentStreak && (currentStreak as any).type === "cold") {
            currentStreak.length++;
            currentStreak.endIndex = index;
          } else {
            // End previous hot streak
            if (currentStreak && (currentStreak as any).type === "hot") {
              streakHistory.push({
                length: currentStreak.length,
                startIndex: currentStreak.startIndex,
                endIndex: currentStreak.endIndex,
                type: "hot",
              });
              hotStreaks.push(currentStreak.length);
              if (currentStreak.length > longestHotStreak.length) {
                longestHotStreak = {
                  length: currentStreak.length,
                  startIndex: currentStreak.startIndex,
                  endIndex: currentStreak.endIndex,
                  type: "hot",
                };
              }
            }
            // Start new cold streak
            currentStreak = {
              length: 1,
              startIndex: index,
              endIndex: index,
              type: "cold",
            };
          }
        }
      });

      // Don't forget the last streak
      if (currentStreak) {
        streakHistory.push({
          length: (currentStreak as any).length,
          startIndex: (currentStreak as any).startIndex,
          endIndex: (currentStreak as any).endIndex,
          type: (currentStreak as any).type,
        });
        if ((currentStreak as any).type === "hot") {
          hotStreaks.push((currentStreak as any).length);
          if ((currentStreak as any).length > longestHotStreak.length) {
            longestHotStreak = {
              length: (currentStreak as any).length,
              startIndex: (currentStreak as any).startIndex,
              endIndex: (currentStreak as any).endIndex,
              type: "hot",
            };
          }
        } else {
          coldStreaks.push((currentStreak as any).length);
          if ((currentStreak as any).length > longestColdStreak.length) {
            longestColdStreak = {
              length: (currentStreak as any).length,
              startIndex: (currentStreak as any).startIndex,
              endIndex: (currentStreak as any).endIndex,
              type: "cold",
            };
          }
        }
      }

      const averageHotStreak =
        hotStreaks.length > 0
          ? hotStreaks.reduce((sum, len) => sum + len, 0) / hotStreaks.length
          : 0;
      const averageColdStreak =
        coldStreaks.length > 0
          ? coldStreaks.reduce((sum, len) => sum + len, 0) / coldStreaks.length
          : 0;

      numberStreaks.push({
        num,
        currentStreak: currentStreak || {
          length: 0,
          startIndex: 0,
          endIndex: 0,
          type: "cold",
        },
        longestHotStreak,
        longestColdStreak,
        averageHotStreak,
        averageColdStreak,
        streakHistory,
      });
    }

    // Identify currently hottest and coldest numbers
    const currentlyHot = numberStreaks
      .filter(
        (s) => s.currentStreak.type === "hot" && s.currentStreak.length >= 1,
      )
      .sort((a, b) => b.currentStreak.length - a.currentStreak.length)
      .slice(0, 10)
      .map((s) => s.num);

    const currentlyCold = numberStreaks
      .filter(
        (s) => s.currentStreak.type === "cold" && s.currentStreak.length >= 5,
      )
      .sort((a, b) => b.currentStreak.length - a.currentStreak.length)
      .slice(0, 10)
      .map((s) => s.num);

    // Numbers with longest historical hot streaks
    const historicallyHot = numberStreaks
      .sort((a, b) => b.longestHotStreak.length - a.longestHotStreak.length)
      .slice(0, 10)
      .map((s) => ({ num: s.num, length: s.longestHotStreak.length }));

    // Numbers with longest historical cold streaks
    const historicallyCold = numberStreaks
      .sort((a, b) => b.longestColdStreak.length - a.longestColdStreak.length)
      .slice(0, 10)
      .map((s) => ({ num: s.num, length: s.longestColdStreak.length }));

    return NextResponse.json({
      success: true,
      metadata: {
        totalDraws: parsedDraws.length,
      },
      currentlyHot,
      currentlyCold,
      historicallyHot,
      historicallyCold,
      streaks: numberStreaks,
    });
  } catch (error) {
    console.error("Error in streaks analysis:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze streaks",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
