import { UIBudget } from '../types/recommendation';

// 1. Planner提示词 - 生成搜索计划
export function createPlannerPrompt(mode: 'popular' | 'occasion' | 'personalized', input: any): string {
  const basePrompt = `你是"礼物检索规划器"。只输出 JSON（必须符合给定 JSON Schema）。

模式：${mode}

要求：
- 每次给 60–120 个候选目标（num_candidates）
- sites_mode 固定 "auto"（先搜常见礼物/畅销页，不足再扩展）
- 禁止输出 JSON 以外的任何文本

输出格式：
{
  "filters": {
    "region": "CA/US",
    "budget": ["25_50", "50_100"],
    "avoid": []
  },
  "category_weights": {
    "tech": 0.2,
    "home": 0.2,
    "selfcare": 0.2,
    "food": 0.2,
    "experience": 0.1,
    "hobby": 0.1
  },
  "sites_mode": "auto",
  "queries": ["query1", "query2", "query3"],
  "evidence_signals": ["Most Gifted", "Best Seller", "Top 100", "Editors' Pick", "Top Rated", "Best Gifts"],
  "num_candidates": 80
}`;

  switch (mode) {
    case 'popular':
      return basePrompt + `

popular模式规则：
- 若未传预算，用 ["25_50", "50_100"]
- 关键词覆盖 popular/top/best-seller 与不同预算表达
- 目标候选量：80-100
- 排序权重：热门>口碑>礼物友好>是否在售/合预算`;

    case 'occasion':
      return basePrompt + `

occasion模式规则：
- 场景：${input.occasion}
- 若未传预算，按场景设置 budget 回退：
  * wedding → ["50_100", "100_200"]
  * housewarming → ["25_50", "50_100"]
  * birthday(adult) → ["25_50", "50_100"]
  * anniversary → ["50_100", "100_200"]
  * baby_shower → ["25_50", "50_100"]
- 关键词覆盖 "<occasion> gifts" 同义词
- 排序权重：场景匹配>热门>口碑>礼物友好>是否在售/合预算`;

    case 'personalized':
      return basePrompt + `

personalized模式规则：
- relationship: ${input.answers.relationship}（必填）
- 其它字段缺失时使用合理回退：
  * coworker → 偏通用/办公小物，避开私密/强个人化
  * grandma/grandpa/parents → 家居/健康/阅读/纪念感
  * partner → 仪式感/体验/可定制，但避开尺码/肤质风险
- 如果给了兴趣：直接当检索词
- 如果给了预算：严格用你传的；没给才用回退
- 排序权重：匹配度>礼物友好>热门>口碑>是否在售/合预算`;

    default:
      return basePrompt;
  }
}

// 2. Search提示词 - web_search
export function createSearchPrompt(plan: any): string {
  return `基于以下搜索计划，使用web_search找到相关商品：

搜索计划：${JSON.stringify(plan, null, 2)}

要求：
1. 输出"标题 + 简短摘要 + URL"的要点列表
2. 至少 ${plan.num_candidates} 条结果
3. 禁止无链接项
4. 每条结果包含：title, snippet, url
5. 确保结果质量和相关性

输出格式：
[
  {
    "title": "商品标题",
    "snippet": "简短描述，包含价格、评分、特色等信息",
    "url": "商品链接"
  }
]`;
}

// 3. Extractor提示词 - 信息抽取
export function createExtractorPrompt(): string {
  return `你是"礼物信息抽取器"。仅依据我提供的网页摘要/片段，抽取以下信息：

title/brand/price_min/price_max/currency/rating_avg/rating_count/badges/availability/image

规则：
1. 无法确认的字段返回 null
2. 不允许猜测
3. 只输出 JSON（遵守 Schema）
4. 价格提取：只提取数字，忽略货币符号
5. 评分提取：只提取数字，忽略星级符号
6. 徽章提取：从文本中识别 "Most Gifted", "Best Seller", "Top 100" 等

输出格式：
{
  "title": "商品标题",
  "brand": "品牌名称或null",
  "price_min": 价格最小值或null,
  "price_max": 价格最大值或null,
  "currency": "USD"或null,
  "rating_avg": 评分或null,
  "rating_count": 评论数量或null,
  "badges": ["徽章1", "徽章2"]或[],
  "availability": true/false或null,
  "image": "图片URL或null"
}`;
}

// 4. Explainer提示词 - 解释为什么选择
export function createExplainerPrompt(): string {
  return `你是"礼物解释器"。用给定字段（title/category/badges/scores/matched_tags），输出一句20字内的"为何适配"说明。

要求：
1. 不超过20字
2. 不得引入来源外信息
3. 突出商品特色和适用性
4. 语言自然流畅

示例：
- "性价比高，适合办公送礼"
- "手工制作，独一无二"
- "科技感强，年轻人喜爱"
- "实用性强，日常必备"

输出格式：
{
  "why": "解释说明"
}`;
}

// 5. 预算回退逻辑
export function getBudgetFallback(mode: 'popular' | 'occasion' | 'personalized', input: any): UIBudget[] {
  switch (mode) {
    case 'popular':
      return ['25_50', '50_100'];
    
    case 'occasion':
      const occasion = input.occasion?.toLowerCase();
      if (occasion?.includes('wedding') || occasion?.includes('anniversary')) {
        return ['50_100', '100_200'];
      }
      return ['25_50', '50_100'];
    
    case 'personalized':
      const relationship = input.answers?.relationship?.toLowerCase();
      if (relationship?.includes('coworker') || relationship?.includes('colleague')) {
        return ['25_50'];
      }
      if (relationship?.includes('grandma') || relationship?.includes('grandpa') || relationship?.includes('parent')) {
        return ['50_100'];
      }
      return ['25_50', '50_100'];
    
    default:
      return ['25_50', '50_100'];
  }
}

// 6. 类别权重配置
export function getCategoryWeights(mode: 'popular' | 'occasion' | 'personalized', input: any): Record<string, number> {
  const baseWeights = {
    tech: 0.2,
    home: 0.2,
    selfcare: 0.2,
    food: 0.2,
    experience: 0.1,
    hobby: 0.1
  };

  switch (mode) {
    case 'personalized':
      const interests = input.answers?.interests || [];
      if (interests.some((i: string) => i.toLowerCase().includes('tech') || i.toLowerCase().includes('gaming'))) {
        return { ...baseWeights, tech: 0.4, home: 0.15, selfcare: 0.15, food: 0.1, experience: 0.1, hobby: 0.1 };
      }
      if (interests.some((i: string) => i.toLowerCase().includes('cooking') || i.toLowerCase().includes('food'))) {
        return { ...baseWeights, food: 0.4, home: 0.2, tech: 0.15, selfcare: 0.1, experience: 0.1, hobby: 0.05 };
      }
      break;
    
    case 'occasion':
      const occasion = input.occasion?.toLowerCase();
      if (occasion?.includes('housewarming')) {
        return { ...baseWeights, home: 0.5, tech: 0.15, selfcare: 0.15, food: 0.1, experience: 0.05, hobby: 0.05 };
      }
      if (occasion?.includes('birthday')) {
        return { ...baseWeights, tech: 0.25, home: 0.2, selfcare: 0.2, food: 0.15, experience: 0.1, hobby: 0.1 };
      }
      break;
  }

  return baseWeights;
}
