import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const OPENAI_CONFIG = {
  model: 'gpt-4o-mini', // Use cost-effective model
  temperature: 0.1, // Lower temperature for more consistent JSON
  max_tokens: 4000, // Increased to handle 24 gifts without truncation
  top_p: 0.5, // More focused responses
} as const

// Development mode configuration - temporary solution when API quota is insufficient
export const DEV_MODE = {
  enabled: process.env.NODE_ENV === 'development',
  skipAPICall: process.env.SKIP_OPENAI_API === 'true', // Can be controlled via environment variable
}
