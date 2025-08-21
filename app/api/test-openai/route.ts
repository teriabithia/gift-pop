import { NextRequest, NextResponse } from 'next/server'
import { POPULAR_EBAY_SEARCH_PROMPT } from '@/lib/ebay-prompts'

export async function GET(request: NextRequest) {
  try {
    console.log('=== OpenAI API测试开始 ===')
    
    // 检查环境变量
    const envCheck = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `Set (${process.env.OPENAI_API_KEY?.slice(0, 8)}...)` : 'Not set',
      SKIP_OPENAI_API: process.env.SKIP_OPENAI_API,
      NODE_ENV: process.env.NODE_ENV
    }
    console.log('环境变量检查:', envCheck)

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        step: 'env_check',
        message: 'OpenAI API key not configured',
        envCheck
      })
    }

    // 检查DEV_MODE设置
    const { DEV_MODE } = await import('@/lib/openai')
    console.log('DEV_MODE设置:', {
      enabled: DEV_MODE.enabled,
      skipAPICall: DEV_MODE.skipAPICall
    })

    if (DEV_MODE.skipAPICall) {
      return NextResponse.json({
        success: false,
        step: 'dev_mode_skip',
        message: 'OpenAI API calls are disabled in development mode',
        devModeStatus: {
          enabled: DEV_MODE.enabled,
          skipAPICall: DEV_MODE.skipAPICall
        }
      })
    }

    // 尝试简单的OpenAI调用
    console.log('尝试OpenAI API调用...')
    
    try {
      const { openai, OPENAI_CONFIG } = await import('@/lib/openai')
      
      // 构建测试上下文
      const testContext = {
        target_audience: 'general_adult',
        budget: {
          min_price: 25,
          max_price: 100,
          currency: 'USD'
        },
        categories: {
          electronics: 0.25,
          home_garden: 0.20,
          beauty_personal_care: 0.15,
          books_media: 0.10,
          sports_outdoors: 0.10,
          toys_games: 0.10,
          other: 0.10
        },
        quality_filters: {
          min_rating: 4.0,
          min_reviews: 50,
          availability: 'in_stock'
        }
      }

      const testPrompt = POPULAR_EBAY_SEARCH_PROMPT(testContext)
      console.log('测试提示词长度:', testPrompt.length)

      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: '你是专业的礼物推荐顾问和eBay搜索策略师。只返回有效的JSON格式，不要markdown，不要解释，不要额外文本。'
          },
          {
            role: 'user',
            content: testPrompt
          }
        ],
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.max_tokens,
        top_p: OPENAI_CONFIG.top_p,
        response_format: { type: "json_object" },
      })

      const content = response.choices[0]?.message?.content
      console.log('OpenAI响应长度:', content?.length || 0)
      
      if (!content) {
        throw new Error('OpenAI返回空响应')
      }

      // 尝试解析JSON
      const parsed = JSON.parse(content)
      console.log('JSON解析成功')

      return NextResponse.json({
        success: true,
        step: 'completed',
        message: 'OpenAI API working correctly',
        envCheck,
        devModeStatus: {
          enabled: DEV_MODE.enabled,
          skipAPICall: DEV_MODE.skipAPICall
        },
        testResult: {
          model: OPENAI_CONFIG.model,
          responseLength: content.length,
          hasSearchPlan: !!parsed.search_plan,
          hasKeywords: !!parsed.search_plan?.primary_keywords,
          keywordCount: parsed.search_plan?.primary_keywords?.length || 0,
          sampleKeywords: parsed.search_plan?.primary_keywords?.slice(0, 3) || []
        }
      })

    } catch (openaiError: any) {
      console.error('OpenAI API调用失败:', openaiError)
      return NextResponse.json({
        success: false,
        step: 'openai_call_failed',
        message: 'OpenAI API call failed',
        error: openaiError.message,
        errorCode: openaiError.code,
        errorStatus: openaiError.status,
        envCheck
      })
    }

  } catch (error: any) {
    console.error('OpenAI测试失败:', error)
    return NextResponse.json({
      success: false,
      step: 'unknown_error',
      error: error.message
    }, { status: 500 })
  }
}
