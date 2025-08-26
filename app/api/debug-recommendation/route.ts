import { NextRequest, NextResponse } from 'next/server'
import { recommendationService } from '@/lib/services/recommendation'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 调试推荐服务...')
    
    const body = await request.json()
    const { mode = 'popular', limit = 10 } = body
    
    console.log(`测试模式: ${mode}, 限制: ${limit}`)
    
    let result: any[] = []
    
    try {
      if (mode === 'popular') {
        console.log('调用 getPopularGifts...')
        result = await recommendationService.getPopularGifts({ limit })
        console.log(`getPopularGifts 返回 ${result.length} 个结果`)
      } else if (mode === 'occasion') {
        console.log('调用 getOccasionGifts...')
        result = await recommendationService.getOccasionGifts({ 
          occasion: 'birthday', 
          limit 
        })
        console.log(`getOccasionGifts 返回 ${result.length} 个结果`)
      } else {
        console.log('调用 getPersonalizedRecommendations...')
        result = await recommendationService.getPersonalizedRecommendations({
          answers: {
            relationship: 'Sister',
            gender: 'Female',
            age_range: '25-34',
            interests: ['Fashion'],
            budget_range: ['$25 - $100'],
            special_preferences: 'Eco-friendly'
          },
          limit
        })
        console.log(`getPersonalizedRecommendations 返回 ${result.length} 个结果`)
      }
    } catch (error) {
      console.error('推荐服务调用失败:', error)
      return NextResponse.json({
        error: '推荐服务调用失败',
        details: error instanceof Error ? error.message : '未知错误',
        stack: error instanceof Error ? error.stack : undefined
      }, { status: 500 })
    }
    
    // 检查结果
    const resultInfo = {
      count: result.length,
      hasData: result.length > 0,
      firstItem: result[0] || null,
      allIds: result.map(item => item.id),
      allNames: result.map(item => item.name),
      allPrices: result.map(item => item.price)
    }
    
    console.log('结果信息:', resultInfo)
    
    return NextResponse.json({
      success: true,
      mode,
      limit,
      result: resultInfo,
      rawData: result
    })
    
  } catch (error) {
    console.error('调试API错误:', error)
    return NextResponse.json({
      error: '调试API错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

