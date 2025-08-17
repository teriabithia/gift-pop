import { Gift } from '../types'
import { UserPreferences } from '../prompts'

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
      const response = await fetch(`${this.baseUrl}/personalized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: RecommendationResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get recommendations')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error)
      throw error
    }
  }

  async getPopularGifts(): Promise<Gift[]> {
    try {
      const response = await fetch(`${this.baseUrl}/popular`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: RecommendationResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get popular gifts')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching popular gifts:', error)
      throw error
    }
  }

  async getOccasionGifts(occasion: string): Promise<Gift[]> {
    try {
      const response = await fetch(`${this.baseUrl}/occasion?occasion=${encodeURIComponent(occasion)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: RecommendationResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get occasion gifts')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching occasion gifts:', error)
      throw error
    }
  }
}

export const recommendationAPI = new RecommendationAPI()

