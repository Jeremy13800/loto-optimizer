import * as cheerio from 'cheerio'
import { ParsedDraw } from './types'

const FRENCH_MONTHS: Record<string, string> = {
  'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
  'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
  'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
}

const FRENCH_DAYS: Record<string, string> = {
  'lundi': 'lundi', 'mardi': 'mardi', 'mercredi': 'mercredi',
  'jeudi': 'jeudi', 'vendredi': 'vendredi', 'samedi': 'samedi', 'dimanche': 'dimanche'
}

export async function fetchDrawsHTML(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout after 30s')
    }
    throw error
  }
}

function parseDate(dateText: string): { dateISO: string; dateLabel: string } | null {
  const cleaned = dateText.trim().toLowerCase()
  
  const patterns = [
    /(\w+)\s+(\d{1,2})\s+(\w+)\s+(\d{4})/,
    /(\d{1,2})\s+(\w+)\s+(\d{4})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  ]

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      if (match[0].includes('/')) {
        const [_, day, month, year] = match
        const dateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        return { dateISO, dateLabel: dateText.trim() }
      } else if (match.length === 5) {
        const [_, dayName, day, monthName, year] = match
        const month = FRENCH_MONTHS[monthName]
        if (month) {
          const dateISO = `${year}-${month}-${day.padStart(2, '0')}`
          return { dateISO, dateLabel: dateText.trim() }
        }
      } else if (match.length === 4) {
        const [_, day, monthName, year] = match
        const month = FRENCH_MONTHS[monthName]
        if (month) {
          const dateISO = `${year}-${month}-${day.padStart(2, '0')}`
          return { dateISO, dateLabel: dateText.trim() }
        }
      }
    }
  }

  return null
}

function extractNumbers(text: string): number[] {
  const numbers: number[] = []
  const matches = text.match(/\b\d{1,2}\b/g)
  
  if (matches) {
    for (const match of matches) {
      const num = parseInt(match, 10)
      if (num >= 1 && num <= 49 && !numbers.includes(num)) {
        numbers.push(num)
      }
    }
  }
  
  return numbers
}

export function parseDrawsFromHTML(html: string): ParsedDraw[] {
  const $ = cheerio.load(html)
  const draws: ParsedDraw[] = []
  const errors: string[] = []

  $('script, style, noscript').remove()

  const text = $('body').text()
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  let currentDate: { dateISO: string; dateLabel: string } | null = null
  let currentNums: number[] = []
  let currentChance: number | null = null
  let currentRawDate = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const dateMatch = parseDate(line)
    if (dateMatch) {
      if (currentDate && currentNums.length === 5 && currentChance !== null) {
        draws.push({
          dateISO: currentDate.dateISO,
          dateLabel: currentDate.dateLabel,
          nums: currentNums.sort((a, b) => a - b),
          chance: currentChance,
          rawDateText: currentRawDate,
        })
      }

      currentDate = dateMatch
      currentRawDate = line
      currentNums = []
      currentChance = null
      continue
    }

    if (line.toLowerCase().includes('tirage') && line.includes(':')) {
      const nums = extractNumbers(line)
      if (nums.length >= 5) {
        currentNums = nums.slice(0, 5)
      }
      continue
    }

    if (line.toLowerCase().includes('chance') && line.includes(':')) {
      const nums = extractNumbers(line)
      if (nums.length > 0) {
        const chance = nums[0]
        if (chance >= 1 && chance <= 10) {
          currentChance = chance
        }
      }
      continue
    }

    const nums = extractNumbers(line)
    if (nums.length >= 5 && currentNums.length === 0) {
      currentNums = nums.slice(0, 5)
    } else if (nums.length === 1 && nums[0] >= 1 && nums[0] <= 10 && currentChance === null) {
      currentChance = nums[0]
    }
  }

  if (currentDate && currentNums.length === 5 && currentChance !== null) {
    draws.push({
      dateISO: currentDate.dateISO,
      dateLabel: currentDate.dateLabel,
      nums: currentNums.sort((a, b) => a - b),
      chance: currentChance,
      rawDateText: currentRawDate,
    })
  }

  return draws
}

export function validateDraw(draw: ParsedDraw): boolean {
  if (!draw.dateISO || !draw.dateLabel) return false
  
  if (!Array.isArray(draw.nums) || draw.nums.length !== 5) return false
  
  const uniqueNums = new Set(draw.nums)
  if (uniqueNums.size !== 5) return false
  
  for (const num of draw.nums) {
    if (!Number.isInteger(num) || num < 1 || num > 49) return false
  }
  
  if (!Number.isInteger(draw.chance) || draw.chance < 1 || draw.chance > 10) return false
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(draw.dateISO)) return false
  
  return true
}

export function generateDrawId(draw: ParsedDraw): string {
  const sortedNums = [...draw.nums].sort((a, b) => a - b).join('-')
  return `${draw.dateISO}_${sortedNums}_${draw.chance}`
}
