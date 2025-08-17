import { NextRequest, NextResponse } from 'next/server'
import { recommendationService } from '@/lib/services/recommendation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const occasion = searchParams.get('occasion')

    if (!occasion) {
      return NextResponse.json(
        { error: 'Occasion parameter is required' },
        { status: 400 }
      )
    }

    const occasionGifts = await recommendationService.getOccasionGifts(occasion)

    return NextResponse.json({
      success: true,
      data: occasionGifts,
      count: occasionGifts.length,
      occasion: occasion,
      source: 'ai-powered',
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Occasion gifts API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get occasion gifts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET with occasion parameter.' },
    { status: 405 }
  )
}

