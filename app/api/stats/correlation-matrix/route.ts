/**
 * API endpoint for correlation matrix analysis
 * Calculates correlations between all numbers (49x49 matrix)
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

    // Create occurrence matrix for each number across all draws
    const numberOccurrences: number[][] = [];
    
    for (let num = 1; num <= 49; num++) {
      const occurrences: number[] = [];
      parsedDraws.forEach(draw => {
        occurrences.push(draw.nums.includes(num) ? 1 : 0);
      });
      numberOccurrences.push(occurrences);
    }

    // Calculate correlation matrix (49x49)
    const correlationMatrix: number[][] = [];
    
    for (let i = 0; i < 49; i++) {
      const row: number[] = [];
      for (let j = 0; j < 49; j++) {
        const correlation = calculatePearsonCorrelation(
          numberOccurrences[i],
          numberOccurrences[j]
        );
        row.push(correlation);
      }
      correlationMatrix.push(row);
    }

    // Find highly correlated pairs
    const highCorrelations: { num1: number; num2: number; correlation: number }[] = [];
    
    for (let i = 0; i < 49; i++) {
      for (let j = i + 1; j < 49; j++) {
        const corr = correlationMatrix[i][j];
        if (Math.abs(corr) > 0.3) { // Threshold for significant correlation
          highCorrelations.push({
            num1: i + 1,
            num2: j + 1,
            correlation: corr,
          });
        }
      }
    }

    // Sort by absolute correlation value
    highCorrelations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    return NextResponse.json({
      success: true,
      metadata: {
        totalDraws: parsedDraws.length,
        matrixSize: '49x49',
      },
      correlationMatrix,
      highCorrelations: highCorrelations.slice(0, 50), // Top 50 correlations
      positiveCorrelations: highCorrelations.filter(c => c.correlation > 0).slice(0, 10),
      negativeCorrelations: highCorrelations.filter(c => c.correlation < 0).slice(0, 10),
    });
  } catch (error) {
    console.error('Error in correlation matrix:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate correlation matrix',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  
  if (n === 0) return 0;
  
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    
    numerator += diffX * diffY;
    denominatorX += diffX * diffX;
    denominatorY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(denominatorX) * Math.sqrt(denominatorY);
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}
