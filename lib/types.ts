export interface Draw {
  id: string;
  dateISO: string;
  dateLabel: string;
  nums: number[];
  chance: number;
  source: string;
  rawDateText?: string;
}

export interface ParsedDraw {
  dateISO: string;
  dateLabel: string;
  nums: number[];
  chance: number;
  rawDateText: string;
}

export interface SyncResult {
  count: number;
  inserted: number;
  updated: number;
  lastDate: string | null;
  errors: string[];
}

export interface DrawFilters {
  limit?: number;
  page?: number;
  from?: string;
  to?: string;
  num?: number;
  chance?: number;
  sort?: "asc" | "desc";
}

export interface PaginatedDraws {
  draws: Draw[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatsWindow {
  window: "all" | "1000" | "200" | "custom";
  from?: string;
  to?: string;
}

export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
}

export interface PairFrequency {
  pair: [number, number];
  count: number;
}

export interface TripletFrequency {
  triplet: [number, number, number];
  count: number;
}

export interface NumberStats {
  number: number;
  frequency: number;
  avgGap: number;
  stdDevGap: number;
  lastGap: number;
  isHot: boolean;
  isCold: boolean;
}

export interface Stats {
  totalDraws: number;
  numberFrequencies: NumberFrequency[];
  chanceFrequencies: NumberFrequency[];
  drawsWithHighNumbers: number;
  highNumberDistribution: { count: number; frequency: number }[];
  evenOddDistribution: { even: number; odd: number; count: number }[];
  lowHighDistribution: { low: number; high: number; count: number }[];
  sumDistribution: { sum: number; count: number }[];
  rangeDistribution: { range: number; count: number }[];
  currentGaps: { number: number; gap: number }[];
  topPairs: PairFrequency[];
  sumPercentiles: { p10: number; p90: number };
  // Advanced statistics
  topTriplets?: TripletFrequency[];
  decadeDistribution?: { decade: number; count: number; percentage: number }[];
  primeNumberStats?: { primeCount: number; frequency: number }[];
  digitEndingDistribution?: { digit: number; count: number }[];
  hotNumbers?: number[];
  coldNumbers?: number[];
  numberStatsAdvanced?: NumberStats[];
  consecutiveGapDistribution?: { gap: number; count: number }[];
  chanceCorrelation?: { chance: number; avgSum: number; avgRange: number }[];
}

export interface GenerateConstraints {
  window?: StatsWindow;
  count?: number;
  excludePreviousDraw?: boolean;
  excludePreviousChance?: boolean;
  evenOddRatio?: "1/4" | "2/3" | "3/2" | "4/1" | "5/0" | "0/5";
  lowHighRatio?: "1/4" | "2/3" | "3/2" | "4/1" | "5/0" | "0/5";
  maxPerDecade?: number;
  maxConsecutive?: number;
  minRange?: number;
  minHighNumbers?: number;
  maxMultiplesOf3?: number;
  minVeryHighNumbers?: number;
  maxVeryHighNumbers?: number;
  minDecadeSpread?: number;
  maxDecadeSpread?: number;
  avoidPopular?: number[];
  avoidChances?: number[];
  maxOverlap?: number;
  // Advanced constraints
  minPrimes?: number;
  maxPrimes?: number;
  minHotNumbers?: number;
  maxHotNumbers?: number;
  minColdNumbers?: number;
  maxColdNumbers?: number;
  minDigitEndings?: number;
  favorTriplets?: boolean;
  minConsecutiveGap?: number;
  maxConsecutiveGap?: number;
  targetSumMin?: number;
  targetSumMax?: number;

  // Advanced constraints (new)
  advanced?: import("./stats/advanced-types").AdvancedConstraints;
}

export interface GeneratedGrid {
  nums: number[];
  chance: number;
  score: number;
  metadata: {
    sum: number;
    range: number;
    evenCount: number;
    oddCount: number;
    lowCount: number;
    highCount: number;
    highNumbers: number[];
  };
  // Advanced scoring (new)
  explainableScore?: import("./stats/advanced-types").ExplainableScore;
  analysis?: import("./stats/advanced-types").GridAnalysis;
}

export interface GenerateResult {
  grids: GeneratedGrid[];
  constraints: GenerateConstraints;
  stats: {
    iterations: number;
    rejections: number;
    avgScore: number;
  };
  warnings: string[];
}
