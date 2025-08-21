import { openai, OPENAI_CONFIG, DEV_MODE } from '../openai'
import { Gift } from '../types'
import { mockGifts } from '../mock-data'
import { ebayService } from '../ebay-service'
import {
  PERSONALIZED_EBAY_SEARCH_PROMPT,
  POPULAR_EBAY_SEARCH_PROMPT,
  OCCASION_EBAY_SEARCH_PROMPT,
  EBAY_RESULT_ANALYSIS_PROMPT,
  OCCASION_CONFIGS,
  PersonalizedContext,
  PopularContext,
  OccasionContext,
  EbaySearchPlan
} from '../ebay-prompts'

/**
 * 三种推荐模式的输入数据结构定义
 */

// 个性化推荐输入接口
export interface PersonalizedInput {
  answers: {
    relationship: string        // 关系类型（朋友、家人等）
    gender?: string            // 性别
    age_range?: string         // 年龄范围
    interests?: string[]       // 兴趣爱好列表
    budget_range?: string[]    // 预算范围（字符串格式：["$25 - $100"]）
    special_preferences?: string // 特殊偏好
  }
  limit?: number              // 返回结果数量限制
  region?: string             // 地区（如：US）
}

// 热门推荐输入接口
export interface PopularInput {
  limit?: number              // 返回结果数量限制
  budget_range?: string[]     // 预算范围
  region?: string             // 地区
}

// 场合推荐输入接口
export interface OccasionInput {
  occasion: string            // 场合名称（birthday, wedding等）
  limit?: number              // 返回结果数量限制
  budget_range?: string[]     // 预算范围
  region?: string             // 地区
}

/**
 * 增强推荐服务类 - 核心业务逻辑
 * 
 * 实现完整的三模式混合推荐策略：
 * 用户输入/热门默认条件/场合默认条件 → OpenAI(生成搜索关键词) → eBay API(搜索商品) → OpenAI(分析筛选) → 返回结果(真实链接)
 * 
 * 三种推荐模式：
 * 1. 个性化推荐 - 基于用户偏好和关系
 * 2. 热门推荐 - 当前流行和趋势商品
 * 3. 场合推荐 - 特定场合的合适礼物
 */
export class RecommendationService {
  private static instance: RecommendationService
  private cache = new Map<string, { data: Gift[], timestamp: number }>()
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30分钟缓存过期时间

  /**
   * 单例模式 - 获取推荐服务实例
   */
  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  /**
   * 生成缓存键
   * @param type 推荐类型
   * @param params 参数对象
   * @returns 缓存键字符串
   */
  private getCacheKey(type: string, params: any): string {
    return `${type}-${JSON.stringify(params)}`
  }

  /**
   * 从缓存获取数据
   * @param key 缓存键
   * @returns 缓存的礼物列表或null
   */
  private getFromCache(key: string): Gift[] | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 要缓存的礼物列表
   */
  private setCache(key: string, data: Gift[]): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * 解析预算范围字符串为数字对象
   * 
   * 将前端的预算字符串格式（如："$25 - $100"）转换为后端需要的数字格式
   * 
   * @param budgetRange 预算范围字符串数组
   * @returns 预算范围数字对象 {min, max}
   */
  private parseBudgetRange(budgetRange?: string[]): { min: number; max: number } {
    if (!budgetRange || budgetRange.length === 0) {
      return { min: 25, max: 100 }  // 默认预算范围
    }

    const range = budgetRange[0]
    // 匹配 "$25 - $100" 格式
    const match = range.match(/\$(\d+)\s*-\s*\$(\d+)/)
    if (match) {
      return {
        min: parseInt(match[1]),
        max: parseInt(match[2])
      }
    }

    // 备用解析：提取所有数字
    const numbers = range.match(/\d+/g)
    if (numbers && numbers.length >= 2) {
      return {
        min: parseInt(numbers[0]),
        max: parseInt(numbers[1])
      }
    }

    return { min: 25, max: 100 }  // 默认值
  }

