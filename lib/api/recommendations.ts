import { Gift } from '../types'
import { UserPreferences } from '../prompts'
import { bestbuyService } from '../bestbuy-service'
import { mockGifts } from '../mock-data'

export interface RecommendationResponse {
  success: boolean
  data: Gift[]
  count: number
  source: string
  lastUpdated?: string
  occasion?: string
  error?: string
  message?: string
}

class RecommendationAPI {
  private baseUrl = '/api/recommendations'

  async getPersonalizedRecommendations(preferences: UserPreferences): Promise<Gift[]> {
    try {
      // Try to get AI-powered recommendations first
      const response = await fetch(`${this.baseUrl}/personalized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        const result: RecommendationResponse = await response.json()
        if (result.success) {
          return result.data
        }
      }
    } catch (error) {
      console.error('AI recommendations failed, falling back to Best Buy:', error)
    }

    // Fallback to Best Buy recommendations
    try {
      const searchQuery = this.buildSearchQuery(preferences)
      const bestbuyGifts = await bestbuyService.searchProducts(searchQuery, {
        limit: 20,
        minPrice: 10, // Default minimum price
        maxPrice: 500, // Default maximum price
        sortBy: 'customerRating'
      })
      
      return bestbuyGifts
    } catch (error) {
      console.error('Best Buy recommendations failed, using mock data:', error)
      return mockGifts.slice(0, 20)
    }
  }

  async getPopularGifts(): Promise<Gift[]> {
    try {
      // Try to get AI-powered popular recommendations first
      const response = await fetch(`${this.baseUrl}/popular`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result: RecommendationResponse = await response.json()
        if (result.success) {
          return result.data
        }
      }
    } catch (error) {
      console.error('AI popular recommendations failed, falling back to Best Buy:', error)
    }

    // Fallback to Best Buy popular products
    try {
      const bestbuyGifts = await bestbuyService.getPopularProducts(20)
      return bestbuyGifts
    } catch (error) {
      console.error('Best Buy popular recommendations failed, using mock data:', error)
      return mockGifts.slice(0, 20)
    }
  }

  async getOccasionGifts(occasion: string): Promise<Gift[]> {
    try {
      // Try to get AI-powered occasion recommendations first
      const response = await fetch(`${this.baseUrl}/occasion?occasion=${encodeURIComponent(occasion)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result: RecommendationResponse = await response.json()
        if (result.success) {
          return result.data
        }
      }
    } catch (error) {
      console.error('AI occasion recommendations failed, falling back to Best Buy:', error)
    }

    // Fallback to Best Buy occasion-based search
    try {
      const bestbuyGifts = await bestbuyService.getGiftIdeas(occasion, 20)
      return bestbuyGifts
    } catch (error) {
      console.error('Best Buy occasion recommendations failed, using mock data:', error)
      return mockGifts.filter(gift => {
        // Handle tags that could be string or string[]
        const giftTags = Array.isArray(gift.tags) ? gift.tags : [gift.tags || '']
        return giftTags.some(tag => tag.toLowerCase().includes(occasion))
      }).slice(0, 20)
    }
  }

  private buildSearchQuery(preferences: UserPreferences): string {
    const parts: string[] = []
    
    if (preferences.interests && preferences.interests.length > 0) {
      parts.push(preferences.interests.join(' '))
    }
    
    if (preferences.relationship) {
      parts.push(preferences.relationship)
    }
    
    if (preferences.gender) {
      parts.push(preferences.gender)
    }
    
    if (preferences.ageRange) {
      parts.push(preferences.ageRange)
    }
    
    if (preferences.specialPreferences) {
      parts.push(preferences.specialPreferences)
    }
    
    return parts.join(' ') || 'gift electronics'
  }
}

export const recommendationAPI = new RecommendationAPI()

