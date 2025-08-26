import { NextRequest, NextResponse } from 'next/server'
import { 
  recommendationService,
  PersonalizedInput,
  PopularInput,
  OccasionInput 
} from '@/lib/services/recommendation'

/**
 * 增强推荐系统API路由 - 核心API端点
 * 
 * 路径: /api/recommendations/enhanced
 * 
 * 实现完整的三模式混合推荐策略：
 * 用户输入/热门默认条件/场合默认条件 → OpenAI(生成搜索关键词) → eBay API(搜索商品) → OpenAI(分析筛选) → 返回结果(真实链接)
 * 
 * 支持的推荐模式：
 * 1. personalized - 个性化推荐（基于用户偏好）
 * 2. popular - 热门推荐（当前流行商品）
 * 3. occasion - 场合推荐（特定场合礼物）
 */

/**
 * POST /api/recommendations/enhanced
 * 
 * 主要推荐API处理函数
 * 根据不同模式调用相应的推荐服务
 * 
 * 请求体格式：
 * {
 *   "mode": "personalized" | "popular" | "occasion",
 *   "answers": { ... },        // 个性化模式必需
 *   "occasion": "birthday",    // 场合模式必需
 *   "limit": 20,              // 可选，返回结果数量
 *   "budget_range": ["$25 - $100"],  // 可选，预算范围
 *   "region": "US"            // 可选，地区
 * }
 * 
 * 响应格式：
 * {
 *   "success": true,
 *   "mode": "personalized",
 *   "data": Gift[],           // 推荐的礼物列表
 *   "count": 20,              // 礼物数量
 *   "source": "ai-ebay-hybrid", // 数据来源标识
 *   "timestamp": "2024-01-01T00:00:00.000Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体，提取模式和其他参数
    const body = await request.json()
    const { mode, type, ...input } = body

    // 支持 'type' 和 'mode' 参数（向后兼容）
    const requestMode = mode || type

    // 验证必需的mode参数
    if (!requestMode) {
      return NextResponse.json(
        { 
          error: 'Mode is required. Use: personalized, popular, or occasion',
          received: { mode, type, body },
          expected: 'mode: "personalized" | "popular" | "occasion"'
        },
        { status: 400 }
      )
    }

    // 验证mode值是否有效
    const validModes = ['personalized', 'popular', 'occasion']
    if (!validModes.includes(requestMode)) {
      return NextResponse.json(
        { 
          error: `Invalid mode: ${requestMode}`,
          validModes,
          received: requestMode
        },
        { status: 400 }
      )
    }

    let recommendations  // 推荐结果
    let source = 'ai-ebay-hybrid'  // 数据来源标识

    // 根据不同模式调用相应的推荐服务
    switch (requestMode) {
      case 'personalized':
        // 个性化推荐模式
        // 验证个性化推荐的必需参数
        if (!input.answers || !input.answers.relationship) {
          return NextResponse.json(
            { 
              error: 'Personalized mode requires answers with relationship',
              received: input,
              required: 'answers.relationship'
            },
            { status: 400 }
          )
        }
        
        // 调用个性化推荐服务
        // 流程：用户偏好 → OpenAI分析 → eBay搜索 → OpenAI筛选 → 个性化结果
        recommendations = await recommendationService.getPersonalizedRecommendations(input as PersonalizedInput)
        break

      case 'popular':
        // 热门推荐模式
        // 流程：热门默认条件 → OpenAI生成热门关键词 → eBay搜索 → OpenAI筛选热门商品 → 热门结果
        recommendations = await recommendationService.getPopularGifts(input as PopularInput)
        break

      case 'occasion':
        // 场合推荐模式
        // 验证场合推荐的必需参数
        if (!input.occasion) {
          return NextResponse.json(
            { 
              error: 'Occasion mode requires occasion field',
              received: input,
              required: 'occasion'
            },
            { status: 400 }
          )
        }
        
        // 调用场合推荐服务
        // 流程：场合默认条件 → OpenAI生成场合关键词 → eBay搜索 → OpenAI筛选适合商品 → 场合结果
        recommendations = await recommendationService.getOccasionGifts(input as OccasionInput)
        break

      default:
        // 无效的推荐模式
        return NextResponse.json(
          { error: `Invalid mode: ${requestMode}. Use: personalized, popular, or occasion` },
          { status: 400 }
        )
    }

    // 返回成功响应，包含推荐结果
    return NextResponse.json({
      success: true,           // 请求成功标识
      mode: requestMode,       // 使用的推荐模式
      data: recommendations,   // 推荐的礼物列表（带真实eBay购买链接）
      count: recommendations.length,  // 推荐礼物的数量
      source,                  // 数据来源：'ai-ebay-hybrid'表示AI+eBay混合策略
      timestamp: new Date().toISOString()  // 响应时间戳
    })

  } catch (error) {
    // 错误处理：记录错误并返回错误响应
    console.error('增强推荐API错误:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get recommendations',  // 通用错误信息
        message: error instanceof Error ? error.message : 'Unknown error'  // 具体错误详情
      },
      { status: 500 }  // 服务器内部错误状态码
    )
  }
}

/**
 * GET /api/recommendations/enhanced
 * 
 * API文档和使用说明端点
 * 返回API的使用方法和示例请求格式
 * 
 * 用途：
 * 1. 开发调试 - 了解API使用方法
 * 2. 前端集成 - 获取请求格式示例
 * 3. API测试 - 验证端点是否正常工作
 */