  /**
   * 调用OpenAI API - 核心AI功能
   * 
   * 用于两个关键步骤：
   * 1. 生成eBay搜索策略和关键词
   * 2. 分析和筛选eBay搜索结果
   * 
   * @param prompt OpenAI提示词
   * @returns OpenAI响应的JSON对象
   */
  private async callOpenAI(prompt: string): Promise<any> {
    // 开发模式跳过API调用
    if (DEV_MODE.skipAPICall) {
      console.log('🚫 跳过OpenAI API调用 (开发模式)')
      throw new Error('API调用已禁用 (开发模式)')
        }

    try {
      const response = await openai.chat.completions.create({
              model: OPENAI_CONFIG.model,
              messages: [
                {
                  role: 'system',
            content: '你是专业的礼物推荐顾问和eBay搜索策略师。只返回有效的JSON格式，不要markdown，不要解释，不要额外文本。'
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
        throw new Error('OpenAI返回空响应')
      }

      const parsed = JSON.parse(content)
      return parsed
    } catch (error: any) {
      console.error('OpenAI API错误:', error)
      // 提供具体的错误信息
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API配额不足')
      } else if (error.status === 429) {
        throw new Error('OpenAI API请求频率超限')
      } else if (error.status === 401) {
        throw new Error('OpenAI API密钥无效')
      } else {
        throw new Error(`OpenAI API调用失败: ${error.message || '未知错误'}`)
      }
    }
  }

  /**
   * 执行eBay搜索 - 根据OpenAI生成的搜索计划
   * 
   * 这是策略中的第二步：使用AI生成的关键词在eBay上搜索真实商品
   * 
   * @param searchPlan OpenAI生成的eBay搜索计划
   * @returns eBay商品列表
   */
  private async executeEbaySearch(searchPlan: EbaySearchPlan): Promise<any[]> {
    if (!ebayService.isAvailable()) {
      throw new Error('eBay API不可用')
    }

    const { primary_keywords, filters, search_strategy } = searchPlan.search_plan
    let allResults: any[] = []

    console.log(`执行eBay搜索，使用${primary_keywords.length}个关键词`)

    // 遍历每个AI生成的关键词进行搜索
    for (const keyword of primary_keywords) {
      try {
        console.log(`在eBay搜索: "${keyword}"`)
        
        const results = await ebayService.searchProducts(keyword, {
          limit: Math.ceil(search_strategy.total_candidates_target / primary_keywords.length),
          priceRange: {
            min: filters.price_range.min,
            max: filters.price_range.max
          },
          condition: 'New',         // 只搜索全新商品
          sortOrder: 'BestMatch'    // 使用eBay的最佳匹配排序
        })

        console.log(`"${keyword}"找到${results.length}个结果`)
        allResults = [...allResults, ...results]

        // 添加小延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`eBay搜索关键词"${keyword}"失败:`, error)
      }
    }

    // 根据商品ID去重
    const uniqueResults = allResults.filter((item, index, self) => 
      index === self.findIndex(t => t.itemId === item.itemId)
    )

    console.log(`eBay搜索总计找到${uniqueResults.length}个唯一商品`)
    return uniqueResults
  }

  /**
   * 使用OpenAI分析和筛选eBay结果 - 策略的最后一步
   * 
   * 这是策略中的第三步：让AI从大量eBay商品中筛选出最合适的礼物
   * 
   * @param searchContext 搜索上下文描述
   * @param ebayResults eBay搜索结果列表
   * @param maxResults 最大返回结果数
   * @returns 筛选后的礼物列表
   */
  private async analyzeEbayResults(
    searchContext: string,
    ebayResults: any[],
    maxResults: number
  ): Promise<Gift[]> {
    if (ebayResults.length === 0) {
      return []
    }

    try {
      // 使用专门的分析提示词让AI筛选最佳商品
      const analysisPrompt = EBAY_RESULT_ANALYSIS_PROMPT(searchContext, ebayResults, maxResults)
      const analysis = await this.callOpenAI(analysisPrompt)
      
      if (!analysis.selected_gifts || !Array.isArray(analysis.selected_gifts)) {
        throw new Error('AI分析响应格式无效')
      }

      const selectedGifts: Gift[] = []
      
      // 根据AI的选择构建最终的礼物列表
      for (const selection of analysis.selected_gifts) {
        const ebayItem = ebayResults.find(item => item.itemId === selection.ebay_item_id)
        if (ebayItem) {
          const gift = ebayService.transformToGift(ebayItem)
          selectedGifts.push({
            ...gift,
            // 添加AI分析的元数据
            selectionReason: selection.selection_reason,  // AI选择理由
            giftScore: selection.gift_score,              // 礼物评分
            matchFactors: selection.match_factors         // 匹配因素
          })
        }
      }

      console.log(`OpenAI从${ebayResults.length}个候选商品中选择了${selectedGifts.length}个礼物`)
      return selectedGifts

    } catch (error) {
      console.warn('OpenAI分析失败，使用直接转换:', error)
      
      // 备用方案：直接转换前N个结果
      return ebayResults
        .slice(0, maxResults)
        .map(item => ebayService.transformToGift(item))
    }
  }

  /**
   * 最终备用方案 - 使用模拟数据
   * 
   * 当所有AI和API都失败时的最后保障
   * 
   * @param count 返回的礼物数量
   * @returns 模拟礼物数据
   */
  private fallbackToMockData(count: number = 24): Gift[] {
    console.warn('回退到模拟数据')
    const shuffled = [...mockGifts].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, mockGifts.length))
  }

