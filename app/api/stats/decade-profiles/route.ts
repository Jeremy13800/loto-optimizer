/**
 * API endpoint for decade distribution profiles analysis
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMostCommonDecadeProfiles } from '@/lib/stats/decades';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || 'all';
    const topN = parseInt(searchParams.get('topN') || '10');
    
    // Fetch draws based on window
    let draws;
    if (window === '200') {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: 'desc' },
        take: 200,
        select: { nums: true }
      });
    } else if (window === '1000') {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: 'desc' },
        take: 1000,
        select: { nums: true }
      });
    } else {
      draws = await prisma.draw.findMany({
        orderBy: { dateISO: 'desc' },
        select: { nums: true }
      });
    }
    
    // Parse nums (stored as JSON strings)
    const parsedDraws = draws.map(d => ({
      nums: Array.isArray(d.nums) ? d.nums : JSON.parse(d.nums as any)
    }));
    
    // Calculate most common decade profiles
    const profiles = getMostCommonDecadeProfiles(parsedDraws, topN);
    
    return NextResponse.json({
      profiles,
      totalDraws: parsedDraws.length,
      window
    });
    
  } catch (error) {
    console.error('Error calculating decade profiles:', error);
    return NextResponse.json(
      { error: 'Failed to calculate decade profiles' },
      { status: 500 }
    );
  }
}
