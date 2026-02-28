import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Draw } from '@/lib/types'
import { calculateStats } from '@/lib/stats'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const window = searchParams.get('window') || 'all'
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let dbDraws

    if (window === 'custom' && from && to) {
      dbDraws = await prisma.draw.findMany({
        where: {
          dateISO: {
            gte: from,
            lte: to,
          },
        },
        orderBy: { dateISO: 'desc' },
      })
    } else if (window === '1000') {
      dbDraws = await prisma.draw.findMany({
        orderBy: { dateISO: 'desc' },
        take: 1000,
      })
    } else if (window === '200') {
      dbDraws = await prisma.draw.findMany({
        orderBy: { dateISO: 'desc' },
        take: 200,
      })
    } else {
      dbDraws = await prisma.draw.findMany({
        orderBy: { dateISO: 'desc' },
      })
    }

    const draws: Draw[] = dbDraws.map(draw => ({
      id: draw.id,
      dateISO: draw.dateISO,
      dateLabel: draw.dateLabel,
      nums: JSON.parse(draw.nums) as number[],
      chance: draw.chance,
      source: draw.source,
      rawDateText: draw.rawDateText || undefined,
    }))

    const stats = calculateStats(draws)

    return NextResponse.json({
      window,
      from: from || null,
      to: to || null,
      stats,
    })
  } catch (error) {
    console.error('Error calculating stats:', error)
    return NextResponse.json(
      { error: 'Failed to calculate stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