  /**
   * 模式1：个性化推荐
   * 
   * 完整策略流程：
   * 1. 用户输入个人偏好 → 构建个性化上下文
   * 2. OpenAI分析用户偏好 → 生成针对性的eBay搜索策略
   * 3. eBay API搜索相关商品 → 获取真实商品数据
   * 4. OpenAI分析所有商品 → 筛选最符合用户偏好的礼物
   * 5. 返回个性化推荐结果（带真实购买链接）
   * 
   * @param input 个性化推荐输入参数
   * @returns 个性化推荐的礼物列表
   */
  async getPersonalizedRecommendations(input: PersonalizedInput): Promise<Gift[]> {
    const cacheKey = this.getCacheKey('personalized', input)
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log('使用缓存的个性化推荐')
      return cached
    }

    try {
      const budget = this.parseBudgetRange(input.answers.budget_range)
      
      // 第一步：构建个性化上下文给OpenAI
      const context: PersonalizedContext = {
        relationship: input.answers.relationship,
        demographics: {
          gender: input.answers.gender,
          age_range: input.answers.age_range
        },
        interests: input.answers.interests || [],
        constraints: {
          budget: {
            min_price: budget.min,
            max_price: budget.max,
            currency: 'USD'
          },
          preferences: input.answers.special_preferences,
          avoid: []
        }
      }

      console.log('生成个性化eBay搜索计划...')
      
      // 第二步：OpenAI生成eBay搜索计划
      const searchPrompt = PERSONALIZED_EBAY_SEARCH_PROMPT(context)
      const searchPlan: EbaySearchPlan = await this.callOpenAI(searchPrompt)

      // 第三步：执行eBay搜索
      const ebayResults = await this.executeEbaySearch(searchPlan)

      if (ebayResults.length === 0) {
        throw new Error('eBay搜索无结果')
      }

      // 第四步：OpenAI分析和筛选结果
      const searchContext = `为${context.relationship}推荐个性化礼物 (${context.demographics?.gender || '任意性别'}, ${context.demographics?.age_range || '成人'}), 兴趣: ${context.interests.join(', ')}, 预算: $${context.constraints.budget.min_price}-$${context.constraints.budget.max_price}`
      
      const selectedGifts = await this.analyzeEbayResults(
        searchContext,
        ebayResults,
        input.limit || 20
      )

      // 缓存结果
      this.setCache(cacheKey, selectedGifts)
      console.log(`个性化推荐完成，返回${selectedGifts.length}个礼物`)
      return selectedGifts

    } catch (error) {
      console.error('个性化推荐失败:', error)
      return this.fallbackToMockData(input.limit || 20)
    }
  }

  /**
   * 模式2：热门推荐
   * 
   * 完整策略流程：
   * 1. 使用热门默认搜索条件 → 构建热门推荐上下文
   * 2. OpenAI分析当前趋势 → 生成热门商品的eBay搜索策略
   * 3. eBay API搜索热门商品 → 获取当前流行的真实商品
   * 4. OpenAI分析商品流行度 → 筛选最受欢迎的礼物
   * 5. 返回热门推荐结果（真实热门商品链接）
   * 
   * @param input 热门推荐输入参数
   * @returns 热门推荐的礼物列表
   */
  async getPopularGifts(input: PopularInput = {}): Promise<Gift[]> {
    const cacheKey = this.getCacheKey('popular', input)
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log('使用缓存的热门推荐')
      return cached
    }

    try {
      const budget = this.parseBudgetRange(input.budget_range)
      
      // 第一步：构建热门推荐上下文
      const context: PopularContext = {
        target_audience: 'general_adult',  // 目标受众：普通成人
        budget: {
          min_price: budget.min,
          max_price: budget.max,
          currency: 'USD'
        },
        // 热门商品的分类分布权重
        categories: {
          electronics: 0.25,           // 电子产品 25%
          home_garden: 0.20,           // 家居园艺 20%
          beauty_personal_care: 0.15,  // 美容个护 15%
          books_media: 0.10,           // 图书媒体 10%
          sports_outdoors: 0.10,       // 运动户外 10%
          toys_games: 0.10,            // 玩具游戏 10%
          other: 0.10                  // 其他 10%
        },
        quality_filters: {
          min_rating: 4.0,      // 最低4星评分
          min_reviews: 50,      // 最少50个评价
          availability: 'in_stock'  // 有库存
        }
      }

      console.log('生成热门礼物eBay搜索计划...')
      
      // 第二步：OpenAI生成热门商品搜索计划
      const searchPrompt = POPULAR_EBAY_SEARCH_PROMPT(context)
      const searchPlan: EbaySearchPlan = await this.callOpenAI(searchPrompt)

      // 第三步：执行eBay搜索
      const ebayResults = await this.executeEbaySearch(searchPlan)

      if (ebayResults.length === 0) {
        throw new Error('eBay搜索无结果')
      }

      // 第四步：OpenAI分析和筛选热门商品
      const searchContext = `热门流行礼物推荐，面向普通成人，预算: $${context.budget.min_price}-$${context.budget.max_price}，重点关注高评分和广泛受欢迎的商品`
      
      const selectedGifts = await this.analyzeEbayResults(
        searchContext,
        ebayResults,
        input.limit || 30
      )

      // 缓存结果
      this.setCache(cacheKey, selectedGifts)
      console.log(`热门推荐完成，返回${selectedGifts.length}个礼物`)
      return selectedGifts

    } catch (error) {
      console.error('热门推荐失败:', error)
      return this.fallbackToMockData(input.limit || 30)
    }
  }

  /**
   * 模式3：场合推荐
   * 
   * 完整策略流程：
   * 1. 场合默认搜索条件 → 构建特定场合上下文
   * 2. OpenAI分析场合特点 → 生成场合专用的eBay搜索策略
   * 3. eBay API搜索场合商品 → 获取适合该场合的真实商品
   * 4. OpenAI分析场合适配性 → 筛选最适合该场合的礼物
   * 5. 返回场合推荐结果（真实场合礼物链接）
   * 
   * 支持场合：生日、婚礼、圣诞节、情人节、母亲节、父亲节、毕业典礼等
   * 
   * @param input 场合推荐输入参数
   * @returns 场合推荐的礼物列表
   */
  async getOccasionGifts(input: OccasionInput): Promise<Gift[]> {
    const cacheKey = this.getCacheKey('occasion', input)
    
    // 检查缓存
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      console.log(`使用缓存的${input.occasion}场合推荐`)
      return cached
    }

    try {
      const budget = this.parseBudgetRange(input.budget_range)
      // 获取预定义的场合配置（如果存在）
      const occasionConfig = OCCASION_CONFIGS[input.occasion.toLowerCase() as keyof typeof OCCASION_CONFIGS]
      
      // 使用场合配置或回退到自定义预算
      const finalBudget = occasionConfig ? occasionConfig.budget : budget
      
      // 第一步：构建场合推荐上下文
      const context: OccasionContext = {
        occasion_type: input.occasion,
        audience: 'individual',  // 受众类型
        budget: {
          // 类型安全的预算处理
          min_price: (finalBudget as any).min_price || (finalBudget as any).min || budget.min,
          max_price: (finalBudget as any).max_price || (finalBudget as any).max || budget.max
        },
        // 场合风格偏好（复制数组避免只读问题）
        style_preferences: occasionConfig?.style_preferences ? [...occasionConfig.style_preferences] : ['thoughtful', 'appropriate'],
        practical_considerations: {
          occasion_formality: occasionConfig ? 'configured' : 'general',  // 正式程度
          gift_presentation: 'important',        // 礼品包装重要
          seasonal_appropriateness: true         // 季节适宜性
        }
      }

      console.log(`生成${input.occasion}场合礼物eBay搜索计划...`)
      
      // 第二步：OpenAI生成场合专用搜索计划
      const searchPrompt = OCCASION_EBAY_SEARCH_PROMPT(context)
      const searchPlan: EbaySearchPlan = await this.callOpenAI(searchPrompt)

      // 第三步：执行eBay搜索
      const ebayResults = await this.executeEbaySearch(searchPlan)

      if (ebayResults.length === 0) {
        throw new Error('eBay搜索无结果')
      }

      // 第四步：OpenAI分析和筛选场合适用商品
      const searchContext = `${input.occasion}场合礼物推荐，预算: $${context.budget.min_price}-$${context.budget.max_price}，风格: ${context.style_preferences.join(', ')}`
      
      const selectedGifts = await this.analyzeEbayResults(
        searchContext,
        ebayResults,
        input.limit || 24
      )

      // 缓存结果
      this.setCache(cacheKey, selectedGifts)
      console.log(`${input.occasion}场合推荐完成，返回${selectedGifts.length}个礼物`)
      return selectedGifts

    } catch (error) {
      console.error(`${input.occasion}场合推荐失败:`, error)
      return this.fallbackToMockData(input.limit || 24)
    }
  }

  /**
   * 清理过期缓存
   * 
   * 定期清理超过30分钟的缓存数据，释放内存
   */
  clearExpiredCache(): void {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`清理了${cleanedCount}个过期缓存项`)
    }
  }
}

// 导出单例实例，供API路由使用
export const recommendationService = RecommendationService.getInstance()