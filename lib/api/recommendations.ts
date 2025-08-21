import { Gift } from '../types'

/**
 * API响应接口定义
 * 统一的推荐API返回格式
 */
export interface RecommendationResponse {
  success: boolean    // 请求是否成功
  data: Gift[]       // 推荐的礼物列表
  count: number      // 礼物数量
  source: string     // 数据来源（如：'ai-ebay-hybrid'）
  mode: string       // 推荐模式（personalized/popular/occasion）
  timestamp?: string // 时间戳
  error?: string     // 错误信息
  message?: string   // 额外消息
}

/**
 * 前端推荐系统API客户端
 * 
 * 核心策略：三种推荐模式统一调用enhanced API
 * 1. 个性化推荐 (personalized) - 基于用户向导数据
 * 2. 热门推荐 (popular) - 当前流行的礼物
 * 3. 场合推荐 (occasion) - 特定场合的礼物
 * 
 * 所有模式都使用相同的后端流程：
 * 用户输入 → OpenAI生成搜索关键词 → eBay API搜索 → OpenAI分析筛选 → 返回结果
 */
class RecommendationAPI {
  private baseUrl = '/api/recommendations'

  /**
   * 获取个性化推荐
   * 
   * 策略流程：
   * 1. 将前端向导数据转换为API格式
   * 2. 调用enhanced API的personalized模式
   * 3. 后端：OpenAI分析用户偏好 → 生成eBay搜索关键词 → eBay API搜索真实商品 → OpenAI筛选最佳结果
   * 4. 返回20个个性化推荐礼物
   * 
   * @param preferences 用户偏好数据（来自向导）
   * @returns Promise<Gift[]> 个性化推荐的礼物列表
   */
  async getPersonalizedRecommendations(preferences: {
    relationship: string      // 关系（如：朋友、家人、同事）
    gender?: string          // 性别
    ageRange?: string        // 年龄范围
    interests: string[]      // 兴趣爱好列表
    budget?: { min: number; max: number }  // 预算范围
    specialPreferences?: string            // 特殊偏好
  }): Promise<Gift[]> {
    try {
      // 将前端数据格式转换为后端API期望的格式
      const requestBody = {
        mode: 'personalized',  // 指定个性化模式
        answers: {
          relationship: preferences.relationship,
          gender: preferences.gender,
          age_range: preferences.ageRange,
          interests: preferences.interests,
          // 将预算对象转换为字符串数组格式
          budget_range: preferences.budget 
            ? [`$${preferences.budget.min} - $${preferences.budget.max}`]
            : ['$25 - $100'],  // 默认预算范围
          special_preferences: preferences.specialPreferences
        },
        limit: 20,    // 返回20个推荐
        region: 'US'  // 美国市场
      }

      // 调用统一的enhanced API
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
          return result.data  // 返回推荐的礼物列表
        } else {
          throw new Error(result.message || 'Failed to get personalized recommendations')
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('个性化推荐失败:', error)
      throw error
    }
  }

  /**
   * 获取热门/流行礼物推荐
   * 
   * 策略流程：
   * 1. 使用预设的热门搜索条件
   * 2. 调用enhanced API的popular模式
   * 3. 后端：OpenAI生成热门礼物搜索关键词 → eBay API搜索 → OpenAI筛选最受欢迎的商品
   * 4. 返回30个热门推荐礼物
   * 
   * @returns Promise<Gift[]> 热门推荐的礼物列表
   */
  async getPopularGifts(): Promise<Gift[]> {
    try {
      const requestBody = {
        mode: 'popular',           // 指定热门模式
        limit: 30,                 // 返回30个推荐（比个性化更多）
        budget_range: ['$20 - $150'],  // 热门商品的价格范围
        region: 'US'               // 美国市场
      }

      // 调用统一的enhanced API
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
          return result.data  // 返回热门礼物列表
        } else {
          throw new Error(result.message || 'Failed to get popular gifts')
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('热门推荐失败:', error)
      throw error
    }
  }

  /**
   * 获取特定场合的礼物推荐
   * 
   * 策略流程：
   * 1. 根据场合类型调用enhanced API的occasion模式
   * 2. 后端：OpenAI根据场合生成专门的搜索关键词 → eBay API搜索 → OpenAI筛选适合该场合的商品
   * 3. 返回24个场合相关的推荐礼物
   * 
   * 支持的场合：生日、结婚、圣诞节、情人节、母亲节、父亲节、毕业等
   * 
   * @param occasion 场合名称（如：birthday, wedding, christmas等）
   * @returns Promise<Gift[]> 场合推荐的礼物列表
   */
  async getOccasionGifts(occasion: string): Promise<Gift[]> {
    try {
      const requestBody = {
        mode: 'occasion',          // 指定场合模式
        occasion: occasion,        // 具体场合名称
        limit: 24,                 // 返回24个推荐
        budget_range: ['$25 - $120'],  // 场合礼物的价格范围
        region: 'US'               // 美国市场
      }

      // 调用统一的enhanced API
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
          return result.data  // 返回场合礼物列表
        } else {
          throw new Error(result.message || `Failed to get ${occasion} gifts`)
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`${occasion}场合推荐失败:`, error)
      throw error
    }
  }

  /**
   * 获取API文档和使用信息
   * 
   * 用于调试和了解API的使用方法
   * 
   * @returns Promise<any> API使用文档
   */
  async getApiInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/enhanced`, {
        method: 'GET',  // GET请求获取文档
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
      console.error('获取API信息失败:', error)
      throw error
    }
  }
}

// 导出单例实例，供前端页面使用
export const recommendationAPI = new RecommendationAPI()