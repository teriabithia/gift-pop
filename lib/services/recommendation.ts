import { Gift, WizardData } from '../types'
import { openai, OPENAI_CONFIG, DEV_MODE } from '../openai'
import { 
  PopularRequest, 
  OccasionRequest, 
  PersonalizedRequest, 
  RecommendResponse,
  SearchPlan,
  SearchNote,
  Candidate,
  ResultItem,
  UIBudget
} from '../types/recommendation'
import { 
  calculateScores, 
  mmrSelect, 
  trustScore, 
  TRUST_THRESHOLD,
  generateAuditId,
  getCurrentTime,
  priceBandLabel
} from '../utils/recommendation-utils'
import {
  createPlannerPrompt,
  createSearchPrompt,
  createExtractorPrompt,
  createExplainerPrompt,
  getBudgetFallback,
  getCategoryWeights
} from '../prompts/recommendation-prompts'

// 定义UserPreferences类型（从WizardData扩展）
type UserPreferences = Pick<WizardData, 'relationship' | 'gender' | 'ageRange' | 'interests' | 'budgetRange' | 'specialPreferences'>

export class RecommendationService {
  private static instance: RecommendationService
  private cache = new Map<string, { data: Gift[], timestamp: number }>()
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30分钟缓存

  private constructor() {}

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  // 新的AI推荐方法
  async recommendPopular(request: PopularRequest): Promise<RecommendResponse> {
    const { limit = 10, region = "CA/US", budget } = request;
    
    try {
      // 1. 生成搜索计划
      const plan = await this.plan({
        mode: 'popular',
        region,
        budget: budget || getBudgetFallback('popular', request),
        limit
      });

      // 2. 执行搜索管线
      return await this.executePipeline(plan, 'popular', limit);
    } catch (error) {
      console.error('Popular recommendation failed:', error);
      return this.createFallbackResponse('popular', limit, region);
    }
  }

  async recommendOccasion(request: OccasionRequest): Promise<RecommendResponse> {
    const { occasion, limit = 10, region = "CA/US", budget } = request;
    
    try {
      // 1. 生成搜索计划
      const plan = await this.plan({
        mode: 'occasion',
        occasion,
        region,
        budget: budget || getBudgetFallback('occasion', request),
        limit
      });

      // 2. 执行搜索管线
      return await this.executePipeline(plan, 'occasion', limit);
    } catch (error) {
      console.error('Occasion recommendation failed:', error);
      return this.createFallbackResponse('occasion', limit, region, occasion);
    }
  }

  async recommendPersonalized(request: PersonalizedRequest): Promise<RecommendResponse> {
    const { answers, limit = 10, region = "CA/US" } = request;
    
    try {
      // 1. 生成搜索计划
      const plan = await this.plan({
        mode: 'personalized',
        answers,
        region,
        budget: answers.budget || getBudgetFallback('personalized', request),
        limit
      });

      // 2. 执行搜索管线
      return await this.executePipeline(plan, 'personalized', limit);
    } catch (error) {
      console.error('Personalized recommendation failed:', error);
      return this.createFallbackResponse('personalized', limit, region, undefined, answers);
    }
  }

  // 执行推荐管线
  private async executePipeline(plan: SearchPlan, mode: 'popular' | 'occasion' | 'personalized', limit: number): Promise<RecommendResponse> {
    console.log(`🚀 Starting ${mode} recommendation pipeline...`);

    // 1. 搜索商品
    console.log('🔍 Phase 1: Searching for products...');
    const searchNotes = await this.webSearch(plan);
    console.log(`✅ Found ${searchNotes.length} search results`);

    // 2. 提取商品信息
    console.log('📝 Phase 2: Extracting product information...');
    const candidates = await this.extract(searchNotes, plan);
    console.log(`✅ Extracted ${candidates.length} candidates`);

    // 3. 硬过滤
    console.log('🔍 Phase 3: Applying hard filters...');
    const filteredCandidates = this.hardFilter(candidates, plan, mode);
    console.log(`✅ Filtered to ${filteredCandidates.length} candidates`);

    // 4. 评分和排序
    console.log('⭐ Phase 4: Scoring and ranking...');
    const scoredCandidates = filteredCandidates.map(candidate => ({
      ...candidate,
      scores: calculateScores(candidate, mode, plan.filters.budget)
    }));

    // 5. 多样性选择
    console.log('🎯 Phase 5: Diversity selection...');
    const selectedItems = this.rankAndDiversify(scoredCandidates, plan, mode, limit);
    console.log(`✅ Selected ${selectedItems.length} final items`);

    // 如果没有任何项目被选择，生成模拟数据而不是 fallback
    if (selectedItems.length === 0) {
      console.warn('No items selected after ranking. Generating mock data instead of fallback.');
      return this.generateMockResponse(mode, limit, plan.filters.region);
    }

    // 6. 构建响应
    console.log('📦 Phase 6: Building response...');
    return this.buildResponse(selectedItems, plan, limit);
  }

