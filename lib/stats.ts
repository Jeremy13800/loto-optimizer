import { Draw, Stats, NumberFrequency, PairFrequency } from './types'

export function calculateStats(draws: Draw[]): Stats {
  const totalDraws = draws.length

  const numberCounts = new Map<number, number>()
  const chanceCounts = new Map<number, number>()
  const pairCounts = new Map<string, number>()
  const sumCounts = new Map<number, number>()
  const rangeCounts = new Map<number, number>()
  const evenOddCounts = new Map<string, number>()
  const lowHighCounts = new Map<string, number>()
  const highNumberCounts = new Map<number, number>()
  let drawsWithHighNumbers = 0

  const lastSeen = new Map<number, number>()

  for (let i = 0; i < draws.length; i++) {
    const draw = draws[i]
    const { nums, chance } = draw

    chanceCounts.set(chance, (chanceCounts.get(chance) || 0) + 1)

    let evenCount = 0
    let oddCount = 0
    let lowCount = 0
    let highCount = 0
    let highNumsInDraw = 0

    for (const num of nums) {
      numberCounts.set(num, (numberCounts.get(num) || 0) + 1)
      lastSeen.set(num, i)

      if (num % 2 === 0) evenCount++
      else oddCount++

      if (num <= 24) lowCount++
      else highCount++

      if (num >= 31) highNumsInDraw++
    }

    if (highNumsInDraw > 0) drawsWithHighNumbers++
    highNumberCounts.set(highNumsInDraw, (highNumberCounts.get(highNumsInDraw) || 0) + 1)

    const eoKey = `${evenCount}/${oddCount}`
    evenOddCounts.set(eoKey, (evenOddCounts.get(eoKey) || 0) + 1)

    const lhKey = `${lowCount}/${highCount}`
    lowHighCounts.set(lhKey, (lowHighCounts.get(lhKey) || 0) + 1)

    const sum = nums.reduce((a, b) => a + b, 0)
    sumCounts.set(sum, (sumCounts.get(sum) || 0) + 1)

    const range = Math.max(...nums) - Math.min(...nums)
    rangeCounts.set(range, (rangeCounts.get(range) || 0) + 1)

    for (let j = 0; j < nums.length; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        const pair = [nums[j], nums[k]].sort((a, b) => a - b)
        const pairKey = `${pair[0]}-${pair[1]}`
        pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1)
      }
    }
  }

  const numberFrequencies: NumberFrequency[] = []
  for (let i = 1; i <= 49; i++) {
    const count = numberCounts.get(i) || 0
    numberFrequencies.push({
      number: i,
      count,
      percentage: totalDraws > 0 ? (count / totalDraws) * 100 : 0,
    })
  }

  const chanceFrequencies: NumberFrequency[] = []
  for (let i = 1; i <= 10; i++) {
    const count = chanceCounts.get(i) || 0
    chanceFrequencies.push({
      number: i,
      count,
      percentage: totalDraws > 0 ? (count / totalDraws) * 100 : 0,
    })
  }

  const highNumberDistribution = Array.from(highNumberCounts.entries())
    .map(([count, frequency]) => ({ count, frequency }))
    .sort((a, b) => a.count - b.count)

  const evenOddDistribution = Array.from(evenOddCounts.entries())
    .map(([key, count]) => {
      const [even, odd] = key.split('/').map(Number)
      return { even, odd, count }
    })
    .sort((a, b) => b.count - a.count)

  const lowHighDistribution = Array.from(lowHighCounts.entries())
    .map(([key, count]) => {
      const [low, high] = key.split('/').map(Number)
      return { low, high, count }
    })
    .sort((a, b) => b.count - a.count)

  const sumDistribution = Array.from(sumCounts.entries())
    .map(([sum, count]) => ({ sum, count }))
    .sort((a, b) => a.sum - b.sum)

  const rangeDistribution = Array.from(rangeCounts.entries())
    .map(([range, count]) => ({ range, count }))
    .sort((a, b) => a.range - b.range)

  const currentGaps: { number: number; gap: number }[] = []
  for (let i = 1; i <= 49; i++) {
    const lastSeenIndex = lastSeen.get(i)
    const gap = lastSeenIndex !== undefined ? draws.length - 1 - lastSeenIndex : draws.length
    currentGaps.push({ number: i, gap })
  }
  currentGaps.sort((a, b) => b.gap - a.gap)

  const topPairs: PairFrequency[] = Array.from(pairCounts.entries())
    .map(([key, count]) => {
      const [n1, n2] = key.split('-').map(Number)
      return { pair: [n1, n2] as [number, number], count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  const sums = Array.from(sumCounts.keys()).sort((a, b) => a - b)
  const p10Index = Math.floor(sums.length * 0.1)
  const p90Index = Math.floor(sums.length * 0.9)
  const sumPercentiles = {
    p10: sums[p10Index] || 0,
    p90: sums[p90Index] || 0,
  }

  return {
    totalDraws,
    numberFrequencies,
    chanceFrequencies,
    drawsWithHighNumbers,
    highNumberDistribution,
    evenOddDistribution,
    lowHighDistribution,
    sumDistribution,
    rangeDistribution,
    currentGaps,
    topPairs,
    sumPercentiles,
  }
}
