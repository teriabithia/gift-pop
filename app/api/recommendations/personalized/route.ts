import { NextRequest, NextResponse } from 'next/server'
import { recommendationService } from '@/lib/services/recommendation'
import { UserPreferences } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const preferences: UserPreferences = body

    // 验证必要字段
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences data' },
        { status: 400 }
      )
    }

    const recommendations = await recommendationService.getPersonalizedRecommendations(preferences)

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      source: 'ai-powered'
    })

  } catch (error) {
    console.error('Personalized recommendations API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get personalized recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit preferences.' },
    { status: 405 }
  )
}

