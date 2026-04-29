import {
  GridPreset,
  DispersionProfile,
  DecadeProfile,
  RecencyMode,
} from "./stats/advanced-types";

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
  // Advanced scoring
  explainableScore?: import("./stats/advanced-types").ExplainableScore;
  analysis?: import("./stats/advanced-types").GridAnalysis;
  // Comprehensive scoring
  comprehensiveScore?: ReturnType<
    typeof import("./stats/scoring/comprehensive-scoring").scoreGrid
  >;
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

// Analysis types
export interface FrequencyData {
  number: number;
  count: number;
  percentage?: number;
}

export interface DistributionData {
  even?: number;
  odd?: number;
  low?: number;
  high?: number;
  count: number;
}

export interface PredictionHeatmap {
  probabilities?: ProbabilityData[];
}

export interface ProbabilityData {
  num: number;
  probability: number;
}

export interface ExtremeGaps {
  dueNumbers?: DueNumber[];
}

export interface DueNumber {
  num: number;
  ratio: number;
  currentGap: number;
}

export interface GenerationStats {
  totalGenerated: number;
  averageScore: number;
  bestScore: number;
  iterations: number;
  rejections: number;
}

// Generator state interface for consolidating all constraints
export interface GeneratorState {
  // Basic constraints
  count: number;
  window: "all" | "1000" | "200";
  excludePrevious: boolean;
  excludePreviousChance: boolean;
  evenOddRatio: "1/4" | "2/3" | "3/2" | "4/1" | "5/0" | "0/5" | "";
  lowHighRatio: "1/4" | "2/3" | "3/2" | "4/1" | "5/0" | "0/5" | "";
  maxPerDecade: number;
  minRange: number;
  minHighNumbers: number;
  maxMultiplesOf3: number;
  avoidPopular: string;
  avoidChances: string;
  maxOverlap: number;

  // Advanced parameters
  minPrimes: number;
  maxPrimes: number;
  minDecadeSpread: number;
  maxDecadeSpread: number;
  minVeryHighNumbers: number;
  maxVeryHighNumbers: number;
  minHotNumbers: number;
  maxHotNumbers: number;
  minColdNumbers: number;
  maxColdNumbers: number;
  minDigitEndings: number;
  favorTriplets: boolean;
  minConsecutiveGap: number;
  maxConsecutiveGap: number;
  targetSumMin: number;
  targetSumMax: number;
  showAdvanced: boolean;

  // New advanced parameters
  selectedPreset: GridPreset;
  centerOfGravityMin: number;
  centerOfGravityMax: number;
  minRepetitions: number;
  maxRepetitions: number;
  favorExactlyOne: boolean;
  dispersionProfile: DispersionProfile;
  avgGapMin: number;
  avgGapMax: number;
  decadeProfile: DecadeProfile;
  decadeBonus: number;
  antiHumanBias: boolean;
  penalizeSequences: boolean;
  penalizeProgressions: boolean;
  penalizeBirthday: boolean;
  penalizeMultiplesOf5: boolean;
  penalizeSameEndings: boolean;
  penaltyWeight: number;
  enableFrequentPairs: boolean;
  pairBonusWeight: number;
  maxPairsPerGrid: number;
  enableModular: boolean;
  recencyMode: RecencyMode;
  activeTab:
    | "structure"
    | "dispersion"
    | "distribution"
    | "anti-bias"
    | "patterns"
    | "experimental";
  useUltraAdvanced: boolean;
  applyConstraintsWithUltra: boolean;
}

// Default generator state
export const getDefaultGeneratorState = (): GeneratorState => ({
  count: 5,
  window: "all",
  excludePrevious: true,
  excludePreviousChance: false,
  evenOddRatio: "",
  lowHighRatio: "",
  maxPerDecade: 2,
  minRange: 25,
  minHighNumbers: 2,
  maxMultiplesOf3: 2,
  avoidPopular: "",
  avoidChances: "",
  maxOverlap: 1,
  minPrimes: 1,
  maxPrimes: 2,
  minDecadeSpread: 3,
  maxDecadeSpread: 4,
  minVeryHighNumbers: 0,
  maxVeryHighNumbers: 2,
  minHotNumbers: 1,
  maxHotNumbers: 2,
  minColdNumbers: 0,
  maxColdNumbers: 2,
  minDigitEndings: 4,
  favorTriplets: true,
  minConsecutiveGap: 1,
  maxConsecutiveGap: 15,
  targetSumMin: 0,
  targetSumMax: 0,
  showAdvanced: false,
  selectedPreset: "custom",
  centerOfGravityMin: 22,
  centerOfGravityMax: 28,
  minRepetitions: 0,
  maxRepetitions: 1,
  favorExactlyOne: false,
  dispersionProfile: "balanced",
  avgGapMin: 8,
  avgGapMax: 14,
  decadeProfile: "free",
  decadeBonus: 5,
  antiHumanBias: false,
  penalizeSequences: true,
  penalizeProgressions: true,
  penalizeBirthday: true,
  penalizeMultiplesOf5: true,
  penalizeSameEndings: true,
  penaltyWeight: 1.0,
  enableFrequentPairs: true,
  pairBonusWeight: 3,
  maxPairsPerGrid: 2,
  enableModular: false,
  recencyMode: "light",
  activeTab: "structure",
  useUltraAdvanced: false,
  applyConstraintsWithUltra: false,
});
