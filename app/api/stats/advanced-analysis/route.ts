/**
 * API endpoint pour toutes les analyses statistiques avancées
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  analyzeRepetitions,
  analyzeSums,
  analyzeAmplitudes,
  analyzeDispersion,
  analyzeDecadeCoverage,
  analyzeConsecutives,
  analyzeMultiplesOf5,
  analyzeHighNumbers,
  analyzeCenterOfGravity,
  analyzeStructures,
  analyzeCoOccurrence,
  analyzeTemporalFrequencies,
} from '@/lib/stats/analysis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || 'all';

    // Récupérer les tirages
    let draws;
    if (window === '200') {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: 'desc' },
        take: 200
      });
    } else if (window === '1000') {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: 'desc' },
        take: 1000
      });
    } else {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: 'desc' }
      });
    }

    if (draws.length === 0) {
      return NextResponse.json(
        { error: 'No draws found' },
        { status: 404 }
      );
    }

    // Parser les numéros
    const parsedDraws = draws.map(d => ({
      ...d,
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any),
      rawDateText: d.rawDateText || undefined
    }));

    // Exécuter toutes les analyses
    const [
      repetitions,
      sums,
      amplitudes,
      dispersion,
      decadeCoverage,
      consecutives,
      multiplesOf5,
      highNumbers,
      centerGravity,
      structures,
      coOccurrence,
      temporal
    ] = await Promise.all([
      Promise.resolve(analyzeRepetitions(parsedDraws)),
      Promise.resolve(analyzeSums(parsedDraws)),
      Promise.resolve(analyzeAmplitudes(parsedDraws)),
      Promise.resolve(analyzeDispersion(parsedDraws)),
      Promise.resolve(analyzeDecadeCoverage(parsedDraws)),
      Promise.resolve(analyzeConsecutives(parsedDraws)),
      Promise.resolve(analyzeMultiplesOf5(parsedDraws)),
      Promise.resolve(analyzeHighNumbers(parsedDraws)),
      Promise.resolve(analyzeCenterOfGravity(parsedDraws)),
      Promise.resolve(analyzeStructures(parsedDraws)),
      Promise.resolve(analyzeCoOccurrence(parsedDraws)),
      Promise.resolve(analyzeTemporalFrequencies(parsedDraws, 100)),
    ]);

    return NextResponse.json({
      repetitions,
      sums,
      amplitudes,
      dispersion,
      decadeCoverage,
      consecutives,
      multiplesOf5,
      highNumbers,
      centerGravity,
      structures,
      coOccurrence: {
        topPairs: coOccurrence.topPairs.slice(0, 20), // Limiter pour la performance
        total: coOccurrence.total
      },
      temporal: {
        windows: temporal.windows.slice(-10), // Dernières 10 fenêtres
        windowSize: temporal.windowSize,
        totalWindows: temporal.totalWindows
      },
      metadata: {
        totalDraws: parsedDraws.length,
        window
      }
    });

  } catch (error) {
    console.error('Error in advanced analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to compute advanced analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
