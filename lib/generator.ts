import { Draw, GenerateConstraints, GeneratedGrid, Stats } from './types'
import { calculateStats } from './stats'

interface GridCandidate {
  nums: number[]
  chance: number
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function hasArithmeticProgression(nums: number[]): boolean {
  const sorted = [...nums].sort((a, b) => a - b)
  for (let i = 0; i < sorted.length - 2; i++) {
    for (let j = i + 1; j < sorted.length - 1; j++) {
      const diff = sorted[j] - sorted[i]
      if (sorted.includes(sorted[j] + diff)) {
        return true
      }
    }
  }
  return false
}

function countConsecutivePairs(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b)
  let count = 0
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) count++
  }
  return count
}

function hasConsecutiveTriplet(nums: number[]): boolean {
  const sorted = [...nums].sort((a, b) => a - b)
  for (let i = 0; i < sorted.length - 2; i++) {
    if (sorted[i + 1] - sorted[i] === 1 && sorted[i + 2] - sorted[i + 1] === 1) {
      return true
    }
  }
  return false
}

function countPerDecade(nums: number[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const num of nums) {
    const decade = Math.floor((num - 1) / 10)
    counts.set(decade, (counts.get(decade) || 0) + 1)
  }
  return counts
}

function checkHardConstraints(
  candidate: GridCandidate,
  constraints: GenerateConstraints,
  previousDraw: Draw | null
): { valid: boolean; reason?: string } {
  const { nums, chance } = candidate

  if (new Set(nums).size !== 5) {
    return { valid: false, reason: 'Duplicate numbers' }
  }

  for (const num of nums) {
    if (num < 1 || num > 49) {
      return { valid: false, reason: 'Number out of range' }
    }
  }

  if (chance < 1 || chance > 10) {
    return { valid: false, reason: 'Chance out of range' }
  }

  if (constraints.excludePreviousDraw && previousDraw) {
    for (const num of nums) {
      if (previousDraw.nums.includes(num)) {
        return { valid: false, reason: 'Contains number from previous draw' }
      }
    }
  }

  if (constraints.excludePreviousChance && previousDraw && chance === previousDraw.chance) {
    return { valid: false, reason: 'Same chance as previous draw' }
  }

  const evenCount = nums.filter(n => n % 2 === 0).length
  const oddCount = 5 - evenCount

  if (constraints.evenOddRatio === '2/3' && !(evenCount === 2 && oddCount === 3)) {
    return { valid: false, reason: 'Even/odd ratio not 2/3' }
  }
  if (constraints.evenOddRatio === '3/2' && !(evenCount === 3 && oddCount === 2)) {
    return { valid: false, reason: 'Even/odd ratio not 3/2' }
  }

  const lowCount = nums.filter(n => n <= 24).length
  const highCount = 5 - lowCount

  if (constraints.lowHighRatio === '2/3' && !(lowCount === 2 && highCount === 3)) {
    return { valid: false, reason: 'Low/high ratio not 2/3' }
  }
  if (constraints.lowHighRatio === '3/2' && !(lowCount === 3 && highCount === 2)) {
    return { valid: false, reason: 'Low/high ratio not 3/2' }
  }

  const maxPerDecade = constraints.maxPerDecade ?? 2
  const decadeCounts = countPerDecade(nums)
  for (const count of decadeCounts.values()) {
    if (count > maxPerDecade) {
      return { valid: false, reason: `Too many numbers in one decade (max ${maxPerDecade})` }
    }
  }

  const maxConsecutive = constraints.maxConsecutive ?? 1
  const consecutiveCount = countConsecutivePairs(nums)
  if (consecutiveCount > maxConsecutive) {
    return { valid: false, reason: `Too many consecutive pairs (max ${maxConsecutive})` }
  }

  if (hasConsecutiveTriplet(nums)) {
    return { valid: false, reason: 'Contains consecutive triplet' }
  }

  if (hasArithmeticProgression(nums)) {
    return { valid: false, reason: 'Contains arithmetic progression' }
  }

  return { valid: true }
}

function calculateScore(
  candidate: GridCandidate,
  constraints: GenerateConstraints,
  stats: Stats
): number {
  let score = 100
  const { nums, chance } = candidate

  const sum = nums.reduce((a, b) => a + b, 0)
  const range = Math.max(...nums) - Math.min(...nums)
  const highNumbers = nums.filter(n => n >= 31)
  const multiplesOf5 = nums.filter(n => n % 5 === 0)

  const targetSum = (stats.sumPercentiles.p10 + stats.sumPercentiles.p90) / 2
  const sumDiff = Math.abs(sum - targetSum)
  score -= sumDiff * 0.5

  const minRange = constraints.minRange ?? 25
  if (range >= minRange) {
    score += 10
  } else {
    score -= (minRange - range) * 2
  }

  const minHighNumbers = constraints.minHighNumbers ?? 2
  if (highNumbers.length >= minHighNumbers) {
    score += 5
  } else {
    score -= (minHighNumbers - highNumbers.length) * 5
  }

  const maxMultiplesOf5 = constraints.maxMultiplesOf5 ?? 1
  if (multiplesOf5.length <= maxMultiplesOf5) {
    score += 5
  } else {
    score -= (multiplesOf5.length - maxMultiplesOf5) * 10
  }

  if (constraints.avoidPopular && constraints.avoidPopular.length > 0) {
    const popularCount = nums.filter(n => constraints.avoidPopular!.includes(n)).length
    score -= popularCount * 8
  }

  const avgChanceFreq = stats.totalDraws / 10
  const chanceFreq = stats.chanceFrequencies.find(cf => cf.number === chance)?.count || 0
  const chanceDiff = Math.abs(chanceFreq - avgChanceFreq)
  score -= chanceDiff * 0.3

  if (constraints.avoidChances && constraints.avoidChances.includes(chance)) {
    score -= 15
  }

  return Math.max(0, score)
}

