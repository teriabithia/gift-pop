import type { Gift } from './types'

interface EtsyProduct {
  listing_id: number
  title: string
  description: string
  price: {
    amount: number
    divisor: number
    currency_code: string
  }
  url: string
  images: Array<{
    url_75x75: string
    url_170x135: string
    url_570xN: string
    url_fullxfull: string
  }>
  shop: {
    shop_name: string
    shop_id: number
  }
  tags: string[]
  materials: string[]
  category_path: string[]
  views: number
  num_favorers: number
}

interface EtsySearchResponse {
  count: number
  results: EtsyProduct[]
}

class EtsyService {
  private apiKey: string
  private baseUrl = 'https://openapi.etsy.com/v3'

  constructor() {
    this.apiKey = process.env.ETSY_API_KEY || ''
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    if (!this.apiKey) {
      throw new Error('ETSY_API_KEY is not configured')
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)
    url.searchParams.append('api_key', this.apiKey)
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Etsy API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Etsy API request failed:', error)
      throw error
    }
  }

  async searchProducts(query: string, options: {
    limit?: number
    minPrice?: number
    maxPrice?: number
    category?: string
    sortOn?: 'relevance' | 'created' | 'price' | 'score'
  } = {}): Promise<Gift[]> {
    try {
      const params: Record<string, string> = {
        keywords: query,
        limit: (options.limit || 20).toString(),
        sort_on: options.sortOn || 'relevance',
        sort_order: 'desc',
      }

      if (options.minPrice) {
        params.min_price = options.minPrice.toString()
      }
      if (options.maxPrice) {
        params.max_price = options.maxPrice.toString()
      }
      if (options.category) {
        params.category = options.category
      }

      const response: EtsySearchResponse = await this.makeRequest('/application/listings/active', params)
      
      return response.results.map(product => this.transformToGift(product))
    } catch (error) {
      console.error('Failed to search Etsy products:', error)
      throw error
    }
  }

  async getProductsByCategory(category: string, limit: number = 20): Promise<Gift[]> {
    try {
      const response: EtsySearchResponse = await this.makeRequest('/application/listings/active', {
        category: category,
        limit: limit.toString(),
        sort_on: 'score',
        sort_order: 'desc',
      })
      
      return response.results.map(product => this.transformToGift(product))
    } catch (error) {
      console.error('Failed to get Etsy products by category:', error)
      throw error
    }
  }

  async getPopularProducts(limit: number = 20): Promise<Gift[]> {
    try {
      const response: EtsySearchResponse = await this.makeRequest('/application/listings/active', {
        limit: limit.toString(),
        sort_on: 'score',
        sort_order: 'desc',
      })
      
      return response.results.map(product => this.transformToGift(product))
    } catch (error) {
      console.error('Failed to get popular Etsy products:', error)
      throw error
    }
  }

  private transformToGift(etsyProduct: EtsyProduct): Gift {
    const price = etsyProduct.price.amount / etsyProduct.price.divisor
    
    return {
      id: `etsy-${etsyProduct.listing_id}`,
      name: etsyProduct.title,
      // description field not in Gift interface, removing
      price: price,
      // originalPrice field not in Gift interface, removing
      // currency field not in Gift interface, removing
      image: etsyProduct.images[0]?.url_570xN || etsyProduct.images[0]?.url_fullxfull || '',
      // thumbnail field not in Gift interface, removing
      brand: etsyProduct.shop.shop_name,
      category: etsyProduct.category_path[0] || 'Handmade',
      rating: 4.5, // Etsy doesn't provide rating in search results
      reviewCount: etsyProduct.num_favorers || 0,
      // availability field not in Gift interface, removing
      // url field not in Gift interface, removing
      // source field not in Gift interface, removing
      tags: [...etsyProduct.tags, ...etsyProduct.materials],
      // occasion field not in Gift interface, removing
      // priceRange field not in Gift interface, removing
      // isHandmade field not in Gift interface, removing
            // isVintage field not in Gift interface, removing
      shipping: {
        free: false,
        cost: 0,
        estimatedDays: '5-10 business days'
      }
    }
  }

  private detectOccasion(tags: string[], title: string): string[] {
    const text = [...tags, title].join(' ').toLowerCase()
    const occasions: string[] = []
    
    if (text.includes('birthday') || text.includes('birth day')) occasions.push('birthday')
    if (text.includes('anniversary')) occasions.push('anniversary')
    if (text.includes('wedding')) occasions.push('wedding')
    if (text.includes('graduation')) occasions.push('graduation')
    if (text.includes('valentine') || text.includes('valentines')) occasions.push('valentines-day')
    if (text.includes('mother') || text.includes('mom')) occasions.push('mothers-day')
    if (text.includes('father') || text.includes('dad')) occasions.push('fathers-day')
    if (text.includes('christmas') || text.includes('holiday')) occasions.push('christmas')
    if (text.includes('housewarming') || text.includes('house warming')) occasions.push('housewarming')
    if (text.includes('baby') || text.includes('shower')) occasions.push('baby-shower')
    if (text.includes('retirement')) occasions.push('retirement')
    if (text.includes('thank you') || text.includes('thankyou')) occasions.push('thank-you')
    
    return occasions
  }

  private getPriceRange(price: number): string {
    if (price < 25) return 'Under $25'
    if (price < 50) return '$25 - $50'
    if (price < 100) return '$50 - $100'
    if (price < 200) return '$100 - $200'
    return 'Over $200'
  }
}

export const etsyService = new EtsyService()
