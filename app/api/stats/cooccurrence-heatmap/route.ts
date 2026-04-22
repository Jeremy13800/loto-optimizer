/**
 * API endpoint for co-occurrence heatmap
 * Shows how often each pair of numbers appears together (49x49 matrix)
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

    // Parse draws
    const parsedDraws = draws.map(d => ({
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
    }));

    // Initialize 49x49 matrix
    const cooccurrenceMatrix: number[][] = Array(49)
      .fill(0)
      .map(() => Array(49).fill(0));

    // Count co-occurrences
    parsedDraws.forEach(draw => {
      const nums = draw.nums;
      for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < nums.length; j++) {
          const num1 = nums[i] - 1; // Convert to 0-indexed
          const num2 = nums[j] - 1;
          cooccurrenceMatrix[num1][num2]++;
        }
      }
    });

    // Normalize by total draws to get probability
    const normalizedMatrix = cooccurrenceMatrix.map(row =>
      row.map(count => count / parsedDraws.length)
    );

    // Find top co-occurring pairs (excluding self-pairs)
    const topPairs: { num1: number; num2: number; count: number; probability: number }[] = [];
    
    for (let i = 0; i < 49; i++) {
      for (let j = i + 1; j < 49; j++) {
        const count = cooccurrenceMatrix[i][j];
        const probability = normalizedMatrix[i][j];
        topPairs.push({
          num1: i + 1,
          num2: j + 1,
          count,
          probability,
        });
      }
    }

    // Sort by count descending
    topPairs.sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      metadata: {
        totalDraws: parsedDraws.length,
        matrixSize: '49x49',
      },
      cooccurrenceMatrix,
      normalizedMatrix,
      topPairs: topPairs.slice(0, 100), // Top 100 pairs
      topPairsByProbability: topPairs.slice(0, 50),
    });
  } catch (error) {
    console.error('Error in co-occurrence heatmap:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate co-occurrence heatmap',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
