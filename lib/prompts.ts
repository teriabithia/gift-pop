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
Generate 24 gifts for ${preferences.relationship || 'someone'} who likes ${preferences.interests?.join(', ') || 'general items'}. Budget: ${preferences.budget || '$50-100'}.

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
      "searchTerm": "specific product search term",
      "category": "Category",
      "tags": ["thoughtful"]
    }
  ]
}

IMPORTANT: Generate specific, searchable product names and brands. The searchTerm should be exactly what someone would type to find this product online (e.g., "Apple iPad Air 5th generation", "Nintendo Switch OLED console", "Instant Pot Duo 7-in-1 pressure cooker").`

export const POPULAR_GIFTS_PROMPT = () => `
Generate 24 popular trending gifts. Return ONLY valid JSON with NO extra text:

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
      "searchTerm": "specific product search term",
      "category": "Electronics",
      "tags": ["trending"]
    }
  ]
}

IMPORTANT: Generate specific, searchable product names and brands. The searchTerm should be exactly what someone would type to find this product online (e.g., "Apple iPad Air 5th generation", "Nintendo Switch OLED console", "Instant Pot Duo 7-in-1 pressure cooker"). Price range $20-$100.`

export const OCCASION_GIFTS_PROMPT = (occasion: string) => `
Generate 24 ${occasion} gifts. Return ONLY valid JSON:

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
      "searchTerm": "specific ${occasion} gift search term",
      "category": "Category",
      "tags": ["${occasion.toLowerCase()}"]
    }
  ]
}

IMPORTANT: Generate specific, searchable product names and brands. The searchTerm should be exactly what someone would type to find this ${occasion} gift online (e.g., "birthday gift for mom", "anniversary gift for husband", "Christmas gift for teenager"). Price $20-$100.`