function generateCandidate(
  constraints: GenerateConstraints,
  stats: Stats,
  previousDraw: Draw | null,
  existingGrids: GridCandidate[]
): GridCandidate | null {
  const maxAttempts = 1000
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const availableNums = Array.from({ length: 49 }, (_, i) => i + 1)
    
    if (constraints.excludePreviousDraw && previousDraw) {
      for (const num of previousDraw.nums) {
        const index = availableNums.indexOf(num)
        if (index > -1) availableNums.splice(index, 1)
      }
    }

    const shuffled = shuffle(availableNums)
    const nums = shuffled.slice(0, 5).sort((a, b) => a - b)

    let availableChances = Array.from({ length: 10 }, (_, i) => i + 1)
    if (constraints.excludePreviousChance && previousDraw) {
      availableChances = availableChances.filter(c => c !== previousDraw.chance)
    }
    if (constraints.avoidChances) {
      const nonAvoided = availableChances.filter(c => !constraints.avoidChances!.includes(c))
      if (nonAvoided.length > 0) availableChances = nonAvoided
    }

    const chance = availableChances[Math.floor(Math.random() * availableChances.length)]

    const candidate: GridCandidate = { nums, chance }

    const hardCheck = checkHardConstraints(candidate, constraints, previousDraw)
    if (!hardCheck.valid) continue

    const maxOverlap = constraints.maxOverlap ?? 1
    let hasHighOverlap = false
    for (const existing of existingGrids) {
      const overlap = nums.filter(n => existing.nums.includes(n)).length
      if (overlap > maxOverlap) {
        hasHighOverlap = true
        break
      }
    }
    if (hasHighOverlap) continue

    const isDuplicate = existingGrids.some(
      g => JSON.stringify(g.nums) === JSON.stringify(nums) && g.chance === chance
    )
    if (isDuplicate) continue

    return candidate
  }

  return null
}

export async function generateGrids(
  draws: Draw[],
  constraints: GenerateConstraints
): Promise<{
  grids: GeneratedGrid[]
  stats: { iterations: number; rejections: number; avgScore: number }
  warnings: string[]
}> {
  const warnings: string[] = []
  const count = constraints.count ?? 5
  const stats = calculateStats(draws)
  
  const previousDraw = draws.length > 0 ? draws[0] : null

  const candidates: GridCandidate[] = []
  let iterations = 0
  let rejections = 0
  const maxIterations = count * 2000

  while (candidates.length < count && iterations < maxIterations) {
    iterations++
    
    const candidate = generateCandidate(constraints, stats, previousDraw, candidates)
    
    if (candidate) {
      candidates.push(candidate)
    } else {
      rejections++
    }

    if (iterations % 500 === 0 && candidates.length === 0) {
      warnings.push(`Difficulty generating grids after ${iterations} iterations. Constraints may be too strict.`)
    }
  }

  if (candidates.length < count) {
    warnings.push(`Only generated ${candidates.length} grids out of ${count} requested. Consider relaxing constraints.`)
  }

  const grids: GeneratedGrid[] = candidates.map(candidate => {
    const score = calculateScore(candidate, constraints, stats)
    const sum = candidate.nums.reduce((a, b) => a + b, 0)
    const range = Math.max(...candidate.nums) - Math.min(...candidate.nums)
    const evenCount = candidate.nums.filter(n => n % 2 === 0).length
    const oddCount = 5 - evenCount
    const lowCount = candidate.nums.filter(n => n <= 24).length
    const highCount = 5 - lowCount
    const highNumbers = candidate.nums.filter(n => n >= 31)

    return {
      nums: candidate.nums,
      chance: candidate.chance,
      score,
      metadata: {
        sum,
        range,
        evenCount,
        oddCount,
        lowCount,
        highCount,
        highNumbers,
      },
    }
  })

  grids.sort((a, b) => b.score - a.score)

  const avgScore = grids.length > 0 
    ? grids.reduce((sum, g) => sum + g.score, 0) / grids.length 
    : 0

  return {
    grids,
    stats: { iterations, rejections, avgScore },
    warnings,
  }
}
