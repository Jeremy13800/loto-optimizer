/**
 * API endpoint for temporal trend analysis
 * Analyzes how number frequencies change over time using moving averages
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TrendPoint {
  drawIndex: number;
  date: string;
  movingAverage: number;
  actualFrequency: number;
}

interface NumberTrend {
  num: number;
  trend: TrendPoint[];
  overallTrend: 'rising' | 'falling' | 'stable';
  currentVelocity: number; // Rate of change
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const windowSize = parseInt(searchParams.get('windowSize') || '50'); // Moving average window
    const lastNDraws = parseInt(searchParams.get('lastNDraws') || '500'); // Analyze last N draws

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
      ...d,
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
    })).reverse();

    // Calculate trends for each number (1-49)
    const numberTrends: NumberTrend[] = [];

    for (let num = 1; num <= 49; num++) {
      const trend: TrendPoint[] = [];
      const window: boolean[] = []; // Rolling window of appearances

      parsedDraws.forEach((draw, index) => {
        const appeared = draw.nums.includes(num);
        
        // Update rolling window
        window.push(appeared);
        if (window.length > windowSize) {
          window.shift();
        }

        // Calculate moving average (frequency in window)
        const movingAverage = window.length > 0 
          ? window.filter(x => x).length / window.length 
          : 0;

        // Calculate actual frequency (cumulative up to this point)
        const cumulativeAppearances = parsedDraws
          .slice(0, index + 1)
          .filter(d => d.nums.includes(num)).length;
        const actualFrequency = cumulativeAppearances / (index + 1);

        trend.push({
          drawIndex: index,
          date: draw.dateISO,
          movingAverage,
          actualFrequency,
        });
      });

      // Determine overall trend direction
      const firstMA = trend[0]?.movingAverage || 0;
      const lastMA = trend[trend.length - 1]?.movingAverage || 0;
      const difference = lastMA - firstMA;
      
      let overallTrend: 'rising' | 'falling' | 'stable' = 'stable';
      if (difference > 0.01) overallTrend = 'rising';
      else if (difference < -0.01) overallTrend = 'falling';

      // Calculate velocity (rate of change)
      const currentVelocity = difference / trend.length;

      numberTrends.push({
        num,
        trend,
        overallTrend,
        currentVelocity,
      });
    }

    // Identify rising and falling numbers
    const risingNumbers = numberTrends
      .filter(t => t.overallTrend === 'rising')
      .sort((a, b) => b.currentVelocity - a.currentVelocity)
      .slice(0, 10)
      .map(t => t.num);

    const fallingNumbers = numberTrends
      .filter(t => t.overallTrend === 'falling')
      .sort((a, b) => a.currentVelocity - b.currentVelocity)
      .slice(0, 10)
      .map(t => t.num);

    return NextResponse.json({
      success: true,
      metadata: {
        totalDraws: parsedDraws.length,
        windowSize,
        analyzedPeriod: {
          start: parsedDraws[0]?.dateISO,
          end: parsedDraws[parsedDraws.length - 1]?.dateISO,
        },
      },
      risingNumbers,
      fallingNumbers,
      trends: numberTrends,
    });
  } catch (error) {
    console.error('Error in temporal trends:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate temporal trends',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
