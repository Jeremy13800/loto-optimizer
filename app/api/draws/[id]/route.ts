import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Draw } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const draw = await prisma.draw.findUnique({
      where: { id: params.id },
    })

    if (!draw) {
      return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
    }

    const allDraws = await prisma.draw.findMany({
      orderBy: { dateISO: 'desc' },
      select: { id: true },
    })

    const currentIndex = allDraws.findIndex(d => d.id === params.id)
    const previousId = currentIndex > 0 ? allDraws[currentIndex - 1].id : null
    const nextId = currentIndex < allDraws.length - 1 ? allDraws[currentIndex + 1].id : null

    const result: Draw & { previousId: string | null; nextId: string | null } = {
      id: draw.id,
      dateISO: draw.dateISO,
      dateLabel: draw.dateLabel,
      nums: JSON.parse(draw.nums) as number[],
      chance: draw.chance,
      source: draw.source,
      rawDateText: draw.rawDateText || undefined,
      previousId,
      nextId,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching draw:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draw', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
