import type { Gift } from './types'

// SerpApi配置
const SERPAPI_CONFIG = {
  apiKey: process.env.SERPAPI_API_KEY,
  baseUrl: 'https://serpapi.com/search',
  engine: 'google_shopping' // 使用google_shopping引擎来搜索产品
}

export interface SerpApiProduct {
  product_id?: string
  title: string
  price: string
  extracted_price?: number
  rating: number
  reviews: number
  thumbnail: string
  product_link: string
  source: string
  delivery?: string
  snippet?: string
}

export interface SerpApiResponse {
  search_metadata: {
    status: string
    created_at: string
  }
  search_parameters: {
    engine: string
    q: string
  }
  search_information: {
    total_results: number
    query_displayed: string
  }
  shopping_results: SerpApiProduct[]
  error?: string
}

export class SerpApiService {
  private static instance: SerpApiService
  private cache = new Map<string, { data: Gift[], timestamp: number }>()
  private readonly CACHE_TTL = 15 * 60 * 1000 // 15分钟缓存

  static getInstance(): SerpApiService {
    if (!SerpApiService.instance) {
      SerpApiService.instance = new SerpApiService()
    }
    return SerpApiService.instance
  }

  // 将SerpApi产品结果转换为Gift格式
  private transformToGift(product: SerpApiProduct, searchTerm: string): Gift {
    // 使用extracted_price如果可用，否则解析price字符串
    let price = 0
    if (product.extracted_price) {
      price = product.extracted_price
    } else if (product.price) {
      // 移除货币符号和空格，提取数字
      const priceMatch = product.price.replace(/[^\d.,]/g, '')
      price = parseFloat(priceMatch) || 0
    }

    // 解析评分和评论数
    let rating = 0
    let reviewCount = 0
    if (product.rating) {
      rating = parseFloat(product.rating.toString()) || 0
    }
    if (product.reviews) {
      reviewCount = parseInt(product.reviews.toString()) || 0
    }

    // 提取品牌（从标题中）
    let brand = 'Unknown Brand'
    if (product.title) {
      // 尝试从标题中提取品牌名称
      const brandMatch = product.title.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
      if (brandMatch) {
        brand = brandMatch[1]
      }
    }

    return {
      id: `serpapi-${product.product_id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: product.title || searchTerm,
      brand: brand,
      price: price,
      rating: rating,
      reviewCount: reviewCount,
      image: product.thumbnail || '/gift-placeholder.jpg',
      shopUrl: product.product_link || '#',
      category: 'General',
      tags: [searchTerm.toLowerCase(), 'serpapi-search']
    }
  }

  // 使用SerpApi搜索Google Shopping
  async searchProducts(searchTerm: string, maxResults: number = 8): Promise<Gift[]> {
    const cacheKey = `serpapi-${searchTerm}-${maxResults}`
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    try {
      if (!SERPAPI_CONFIG.apiKey) {
        console.warn('SerpApi API key not configured, using fallback')
        return this.getFallbackProducts(searchTerm, maxResults)
      }

      // 构建SerpApi请求 - 使用google_shopping引擎
      const params = new URLSearchParams({
        api_key: SERPAPI_CONFIG.apiKey,
        engine: SERPAPI_CONFIG.engine,
        q: searchTerm,
        num: Math.min(maxResults, 20).toString() // SerpApi支持最多20个结果
      })

      const url = `${SERPAPI_CONFIG.baseUrl}?${params.toString()}`
      
      console.log(`Calling SerpApi: ${url}`)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`SerpApi error: ${response.status} ${response.statusText}`)
      }

      const data: SerpApiResponse = await response.json()
      
      if (data.error) {
        throw new Error(`SerpApi API error: ${data.error}`)
      }

      // 提取购物结果
      let products: SerpApiProduct[] = []
      
      if (data.shopping_results && data.shopping_results.length > 0) {
        products = data.shopping_results
      }

      if (products.length === 0) {
        console.warn(`No products found for search term: ${searchTerm}`)
        return this.getFallbackProducts(searchTerm, maxResults)
      }

      // 转换搜索结果
      const gifts = products
        .map(product => this.transformToGift(product, searchTerm))
        .filter(gift => gift.shopUrl && gift.shopUrl !== '#')
        .slice(0, maxResults)

      console.log(`Found ${gifts.length} products via SerpApi for: ${searchTerm}`)

      // 缓存结果
      this.setCache(cacheKey, gifts)
      return gifts

    } catch (error) {
      console.error('SerpApi error:', error)
      return this.getFallbackProducts(searchTerm, maxResults)
    }
  }

  // 获取备用产品数据（当API不可用时）
  private getFallbackProducts(searchTerm: string, maxResults: number): Gift[] {
    console.log(`Using fallback products for: ${searchTerm}`)
    
    // 基于搜索词生成相关产品，使用Google Shopping搜索链接
    const fallbackProducts: Gift[] = [
      {
        id: `fallback-1-${Date.now()}`,
        name: `${searchTerm} - Premium Quality`,
        brand: 'Featured Brand',
        price: 49.99,
        rating: 4.5,
        reviewCount: 1200,
        image: '/gift-placeholder.jpg',
        shopUrl: `https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' buy online shopping')}&tbm=shop`,
        category: 'General',
        tags: [searchTerm.toLowerCase(), 'fallback']
      },
      {
        id: `fallback-2-${Date.now()}`,
        name: `${searchTerm} - Best Seller`,
        brand: 'Popular Brand',
        price: 39.99,
        rating: 4.7,
        reviewCount: 850,
        image: '/gift-placeholder.jpg',
        shopUrl: `https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' best price shopping')}&tbm=shop`,
        category: 'General',
        tags: [searchTerm.toLowerCase(), 'fallback']
      }
    ]

    return fallbackProducts.slice(0, maxResults)
  }

  // 缓存管理
  private getFromCache(key: string): Gift[] | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: Gift[]): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // 清理过期缓存
  clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key)
      }
    }
  }
}

// 导出单例实例
export const serpApiService = SerpApiService.getInstance()

// 保持向后兼容性
export const googleShoppingService = serpApiService
