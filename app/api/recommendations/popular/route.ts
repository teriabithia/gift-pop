import { NextRequest, NextResponse } from 'next/server'
import { recommendationService } from '@/lib/services/recommendation'

export async function GET(request: NextRequest) {
  try {
    const popularGifts = await recommendationService.getPopularGifts()

    return NextResponse.json({
      success: true,
      data: popularGifts,
      count: popularGifts.length,
      source: 'ai-powered',
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Popular gifts API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get popular gifts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch popular gifts.' },
    { status: 405 }
  )
}

