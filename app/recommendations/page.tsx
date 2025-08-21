"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Plus, Share2, Sparkles, Loader2 } from "lucide-react"
import { useWizard } from "@/contexts/wizard-context"
import { useAuth } from "@/contexts/auth-context"
import { useLists } from "@/contexts/lists-context"
import { GiftCard } from "@/components/gift-card"
import { ListSelectionModal } from "@/components/list-selection-modal"
import { LoginModal } from "@/components/login-modal"
import { ShareModal } from "@/components/share-modal"
import { mockGifts } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { recommendationAPI } from "@/lib/api/recommendations"
import type { Gift, GiftList } from "@/lib/types"

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecommendationsContent />
    </Suspense>
  )
}

function RecommendationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: wizardData, resetData } = useWizard()
  const { user } = useAuth()
  const { lists, createList, addGiftToList } = useLists()
  const { toast } = useToast()
  
  // Get occasion parameter
  const occasion = searchParams.get('occasion')

  const [showListModal, setShowListModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<Gift | undefined>()
  const [pendingAction, setPendingAction] = useState<"add-to-list" | "create-list" | "share-list" | null>(null)
  // Loading logic state
  const [displayedGifts, setDisplayedGifts] = useState<Gift[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  
  const GIFTS_PER_PAGE = 24

  const [apiGifts, setApiGifts] = useState<Gift[]>([])
  const [apiLoaded, setApiLoaded] = useState(false)

  // Load recommended gifts
  const loadRecommendations = useCallback(async () => {
    if (apiLoaded) return

    setIsLoading(true)
    try {
      let gifts: Gift[] = []
      
      if (occasion) {
        // Occasion recommendations
        gifts = await recommendationAPI.getOccasionGifts(occasion)
        toast({
          title: "Occasion Recommendations Loaded",
          description: `Curated gifts for ${occasion} loaded successfully!`,
        })
      } else if (wizardData.relationship || wizardData.interests?.length) {
        // Personalized recommendations
        // Parse budget range from string to object
        let budget: { min: number; max: number } | undefined
        if (wizardData.budgetRange) {
          const match = wizardData.budgetRange.match(/\$(\d+)\s*-\s*\$(\d+)/)
          if (match) {
            budget = {
              min: parseInt(match[1]),
              max: parseInt(match[2])
            }
          }
        }

        const preferences = {
          relationship: wizardData.relationship,
          gender: wizardData.gender,
          ageRange: wizardData.ageRange,
          interests: wizardData.interests,
          budget: budget,
          specialPreferences: wizardData.specialPreferences
        }
        gifts = await recommendationAPI.getPersonalizedRecommendations(preferences)
        toast({
          title: "Personalized Recommendations Loaded",
          description: "Curated gifts based on your preferences!",
        })
      } else {
        // Default popular recommendations
        gifts = await recommendationAPI.getPopularGifts()
        toast({
          title: "Popular Recommendations Loaded",
          description: "Trending gifts loaded successfully!",
        })
      }
      
      setApiGifts(gifts)
      setApiLoaded(true)
      
      // Initially display first items
      setDisplayedGifts(gifts.slice(0, GIFTS_PER_PAGE))
      setPage(1)
      setHasMore(gifts.length > GIFTS_PER_PAGE)
      
    } catch (error) {
      console.error('Failed to load recommendations:', error)
      // Fallback to mock data
      setApiGifts(mockGifts)
      setDisplayedGifts(mockGifts.slice(0, GIFTS_PER_PAGE))
      setPage(1)
      setHasMore(mockGifts.length > GIFTS_PER_PAGE)
      
      const errorMessage = error instanceof Error ? error.message : 'AI service temporarily unavailable'
      const isDevMode = errorMessage.includes('开发模式') || errorMessage.includes('开发')
      
      toast({
        title: isDevMode ? "Development Mode" : "API Call Failed",
        description: isDevMode 
          ? "AI features disabled, showing local recommendation data." 
          : `${errorMessage}, now showing local recommendation data.`,
        variant: isDevMode ? "default" : "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [occasion, wizardData, apiLoaded, toast])

  // Initialize loading gifts
  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  const loadMoreGifts = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setTimeout(() => {
      const startIndex = page * GIFTS_PER_PAGE
      const endIndex = startIndex + GIFTS_PER_PAGE
      const newGifts = apiGifts.slice(startIndex, endIndex)

      if (newGifts.length === 0) {
        setHasMore(false)
      } else {
        setDisplayedGifts(prev => [...prev, ...newGifts])
        setPage(prev => prev + 1)
        if (endIndex >= apiGifts.length) {
          setHasMore(false)
        }
      }
      setIsLoading(false)
    }, 500)
  }, [page, isLoading, hasMore, apiGifts])

  const getRecommendationContext = () => {
    // If occasion parameter exists, prioritize occasion recommendations
    if (occasion) {
      const occasionNames: { [key: string]: string } = {
        'birthday': 'Birthday',
        'anniversary': 'Anniversary', 
        'wedding': 'Wedding',
        'graduation': 'Graduation',
        'valentines-day': "Valentine's Day",
        'mothers-day': "Mother's Day",
        'fathers-day': "Father's Day",
        'christmas': 'Christmas',
        'housewarming': 'Housewarming',
        'baby-shower': 'Baby Shower',
        'retirement': 'Retirement',
        'thank-you': 'Thank You'
      }
      
      return `Based on: ${occasionNames[occasion] || occasion.charAt(0).toUpperCase() + occasion.slice(1)}`
    }
    
    // Otherwise display wizard data
    if (!wizardData.relationship) return "Perfect Gifts"

    const parts = []
    
    // Add relationship
    parts.push(wizardData.relationship)
    
    // Add gender
    if (wizardData.gender) {
      parts.push(wizardData.gender)
    }
    
    // Add age range
    if (wizardData.ageRange) {
      parts.push(wizardData.ageRange)
    }
    
    // Add interests
    if (wizardData.interests && wizardData.interests.length > 0) {
      parts.push(`interests: ${wizardData.interests.join(", ")}`)
    }
    
    // Add budget range
    if (wizardData.budgetRange) {
      parts.push(`budget: ${wizardData.budgetRange}`)
    }

    const context = parts.join(" • ")
    return `Based on: ${context.charAt(0).toUpperCase() + context.slice(1)}`
  }

  const handleStartOver = () => {
    resetData()
    router.push("/wizard/step-1")
  }

  const handleShareList = () => {
    if (!user) {
      setPendingAction("share-list")
      setShowLoginModal(true)
      return
    }

    if (lists.length === 0) {
      toast({
        title: "No lists to share",
        description: "Create a list first before sharing.",
        variant: "destructive",
      })
      return
    }

    setShowShareModal(true)
  }

  const handleGenerateShareLink = (listId: string) => {
    const shareLink = `${window.location.origin}/shared/${listId}`
    return shareLink
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)

    // Execute pending action after login
    if (pendingAction === "add-to-list" && selectedGift) {
      setShowListModal(true)
    } else if (pendingAction === "create-list") {
      setShowListModal(true)
    } else if (pendingAction === "share-list") {
      handleShareList()
    }

    setPendingAction(null)
  }

  const handleCreateList = (name: string) => {
    const newList = createList(name)
    if (selectedGift) {
      const result = addGiftToList(newList.id, selectedGift)
      toast({
        title: "Added to new list!",
        description: result.message,
      })
    }
    setShowListModal(false)
  }

  const handleCreateNewList = () => {
    if (!user) {
      setPendingAction("create-list")
      setShowLoginModal(true)
      return
    }
    // Directly open create list modal, no need to select gift
    setSelectedGift(undefined)
    setShowListModal(true)
  }

  const handleAddToExistingList = (listId: string, gift?: Gift) => {
    if (gift) {
      const result = addGiftToList(listId, gift)
      
      if (result.success) {
        toast({
          title: "Added to list!",
          description: result.message,
        })
      } else {
        toast({
          title: "Item Already in List",
          description: result.message,
          variant: "default", // 改为白色背景
        })
      }
    }
    setShowListModal(false)
  }

  const handleAddToList = (gift: Gift) => {
    if (!user) {
      setSelectedGift(gift)
      setPendingAction("add-to-list")
      setShowLoginModal(true)
      return
    }
    setSelectedGift(gift)
    setShowListModal(true)
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <Badge className="text-base px-6 py-3 bg-purple-primary/10 text-purple-primary border-purple-primary/20 rounded-2xl">
              <Sparkles className="h-5 w-5 mr-2" />
              {getRecommendationContext()}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Perfect Gift Recommendations
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We've curated these thoughtful gifts based on your preferences. Each one is carefully selected to bring joy
            to your special someone.
          </p>
        </div>

        {/* Quick Action Toolbar - Only show when NOT from occasions page */}
        {!occasion && (
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <Button
              onClick={handleCreateNewList}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
            Create New List
          </Button>
            <Button
              onClick={handleShareList}
              variant="outline"
              size="lg"
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Share2 className="h-5 w-5 mr-2" />
            Share List
          </Button>
            <Button
              onClick={() => {
                resetData()
                router.push("/wizard/step-1")
              }}
              variant="outline"
              size="lg"
              className="border-2 border-gray-200 text-gray-600 hover:text-purple-700 hover:bg-purple-50 hover:border-purple-200 px-8 py-4 rounded-full transition-all duration-300"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Start Over
          </Button>
        </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedGifts.map((gift, index) => (
            <div
              key={gift.id}
              className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${(index % GIFTS_PER_PAGE) * 100}ms` }}
            >
              <GiftCard gift={gift} onAddToList={handleAddToList} />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && displayedGifts.length > 0 && (
          <div className="flex justify-center items-center py-12">
            <Button
              onClick={loadMoreGifts}
              disabled={isLoading}
              size="lg"
              variant="outline"
              className="px-8 py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Load More Gifts
                </>
              )}
            </Button>
          </div>
        )}

        {/* End of results */}
        {!hasMore && displayedGifts.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">
                You've seen all {displayedGifts.length} recommendations!
              </span>
            </div>
          </div>
        )}

        {mockGifts.length === 0 && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <Card className="text-center py-16 max-w-2xl mx-auto bg-white border-gray-100 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <CardHeader className="pb-8">
                <div className="mx-auto mb-6 p-4 bg-purple-primary/10 rounded-3xl w-fit">
                  <Sparkles className="h-12 w-12 text-purple-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">No recommendations found</CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-4">
                  Try adjusting your preferences or starting over with different criteria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleStartOver} size="xl">
                  <RotateCcw className="h-5 w-5 mr-3" />
                  Start Over
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <ListSelectionModal
        open={showListModal}
        onOpenChange={setShowListModal}
        gift={selectedGift}
        lists={lists}
        onCreateList={handleCreateList}
        onAddToList={handleAddToExistingList}
      />

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        lists={lists}
        onGenerateLink={handleGenerateShareLink}
      />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}
