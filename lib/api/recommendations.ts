import { Gift } from '../types'

/**
 * API Response Interface Definition
 * Unified recommendation API response format
 */
export interface RecommendationResponse {
  success: boolean    // Whether the request was successful
  data: Gift[]       // List of recommended gifts
  count: number      // Number of gifts
  source: string     // Data source (e.g., 'ai-ebay-hybrid')
  mode: string       // Recommendation mode (personalized/popular/occasion)
  timestamp?: string // Timestamp
  error?: string     // Error message
  message?: string   // Additional message
}

/**
 * Frontend Recommendation System API Client
 * 
 * Core Strategy: Three recommendation modes unified through enhanced API
 * 1. Personalized recommendations (personalized) - Based on user wizard data
 * 2. Popular recommendations (popular) - Currently trending gifts
 * 3. Occasion-based recommendations (occasion) - Gifts for specific occasions
 * 
 * All modes use the same backend flow:
 * User input → OpenAI generates search keywords → eBay API search → OpenAI analysis & filtering → Return results
 */
class RecommendationAPI {
  private baseUrl = '/api/recommendations'

  /**
   * Get personalized recommendations
   * 
   * Strategy Flow:
   * 1. Convert frontend wizard data to API format
   * 2. Call enhanced API in personalized mode
   * 3. Backend: OpenAI analyzes user preferences → Generates eBay search keywords → eBay API searches real products → OpenAI filters best results
   * 4. Returns 20 personalized gift recommendations
   * 
   * @param preferences User preference data (from wizard)
   * @returns Promise<Gift[]> List of personalized gift recommendations
   */
  async getPersonalizedRecommendations(preferences: {
    relationship: string      // Relationship (e.g., friend, family, colleague)
    gender?: string          // Gender
    ageRange?: string        // Age range
    interests: string[]      // List of interests and hobbies
    budget?: { min: number; max: number }  // Budget range
    specialPreferences?: string            // Special preferences
  }): Promise<Gift[]> {
    try {
      // Convert frontend data format to backend API expected format
      const requestBody = {
        mode: 'personalized',  // Specify personalized mode
        answers: {
          relationship: preferences.relationship,
          gender: preferences.gender,
          age_range: preferences.ageRange,
          interests: preferences.interests,
          // Convert budget object to string array format
          budget_range: preferences.budget 
            ? [`$${preferences.budget.min} - $${preferences.budget.max}`]
            : ['$25 - $100'],  // Default budget range
          special_preferences: preferences.specialPreferences
        },
        limit: 20,    // Return 20 recommendations
        region: 'US'  // US market
      }

      // Call unified enhanced API
      const response = await fetch(`${this.baseUrl}/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const result: RecommendationResponse = await response.json()
        if (result.success) {
          return result.data  // Return recommended gift list
        } else {
          throw new Error(result.message || 'Failed to get personalized recommendations')
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Personalized recommendations failed:', error)
      throw error
    }
  }

  /**
   * Get popular/trending gift recommendations
   * 
   * Strategy Flow:
   * 1. Use preset popular search criteria
   * 2. Call enhanced API in popular mode
   * 3. Backend: OpenAI generates popular gift search keywords → eBay API search → OpenAI filters most popular products
   * 4. Returns 30 popular gift recommendations
   * 
   * @returns Promise<Gift[]> List of popular gift recommendations
   */
  async getPopularGifts(): Promise<Gift[]> {
    try {
      const requestBody = {
        mode: 'popular',           // Specify popular mode
        limit: 30,                 // Return 30 recommendations (more than personalized)
        budget_range: ['$20 - $150'],  // Price range for popular products
        region: 'US'               // US market
      }

      // Call unified enhanced API
      const response = await fetch(`${this.baseUrl}/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const result: RecommendationResponse = await response.json()
        if (result.success) {
          return result.data  // Return popular gift list
        } else {
          throw new Error(result.message || 'Failed to get popular gifts')
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Popular recommendations failed:', error)
      throw error
    }
  }

  /**
   * Get gift recommendations for specific occasions
   * 
   * Strategy Flow:
   * 1. Call enhanced API in occasion mode based on occasion type
   * 2. Backend: OpenAI generates specialized search keywords for the occasion → eBay API search → OpenAI filters products suitable for that occasion
   * 3. Returns 24 occasion-related gift recommendations
   * 
   * Supported occasions: Birthday, wedding, Christmas, Valentine's Day, Mother's Day, Father's Day, graduation, etc.
   * 
   * @param occasion Occasion name (e.g., birthday, wedding, christmas, etc.)
   * @returns Promise<Gift[]> List of occasion-based gift recommendations
   */
  async getOccasionGifts(occasion: string): Promise<Gift[]> {
    try {
      const requestBody = {
        mode: 'occasion',          // Specify occasion mode
        occasion: occasion,        // Specific occasion name
        limit: 24,                 // Return 24 recommendations
        budget_range: ['$25 - $120'],  // Price range for occasion gifts
        region: 'US'               // US market
      }

      // Call unified enhanced API
      const response = await fetch(`${this.baseUrl}/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const result: RecommendationResponse = await response.json()
        if (result.success) {
          return result.data  // Return occasion gift list
        } else {
          throw new Error(result.message || `Failed to get ${occasion} gifts`)
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`${occasion} occasion recommendations failed:`, error)
      throw error
    }
  }

  /**
   * Get API documentation and usage information
   * 
   * Used for debugging and understanding API usage methods
   * 
   * @returns Promise<any> API usage documentation
   */
  async getApiInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/enhanced`, {
        method: 'GET',  // GET request to retrieve documentation
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return await response.json()
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to get API info:', error)
      throw error
    }
  }
}

// Export singleton instance for frontend pages to use
export const recommendationAPI = new RecommendationAPI()