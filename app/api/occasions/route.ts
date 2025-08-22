import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

// 缓存数据7天
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7天，单位毫秒

// 验证和转换商品数据格式
function validateGiftData(data: any[]) {
  return data.map(item => ({
    ...item,
    price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]/g, '')) || 0 : (typeof item.price === 'number' ? item.price : 0),
    rating: typeof item.rating === 'string' ? parseFloat(item.rating) || 0 : (typeof item.rating === 'number' ? item.rating : 0),
    reviewCount: typeof item.reviewCount === 'string' ? parseInt(item.reviewCount) || 0 : (typeof item.reviewCount === 'number' ? item.reviewCount : 0),
    // 确保 image 字段是字符串
    image: typeof item.image === 'string' ? item.image : (item.image?.imageUrl || item.image?.url || '')
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const occasion = searchParams.get('occasion')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    if (!occasion) {
      return NextResponse.json({ error: "Occasion parameter is required" }, { status: 400 })
    }

    // 检查缓存
    const cachedData = await prisma.recommendation.findFirst({
      where: {
        type: 'occasion',
        occasion: occasion,
        updatedAt: {
          gte: new Date(Date.now() - CACHE_DURATION)
        }
      }
    })

    if (cachedData) {
      console.log(`✅ Using cached data for ${occasion}`)
      const parsedData = JSON.parse(cachedData.data || '[]')
      
      // 确保缓存数据的类型正确
      const validatedData = Array.isArray(parsedData) ? validateGiftData(parsedData) : parsedData
      
      // 应用分页
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedData = validatedData.slice(startIndex, endIndex)
      const hasMore = endIndex < validatedData.length
      
      return NextResponse.json({
        success: true,
        data: paginatedData,
        cached: true,
        updatedAt: cachedData.updatedAt,
        pagination: {
          page,
          limit,
          total: validatedData.length,
          hasMore,
          totalPages: Math.ceil(validatedData.length / limit)
        }
      })
    }

    // 如果没有缓存或缓存过期，调用推荐API获取新数据
    console.log(`🔄 Fetching fresh data for ${occasion}`)
    
    // 这里调用你的推荐API逻辑
    const recommendations = await getOccasionRecommendations(occasion)
    
    if (recommendations && recommendations.length > 0) {
      // 确保数据格式正确后再保存到数据库
      const validatedRecommendations = Array.isArray(recommendations) ? validateGiftData(recommendations) : recommendations
      
      // 保存到数据库作为缓存
      await prisma.recommendation.upsert({
        where: {
          type_occasion: {
            type: 'occasion',
            occasion: occasion
          }
        },
        update: {
          data: JSON.stringify(validatedRecommendations),
          updatedAt: new Date()
        },
        create: {
          type: 'occasion',
          occasion: occasion,
          data: JSON.stringify(validatedRecommendations)
        }
      })
      
      console.log(`✅ Cached new data for ${occasion}`)
      
      // 应用分页
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedData = validatedRecommendations.slice(startIndex, endIndex)
      const hasMore = endIndex < validatedRecommendations.length
      
      return NextResponse.json({
        success: true,
        data: paginatedData,
        cached: false,
        updatedAt: new Date(),
        pagination: {
          page,
          limit,
          total: validatedRecommendations.length,
          hasMore,
          totalPages: Math.ceil(validatedRecommendations.length / limit)
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: "No recommendations found",
      data: []
    })

  } catch (error) {
    console.error("Error fetching occasion recommendations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 获取occasion推荐商品的函数
async function getOccasionRecommendations(occasion: string) {
  try {
    // 根据occasion生成搜索关键词
    const searchKeywords = getOccasionKeywords(occasion)
    
    // 调用eBay API搜索商品
    const ebayResults = await searchEbayProducts(searchKeywords)
    
    // 使用OpenAI分析筛选结果
    const analyzedResults = await analyzeEbayResults(ebayResults, occasion)
    
    return analyzedResults
  } catch (error) {
    console.error(`Error getting recommendations for ${occasion}:`, error)
    return []
  }
}

// 根据occasion生成搜索关键词
function getOccasionKeywords(occasion: string): string {
  const keywordMap: { [key: string]: string } = {
    'birthday': 'birthday gift present party celebration',
    'wedding': 'wedding gift bridal shower marriage celebration',
    'christmas': 'christmas gift holiday celebration winter',
    'graduation': 'graduation gift academic achievement celebration',
    'baby-shower': 'baby shower gift newborn infant celebration',
    'housewarming': 'housewarming gift home decor house celebration',
    'fathers-day': 'fathers day dad gift father birthday present',
    'mothers-day': 'mothers day mom gift mother birthday present',
    'valentines-day': 'valentines day romantic gift love present',
    'anniversary': 'anniversary gift couple celebration love',
    'retirement': 'retirement gift celebration new chapter',
    'just-because': 'gift present surprise thoughtful'
  }
  
  return keywordMap[occasion.toLowerCase()] || occasion
}

// 搜索eBay商品
async function searchEbayProducts(keywords: string) {
  try {
    // 获取eBay OAuth token
    const token = await getEbayToken()
    if (!token) {
      throw new Error('Failed to get eBay token')
    }

    // 搜索商品
    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(keywords)}&limit=100&filter=conditions:{NEW}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY-US'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.status}`)
    }

    const data = await response.json()
    return data.itemSummaries || []
  } catch (error) {
    console.error('Error searching eBay products:', error)
    return []
  }
}

// 获取eBay OAuth token
async function getEbayToken() {
  try {
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    })

    if (!response.ok) {
      throw new Error(`OAuth error: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting eBay token:', error)
    return null
  }
}

// 使用OpenAI分析eBay结果
async function analyzeEbayResults(ebayResults: any[], occasion: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found')
      return transformEbayResults(ebayResults.slice(0, 24)) // 返回转换后的前24个结果
    }

    const prompt = `为${occasion}场合选择最合适的24个礼物。

考虑因素：
1. 商品相关性
2. 价格合理性
3. 评价和评分
4. 商品质量

返回JSON格式，每个商品包含：
- id: 商品ID (字符串)
- name: 商品名称 (字符串)
- price: 价格 (数字)
- image: 图片URL (字符串)
- rating: 评分 (数字，0-5)
- reviewCount: 评价数量 (数字)
- shopUrl: 商品链接 (字符串)
- brand: 品牌 (字符串)

确保所有数值字段都是数字类型。`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (content) {
      try {
        const parsed = JSON.parse(content)
        
        // 验证和转换数据格式
        if (Array.isArray(parsed)) {
          return validateGiftData(parsed)
        }
        
        return parsed
      } catch {
        // 如果解析失败，返回转换后的原始结果
        return transformEbayResults(ebayResults.slice(0, 24))
      }
    }

    return transformEbayResults(ebayResults.slice(0, 24))
  } catch (error) {
    console.error('Error analyzing results with OpenAI:', error)
    return transformEbayResults(ebayResults.slice(0, 24))
  }
}

// 转换 eBay 原始数据为我们需要的格式
function transformEbayResults(ebayResults: any[]) {
  return ebayResults.map(item => ({
    id: item.itemId || item.legacyItemId || '',
    name: item.title || '',
    price: parseFloat(item.price?.value || 0),
    image: item.image || item.thumbnailImages?.[0]?.imageUrl || '',
    rating: 0, // eBay API 通常不直接提供评分
    reviewCount: 0, // eBay API 通常不直接提供评价数量
    shopUrl: item.itemWebUrl || item.itemHref || '',
    brand: item.seller?.username || '',
    description: item.shortDescription || ''
  }))
}
