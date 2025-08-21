import { Gift } from './types'

export interface EbayProduct {
  itemId: string
  title: string
  price: {
    value: string
    currency: string
  }
  condition: string
  image?: {
    imageUrl: string
  }
  seller: {
    username: string
    feedbackPercentage: number
  }
  itemWebUrl: string
  categories: Array<{
    categoryId: string
    categoryName: string
  }>
  shippingOptions?: Array<{
    shippingCost: {
      value: string
      currency: string
    }
    shippingServiceName: string
  }>
  itemLocation?: {
    country: string
  }
}

export interface EbaySearchResponse {
  href: string
  total: number
  next?: string
  limit: number
  offset: number
  itemSummaries: EbayProduct[]
}

export class EbayService {
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly baseUrl: string = 'https://api.ebay.com'
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    this.clientId = process.env.EBAY_CLIENT_ID || ''
    this.clientSecret = process.env.EBAY_CLIENT_SECRET || ''

    if (!this.clientId || !this.clientSecret) {
      console.warn('eBay API credentials not configured')
    }
  }

  /**
   * Get OAuth access token for eBay API
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    try {
      const authUrl = 'https://api.ebay.com/identity/v1/oauth2/token'

      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
      })

      if (!response.ok) {
        throw new Error(`eBay OAuth failed: ${response.status}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      // Set expiration to 5 minutes before actual expiry for safety
      this.tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000

      return this.accessToken!
    } catch (error) {
      console.error('Error getting eBay access token:', error)
      throw error
    }
  }

  /**
   * Search for products on eBay
   */
  async searchProducts(query: string, options: {
    limit?: number
    categoryIds?: string[]
    priceRange?: { min: number; max: number }
    condition?: string
    sortOrder?: string
  } = {}): Promise<EbayProduct[]> {
    try {
      const accessToken = await this.getAccessToken()
      
      const params = new URLSearchParams({
        q: query,
        limit: (options.limit || 20).toString(),
        offset: '0'
      })

      // Add category filter if specified
      if (options.categoryIds && options.categoryIds.length > 0) {
        params.append('category_ids', options.categoryIds.join(','))
      }

      // Add price range filter
      if (options.priceRange) {
        if (options.priceRange.min > 0) {
          params.append('filter', `price:[${options.priceRange.min}..${options.priceRange.max}],priceCurrency:USD`)
        }
      }

      // Add condition filter
      if (options.condition) {
        params.append('filter', `conditions:{${options.condition}}`)
      }

      // Add sort order
      if (options.sortOrder) {
        params.append('sort', options.sortOrder)
      }

      const url = `${this.baseUrl}/buy/browse/v1/item_summary/search?${params.toString()}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' // US marketplace
        }
      })

      if (!response.ok) {
        throw new Error(`eBay API request failed: ${response.status}`)
      }

      const data: EbaySearchResponse = await response.json()
      return data.itemSummaries || []

    } catch (error) {
      console.error('Error searching eBay products:', error)
      return []
    }
  }

  /**
   * Transform eBay product to Gift format
   */
  transformToGift(product: EbayProduct): Gift {
    const price = parseFloat(product.price?.value || '0')
    
    return {
      id: product.itemId,
      name: product.title,
      brand: product.seller?.username || 'eBay Seller',
      price: price,
      rating: Math.min(product.seller?.feedbackPercentage || 90, 100) / 20, // Convert to 5-star rating
      reviewCount: 0, // eBay API doesn't provide review count in search results
      image: product.image?.imageUrl || '/placeholder-gift.jpg',
      shopUrl: product.itemWebUrl,
      tags: product.categories?.map(cat => cat.categoryName) || [],
      category: product.categories?.[0]?.categoryName || 'General'
    }
  }

  /**
   * Get gift recommendations by occasion
   */
  async getGiftsByOccasion(occasion: string, options: {
    budget?: { min: number; max: number }
    limit?: number
  } = {}): Promise<Gift[]> {
    const occasionQueries: Record<string, string[]> = {
      birthday: ['birthday gift', 'birthday present', 'celebration gift'],
      anniversary: ['anniversary gift', 'romantic gift', 'couple gift'],
      wedding: ['wedding gift', 'bridal gift', 'wedding present'],
      graduation: ['graduation gift', 'graduate present', 'achievement gift'],
      christmas: ['christmas gift', 'holiday gift', 'xmas present'],
      valentine: ['valentine gift', 'romantic present', 'love gift'],
      mother: ['mother gift', 'mom present', 'mothers day'],
      father: ['father gift', 'dad present', 'fathers day'],
      baby: ['baby gift', 'newborn present', 'baby shower'],
      housewarming: ['housewarming gift', 'new home gift', 'home decor']
    }

    const queries = occasionQueries[occasion.toLowerCase()] || [occasion + ' gift']
    let allProducts: EbayProduct[] = []

    // Search with multiple related queries
    for (const query of queries.slice(0, 2)) { // Limit to 2 queries to avoid rate limits
      const products = await this.searchProducts(query, {
        limit: Math.ceil((options.limit || 20) / queries.length),
        priceRange: options.budget,
        condition: 'New',
        sortOrder: 'price' // Sort by price for better variety
      })
      allProducts = [...allProducts, ...products]
    }

    // Remove duplicates and transform to Gift format
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.itemId === product.itemId)
    )

    return uniqueProducts
      .slice(0, options.limit || 20)
      .map(product => this.transformToGift(product))
  }

  /**
   * Get popular/trending gifts
   */
  async getPopularGifts(options: {
    limit?: number
    priceRange?: { min: number; max: number }
  } = {}): Promise<Gift[]> {
    const popularQueries = [
      'popular gift',
      'best seller gift',
      'trending gift',
      'top rated gift'
    ]

    const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)]
    
    const products = await this.searchProducts(randomQuery, {
      limit: options.limit || 20,
      priceRange: options.priceRange,
      condition: 'New',
      sortOrder: 'BestMatch' // eBay's best match algorithm
    })

    return products.map(product => this.transformToGift(product))
  }

  /**
   * Search gifts by keywords and preferences
   */
  async searchGifts(keywords: string[], options: {
    budget?: { min: number; max: number }
    interests?: string[]
    ageGroup?: string
    relationship?: string
    limit?: number
  } = {}): Promise<Gift[]> {
    // Combine keywords with interests for better search
    const searchTerms = [...keywords]
    if (options.interests) {
      searchTerms.push(...options.interests.slice(0, 2)) // Add top 2 interests
    }

    const query = searchTerms.join(' ') + ' gift'
    
    const products = await this.searchProducts(query, {
      limit: options.limit || 20,
      priceRange: options.budget,
      condition: 'New',
      sortOrder: 'BestMatch'
    })

    return products.map(product => this.transformToGift(product))
  }

  /**
   * Get detailed product information
   */
  async getProductDetails(itemId: string): Promise<EbayProduct | null> {
    try {
      const accessToken = await this.getAccessToken()
      
      const url = `${this.baseUrl}/buy/browse/v1/item/${itemId}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      })

      if (!response.ok) {
        throw new Error(`eBay API request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting eBay product details:', error)
      return null
    }
  }

  /**
   * Check if eBay service is available
   */
  isAvailable(): boolean {
    return !!(this.clientId && this.clientSecret)
  }
}

// Export singleton instance
export const ebayService = new EbayService()
