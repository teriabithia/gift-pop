// 预算分档类型
export type UIBudget = 
  | "under_25" | "25_50" | "50_100" | "100_200" | "200_500" | "500_plus";

// 预算范围配置
export const BudgetRanges: Record<UIBudget, { min: number | null; max: number | null; label: string }> = {
  under_25: { min: null, max: 25, label: "Under $25" },
  "25_50": { min: 25, max: 50, label: "$25–$50" },
  "50_100": { min: 50, max: 100, label: "$50–$100" },
  "100_200": { min: 100, max: 200, label: "$100–$200" },
  "200_500": { min: 200, max: 500, label: "$200–$500" },
  "500_plus": { min: 500, max: null, label: "Over $500" }
};

// 推荐模式
export type RecommendationMode = "popular" | "occasion" | "personalized";

// 个性化问卷答案
export interface Answers {
  relationship: string;                    // 必填
  gender?: "female" | "male" | "nonbinary" | "unknown";
  age?: number;
  interests?: string[];
  budget?: UIBudget[];
  other_requirements?: string[];
}

// 搜索计划
export interface SearchPlan {
  filters: {
    region: string;
    budget?: UIBudget[];
    avoid: string[];
  };
  category_weights: {
    tech: number;
    home: number;
    selfcare: number;
    food: number;
    experience: number;
    hobby: number;
  };
  sites_mode: "auto";
  queries: string[];
  evidence_signals: string[];
  num_candidates: number;
}

// 搜索笔记
export interface SearchNote {
  title: string;
  snippet: string;
  url: string;
  trust_score?: number;
}

// 候选商品
export interface Candidate {
  title: string;
  brand?: string;
  price_min?: number;
  price_max?: number;
  currency?: string;
  rating_avg?: number;
  rating_count?: number;
  badges?: string[];
  availability?: boolean;
  image?: string;
  url: string;
  category?: string;
  match_score?: number;
}

// 结果商品
export interface ResultItem {
  rank: number;
  title: string;
  category: string;
  price_band: string;
  currency: string;
  badges: string[];
  source_url: string;
  image: string;
  scores: {
    popularity: number;
    quality: number;
    giftability: number;
    logistics: number;
    match: number;
    final: number;
  };
  why: string;
  backup_url?: string;
}

// 推荐响应
export interface RecommendResponse {
  items: ResultItem[];
  coverage: {
    categories: Record<string, number>;
    price: string;
  };
  assumptions: {
    region: string;
  };
  updated_at: string;
  audit_id: string;
}

// 请求参数
export interface PopularRequest {
  limit?: number;
  region?: string;
  budget?: UIBudget[];
}

export interface OccasionRequest {
  occasion: string;
  limit?: number;
  region?: string;
  budget?: UIBudget[];
}

export interface PersonalizedRequest {
  answers: Answers;
  limit?: number;
  region?: string;
}
