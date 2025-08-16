"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TrendingUp, Plus, Share2, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLists } from "@/contexts/lists-context"
import { GiftCard } from "@/components/gift-card"
import { ListSelectionModal } from "@/components/list-selection-modal"
import { LoginModal } from "@/components/login-modal"
import { mockGifts } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import type { Gift } from "@/lib/types"

// Extended mock data for popular gifts with trending indicators
const popularGifts: (Gift & { trendingScore: number; weeklyGrowth: number })[] = [
  {
    ...mockGifts[0],
    trendingScore: 95,
    weeklyGrowth: 23,
  },
  {
    ...mockGifts[1],
    trendingScore: 92,
    weeklyGrowth: 18,
  },
  {
    ...mockGifts[2],
    trendingScore: 89,
    weeklyGrowth: 31,
  },
  {
    ...mockGifts[3],
    trendingScore: 87,
    weeklyGrowth: 15,
  },
  {
    ...mockGifts[4],
    trendingScore: 85,
    weeklyGrowth: 27,
  },
  {
    ...mockGifts[5],
    trendingScore: 82,
    weeklyGrowth: 12,
  },
  // Additional popular gifts
  {
    id: "7",
    name: "Wireless Noise-Canceling Headphones",
    brand: "SoundTech Pro",
    price: 199.99,
    rating: 4.7,
    reviewCount: 3421,
    image: "/wireless-headphones.png",
    shopUrl: "https://example.com/headphones",
    category: "Electronics",
    trendingScore: 94,
    weeklyGrowth: 35,
  },
  {
    id: "8",
    name: "Smart Fitness Watch",
    brand: "FitLife",
    price: 249.99,
    rating: 4.6,
    reviewCount: 2876,
    image: "/smart-fitness-watch.png",
    shopUrl: "https://example.com/fitness-watch",
    category: "Fitness",
    trendingScore: 91,
    weeklyGrowth: 22,
  },
  {
    id: "9",
    name: "Artisan Coffee Subscription Box",
    brand: "Roast Masters",
    price: 29.99,
    rating: 4.8,
    reviewCount: 1654,
    image: "/coffee-subscription-box.png",
    shopUrl: "https://example.com/coffee-subscription",
    category: "Food & Beverage",
    trendingScore: 88,
    weeklyGrowth: 19,
  },
]

export default function PopularGiftsPage() {
  const { user } = useAuth()
  const { lists } = useLists()
  const { toast } = useToast()

  const [showListModal, setShowListModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<Gift | undefined>()
  const [pendingAction, setPendingAction] = useState<"add-to-list" | "create-list" | "share-list" | null>(null)

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
    // This would be handled by the ListsProvider
    if (selectedGift) {
      toast({
        title: "Added to new list!",
        description: `"${selectedGift.name}" has been added to "${name}".`,
      })
    }
  }

  const handleAddToExistingList = (listId: string, gift?: Gift) => {
    if (gift) {
      const list = lists.find((l) => l.id === listId)
      toast({
        title: "Added to list!",
        description: `"${gift.name}" has been added to "${list?.name}".`,
      })
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

        {/* Toolbar */}
        <div className="mb-16 flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <Button onClick={handleCreateNewList} size="xl" className="w-full sm:w-auto min-w-[180px]">
            <Plus className="h-5 w-5 mr-3" />
            Create New List
          </Button>
          <Button onClick={handleShareList} variant="success" size="xl" className="w-full sm:w-auto min-w-[140px]">
            <Share2 className="h-5 w-5 mr-3" />
            Share List
          </Button>
        </div>

        {/* Popular Gifts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularGifts.map((gift, index) => (
            <div key={gift.id} className="relative">
              <GiftCard gift={gift} onAddToList={handleAddToList} showCategoryBadge={false} />
            </div>
          ))}
        </div>

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
