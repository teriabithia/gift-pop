export interface User {
  id: string
  email: string
  name: string
  image?: string
}

export interface GiftList {
  id: string
  name: string
  userId: string
  gifts: Gift[]
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  shareId?: string
  specialPreferences?: string
}

export interface Gift {
  id: string
  name: string
  brand: string
  price: number
  rating: number
  reviewCount: number
  image: string
  shopUrl: string
  searchTerm?: string // AI生成的搜索关键词
  category?: string
  tags?: string[] | string // 支持数组或JSON字符串格式
}

export interface WizardData {
  relationship: string
  gender?: string
  ageRange?: string
  interests: string[]
  budgetRange?: string
  specialPreferences?: string
}

export type AuthState = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  googleLogin: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}