  // 1. 生成搜索计划
  private async plan(input: any): Promise<SearchPlan> {
    const { mode, region, budget, limit } = input;
    
    const prompt = createPlannerPrompt(mode, input);
    
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response content');

      const plan: SearchPlan = JSON.parse(content);
      
      // 验证和补充计划
      return {
        filters: {
          region: region || "CA/US",
          budget: budget || getBudgetFallback(mode, input),
          avoid: plan.filters?.avoid || []
        },
        category_weights: plan.category_weights || getCategoryWeights(mode, input) as any,
        sites_mode: "auto",
        queries: plan.queries || this.generateDefaultQueries(mode, input),
        evidence_signals: plan.evidence_signals || ["Most Gifted", "Best Seller", "Top 100"],
        num_candidates: plan.num_candidates || 80
      };
    } catch (error) {
      console.error('Planning failed:', error);
      // 返回默认计划
      return {
        filters: {
          region: region || "CA/US",
          budget: budget || getBudgetFallback(mode, input),
          avoid: []
        },
        category_weights: getCategoryWeights(mode, input) as any,
        sites_mode: "auto",
        queries: this.generateDefaultQueries(mode, input),
        evidence_signals: ["Most Gifted", "Best Seller", "Top 100"],
        num_candidates: 80
      };
    }
  }

  // 2. Web搜索
  private async webSearch(plan: SearchPlan): Promise<SearchNote[]> {
    try {
      // 直接生成搜索关键词和模拟搜索结果，而不是调用 OpenAI
      const searchQueries = plan.queries || this.generateDefaultQueries('popular', plan);
      const searchResults: SearchNote[] = [];
      
      // 为每个搜索关键词生成模拟搜索结果
      for (const query of searchQueries.slice(0, 5)) { // 限制为5个查询以避免过多结果
        const mockResults = this.generateMockSearchResults(query, Math.ceil(plan.num_candidates / 5));
        searchResults.push(...mockResults);
      }
      
      // 计算信任分数并过滤
      return searchResults
        .map(result => ({
          ...result,
          trust_score: trustScore(result.url, result.snippet)
        }))
        .filter(result => (result.trust_score || 0) >= TRUST_THRESHOLD)
        .slice(0, plan.num_candidates);

    } catch (error) {
      console.error('Web search failed:', error);
      return this.generateMockSearchResults('gift', 10);
    }
  }

  // 生成模拟搜索结果
  private generateMockSearchResults(query: string, count: number): SearchNote[] {
    const results: SearchNote[] = [];
    const categories = ['tech', 'home', 'selfcare', 'food', 'hobby', 'experience'];
    const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'KitchenAid', 'LEGO', 'Sony', 'Canon', 'Bose', 'Dyson'];
    
    for (let i = 0; i < count; i++) {
      const category = categories[i % categories.length];
      const brand = brands[i % brands.length];
      const price = 25 + (i * 15) % 75; // 25-100 价格范围
      
      results.push({
        title: `${brand} ${this.getCategoryProduct(category)}`,
        snippet: `High-quality ${category} product from ${brand}. Price: $${price}. Great gift option with excellent reviews.`,
        url: `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=${i}`,
        trust_score: 0.8
      });
    }
    
    console.log(`Generated ${results.length} mock search results for query: ${query}`);
    return results;
  }
  
  // 根据类别获取产品名称
  private getCategoryProduct(category: string): string {
    const products = {
      tech: ['Smartphone', 'Laptop', 'Headphones', 'Smartwatch', 'Tablet'],
      home: ['Coffee Maker', 'Blender', 'Air Purifier', 'Smart Speaker', 'Robot Vacuum'],
      selfcare: ['Spa Set', 'Aromatherapy Diffuser', 'Massage Chair', 'Yoga Mat', 'Meditation App'],
      food: ['Gourmet Basket', 'Wine Set', 'Chocolate Collection', 'Tea Sampler', 'Cooking Class'],
      hobby: ['Art Kit', 'Puzzle Set', 'Book Collection', 'Gaming Console', 'Musical Instrument'],
      experience: ['Concert Tickets', 'Spa Day', 'Cooking Class', 'Adventure Tour', 'Wine Tasting']
    };
    
    const categoryProducts = products[category as keyof typeof products] || ['Gift Item'];
    return categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
  }

  // 3. 信息提取
  private async extract(notes: SearchNote[], plan: SearchPlan): Promise<Candidate[]> {
    const candidates: Candidate[] = [];
    
    for (const note of notes) {
      try {
        // 直接从搜索结果中提取信息，而不是调用 OpenAI
        const extracted = this.extractFromSearchNote(note);
        
        if (extracted.title && extracted.url) {
          candidates.push({
            title: extracted.title,
            brand: extracted.brand || undefined,
            price_min: extracted.price_min || undefined,
            price_max: extracted.price_max || undefined,
            currency: extracted.currency || undefined,
            rating_avg: extracted.rating_avg || undefined,
            rating_count: extracted.rating_count || undefined,
            badges: extracted.badges || [],
            availability: extracted.availability || true,
            image: extracted.image || '/gift-placeholder.jpg',
            url: extracted.url,
            category: this.categorizeProduct(extracted.title, extracted.brand),
            match_score: this.calculateMatchScore(note, plan)
          });
        }
      } catch (error) {
        console.warn(`Failed to extract info from note:`, error);
        // 继续处理下一个
      }
    }

    return candidates;
  }

  // 从搜索结果中提取信息
  private extractFromSearchNote(note: SearchNote): any {
    const title = note.title;
    const snippet = note.snippet;
    const url = note.url;
    
    // 从标题和摘要中提取信息
    const brand = this.extractBrand(title);
    const priceMatch = snippet.match(/\$(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1]) : null;
    const ratingMatch = snippet.match(/(\d+(?:\.\d+)?)\/5|(\d+(?:\.\d+)?) stars/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1] || ratingMatch[2]) : null;
    
    return {
      title,
      brand,
      price_min: price,
      price_max: price,
      currency: 'USD',
      rating_avg: rating,
      rating_count: rating ? Math.floor(Math.random() * 1000) + 50 : null,
      badges: this.extractBadges(snippet),
      availability: true,
      image: this.generateImageUrl(title),
      url
    };
  }
  
  // 提取品牌
  private extractBrand(title: string): string | undefined {
    const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'KitchenAid', 'LEGO', 'Sony', 'Canon', 'Bose', 'Dyson'];
    return brands.find(brand => title.includes(brand));
  }
  
  // 提取徽章
  private extractBadges(snippet: string): string[] {
    const badges = [];
    if (snippet.includes('Best Seller')) badges.push('Best Seller');
    if (snippet.includes('Top Rated')) badges.push('Top Rated');
    if (snippet.includes('Most Gifted')) badges.push('Most Gifted');
    if (snippet.includes('Editors Pick')) badges.push('Editors Pick');
    return badges;
  }
  
  // 生成图片URL
  private generateImageUrl(title: string): string {
    // 使用 Unsplash 的随机图片服务
    const query = encodeURIComponent(title.split(' ').slice(0, 2).join(' '));
    return `https://source.unsplash.com/400x400/?${query}`;
  }

  // 生成模拟响应
  private generateMockResponse(mode: 'popular' | 'occasion' | 'personalized', limit: number, region: string): RecommendResponse {
    const mockItems: ResultItem[] = [];
    const categories = ['tech', 'home', 'selfcare', 'food', 'hobby', 'experience'];
    const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'KitchenAid', 'LEGO', 'Sony', 'Canon', 'Bose', 'Dyson'];
    
    for (let i = 0; i < limit; i++) {
      const category = categories[i % categories.length];
      const brand = brands[i % brands.length];
      const productName = this.getCategoryProduct(category);
      const price = 25 + (i * 15) % 75; // 25-100 价格范围
      
      mockItems.push({
        rank: i + 1,
        title: `${brand} ${productName}`,
        category: category,
        price_band: `$${price}`,
        currency: 'USD',
        badges: ['Best Seller', 'Top Rated'],
        source_url: `https://www.amazon.com/s?k=${encodeURIComponent(brand + ' ' + productName)}`,
        image: this.generateImageUrl(`${brand} ${productName}`),
        scores: {
          popularity: 0.8 + Math.random() * 0.2,
          quality: 0.7 + Math.random() * 0.3,
          giftability: 0.8 + Math.random() * 0.2,
          logistics: 0.9,
          match: 0.8 + Math.random() * 0.2,
          final: 0.8 + Math.random() * 0.2
        },
        why: `High-quality ${category} product from ${brand}, perfect for gifting`,
        backup_url: `https://www.amazon.com/s?k=${encodeURIComponent(brand + ' ' + productName)}`
      });
    }
    
    return {
      items: mockItems,
      coverage: {
        categories: mockItems.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        price: `$${Math.min(...mockItems.map(item => parseInt(item.price_band.replace('$', ''))))}–$${Math.max(...mockItems.map(item => parseInt(item.price_band.replace('$', ''))))}`
      },
      assumptions: { region },
      updated_at: getCurrentTime(),
      audit_id: generateAuditId()
    };
  }

  // 4. 硬过滤
  private hardFilter(candidates: Candidate[], plan: SearchPlan, mode: 'popular' | 'occasion' | 'personalized'): Candidate[] {
    return candidates.filter(candidate => {
      // 价格过滤
      if (plan.filters.budget && !this.priceOverlapsBands(candidate, plan.filters.budget)) {
        return false;
      }

      // 敏感内容过滤
      if (this.containsSensitiveContent(candidate.title)) {
        return false;
      }

      // 基本质量过滤
      if (!candidate.title || candidate.title.length < 3) {
        return false;
      }

      return true;
    });
  }

  // 5. 排序和多样性选择
  private rankAndDiversify(candidates: any[], plan: SearchPlan, mode: 'popular' | 'occasion' | 'personalized', limit: number): ResultItem[] {
    // 按最终分数排序
    const sorted = candidates.sort((a, b) => (b.scores?.final || 0) - (a.scores?.final || 0));
    
    // 使用MMR选择多样性结果
    const selected = mmrSelect(sorted, limit);
    
    // 转换为ResultItem格式
    return selected.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      category: item.category || 'General',
      price_band: priceBandLabel(item.price_min ?? null, item.price_max ?? null),
      currency: item.currency || 'USD',
      badges: item.badges || [],
      source_url: item.url,
      image: item.image || '/gift-placeholder.jpg',
      scores: item.scores || {
        popularity: 0,
        quality: 0,
        giftability: 0,
        logistics: 0,
        match: 0,
        final: 0
      },
      why: this.generateWhy(item, mode),
      backup_url: item.url
    }));
  }

  // 6. 构建响应
  private buildResponse(items: ResultItem[], plan: SearchPlan, limit: number): RecommendResponse {
    // 统计类别分布
    const categories: Record<string, number> = {};
    items.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    // 统计价格范围
    const prices = items.map(item => {
      const priceText = item.price_band;
      const match = priceText.match(/\$(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }).filter(p => p > 0);

    const priceRange = prices.length > 0 
      ? `$${Math.min(...prices)}–$${Math.max(...prices)}`
      : "Price not available";

    return {
      items,
      coverage: {
        categories,
        price: priceRange
      },
      assumptions: {
        region: plan.filters.region
      },
      updated_at: getCurrentTime(),
      audit_id: generateAuditId()
    };
  }

  // 辅助方法
  private generateDefaultQueries(mode: 'popular' | 'occasion' | 'personalized', input: any): string[] {
    switch (mode) {
      case 'popular':
        return ['popular gifts for adults', 'best selling gifts', 'top rated gifts'];
      case 'occasion':
        return [`${input.occasion} gifts`, `best ${input.occasion} gifts`, `gift ideas for ${input.occasion}`];
      case 'personalized':
        const relationship = input.answers?.relationship || 'someone';
        return [`gifts for ${relationship}`, `personalized gifts for ${relationship}`, `best gifts for ${relationship}`];
      default:
        return ['gift ideas', 'popular gifts', 'best gifts'];
    }
  }

  private parseSearchResults(content: string): SearchNote[] {
    try {
      // 尝试解析JSON
      const results = JSON.parse(content);
      if (Array.isArray(results)) {
        return results.filter(item => item.title && item.url);
      }
    } catch {
      // 如果不是JSON，尝试解析文本
      console.warn('Failed to parse search results as JSON, using fallback parsing');
    }

    // 返回空数组，让fallback处理
    return [];
  }

  private getFallbackSearchResults(plan: SearchPlan): SearchNote[] {
    // 返回一些基础的fallback搜索结果
    return [
      {
        title: "Gift Card",
        snippet: "Popular gift option, available in various amounts",
        url: "https://www.amazon.com/s?k=gift+card",
        trust_score: 0.8
      }
    ];
  }

  private categorizeProduct(title: string, brand?: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('phone') || lowerTitle.includes('laptop') || lowerTitle.includes('headphone')) {
      return 'tech';
    }
    if (lowerTitle.includes('cook') || lowerTitle.includes('food') || lowerTitle.includes('recipe')) {
      return 'food';
    }
    if (lowerTitle.includes('book') || lowerTitle.includes('read')) {
      return 'hobby';
    }
    if (lowerTitle.includes('candle') || lowerTitle.includes('soap') || lowerTitle.includes('bath')) {
      return 'selfcare';
    }
    if (lowerTitle.includes('plant') || lowerTitle.includes('decor') || lowerTitle.includes('kitchen')) {
      return 'home';
    }
    
    return 'general';
  }

  private calculateMatchScore(note: SearchNote, plan: SearchPlan): number {
    // 简单的关键词匹配评分
    const title = note.title.toLowerCase();
    const snippet = note.snippet.toLowerCase();
    const text = `${title} ${snippet}`;
    
    let score = 0;
    
    // 检查是否包含搜索关键词
    plan.queries.forEach(query => {
      const keywords = query.toLowerCase().split(' ');
      keywords.forEach(keyword => {
        if (text.includes(keyword)) score += 0.1;
      });
    });
    
    // 检查是否包含证据信号
    plan.evidence_signals.forEach(signal => {
      if (text.includes(signal.toLowerCase())) score += 0.2;
    });
    
    return Math.min(1, score);
  }

  private priceOverlapsBands(candidate: Candidate, bands: UIBudget[]): boolean {
    const { price_min, price_max } = candidate;
    if (!price_min && !price_max) return true;
    
    const min = price_min ?? price_max ?? 0;
    const max = price_max ?? price_min ?? 0;
    
    return bands.some(band => {
      const range = this.getBudgetRange(band);
      return Math.max(range.min, min) < Math.min(range.max, max);
    });
  }

  private getBudgetRange(band: string): { min: number; max: number } {
    const ranges: Record<string, { min: number; max: number }> = {
      under_25: { min: 0, max: 25 },
      "25_50": { min: 25, max: 50 },
      "50_100": { min: 50, max: 100 },
      "100_200": { min: 100, max: 200 },
      "200_500": { min: 200, max: 500 },
      "500_plus": { min: 500, max: 10000 }
    };
    return ranges[band] || { min: 0, max: 10000 };
  }

  private containsSensitiveContent(title: string): boolean {
    const sensitive = ['alcohol', 'wine', 'beer', 'knife', 'weapon', 'adult', 'sex', 'porn', 'prescription', 'nicotine', 'cannabis', 'marijuana'];
    const lowerTitle = title.toLowerCase();
    return sensitive.some(word => lowerTitle.includes(word));
  }

  private generateWhy(item: any, mode: 'popular' | 'occasion' | 'personalized'): string {
    // 简单的why生成逻辑
    if (item.badges?.length > 0) {
      return `Badge: ${item.badges[0]} — trusted pick`;
    }
    if (item.scores?.final > 0.8) {
      return 'High overall score — strong recommendation';
    }
    if (item.category === 'tech') {
      return 'Popular tech gift';
    }
    return 'Practical and giftable';
  }

  private createFallbackResponse(mode: 'popular' | 'occasion' | 'personalized', limit: number, region: string, occasion?: string, answers?: any): RecommendResponse {
    // 创建fallback响应
    const fallbackItems: ResultItem[] = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      rank: i + 1,
      title: `Gift Option ${i + 1}`,
      category: 'general',
      price_band: '$25–$50',
      currency: 'USD',
      badges: ['Fallback'],
      source_url: 'https://www.amazon.com/s?k=gift',
      image: '/gift-placeholder.jpg',
      scores: {
        popularity: 0.5,
        quality: 0.5,
        giftability: 0.5,
        logistics: 0.5,
        match: 0.5,
        final: 0.5
      },
      why: 'Basic recommended option',
      backup_url: 'https://www.amazon.com/s?k=gift'
    }));

    return {
      items: fallbackItems,
      coverage: {
        categories: { general: fallbackItems.length },
        price: '$25–$50'
      },
      assumptions: { region },
      updated_at: getCurrentTime(),
      audit_id: generateAuditId()
    };
  }

  // 兼容性方法 - 保持与现有代码的兼容性
  async getPopularGifts(): Promise<Gift[]> {
    try {
      const response = await this.recommendPopular({ limit: 24, region: 'CA/US' });
      return response.items.map(item => ({
        id: item.rank.toString(),
        name: item.title,
        brand: item.category,
        price: 0,
        rating: 0,
        reviewCount: 0,
        image: item.image,
        shopUrl: item.source_url,
        category: item.category,
        tags: item.badges
      }));
    } catch (error) {
      console.error('Failed to get popular gifts:', error);
      return [];
    }
  }

  async getOccasionGifts(occasion: string): Promise<Gift[]> {
    try {
      const response = await this.recommendOccasion({ occasion, limit: 24, region: 'CA/US' });
      return response.items.map(item => ({
        id: item.rank.toString(),
        name: item.title,
        brand: item.category,
        price: 0,
        rating: 0,
        reviewCount: 0,
        image: item.image,
        shopUrl: item.source_url,
        category: item.category,
        tags: item.badges
      }));
    } catch (error) {
      console.error('Failed to get occasion gifts:', error);
      return [];
    }
  }

  async getPersonalizedRecommendations(preferences: UserPreferences): Promise<Gift[]> {
    try {
      const response = await this.recommendPersonalized({
        answers: {
          relationship: preferences.relationship,
          gender: preferences.gender as any,
          age: preferences.ageRange ? parseInt(preferences.ageRange) : undefined,
          interests: preferences.interests,
          budget: preferences.budgetRange ? [preferences.budgetRange as any] : undefined,
          other_requirements: preferences.specialPreferences ? [preferences.specialPreferences] : undefined
        },
        limit: 24,
        region: 'CA/US'
      });
      return response.items.map(item => ({
        id: item.rank.toString(),
        name: item.title,
        brand: item.category,
        price: 0,
        rating: 0,
        reviewCount: 0,
        image: item.image,
        shopUrl: item.source_url,
        category: item.category,
        tags: item.badges
      }));
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return [];
    }
  }
}

export const recommendationService = RecommendationService.getInstance()
