"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, CheckCircle, RefreshCw } from "lucide-react"
import { GiftCard } from "@/components/gift-card"
import type { GiftList, Gift as GiftType } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function SharedListPage() {
  const params = useParams()
  const shareId = params.shareId as string
  const [sharedList, setSharedList] = useState<GiftList | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGifts, setSelectedGifts] = useState<Set<string>>(new Set())
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSharedList = async () => {
      try {
        const response = await fetch(`/api/shared/${shareId}`)
        
        if (response.ok) {
          const data = await response.json()
          // Convert date strings back to Date objects
          const listWithDates = {
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
          }
          setSharedList(listWithDates)
        } else {
          setSharedList(null)
        }
      } catch (error) {
        console.error('Error fetching shared list:', error)
        setSharedList(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSharedList()
  }, [shareId])

  const handleSelectGift = (gift: GiftType) => {
    if (selectedGifts.has(gift.id)) {
      // Deselect gift
      setSelectedGifts(prev => {
        const newSet = new Set(prev)
        newSet.delete(gift.id)
        return newSet
      })
    } else {
      // Select gift
      setSelectedGifts(prev => new Set([...prev, gift.id]))
    }
  }

  const handleSubmitFinalSelection = async () => {
    if (selectedGifts.size === 0) {
      toast({
        title: "No gifts selected",
        description: "Please select at least one gift before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
      // Submit selections for each gift
      const promises = Array.from(selectedGifts).map(giftId => {
        const gift = sharedList?.gifts.find(g => g.id === giftId)
        if (!gift) return Promise.resolve()
        
        return fetch(`/api/shared/${shareId}/select`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            giftId: gift.id,
            selectedBy: 'Anonymous',
            selectionNote: '',
          }),
        })
      })

      await Promise.all(promises)

      // Set submitted state instead of showing toast
      setIsSubmitted(true)

      // Refresh the shared list to show updated selections
      const updatedResponse = await fetch(`/api/shared/${shareId}`)
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json()
        const listWithDates = {
          ...updatedData,
          createdAt: new Date(updatedData.createdAt),
          updatedAt: new Date(updatedData.updatedAt),
        }
        setSharedList(listWithDates)
      }
    } catch (error) {
      console.error('Error submitting selection:', error)
      toast({
        title: "Error submitting selection",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleResetSelection = () => {
    setIsSubmitted(false)
    setSelectedGifts(new Set())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared list...</p>
        </div>
      </div>
    )
  }

  if (!sharedList) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">List Not Found</h1>
            <p className="text-gray-600 mb-6">
              The shared list you're looking for doesn't exist or is no longer available.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6">
            <Gift className="h-4 w-4 mr-2" />
            Shared Gift List
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Gifts from{' '}
            <span className="text-purple-600">
              {sharedList.creatorName || 'Anonymous'}
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Please select the gifts you like from this curated collection
          </p>
          
          {/* Special Preferences */}
          {sharedList.specialPreferences && (
            <div className="mt-8 max-w-3xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    Special Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{sharedList.specialPreferences}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Gifts Grid Section */}
        {sharedList.gifts.length > 0 ? (
          <div className="space-y-12">
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sharedList.gifts.map((gift) => (
                <div key={gift.id} className="group">
                  <GiftCard
                    gift={gift}
                    showCategoryBadge={true}
                    showTags={false}
                    showActionButtons={false}
                    isSharedPage={true}
                    isSelected={selectedGifts.has(gift.id)}
                    onToggleSelection={handleSelectGift}
                  />
                </div>
              ))}
            </div>
            
            {/* Submit Section - Centered */}
            {selectedGifts.size > 0 && (
              <div className="mt-20 text-center">
                {!isSubmitted ? (
                  <>
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {selectedGifts.size} Gift{selectedGifts.size !== 1 ? 's' : ''} Selected
                      </h3>
                      <p className="text-base text-gray-700">
                        Ready to confirm your selection?
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleSubmitFinalSelection}
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-orange-400"
                    >
                      <CheckCircle className="h-5 w-5 mr-3" />
                      Confirm Selection & Submit
                    </Button>
                  </>
                ) : (
                                 <>
                 <div className="mb-8">
                   <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                     <CheckCircle className="h-8 w-8 text-green-600" />
                   </div>
                   <h3 className="text-2xl font-bold text-green-900 mb-3">
                     Submitted
                   </h3>
                   <p className="text-base text-green-700">
                     Your gift selection has been successfully submitted!
                   </p>
                 </div>
                 
                 <Button
                   onClick={handleResetSelection}
                   size="lg"
                   className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                 >
                   <RefreshCw className="h-5 w-5 mr-3" />
                   Reselect
                 </Button>
               </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Gift className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Empty List</h2>
            <p className="text-gray-600 text-lg">This list doesn't have any gifts yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
