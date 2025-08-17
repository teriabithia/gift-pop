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
      "shopUrl": "https://www.etsy.com/listing/product-name",
      "category": "Category",
      "tags": ["thoughtful"]
    }
  ]
}

Use diverse shopping platforms: Amazon, Target, Walmart, Best Buy, Etsy, brand websites, specialty stores, etc. Match products to preferences from various retailers.`

export const POPULAR_GIFTS_PROMPT = () => `
Generate 4 popular trending gifts from various online retailers. Return ONLY valid JSON with NO extra text:

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
      "shopUrl": "https://www.target.com/p/product-name",
      "category": "Electronics",
      "tags": ["trending"]
    }
  ]
}

Use diverse shopping platforms: Amazon, Target, Walmart, Best Buy, brand official websites, Etsy, etc. Include real product URLs from different retailers. Price range $20-$100.`

export const OCCASION_GIFTS_PROMPT = (occasion: string) => `
Generate 4 ${occasion} gifts from various online retailers. Return ONLY valid JSON:

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
      "shopUrl": "https://www.walmart.com/ip/product-name",
      "category": "Category",
      "tags": ["${occasion.toLowerCase()}"]
    }
  ]
}

Use diverse shopping platforms for ${occasion}: Amazon, Target, Walmart, Best Buy, Etsy, brand official sites, specialty gift stores, etc. Price $20-$100.`
