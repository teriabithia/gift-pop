"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { TrendingUp, Plus, Share2, Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLists } from "@/contexts/lists-context"
import { GiftCard } from "@/components/gift-card"
import { ListSelectionModal } from "@/components/list-selection-modal"
import { LoginModal } from "@/components/login-modal"
import { mockGifts } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { recommendationAPI } from "@/lib/api/recommendations"
import type { Gift } from "@/lib/types"


export default function PopularGiftsPage() {
  const { user } = useAuth()
  const { lists, addGiftToList, createList } = useLists()
  const { toast } = useToast()

  const [showListModal, setShowListModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<Gift | undefined>()
  const [pendingAction, setPendingAction] = useState<"add-to-list" | "create-list" | "share-list" | null>(null)
  
  // Scroll loading state
  const [displayedGifts, setDisplayedGifts] = useState<Gift[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  
  const GIFTS_PER_PAGE = 24

  const [apiGifts, setApiGifts] = useState<Gift[]>([])
  const [apiLoaded, setApiLoaded] = useState(false)

  // Load AI recommended popular gifts
  const loadPopularGifts = useCallback(async () => {
    if (apiLoaded) return

    setIsLoading(true)
    try {
      const popularGifts = await recommendationAPI.getPopularGifts()
      setApiGifts(popularGifts)
      setApiLoaded(true)
      
      // Initially display first items
      setDisplayedGifts(popularGifts.slice(0, GIFTS_PER_PAGE))
      setPage(1)
      setHasMore(popularGifts.length > GIFTS_PER_PAGE)
      
      toast({
        title: "AI Recommendations Loaded",
        description: "Latest trending gifts loaded successfully!",
      })
    } catch (error) {
      console.error('Failed to load popular gifts:', error)
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
  }, [apiLoaded, toast])

  // 初始加载
  useEffect(() => {
    loadPopularGifts()
  }, [loadPopularGifts])

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

  const handleCreateNewList = () => {
    if (!user) {
      setPendingAction("create-list")
      setShowLoginModal(true)
      return
    }
    setSelectedGift(undefined)
    setShowListModal(true)
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

    // For demo, just copy a mock share link
    const shareLink = `${window.location.origin}/shared/abc123`
    navigator.clipboard.writeText(shareLink)
    toast({
      title: "Link copied!",
      description: "Share link has been copied to your clipboard.",
    })
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
    // 创建新清单并添加商品
    const newList = createList(name)
    if (selectedGift) {
      const result = addGiftToList(newList.id, selectedGift)
      toast({
        title: "Added to new list!",
        description: result.message,
      })
    }
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
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 pb-0">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Popular Gifts</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover the most loved gifts on GiftPop. These trending presents are chosen by thousands of gift-givers and
            guaranteed to bring smiles.
          </p>
        </div>



        {/* Popular Gifts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedGifts.map((gift, index) => (
            <div 
              key={gift.id} 
              className="relative animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${(index % GIFTS_PER_PAGE) * 100}ms` }}
            >
              <GiftCard 
                gift={gift} 
                onAddToList={handleAddToList} 
                showCategoryBadge={false} 
                showTags={true}
              />
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
                You've seen all {displayedGifts.length} popular gifts!
              </span>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-primary/20 -mx-4 border-none py-20 px-0">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Want More Personalized Suggestions?</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Take our quick quiz to get gift recommendations tailored specifically to your recipient.
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full">
              <a href="/wizard/step-1">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Personalized Recommendations
              </a>
            </Button>
          </div>
        </section>
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

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}
