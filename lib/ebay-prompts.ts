/**
 * eBay-optimized OpenAI prompts for gift recommendation system
 * Supports three modes: personalized, popular, occasion
 */

export interface PersonalizedContext {
  relationship: string
  demographics?: {
    gender?: string
    age_range?: string
  }
  interests: string[]
  constraints: {
    budget: {
      min_price: number
      max_price: number
      currency: string
    }
    preferences?: string
    avoid?: string[]
  }
}

export interface PopularContext {
  target_audience: string
  budget: {
    min_price: number
    max_price: number
    currency: string
  }
  categories: Record<string, number>
  quality_filters: {
    min_rating: number
    min_reviews: number
    availability: string
  }
}

export interface OccasionContext {
  occasion_type: string
  audience: string
  budget: {
    min_price: number
    max_price: number
  }
  style_preferences: string[]
  practical_considerations?: Record<string, any>
}

export interface EbaySearchPlan {
  search_plan: {
    primary_keywords: string[]
    ebay_categories: string[]
    filters: {
      price_range: { min: number; max: number }
      condition: string[]
      shipping: string[]
      seller_rating: string
      return_policy: string
    }
    search_strategy: {
      queries_per_category: number
      total_candidates_target: number
      diversity_requirement: string
    }
  }
}

/**
 * Generate eBay search keywords for personalized gifts
 */
export function PERSONALIZED_EBAY_SEARCH_PROMPT(context: PersonalizedContext): string {
  return `You are an expert gift consultant and eBay search strategist. Generate optimized eBay search keywords and strategy for finding personalized gifts.

RECIPIENT PROFILE:
- Relationship: ${context.relationship}
- Demographics: ${context.demographics?.gender || 'Any'} ${context.demographics?.age_range || 'Adult'}
- Interests: ${context.interests.join(', ')}
- Budget: $${context.constraints.budget.min_price} - $${context.constraints.budget.max_price} ${context.constraints.budget.currency}
- Preferences: ${context.constraints.preferences || 'None specified'}
- Avoid: ${context.constraints.avoid?.join(', ') || 'None specified'}

TASK: Generate eBay-optimized search strategy that will find relevant, high-quality gifts matching this profile.

REQUIREMENTS:
1. Create 4-6 PRODUCT KEYWORDS mixing specific and general terms (e.g., "headphones", "phone accessories", "books")
2. Use commonly available product categories on eBay (electronics, books, accessories, home decor, etc.)
3. Balance between specific brands and generic categories to maximize matches
4. Include both interest-based and general gift categories
5. Prioritize commonly searched terms that likely exist in eBay sandbox
6. Ensure diversity across different gift types and price points
7. Consider the relationship context but prioritize findable products

// 注释掉的严格要求（保留以备将来使用）:
// 1. Create 3-5 SPECIFIC PRODUCT KEYWORDS (not abstract terms like "gifts for her")
// 2. Use concrete product names that are commonly available on eBay (phone case, headphones, book, etc.)

Return ONLY valid JSON in this exact format:
{
  "search_plan": {
    "primary_keywords": [
      "keyword combining interest + gift intent",
      "another targeted keyword"
    ],
    "ebay_categories": [
      "Category > Subcategory",
      "Another Category > Subcategory"
    ],
    "filters": {
      "price_range": {"min": ${context.constraints.budget.min_price}, "max": ${context.constraints.budget.max_price}},
      "condition": ["New"]
      // 注释掉的严格筛选条件（保留以备将来使用）:
      // "condition": ["New", "New with tags"],
      // "shipping": ["Fast 'N Free", "Free shipping"], 
      // "seller_rating": "98%+",
      // "return_policy": "30 days or more"
    },
    "search_strategy": {
      "queries_per_category": 2,
      "total_candidates_target": 80,  // 增加候选商品数量
      "diversity_requirement": "min_3_categories"  // 降低多样性要求
    }
  }
}`
}

/**
 * Generate eBay search keywords for popular gifts
 */
export function POPULAR_EBAY_SEARCH_PROMPT(context: PopularContext): string {
  return `Generate eBay search strategy for finding popular, trending gifts.

CONTEXT:
- Audience: ${context.target_audience}
- Budget: $${context.budget.min_price} - $${context.budget.max_price}
- Quality: Min ${context.quality_filters.min_rating} stars, ${context.quality_filters.min_reviews}+ reviews

Return ONLY valid JSON:
{
  "search_plan": {
    "primary_keywords": [
      "phone case",
      "wireless headphones", 
      "smart watch",
      "home decor",
      "fragrance gift set",
      "fitness tracker",
      "board game",
      "outdoor gear",
      "kitchen gadget"
    ],
    "ebay_categories": [
      "Electronics > Consumer Electronics",
      "Home & Garden > Home Décor",
      "Health & Beauty > Fragrances"
    ],
    "filters": {
      "price_range": {"min": ${context.budget.min_price}, "max": ${context.budget.max_price}},
      "condition": ["New"]
    },
    "search_strategy": {
      "queries_per_category": 3,
      "total_candidates_target": 100,
      "diversity_requirement": "balanced_categories"
    }
  }
}`
}

