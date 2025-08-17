export interface UserPreferences {
  relationship?: string
  gender?: string
  ageRange?: string
  interests?: string[]
  budget?: string
  occasion?: string
  specialPreferences?: string
}

export const GIFT_RECOMMENDATION_PROMPT = (preferences: UserPreferences) => `
Generate 4 gifts for ${preferences.relationship || 'someone'} who likes ${preferences.interests?.join(', ') || 'general items'}. Budget: ${preferences.budget || '$50-100'}.

Return ONLY valid JSON:

{
  "gifts": [
    {
      "id": "r1",
      "name": "Gift Name",
      "brand": "Brand",
      "price": 45.99,
      "rating": 4.5,
      "reviewCount": 500,
      "image": "/gift.jpg",
      "shopUrl": "https://www.amazon.com/dp/B0ABCDEFGH",
      "category": "Category",
      "tags": ["thoughtful"]
    }
  ]
}

CRITICAL: Use ONLY real, existing Amazon product URLs with valid ASINs. Research actual products that match the preferences.`

export const POPULAR_GIFTS_PROMPT = () => `
Generate 4 popular trending gifts that actually exist on Amazon. Return ONLY valid JSON with NO extra text:

{
  "gifts": [
    {
      "id": "p1",
      "name": "Gift Name",
      "brand": "Brand",
      "price": 49.99,
      "rating": 4.5,
      "reviewCount": 1000,
      "image": "/gift.jpg",
      "shopUrl": "https://www.amazon.com/dp/B0ABCDEFGH",
      "category": "Electronics",
      "tags": ["trending"]
    }
  ]
}

CRITICAL: Use ONLY real, existing Amazon product URLs with valid ASINs (B0XXXXXXXX format). Research actual popular products on Amazon. Price range $20-$100.`

export const OCCASION_GIFTS_PROMPT = (occasion: string) => `
Generate 4 ${occasion} gifts that actually exist on Amazon. Return ONLY valid JSON:

{
  "gifts": [
    {
      "id": "o1",
      "name": "Gift Name",
      "brand": "Brand",
      "price": 39.99,
      "rating": 4.6,
      "reviewCount": 800,
      "image": "/gift.jpg",
      "shopUrl": "https://www.amazon.com/dp/B0ABCDEFGH",
      "category": "Category",
      "tags": ["${occasion.toLowerCase()}"]
    }
  ]
}

CRITICAL: Use ONLY real, existing Amazon product URLs with valid ASINs. Research actual products suitable for ${occasion}. Price $20-$100.`
