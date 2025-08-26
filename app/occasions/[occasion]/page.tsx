"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLists } from "@/contexts/lists-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { GiftCard } from "@/components/gift-card"
import { ListSelectionModal } from "@/components/list-selection-modal"
import { LoginModal } from "@/components/login-modal"

interface Gift {
  id: string
  name: string
  price: number
  image: string
  rating: number
  reviewCount: number
  shopUrl: string
  brand: string
  description?: string
}

interface OccasionData {
  id: string
  name: string
  icon: string
  description: string
}

const occasionData: { [key: string]: OccasionData } = {
  'birthday': {
    id: 'birthday',
    name: 'Birthday',
    icon: '🎂',
    description: 'Perfect gifts to celebrate another year of life'
  },
  'wedding': {
    id: 'wedding',
    name: 'Wedding',
    icon: '💒',
    description: 'Beautiful gifts for the happy couple'
  },
  'christmas': {
    id: 'christmas',
    name: 'Christmas',
    icon: '🎄',
    description: 'Festive gifts for the holiday season'
  },
  'graduation': {
    id: 'graduation',
    name: 'Graduation',
    icon: '🎓',
    description: 'Celebrate academic achievements'
  },
  'baby-shower': {
    id: 'baby-shower',
    name: 'Baby Shower',
    icon: '👶',
    description: 'Gifts for expecting parents'
  },
  'housewarming': {
    id: 'housewarming',
    name: 'Housewarming',
    icon: '🏠',
    description: 'Welcome gifts for new homes'
  },
  'retirement': {
    id: 'retirement',
    name: 'Retirement',
    icon: '💼',
    description: 'Celebrate a new chapter in life'
  },
  'anniversary': {
    id: 'anniversary',
    name: 'Anniversary',
    icon: '💕',
    description: 'Commemorate special milestones together'
  },
  'mothers-day': {
    id: 'mothers-day',
    name: 'Mother\'s Day',
    icon: '💝',
    description: 'Show appreciation for the special women in your life'
  },
  'fathers-day': {
    id: 'fathers-day',
    name: 'Father\'s Day',
    icon: '🎁',
    description: 'Honor the fathers and father figures in your life'
  },
  'valentines-day': {
    id: 'valentines-day',
    name: 'Valentine\'s Day',
    icon: '💖',
    description: 'Express love and affection on this romantic day'
  },
  'just-because': {
    id: 'just-because',
    name: 'Just Because',
    icon: '✨',
    description: 'Sometimes the best gifts are given for no reason at all'
  }
}

export default function OccasionPage() {
  const params = useParams()
  const router = useRouter()
  const occasion = params.occasion as string
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; updatedAt: string } | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    hasMore: boolean
    totalPages: number
  } | null>(null)
  
  const { user } = useAuth()
  const { lists, createList, addGiftToList } = useLists()
  const { toast } = useToast()
  
  const [showListModal, setShowListModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<Gift | undefined>()

  const occasionInfo = occasionData[occasion]

  useEffect(() => {
    if (occasion) {
      fetchOccasionGifts(occasion)
    }
  }, [occasion])

  const fetchOccasionGifts = async (occasionId: string, page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)
      
      const response = await fetch(`/api/occasions?occasion=${occasionId}&page=${page}`)
      const result = await response.json()
      
      if (result.success) {
        if (append) {
          setGifts(prev => [...prev, ...result.data])
        } else {
          setGifts(result.data)
        }
        setCacheInfo({
          cached: result.cached,
          updatedAt: new Date(result.updatedAt).toLocaleDateString()
        })
        setPagination(result.pagination || null)
      } else {
        setError(result.error || 'Failed to fetch gifts')
      }
    } catch (err) {
      setError('Failed to fetch gifts')
      console.error('Error fetching occasion gifts:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }





  const handleShopNow = (shopUrl: string) => {
    window.open(shopUrl, '_blank')
  }

  const handleLoadMore = async () => {
    if (pagination && pagination.hasMore) {
      await fetchOccasionGifts(occasion, pagination.page + 1, true)
    }
  }

  const handleAddToList = (gift: Gift) => {
    if (!user) {
      setSelectedGift(gift)
      setShowLoginModal(true)
      return
    }
    setSelectedGift(gift)
    setShowListModal(true)
  }

  const handleCreateNewList = async (name: string) => {
    if (!selectedGift) return
    
    try {
      const result = await createList(name, selectedGift)
      toast({
        title: "List created successfully!",
        description: selectedGift 
          ? `"<span class="font-semibold text-purple-600">${name}</span>" has been created and "<span class="font-semibold text-gray-900">${selectedGift.name}</span>" has been added to it.`
          : `"<span class="font-semibold text-purple-600">${name}</span>" has been created.`,
        variant: "success",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/my-lists?from=recommendations')}
            className="ml-2"
          >
            View Lists
          </Button>
        ),
      })
      setShowListModal(false)
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Failed to create list. Please try again.",
      })
    }
  }

  const handleAddToExistingList = async (listId: string) => {
    if (!selectedGift) return
    
    try {
      const result = await addGiftToList(listId, selectedGift)
      if (result.success) {
        toast({
          title: "Added to list!",
          description: `"<span class="font-semibold text-gray-900">${selectedGift.name}</span>" has been added to "<span class="font-semibold text-purple-600">${result.listName}</span>"!`,
          variant: "success",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/my-lists?from=recommendations')}
              className="ml-2"
            >
              View Lists
            </Button>
          ),
        })
        setShowListModal(false)
      } else {
        toast({
          title: "Already in list",
          description: `"<span class="font-semibold text-gray-900">${selectedGift.name}</span>" is already in "<span class="font-semibold text-purple-600">${result.listName}</span>".`,
          variant: "default", // 使用默认样式，不是错误
        })
      }
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
      })
    }
  }

  if (!occasionInfo) {
    return (
      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Occasion Not Found</h1>
          <Link href="/occasions">
            <Button>Back to Occasions</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/occasions" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Occasions
          </Link>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="text-6xl">{occasionInfo.icon}</div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {occasionInfo.name} Gifts
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {occasionInfo.description}
            </p>
            
            {/* Cache Info */}
            {cacheInfo && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {cacheInfo.cached ? (
                  <span>Last updated: {cacheInfo.updatedAt}</span>
                ) : (
                  <span>Fresh recommendations</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading {occasionInfo.name} gifts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchOccasionGifts(occasion)}>Try Again</Button>
          </div>
        )}

        {/* Gifts Grid */}
        {!loading && !error && gifts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {gifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onAddToList={handleAddToList}
                  showCategoryBadge={false}
                  showTags={false}
                />
              ))}
            </div>

            {/* Load More Button */}
            {pagination && pagination.hasMore && (
              <div className="text-center mb-16">
                <Button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 text-lg"
                  variant="outline"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    `Load More (${pagination.total - gifts.length} more)`
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && !error && gifts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No gifts found for this occasion.</p>
            <Button onClick={() => fetchOccasionGifts(occasion)}>Refresh</Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ListSelectionModal
        open={showListModal}
        onOpenChange={setShowListModal}
        gift={selectedGift}
        lists={lists}
        onCreateList={handleCreateNewList}
        onAddToList={handleAddToExistingList}
      />

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </div>
  )
}
