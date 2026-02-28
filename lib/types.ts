export interface Draw {
  id: string
  dateISO: string
  dateLabel: string
  nums: number[]
  chance: number
  source: string
  rawDateText?: string
}

export interface ParsedDraw {
  dateISO: string
  dateLabel: string
  nums: number[]
  chance: number
  rawDateText: string
}

export interface SyncResult {
  count: number
  inserted: number
  updated: number
  lastDate: string | null
  errors: string[]
}

export interface DrawFilters {
  limit?: number
  page?: number
  from?: string
  to?: string
  num?: number
  chance?: number
  sort?: 'asc' | 'desc'
}

export interface PaginatedDraws {
  draws: Draw[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface StatsWindow {
  window: 'all' | '1000' | '200' | 'custom'
  from?: string
  to?: string
}

export interface NumberFrequency {
  number: number
  count: number
  percentage: number
}

export interface PairFrequency {
  pair: [number, number]
  count: number
}

export interface Stats {
  totalDraws: number
  numberFrequencies: NumberFrequency[]
  chanceFrequencies: NumberFrequency[]
  drawsWithHighNumbers: number
  highNumberDistribution: { count: number; frequency: number }[]
  evenOddDistribution: { even: number; odd: number; count: number }[]
  lowHighDistribution: { low: number; high: number; count: number }[]
  sumDistribution: { sum: number; count: number }[]
  rangeDistribution: { range: number; count: number }[]
  currentGaps: { number: number; gap: number }[]
  topPairs: PairFrequency[]
  sumPercentiles: { p10: number; p90: number }
}

export interface GenerateConstraints {
  window?: StatsWindow
  count?: number
  excludePreviousDraw?: boolean
  excludePreviousChance?: boolean
  evenOddRatio?: '2/3' | '3/2'
  lowHighRatio?: '2/3' | '3/2'
  maxPerDecade?: number
  maxConsecutive?: number
  minRange?: number
  minHighNumbers?: number
  maxMultiplesOf5?: number
  avoidPopular?: number[]
  avoidChances?: number[]
  maxOverlap?: number
}

export interface GeneratedGrid {
  nums: number[]
  chance: number
  score: number
  metadata: {
    sum: number
    range: number
    evenCount: number
    oddCount: number
    lowCount: number
    highCount: number
    highNumbers: number[]
  }
}

export interface GenerateResult {
  grids: GeneratedGrid[]
  constraints: GenerateConstraints
  stats: {
    iterations: number
    rejections: number
    avgScore: number
  }
  warnings: string[]
}
