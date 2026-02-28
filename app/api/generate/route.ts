import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Draw, GenerateConstraints } from '@/lib/types'
import { generateGrids } from '@/lib/generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateConstraints

    const window = body.window?.window || 'all'
    const from = body.window?.from
    const to = body.window?.to

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

    if (draws.length === 0) {
      return NextResponse.json(
        { error: 'No draws available. Please sync data first.' },
        { status: 400 }
      )
    }

    const result = await generateGrids(draws, body)

    return NextResponse.json({
      ...result,
      constraints: body,
    })
  } catch (error) {
    console.error('Error generating grids:', error)
    return NextResponse.json(
      { error: 'Failed to generate grids', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
