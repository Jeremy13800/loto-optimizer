/**
 * Analyse temporelle de la fréquence des numéros
 */

import { Draw } from '@/lib/types';

export interface TemporalWindow {
  windowIndex: number;
  startDate: string;
  endDate: string;
  frequencies: Record<number, number>; // numéro -> fréquence
}

export interface TemporalAnalysisResult {
  windows: TemporalWindow[];
  windowSize: number;
  totalWindows: number;
}

/**
 * Analyse la fréquence des numéros par fenêtres temporelles
 */
export function analyzeTemporalFrequencies(
  draws: Draw[],
  windowSize: number = 100
): TemporalAnalysisResult {
  const windows: TemporalWindow[] = [];
  const sortedDraws = [...draws].sort((a, b) => 
    new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  );

  for (let i = 0; i < sortedDraws.length; i += windowSize) {
    const windowDraws = sortedDraws.slice(i, i + windowSize);
    if (windowDraws.length === 0) break;

    const frequencies: Record<number, number> = {};
    
    // Initialiser toutes les fréquences à 0
    for (let n = 1; n <= 49; n++) {
      frequencies[n] = 0;
    }

    // Compter les fréquences dans cette fenêtre
    windowDraws.forEach(draw => {
      const nums = Array.isArray(draw.nums) ? draw.nums : JSON.parse(draw.nums as any);
      nums.forEach((n: number) => {
        frequencies[n]++;
      });
    });

    windows.push({
      windowIndex: Math.floor(i / windowSize),
      startDate: windowDraws[0].dateISO,
      endDate: windowDraws[windowDraws.length - 1].dateISO,
      frequencies,
    });
  }

  return {
    windows,
    windowSize,
    totalWindows: windows.length,
  };
}

/**
 * Obtient les numéros les plus chauds dans la fenêtre la plus récente
 */
export function getHotNumbers(
  temporalAnalysis: TemporalAnalysisResult,
  topN: number = 10
): number[] {
  if (temporalAnalysis.windows.length === 0) return [];

  const latestWindow = temporalAnalysis.windows[temporalAnalysis.windows.length - 1];
  
  return Object.entries(latestWindow.frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([num]) => parseInt(num));
}
