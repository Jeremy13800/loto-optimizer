import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Draw, PaginatedDraws } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const from = searchParams.get('from') || undefined
    const to = searchParams.get('to') || undefined
    const num = searchParams.get('num') ? parseInt(searchParams.get('num')!) : undefined
    const chance = searchParams.get('chance') ? parseInt(searchParams.get('chance')!) : undefined
    const sort = (searchParams.get('sort') || 'desc') as 'asc' | 'desc'

    const where: any = {}

    if (from || to) {
      where.dateISO = {}
      if (from) where.dateISO.gte = from
      if (to) where.dateISO.lte = to
    }

    if (chance !== undefined) {
      where.chance = chance
    }

    let allDraws = await prisma.draw.findMany({
      where,
      orderBy: { dateISO: sort },
    })

    if (num !== undefined) {
      allDraws = allDraws.filter(draw => {
        const nums = JSON.parse(draw.nums) as number[]
        return nums.includes(num)
      })
    }

    const total = allDraws.length
    const skip = (page - 1) * limit
    const paginatedDraws = allDraws.slice(skip, skip + limit)

    const draws: Draw[] = paginatedDraws.map(draw => ({
      id: draw.id,
      dateISO: draw.dateISO,
      dateLabel: draw.dateLabel,
      nums: JSON.parse(draw.nums) as number[],
      chance: draw.chance,
      source: draw.source,
      rawDateText: draw.rawDateText || undefined,
    }))

    const result: PaginatedDraws = {
      draws,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching draws:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draws', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
