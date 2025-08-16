"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Plus, Share2, Sparkles } from "lucide-react"
import { useWizard } from "@/contexts/wizard-context"
import { useAuth } from "@/contexts/auth-context"
import { GiftCard } from "@/components/gift-card"
import { ListSelectionModal } from "@/components/list-selection-modal"
import { LoginModal } from "@/components/login-modal"
import { ShareModal } from "@/components/share-modal"
import { mockGifts } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import type { Gift, GiftList } from "@/lib/types"

export default function RecommendationsPage() {
  const router = useRouter()
  const { data: wizardData, resetData } = useWizard()
  const { user } = useAuth()
  const { toast } = useToast()

  const [showListModal, setShowListModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<Gift | undefined>()
  const [pendingAction, setPendingAction] = useState<"add-to-list" | "create-list" | "share-list" | null>(null)
  const [userLists, setUserLists] = useState<GiftList[]>([])

  // Mock user lists
  useEffect(() => {
    if (user) {
      setUserLists([
        {
          id: "1",
          name: "Mom's Birthday",
          userId: user.id,
          gifts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublic: false,
        },
        {
          id: "2",
          name: "Holiday Gifts 2024",
          userId: user.id,
          gifts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublic: true,
          shareId: "abc123",
        },
      ])
    }
  }, [user])

  const getRecommendationContext = () => {
    if (!wizardData.relationship) return "Perfect Gifts"

    let context = wizardData.relationship
    if (wizardData.gender) context += ` (${wizardData.gender})`
    if (wizardData.ageRange) context += `, ${wizardData.ageRange}`

    return `Based on: ${context.charAt(0).toUpperCase() + context.slice(1)}`
  }

  const handleStartOver = () => {
    resetData()
    router.push("/wizard/step-1")
  }

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

    if (userLists.length === 0) {
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
    const newList: GiftList = {
      id: Date.now().toString(),
      name,
      userId: user!.id,
      gifts: selectedGift ? [selectedGift] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
    }
    setUserLists((prev) => [...prev, newList])
  }

  const handleAddToExistingList = (listId: string, gift?: Gift) => {
    if (gift) {
      setUserLists((prev) =>
        prev.map((list) =>
          list.id === listId ? { ...list, gifts: [...list.gifts, gift], updatedAt: new Date() } : list,
        ),
      )
    }
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

        <div className="mb-16 flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <Button onClick={handleStartOver} variant="secondary" size="xl" className="w-full sm:w-auto min-w-[160px]">
            <RotateCcw className="h-5 w-5 mr-3" />
            Start Over
          </Button>
          <Button onClick={handleCreateNewList} size="xl" className="w-full sm:w-auto min-w-[180px]">
            <Plus className="h-5 w-5 mr-3" />
            Create New List
          </Button>
          <Button onClick={handleShareList} variant="success" size="xl" className="w-full sm:w-auto min-w-[140px]">
            <Share2 className="h-5 w-5 mr-3" />
            Share List
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mockGifts.map((gift, index) => (
            <div
              key={gift.id}
              className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <GiftCard gift={gift} onAddToList={handleAddToList} />
            </div>
          ))}
        </div>

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
        lists={userLists}
        onCreateList={handleCreateList}
        onAddToList={handleAddToExistingList}
      />

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        lists={userLists}
        onGenerateLink={handleGenerateShareLink}
      />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}
