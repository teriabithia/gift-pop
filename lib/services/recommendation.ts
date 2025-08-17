import { openai, OPENAI_CONFIG, DEV_MODE } from '../openai'
import { 
  GIFT_RECOMMENDATION_PROMPT, 
  POPULAR_GIFTS_PROMPT, 
  OCCASION_GIFTS_PROMPT,
  UserPreferences 
} from '../prompts'
import { Gift } from '../types'
import { mockGifts } from '../mock-data'

export class RecommendationService {
  private static instance: RecommendationService
  private cache = new Map<string, { data: Gift[], timestamp: number }>()
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30分钟缓存

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  private getCacheKey(type: string, params: any): string {
    return `${type}-${JSON.stringify(params)}`
  }

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

  private async callOpenAI(prompt: string): Promise<any> {
    // Skip API call if development mode is enabled
    if (DEV_MODE.skipAPICall) {
      console.log('🚫 Skipping OpenAI API call (development mode)')
      throw new Error('API calls disabled (development mode)')
    }

    try {
                  const response = await openai.chat.completions.create({
              model: OPENAI_CONFIG.model,
              messages: [
                {
                  role: 'system',
                  content: 'You are a gift recommendation expert. Return ONLY valid JSON with the exact structure requested. No markdown, no explanations, no extra text.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: OPENAI_CONFIG.temperature,
              max_tokens: OPENAI_CONFIG.max_tokens,
              top_p: OPENAI_CONFIG.top_p,
              response_format: { type: "json_object" },
            })

      const content = response.choices[0]?.message?.content
      if (!content) {
        console.warn('Empty response from OpenAI, using fallback')
        return { gifts: [] }
      }

      // Clean the response content
      let cleanContent = content.trim()
      
      // Remove any markdown formatting
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      // Basic JSON cleaning
      cleanContent = cleanContent
        .replace(/[\u0000-\u0019]+/g, '') // Remove control characters
        .replace(/,\s*}/g, '}') // Remove trailing commas in objects
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      
      // Attempt to parse JSON with robust error handling
      try {
        const parsed = JSON.parse(cleanContent)
        if (parsed && parsed.gifts && Array.isArray(parsed.gifts)) {
          return parsed
        } else {
          console.warn('Invalid JSON structure, using fallback')
          return { gifts: [] }
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.log('Content length:', content.length)
        
        // Advanced JSON repair attempts
        let repairedContent = cleanContent
        
        // Fix common JSON issues
        repairedContent = repairedContent
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas before closing brackets
          .replace(/(["\w])\s*\n\s*(["\w])/g, '$1, $2') // Add missing commas between lines
          .replace(/"\s*:\s*([^",\[\{][^",\[\{]*?)(\s*[,\]\}])/g, '": "$1"$2') // Quote unquoted string values
          .replace(/:\s*([^",\[\{][^",\[\{]*?)(\s*$)/g, ': "$1"') // Quote values at end of content
        
        // Try parsing the repaired content
        try {
          const repairedParsed = JSON.parse(repairedContent)
          if (repairedParsed && repairedParsed.gifts && Array.isArray(repairedParsed.gifts)) {
            console.log('✅ Successfully repaired JSON')
            return repairedParsed
          }
        } catch (repairError) {
          console.log('JSON repair failed, trying extraction...')
        }
        
        // Try to extract valid JSON objects from truncated response
        const giftMatches = content.match(/"gifts":\s*\[([\s\S]*?)(?:\]|$)/)
        if (giftMatches) {
          let giftArrayStr = giftMatches[1]
          
          // Try to fix incomplete objects
          if (!giftArrayStr.endsWith('}')) {
            // Find the last complete object
            const lastCompleteObj = giftArrayStr.lastIndexOf('}')
            if (lastCompleteObj > 0) {
              giftArrayStr = giftArrayStr.substring(0, lastCompleteObj + 1)
            }
          }
          
          try {
            const giftArray = JSON.parse(`[${giftArrayStr}]`)
            console.log(`✅ Extracted ${giftArray.length} gifts from truncated JSON`)
            return { gifts: giftArray }
          } catch (extractError: any) {
            console.warn('Failed to extract gifts from truncated JSON:', extractError.message)
          }
        }
        
        return { gifts: [] }
      }
    } catch (error: any) {
      console.error('OpenAI API Error:', error)
      
      // Provide specific error messages
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded, please check your account balance and billing details')
      } else if (error.status === 429) {
        throw new Error('OpenAI API requests too frequent, please try again later')
      } else if (error.status === 401) {
        throw new Error('Invalid OpenAI API key, please check your API key')
      } else {
        throw new Error(`OpenAI API call failed: ${error.message || 'Unknown error'}`)
      }
    }
  }

  private fallbackToMockData(count: number = 24): Gift[] {
    console.warn('Falling back to mock data due to API error')
    // Randomly select and return specified number of mock data
    const shuffled = [...mockGifts].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, mockGifts.length))
  }

  async getPersonalizedRecommendations(preferences: UserPreferences): Promise<Gift[]> {
    const cacheKey = this.getCacheKey('personalized', preferences)
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const prompt = GIFT_RECOMMENDATION_PROMPT(preferences)
      const response = await this.callOpenAI(prompt)
      
      const gifts: Gift[] = response.gifts?.map((item: any, index: number) => ({
        id: item.id || `ai-rec-${Date.now()}-${index}`,
        name: item.name || 'Gift Item',
        brand: item.brand || 'Not Available',
        price: Number(item.price) || 0,
        rating: Number(item.rating) || 0, // 0 means no rating
        reviewCount: Number(item.reviewCount) || 0,
        image: item.image || '/gift-placeholder.jpg',
        shopUrl: item.shopUrl || '#',
        category: item.category || 'General',
        tags: Array.isArray(item.tags) ? item.tags : ['recommended'],
      })) || []

      if (gifts.length === 0) {
        throw new Error('No recommendations received')
      }

      // 缓存结果
      this.setCache(cacheKey, gifts)
      return gifts

    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return this.fallbackToMockData(24)
    }
  }

  async getPopularGifts(): Promise<Gift[]> {
    const cacheKey = this.getCacheKey('popular', {})
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const prompt = POPULAR_GIFTS_PROMPT()
      const response = await this.callOpenAI(prompt)
      
      const gifts: Gift[] = response.gifts?.map((item: any, index: number) => ({
        id: item.id || `ai-popular-${Date.now()}-${index}`,
        name: item.name || 'Popular Gift',
        brand: item.brand || 'Not Available',
        price: Number(item.price) || 0,
        rating: Number(item.rating) || 0, // 0 means no rating
        reviewCount: Number(item.reviewCount) || 0,
        image: item.image || '/gift-placeholder.jpg',
        shopUrl: item.shopUrl || '#',
        category: item.category || 'Trending',
        tags: Array.isArray(item.tags) ? item.tags : ['popular', 'trending'],
      })) || []

      if (gifts.length === 0) {
        throw new Error('No popular gifts received')
      }

      // 缓存结果
      this.setCache(cacheKey, gifts)
      return gifts

    } catch (error) {
      console.error('Error getting popular gifts:', error)
      return this.fallbackToMockData(30)
    }
  }

  async getOccasionGifts(occasion: string): Promise<Gift[]> {
    const cacheKey = this.getCacheKey('occasion', { occasion })
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const prompt = OCCASION_GIFTS_PROMPT(occasion)
      const response = await this.callOpenAI(prompt)
      
      const gifts: Gift[] = response.gifts?.map((item: any, index: number) => ({
        id: item.id || `ai-occasion-${Date.now()}-${index}`,
        name: item.name || 'Occasion Gift',
        brand: item.brand || 'Not Available',
        price: Number(item.price) || 0,
        rating: Number(item.rating) || 0, // 0 means no rating
        reviewCount: Number(item.reviewCount) || 0,
        image: item.image || '/gift-placeholder.jpg',
        shopUrl: item.shopUrl || '#',
        category: item.category || 'Occasion',
        tags: Array.isArray(item.tags) ? item.tags : [occasion.toLowerCase(), 'occasion'],
      })) || []

      if (gifts.length === 0) {
        throw new Error('No occasion gifts received')
      }

      // 缓存结果
      this.setCache(cacheKey, gifts)
      return gifts

    } catch (error) {
      console.error('Error getting occasion gifts:', error)
      return this.fallbackToMockData(24)
    }
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

export const recommendationService = RecommendationService.getInstance()
