import type { Gift } from './types'

interface BestBuyProduct {
  sku: number
  name: string
  description: string
  salePrice: number
  regularPrice: number
  url: string
  image: string
  thumbnailImage: string
  brand: string
  categoryPath: Array<{
    id: string
    name: string
  }>
  customerReviewAverage: number
  customerReviewCount: number
  inStoreAvailability: boolean
  onlineAvailability: boolean
  shipping: {
    freeShipping: boolean
    shippingCost: number
  }
  features: Array<{
    feature: string
  }>
  details: Array<{
    name: string
    value: string
  }>
}

interface BestBuySearchResponse {
  total: number
  totalPages: number
  currentPage: number
  products: BestBuyProduct[]
}

class BestBuyService {
  private apiKey: string
  private baseUrl = 'https://api.bestbuy.com/v1'

  constructor() {
    this.apiKey = process.env.BESTBUY_API_KEY || ''
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    if (!this.apiKey) {
      throw new Error('BESTBUY_API_KEY is not configured')
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)
    url.searchParams.append('apiKey', this.apiKey)
    url.searchParams.append('format', 'json')
    
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
        throw new Error(`Best Buy API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Best Buy API request failed:', error)
      throw error
    }
  }

  async searchProducts(query: string, options: {
    limit?: number
    minPrice?: number
    maxPrice?: number
    category?: string
    sortBy?: 'bestMatch' | 'price' | 'customerRating' | 'newArrivals'
  } = {}): Promise<Gift[]> {
    try {
      const params: Record<string, string> = {
        query: query,
        pageSize: (options.limit || 20).toString(),
        sort: this.getSortParam(options.sortBy || 'bestMatch'),
        show: 'sku,name,description,salePrice,regularPrice,url,image,thumbnailImage,brand,categoryPath,customerReviewAverage,customerReviewCount,inStoreAvailability,onlineAvailability,shipping,features,details'
      }

      if (options.minPrice) {
        params.price = `>${options.minPrice}`
      }
      if (options.maxPrice) {
        params.price = params.price ? `${params.price} AND <${options.maxPrice}` : `<${options.maxPrice}`
      }
      if (options.category) {
        params.categoryPath = options.category
      }

      const response: BestBuySearchResponse = await this.makeRequest('/products', params)
      
      return response.products.map(product => this.transformToGift(product))
    } catch (error) {
      console.error('Failed to search Best Buy products:', error)
      throw error
    }
  }

  async getProductsByCategory(category: string, limit: number = 20): Promise<Gift[]> {
    try {
      const response: BestBuySearchResponse = await this.makeRequest('/products', {
        categoryPath: category,
        pageSize: limit.toString(),
        sort: 'customerRating.desc',
        show: 'sku,name,description,salePrice,regularPrice,url,image,thumbnailImage,brand,categoryPath,customerReviewAverage,customerReviewCount,inStoreAvailability,onlineAvailability,shipping,features,details'
      })
      
      return response.products.map(product => this.transformToGift(product))
    } catch (error) {
      console.error('Failed to get Best Buy products by category:', error)
      throw error
    }
  }

  async getPopularProducts(limit: number = 20): Promise<Gift[]> {
    try {
      const response: BestBuySearchResponse = await this.makeRequest('/products', {
        pageSize: limit.toString(),
        sort: 'customerRating.desc',
        show: 'sku,name,description,salePrice,regularPrice,url,image,thumbnailImage,brand,categoryPath,customerReviewAverage,customerReviewCount,inStoreAvailability,onlineAvailability,shipping,features,details'
      })
      
      return response.products.map(product => this.transformToGift(product))
    } catch (error) {
      console.error('Failed to get popular Best Buy products:', error)
      throw error
    }
  }

  async getGiftIdeas(occasion: string, limit: number = 20): Promise<Gift[]> {
    try {
      const searchQuery = this.getOccasionSearchQuery(occasion)
      const response: BestBuySearchResponse = await this.makeRequest('/products', {
        query: searchQuery,
        pageSize: limit.toString(),
        sort: 'customerRating.desc',
        show: 'sku,name,description,salePrice,regularPrice,url,image,thumbnailImage,brand,categoryPath,customerReviewAverage,customerReviewCount,inStoreAvailability,onlineAvailability,shipping,features,details'
      })
      
      return response.products.map(product => this.transformToGift(product))
    } catch (error) {
      console.error('Failed to get Best Buy gift ideas:', error)
      throw error
    }
  }

  private transformToGift(bestbuyProduct: BestBuyProduct): Gift {
    const price = bestbuyProduct.salePrice || bestbuyProduct.regularPrice
    const originalPrice = bestbuyProduct.regularPrice
    
    return {
      id: `bestbuy-${bestbuyProduct.sku}`,
      name: bestbuyProduct.name,
      // description field not in Gift interface, removing
      price: price,
      // originalPrice field not in Gift interface, removing
      // currency field not in Gift interface, removing
      image: bestbuyProduct.image || '',
      // thumbnail field not in Gift interface, removing
      brand: bestbuyProduct.brand || 'Best Buy',
      category: bestbuyProduct.categoryPath?.[0]?.name || 'Electronics',
      rating: bestbuyProduct.customerReviewAverage || 4.0,
      reviewCount: bestbuyProduct.customerReviewCount || 0,
      // availability field not in Gift interface, removing
      // url field not in Gift interface, removing
      // source field not in Gift interface, removing
      tags: [
        ...(bestbuyProduct.features?.map(f => f.feature) || []),
        ...(bestbuyProduct.details?.map(d => `${d.name}: ${d.value}`) || [])
      ],
      // occasion field not in Gift interface, removing
      // priceRange field not in Gift interface, removing
      // isHandmade field not in Gift interface, removing
      // isVintage field not in Gift interface, removing
      shipping: {
        free: bestbuyProduct.shipping?.freeShipping || false,
        cost: bestbuyProduct.shipping?.shippingCost || 0,
        estimatedDays: '3-5 business days'
      }
    }
  }

  private detectOccasion(product: BestBuyProduct): string[] {
    const text = [
      product.name,
      product.description,
      ...(product.features?.map(f => f.feature) || [])
    ].join(' ').toLowerCase()
    
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

  private getSortParam(sortBy: string): string {
    switch (sortBy) {
      case 'price':
        return 'salePrice.asc'
      case 'customerRating':
        return 'customerRating.desc'
      case 'newArrivals':
        return 'dateAdded.desc'
      default:
        return 'bestMatch'
    }
  }

  private getOccasionSearchQuery(occasion: string): string {
    const occasionMap: Record<string, string> = {
      'birthday': 'birthday gift electronics',
      'anniversary': 'anniversary gift romantic',
      'wedding': 'wedding gift registry',
      'graduation': 'graduation gift student',
      'valentines-day': 'valentine gift romantic electronics',
      'mothers-day': 'mother gift mom electronics',
      'fathers-day': 'father gift dad electronics',
      'christmas': 'christmas gift holiday electronics',
      'housewarming': 'housewarming gift home electronics',
      'baby-shower': 'baby shower gift infant',
      'retirement': 'retirement gift hobby',
      'thank-you': 'thank you gift appreciation'
    }
    
    return occasionMap[occasion] || `${occasion} gift electronics`
  }
}

export const bestbuyService = new BestBuyService()
