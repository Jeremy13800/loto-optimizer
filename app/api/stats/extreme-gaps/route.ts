/**
 * API endpoint for extreme gaps analysis
 * Identifies numbers with the longest gaps in history
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastNDraws = parseInt(searchParams.get('lastNDraws') || '1000');

    // Fetch draws
    const draws = await prisma.draw.findMany({
      orderBy: { dateISO: 'desc' },
      take: lastNDraws,
    });

    if (draws.length === 0) {
      return NextResponse.json({ error: 'No draws found' }, { status: 404 });
    }

    // Parse and reverse to get chronological order
    const parsedDraws = draws.map(d => ({
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
    })).reverse();

    // Calculate gaps for each number
    const numberGaps: { num: number; currentGap: number; maxGap: number; avgGap: number; lastSeen: number }[] = [];

    for (let num = 1; num <= 49; num++) {
      const appearances: number[] = [];
      const gaps: number[] = [];

      parsedDraws.forEach((draw, index) => {
        if (draw.nums.includes(num)) {
          appearances.push(index);
        }
      });

      // Calculate gaps between appearances
      for (let i = 1; i < appearances.length; i++) {
        gaps.push(appearances[i] - appearances[i - 1]);
      }

      // Current gap
      const lastSeen = appearances.length > 0 ? appearances[appearances.length - 1] : -1;
      const currentGap = lastSeen >= 0 ? parsedDraws.length - 1 - lastSeen : parsedDraws.length;

      // Max gap
      const maxGap = gaps.length > 0 ? Math.max(...gaps) : currentGap;

      // Average gap
      const avgGap = gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : currentGap;

      numberGaps.push({
        num,
        currentGap,
        maxGap,
        avgGap,
        lastSeen,
      });
    }

    // Identify extreme gaps
    const longestCurrentGaps = numberGaps
      .sort((a, b) => b.currentGap - a.currentGap)
      .slice(0, 10);

    const longestHistoricalGaps = numberGaps
      .sort((a, b) => b.maxGap - a.maxGap)
      .slice(0, 10);

    const longestAverageGaps = numberGaps
      .sort((a, b) => b.avgGap - a.avgGap)
      .slice(0, 10);

    // Numbers that are "due" (current gap > average gap)
    const dueNumbers = numberGaps
      .filter(g => g.currentGap > g.avgGap * 1.5)
      .sort((a, b) => (b.currentGap / b.avgGap) - (a.currentGap / a.avgGap))
      .slice(0, 10)
      .map(g => ({ num: g.num, ratio: g.currentGap / g.avgGap, currentGap: g.currentGap, avgGap: g.avgGap }));

    return NextResponse.json({
      success: true,
      metadata: {
        totalDraws: parsedDraws.length,
      },
      longestCurrentGaps,
      longestHistoricalGaps,
      longestAverageGaps,
      dueNumbers,
      allGaps: numberGaps,
    });
  } catch (error) {
    console.error('Error in extreme gaps analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze extreme gaps',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
