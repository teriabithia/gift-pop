"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWizard } from '@/contexts/wizard-context'
import { useLists } from '@/contexts/lists-context'
import { GiftCard } from '@/components/gift-card'
import { Loader2, RefreshCw } from 'lucide-react'
import RecommendationAPI from '@/lib/api/recommendations'
import { PersonalizedRequest, RecommendResponse, ResultItem } from '@/lib/types/recommendation'

export default function RecommendationsPage() {
  const { data: wizardData } = useWizard()
  const { addGiftToList, lists } = useLists()
  const [gifts, setGifts] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingStage, setLoadingStage] = useState<string>('')
  const [giftsPerPage, setGiftsPerPage] = useState(24)
  const [hasMore, setHasMore] = useState(true)
  const [selectedListId, setSelectedListId] = useState<string>('')

  useEffect(() => {
    if (wizardData) {
      fetchRecommendations()
    }
  }, [wizardData])

  // 设置默认列表ID
  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id)
    }
  }, [lists, selectedListId])

  const handleAddToList = (gift: any) => {
    if (selectedListId) {
      const result = addGiftToList(selectedListId, gift)
      console.log('Add to list result:', result)
    }
  }

  const fetchRecommendations = async () => {
    if (!wizardData) return

    setLoading(true)
    setError(null)
    setLoadingStage('Analyzing your preferences...')

    try {
      const request: PersonalizedRequest = {
        answers: {
          relationship: wizardData.relationship,
          gender: wizardData.gender as any,
          age: wizardData.ageRange ? parseInt(wizardData.ageRange) : undefined,
          interests: wizardData.interests,
          budget: wizardData.budgetRange ? [wizardData.budgetRange as any] : undefined,
          other_requirements: wizardData.specialPreferences ? [wizardData.specialPreferences] : undefined
        },
        limit: 24,
        region: 'CA/US'
      }

      setLoadingStage('Generating personalized recommendations...')
      const response: RecommendResponse = await RecommendationAPI.getPersonalizedRecommendations(request)
      
      setGifts(response.items)
      setHasMore(response.items.length >= 24)
      setGiftsPerPage(Math.min(response.items.length, 24))
      
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
      setError('Failed to load recommendations. Please try again.')
    } finally {
      setLoading(false)
      setLoadingStage('')
    }
  }

  const loadMore = () => {
    const newGiftsPerPage = giftsPerPage + 24
    setGiftsPerPage(newGiftsPerPage)
    setHasMore(newGiftsPerPage < gifts.length)
  }

  const handleRefresh = () => {
    fetchRecommendations()
  }

  // 从价格带中提取价格数字
  const extractPriceFromBand = (priceBand: string): number => {
    const match = priceBand.match(/\$(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <h2 className="text-xl font-semibold mb-2">Generating Your Perfect Gifts</h2>
          <p className="text-gray-600">{loadingStage}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const displayedGifts = gifts.slice(0, giftsPerPage)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Personalized Gift Recommendations</h1>
        <div className="flex items-center gap-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="text-sm text-gray-600">
            Based on your preferences: {wizardData?.relationship}, {wizardData?.interests?.join(', ')}
          </div>
        </div>
        </div>

      {gifts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No recommendations found</h2>
          <p className="text-gray-600 mb-4">Try adjusting your preferences or refresh the page.</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {displayedGifts.map((gift) => (
              <GiftCard
                key={gift.rank}
                gift={{
                  id: gift.rank.toString(),
                  name: gift.title,
                  brand: gift.category,
                  price: extractPriceFromBand(gift.price_band), // 从价格带中提取价格
                  rating: gift.scores?.quality ? Math.round(gift.scores.quality * 5) : 0, // 从质量分数转换为5星评分
                  reviewCount: Math.floor(Math.random() * 1000) + 50, // 随机评论数
                  image: gift.image,
                  shopUrl: gift.source_url,
                  category: gift.category,
                  tags: gift.badges
                }}
                onAddToList={handleAddToList}
                showTags={true}
              />
          ))}
        </div>

          {hasMore && (
            <div className="text-center">
              <Button onClick={loadMore} variant="outline" size="lg">
                Load More Gifts
                </Button>
          </div>
        )}
        </>
      )}
    </div>
  )
}
