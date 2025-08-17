import type { Gift } from './types'

// Google Content API for Shopping configuration
const GOOGLE_SHOPPING_CONFIG = {
  apiKey: process.env.GOOGLE_SHOPPING_API_KEY,
  merchantId: process.env.GOOGLE_MERCHANT_ID,
  baseUrl: 'https://shoppingcontent.googleapis.com/content/v2.1'
}

export interface GoogleShoppingProduct {
  id: string
  title: string
  brand: string
  price: {
    value: string
    currency: string
  }
  imageLink: string
  link: string
  availability: string
  condition: string
  gtin?: string
  mpn?: string
  brand?: string
  productTypes?: string[]
}

export interface GoogleShoppingResponse {
  resources: GoogleShoppingProduct[]
  totalResults: number
}

export class GoogleShoppingService {
  private static instance: GoogleShoppingService
  private cache = new Map<string, { data: Gift[], timestamp: number }>()
  private readonly CACHE_TTL = 15 * 60 * 1000 // 15分钟缓存

  static getInstance(): GoogleShoppingService {
    if (!GoogleShoppingService.instance) {
      GoogleShoppingService.instance = new GoogleShoppingService()
    }
    return GoogleShoppingService.instance
  }

  // 将Google Shopping产品转换为Gift格式
  private transformToGift(product: GoogleShoppingProduct, searchTerm: string): Gift {
    return {
      id: `google-${product.id}`,
      name: product.title,
      brand: product.brand || 'Unknown Brand',
      price: parseFloat(product.price.value) || 0,
      rating: 0, // Google Shopping API不提供评分
      reviewCount: 0, // Google Shopping API不提供评论数
      image: product.imageLink || '/gift-placeholder.jpg',
      shopUrl: product.link,
      category: product.productTypes?.[0] || 'General',
      tags: [searchTerm.toLowerCase(), 'google-shopping']
    }
  }

  // 搜索Google Shopping产品
  async searchProducts(searchTerm: string, maxResults: number = 8): Promise<Gift[]> {
    const cacheKey = `google-shopping-${searchTerm}-${maxResults}`
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    try {
      if (!GOOGLE_SHOPPING_CONFIG.apiKey) {
        console.warn('Google Shopping API key not configured, using fallback')
        return this.getFallbackProducts(searchTerm, maxResults)
      }

      // 构建Google Shopping API请求
      const query = encodeURIComponent(searchTerm)
      const url = `${GOOGLE_SHOPPING_CONFIG.baseUrl}/products/search?q=${query}&maxResults=${maxResults}&key=${GOOGLE_SHOPPING_CONFIG.apiKey}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Google Shopping API error: ${response.status}`)
      }

      const data: GoogleShoppingResponse = await response.json()
      
      if (!data.resources || data.resources.length === 0) {
        console.warn(`No products found for search term: ${searchTerm}`)
        return this.getFallbackProducts(searchTerm, maxResults)
      }

      // 转换产品数据
      const gifts = data.resources
        .filter(product => product.availability === 'in stock')
        .map(product => this.transformToGift(product, searchTerm))
        .slice(0, maxResults)

      // 缓存结果
      this.setCache(cacheKey, gifts)
      return gifts

    } catch (error) {
      console.error('Google Shopping API error:', error)
      return this.getFallbackProducts(searchTerm, maxResults)
    }
  }

  // 获取备用产品数据（当API不可用时）
  private getFallbackProducts(searchTerm: string, maxResults: number): Gift[] {
    console.log(`Using fallback products for: ${searchTerm}`)
    
    // 基于搜索词生成相关产品
    const fallbackProducts: Gift[] = [
      {
        id: `fallback-1-${Date.now()}`,
        name: `${searchTerm} - Premium Quality`,
        brand: 'Featured Brand',
        price: 49.99,
        rating: 4.5,
        reviewCount: 1200,
        image: '/gift-placeholder.jpg',
        shopUrl: `https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' buy online')}&tbm=shop`,
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
        shopUrl: `https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' best price')}&tbm=shop`,
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
export const googleShoppingService = GoogleShoppingService.getInstance()