/**
 * Generate eBay search keywords for occasion-specific gifts
 */
export function OCCASION_EBAY_SEARCH_PROMPT(context: OccasionContext): string {
  return `Generate eBay search strategy for ${context.occasion_type} gifts.

CONTEXT:
- Occasion: ${context.occasion_type}
- Budget: $${context.budget.min_price} - $${context.budget.max_price}
- Style: ${context.style_preferences.join(', ')}

Return ONLY valid JSON:
{
  "search_plan": {
    "primary_keywords": [
      "${context.occasion_type} gift",
      "celebration item",
      "special occasion present"
    ],
    "ebay_categories": [
      "Gifts & Occasions",
      "Jewelry & Watches",
      "Home & Garden"
    ],
    "filters": {
      "price_range": {"min": ${context.budget.min_price}, "max": ${context.budget.max_price}},
      "condition": ["New"]
    },
    "search_strategy": {
      "queries_per_category": 3,
      "total_candidates_target": 100,
      "diversity_requirement": "occasion_appropriate"
    }
  }
}`
}

/**
 * Analyze and filter eBay search results using OpenAI
 */
export function EBAY_RESULT_ANALYSIS_PROMPT(
  searchContext: string,
  ebayResults: any[],
  maxResults: number = 20
): string {
  // 只取前5个商品作为样本，只包含必要信息，减少token使用
  const sampleProducts = ebayResults.slice(0, 5).map(item => ({
    id: item.itemId || item.legacyItemId || 'unknown',
    name: (item.title || 'Unknown Product').substring(0, 40), // 限制标题长度
    price: item.price?.value || '0'
  }))

  return `Select the best ${maxResults} gifts from these products.

CONTEXT: ${searchContext}
TOTAL RESULTS: ${ebayResults.length} items

SAMPLE PRODUCTS (first 5):
${JSON.stringify(sampleProducts, null, 2)}

TASK: Select ${maxResults} best gifts based on relevance and value.

Return ONLY valid JSON:
{
  "selected_gifts": [
    {
      "ebay_item_id": "exact_id_from_sample",
      "selection_reason": "Why this gift was selected",
      "gift_score": 8.5
    }
  ]
}`
}

/**
 * Default occasion configurations
 */
export const OCCASION_CONFIGS = {
  wedding: {
    budget: { min_price: 50, max_price: 200 },
    keywords: ["wedding gifts", "bridal gifts", "couple gifts", "wedding registry"],
    categories: ["home_garden", "kitchen", "decor", "personalized"],
    style_preferences: ["elegant", "romantic", "timeless", "practical"],
    avoid: ["personal_items", "clothing", "perishable"]
  },
  birthday: {
    budget: { min_price: 25, max_price: 100 },
    keywords: ["birthday gifts", "birthday presents", "celebration gifts"],
    categories: ["electronics", "toys", "books", "beauty", "accessories"],
    style_preferences: ["fun", "personal", "trendy", "useful"],
    avoid: ["too_personal", "intimate"]
  },
  christmas: {
    budget: { min_price: 20, max_price: 150 },
    keywords: ["christmas gifts", "holiday gifts", "xmas presents"],
    categories: ["electronics", "home", "toys", "books", "clothing"],
    style_preferences: ["festive", "cozy", "family_friendly", "seasonal"],
    avoid: ["summer_items", "swimwear"]
  },
  valentine_day: {
    budget: { min_price: 30, max_price: 150 },
    keywords: ["valentine gifts", "romantic gifts", "love gifts", "couple gifts"],
    categories: ["jewelry", "beauty", "personalized", "experience"],
    style_preferences: ["romantic", "intimate", "thoughtful", "luxury"],
    avoid: ["platonic", "casual", "work_related"]
  },
  mothers_day: {
    budget: { min_price: 25, max_price: 120 },
    keywords: ["mother day gifts", "mom gifts", "mothers day presents"],
    categories: ["beauty", "home", "jewelry", "books", "spa"],
    style_preferences: ["caring", "appreciative", "relaxing", "beautiful"],
    avoid: ["childish", "masculine"]
  },
  fathers_day: {
    budget: { min_price: 25, max_price: 120 },
    keywords: ["father day gifts", "dad gifts", "fathers day presents"],
    categories: ["electronics", "tools", "sports", "books", "accessories"],
    style_preferences: ["practical", "masculine", "hobby_related", "useful"],
    avoid: ["feminine", "childish"]
  },
  graduation: {
    budget: { min_price: 40, max_price: 200 },
    keywords: ["graduation gifts", "graduate presents", "achievement gifts"],
    categories: ["electronics", "books", "professional", "travel", "tech"],
    style_preferences: ["professional", "inspiring", "practical", "future_oriented"],
    avoid: ["childish", "temporary"]
  }
} as const
