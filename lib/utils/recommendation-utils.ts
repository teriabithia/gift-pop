import { UIBudget, BudgetRanges, Candidate, ResultItem, RecommendationMode } from '../types/recommendation';

// 扩展Candidate接口，添加scores属性
interface CandidateWithScores extends Candidate {
  scores?: {
    popularity: number;
    quality: number;
    giftability: number;
    logistics: number;
    match: number;
    final: number;
  };
}

// 价格与预算过滤
export function priceOverlapsBands(min: number | null, max: number | null, bands: UIBudget[] | undefined): boolean {
  if (!bands?.length) return true;
  const a = min ?? max ?? -Infinity, b = max ?? min ?? Infinity;
  return bands.some(k => {
    const r = BudgetRanges[k], lo = r.min ?? -Infinity, hi = r.max ?? Infinity;
    return Math.max(lo, a) < Math.min(hi, b);
  });
}

export function priceBandLabel(min: number | null, max: number | null): string {
  const mid = ((min ?? max ?? 0) + (max ?? min ?? 0)) / 2;
  const r = Object.values(BudgetRanges).find(x => (x.min ?? -Infinity) <= mid && mid < (x.max ?? Infinity));
  return r?.label ?? "—";
}

// 信任打分
const DEFAULT_TRUSTED = ["amazon.com", "walmart.com", "target.com", "bestbuy.com", "etsy.com", "nymag.com", "goodhousekeeping.com"];
const SENSITIVE = ["alcohol", "wine", "beer", "knife", "weapon", "adult", "sex", "porn", "prescription", "nicotine", "cannabis", "marijuana"];
const EVIDENCE = ["Most Gifted", "Best Seller", "Top 100", "Editors' Pick", "Top Rated", "Best Gifts"];

export function trustScore(url: string, snippet: string): number {
  try {
    const u = new URL(url);
    const rep = DEFAULT_TRUSTED.some(d => u.hostname.endsWith(d)) ? 0.9 : 0.3;
    const text = snippet.toLowerCase();
    
    if (SENSITIVE.some(k => text.includes(k))) return 0;
    
    const hasGift = /gift|best seller|top 100|ideas|top rated/i.test(snippet);
    const hasPrice = /\$\d+(\.\d{2})?/.test(snippet);
    const hasRating = /(★|stars?|rating|\d\.\d\/5)/i.test(snippet);
    const hasBadge = EVIDENCE.some(k => text.includes(k.toLowerCase()));
    
    return Math.min(1, Math.max(0, 
      0.35 * rep + 
      0.2 * (hasGift ? 1 : 0) + 
      0.15 * (hasPrice ? 1 : 0) + 
      0.15 * (hasRating ? 1 : 0) + 
      0.15 * (hasBadge ? 1 : 0)
    ));
  } catch {
    return 0.1; // URL解析失败，给低分
  }
}

export const TRUST_THRESHOLD = 0.55;

// 评分计算
export function calculateScores(item: Candidate, mode: RecommendationMode, bands?: UIBudget[]): {
  popularity: number;
  quality: number;
  giftability: number;
  logistics: number;
  match: number;
  final: number;
} {
  // 标准化评分 (0-1)
  const normPopularity = (item: Candidate): number => {
    const reviewCount = item.rating_count || 0;
    const hasEvidence = item.badges?.some(b => EVIDENCE.some(e => b.toLowerCase().includes(e.toLowerCase()))) ? 1 : 0;
    return Math.min(1, (Math.log10(reviewCount + 1) / 5) * 0.7 + hasEvidence * 0.3);
  };

  const normQuality = (item: Candidate): number => {
    const rating = item.rating_avg || 0;
    const count = item.rating_count || 0;
    return (rating / 5) * 0.6 + Math.min(1, count / 1000) * 0.4;
  };

  const giftability = (item: Candidate): number => {
    const title = item.title.toLowerCase();
    const isGeneric = /gift|present|for everyone|universal/i.test(title);
    const isPersonalized = /personalized|custom|engraved/i.test(title);
    const isGiftSet = /gift set|bundle|collection/i.test(title);
    return (isGeneric ? 0.4 : 0) + (isPersonalized ? 0.3 : 0) + (isGiftSet ? 0.3 : 0);
  };

  const logistics = (item: Candidate, bands?: UIBudget[]): number => {
    const available = item.availability ? 1 : 0;
    const priceFit = bands ? (priceOverlapsBands(item.price_min ?? null, item.price_max ?? null, bands) ? 1 : 0) : 0.5;
    return available * 0.6 + priceFit * 0.4;
  };

  const match = item.match_score ?? 0;

  // 权重配置
  const W = {
    popular: { pop: 0.40, qual: 0.25, gift: 0.20, logi: 0.15, match: 0 },
    occasion: { pop: 0.25, qual: 0.20, gift: 0.15, logi: 0.10, match: 0.30 },
    personalized: { pop: 0.20, qual: 0.15, gift: 0.25, logi: 0.05, match: 0.35 }
  }[mode];

  const final = W.pop * normPopularity(item) + 
                W.qual * normQuality(item) + 
                W.gift * giftability(item) + 
                W.logi * logistics(item, bands) + 
                W.match * match;

  return {
    popularity: normPopularity(item),
    quality: normQuality(item),
    giftability: giftability(item),
    logistics: logistics(item, bands),
    match,
    final
  };
}

// MMR多样性选择
export function mmrSelect(list: CandidateWithScores[], k: number, lambda = 0.75): CandidateWithScores[] {
  const sel: CandidateWithScores[] = [];
  
  while (sel.length < k && list.length) {
    let best: CandidateWithScores | null = null;
    let bestS = -1e9;
    
    for (const c of list) {
      const sim = sel.length ? Math.max(...sel.map(s => similarity(c, s))) : 0;
      const s = lambda * (c.scores?.final || 0) - (1 - lambda) * sim;
      if (s > bestS) {
        best = c;
        bestS = s;
      }
    }
    
    if (best) {
      sel.push(best);
      list = list.filter(x => x !== best);
    } else {
      break;
    }
  }
  
  return sel;
}

// 相似度计算
function similarity(a: CandidateWithScores, b: CandidateWithScores): number {
  const titleSim = stringSimilarity(a.title.toLowerCase(), b.title.toLowerCase());
  const categorySim = a.category === b.category ? 1 : 0;
  const priceSim = priceSimilarity(a, b);
  
  return (titleSim * 0.5 + categorySim * 0.3 + priceSim * 0.2);
}

function stringSimilarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1: string, s2: string): number {
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[s2.length][s1.length];
}

function priceSimilarity(a: CandidateWithScores, b: CandidateWithScores): number {
  const aMid = ((a.price_min ?? 0) + (a.price_max ?? 0)) / 2;
  const bMid = ((b.price_min ?? 0) + (b.price_max ?? 0)) / 2;
  
  if (aMid === 0 || bMid === 0) return 0.5;
  
  const diff = Math.abs(aMid - bMid);
  const max = Math.max(aMid, bMid);
  
  return Math.max(0, 1 - diff / max);
}

// 生成审计ID
export function generateAuditId(): string {
  return `rec_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
}

// 获取当前时间
export function getCurrentTime(): string {
  return new Date().toISOString();
}