export async function GET() {
  return NextResponse.json({
    message: 'Enhanced Recommendations API',  // API描述
    modes: ['personalized', 'popular', 'occasion'],  // 支持的推荐模式
    
    // 详细的使用示例，包含三种模式的完整请求格式
    usage: {
      // 个性化推荐使用示例
      personalized: {
        method: 'POST',
        description: '基于用户偏好的个性化推荐',
        body: {
          mode: 'personalized',
          answers: {
            relationship: 'Sister',      // 关系：姐妹
            gender: 'Female',           // 性别：女性
            age_range: '25-34',         // 年龄范围：25-34岁
            interests: ['Fashion', 'Beauty'],  // 兴趣：时尚、美容
            budget_range: ['$25 - $50'],       // 预算：25-50美元
            special_preferences: 'Loves eco-friendly products'  // 特殊偏好：喜欢环保产品
          },
          limit: 10,    // 返回10个推荐
          region: 'US'  // 美国市场
        }
      },
      
      // 热门推荐使用示例
      popular: {
        method: 'POST',
        description: '当前流行和热门的礼物推荐',
        body: {
          mode: 'popular',
          limit: 20,                    // 返回20个热门推荐
          budget_range: ['$25 - $100'], // 预算：25-100美元
          region: 'US'                  // 美国市场
        }
      },
      
      // 场合推荐使用示例
      occasion: {
        method: 'POST',
        description: '特定场合的礼物推荐',
        body: {
          mode: 'occasion',
          occasion: 'birthday',         // 场合：生日
          limit: 15,                    // 返回15个推荐
          budget_range: ['$30 - $80'],  // 预算：30-80美元
          region: 'US'                  // 美国市场
        }
      }
    },
    
    // API技术信息
    technical_info: {
      strategy: 'AI-eBay Hybrid',  // 使用的推荐策略
      flow: [
        '1. 用户输入/默认条件',
        '2. OpenAI分析并生成eBay搜索关键词',
        '3. eBay API搜索真实商品',
        '4. OpenAI分析筛选最佳结果',
        '5. 返回带真实购买链接的推荐'
      ],
      cache_duration: '30 minutes',   // 缓存时长
      supported_regions: ['US'],      // 支持的地区
      data_sources: ['OpenAI GPT', 'eBay API', 'Fallback Mock Data']  // 数据来源
    }
  })
}