/**
 * API endpoint for seasonal pattern analysis
 * Analyzes number frequencies by month and day of week
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Fetch all draws
    const draws = await prisma.draw.findMany({
      orderBy: { dateISO: 'desc' },
    });

    if (draws.length === 0) {
      return NextResponse.json({ error: 'No draws found' }, { status: 404 });
    }

    // Parse draws
    const parsedDraws = draws.map(d => ({
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
      dateISO: d.dateISO,
    }));

    // Analyze by month
    const monthFrequency = new Map<number, Map<number, number>>(); // month -> num -> count
    const monthDrawCounts = new Map<number, number>();

    // Analyze by day of week
    const dayFrequency = new Map<number, Map<number, number>>(); // day -> num -> count
    const dayDrawCounts = new Map<number, number>();

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    parsedDraws.forEach(draw => {
      const date = new Date(draw.dateISO);
      const month = date.getMonth(); // 0-11
      const day = date.getDay(); // 0-6 (Sunday = 0)

      // Initialize maps if needed
      if (!monthFrequency.has(month)) {
        monthFrequency.set(month, new Map());
        monthDrawCounts.set(month, 0);
      }
      if (!dayFrequency.has(day)) {
        dayFrequency.set(day, new Map());
        dayDrawCounts.set(day, 0);
      }

      // Count draws
      monthDrawCounts.set(month, (monthDrawCounts.get(month) || 0) + 1);
      dayDrawCounts.set(day, (dayDrawCounts.get(day) || 0) + 1);

      // Count number frequencies
      draw.nums.forEach((num: number) => {
        const monthMap = monthFrequency.get(month)!;
        monthMap.set(num, (monthMap.get(num) || 0) + 1);

        const dayMap = dayFrequency.get(day)!;
        dayMap.set(num, (dayMap.get(num) || 0) + 1);
      });
    });

    // Calculate average frequency per month
    const monthlyAnalysis = Array.from({ length: 12 }, (_, monthIndex) => {
      const totalDraws = monthDrawCounts.get(monthIndex) || 0;
      const freqMap = monthFrequency.get(monthIndex) || new Map();
      
      const numberFrequencies: { num: number; frequency: number }[] = [];
      for (let num = 1; num <= 49; num++) {
        const count = freqMap.get(num) || 0;
        const frequency = totalDraws > 0 ? (count / totalDraws) * 5 : 0; // Normalize to 5 numbers per draw
        numberFrequencies.push({ num, frequency });
      }

      // Find hottest and coldest numbers for this month
      const hottest = [...numberFrequencies]
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(f => f.num);
      
      const coldest = [...numberFrequencies]
        .sort((a, b) => a.frequency - b.frequency)
        .slice(0, 5)
        .map(f => f.num);

      return {
        month: monthIndex,
        monthName: monthNames[monthIndex],
        totalDraws,
        numberFrequencies,
        hottest,
        coldest,
        averageSum: numberFrequencies.reduce((sum, f) => sum + f.num * f.frequency, 0) / 5,
      };
    });

    // Calculate average frequency per day of week
    const dailyAnalysis = Array.from({ length: 7 }, (_, dayIndex) => {
      const totalDraws = dayDrawCounts.get(dayIndex) || 0;
      const freqMap = dayFrequency.get(dayIndex) || new Map();
      
      const numberFrequencies: { num: number; frequency: number }[] = [];
      for (let num = 1; num <= 49; num++) {
        const count = freqMap.get(num) || 0;
        const frequency = totalDraws > 0 ? (count / totalDraws) * 5 : 0;
        numberFrequencies.push({ num, frequency });
      }

      const hottest = [...numberFrequencies]
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(f => f.num);
      
      const coldest = [...numberFrequencies]
        .sort((a, b) => a.frequency - b.frequency)
        .slice(0, 5)
        .map(f => f.num);

      return {
        day: dayIndex,
        dayName: dayNames[dayIndex],
        totalDraws,
        numberFrequencies,
        hottest,
        coldest,
        averageSum: numberFrequencies.reduce((sum, f) => sum + f.num * f.frequency, 0) / 5,
      };
    });

    // Identify overall seasonal patterns
    const bestMonths = monthlyAnalysis
      .filter(m => m.totalDraws > 0)
      .sort((a, b) => b.averageSum - a.averageSum)
      .slice(0, 3);

    const worstMonths = monthlyAnalysis
      .filter(m => m.totalDraws > 0)
      .sort((a, b) => a.averageSum - b.averageSum)
      .slice(0, 3);

    const bestDays = dailyAnalysis
      .filter(d => d.totalDraws > 0)
      .sort((a, b) => b.averageSum - a.averageSum)
      .slice(0, 3);

    const worstDays = dailyAnalysis
      .filter(d => d.totalDraws > 0)
      .sort((a, b) => a.averageSum - b.averageSum)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      metadata: {
        totalDraws: parsedDraws.length,
      },
      monthlyAnalysis,
      dailyAnalysis,
      bestMonths,
      worstMonths,
      bestDays,
      worstDays,
    });
  } catch (error) {
    console.error('Error in seasonal patterns analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze seasonal patterns',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
