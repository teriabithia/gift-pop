"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle } from "lucide-react"
import type { Gift } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useLists } from "@/contexts/lists-context"
import { ShoppingModal } from "./shopping-modal"
import { ListSelectionModal } from "./list-selection-modal"
import { LoginModal } from "./login-modal"

interface GiftCardProps {
  gift: Gift
  showCategoryBadge?: boolean
  showTags?: boolean
  showActionButtons?: boolean
  onAddToList?: (gift: Gift) => void
  isSharedPage?: boolean
  isSelected?: boolean
  onToggleSelection?: (gift: Gift) => void
  isProcessing?: boolean
}

export function GiftCard({ gift, showCategoryBadge = true, showTags = false, showActionButtons = true, onAddToList, isSharedPage = false, isSelected = false, onToggleSelection, isProcessing = false }: GiftCardProps) {
  const { user } = useAuth()
  const { lists, createList, addGiftToList } = useLists()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [showShoppingModal, setShowShoppingModal] = useState(false)
  const [showListModal, setShowListModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

    // 不再检查是否已在清单中，允许重复添加

  // 解析标签（从JSON字符串或数组）
  const getTags = () => {
    if (!gift.tags) return []
    try {
      return typeof gift.tags === 'string' ? JSON.parse(gift.tags) : gift.tags
    } catch {
      return []
    }
  }

  const handleAddToList = async () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    // If parent component provides onAddToList callback, use it
    if (onAddToList) {
      onAddToList(gift)
      return
    }

    // Otherwise, show the list selection modal
    setShowListModal(true)
  }

  const handleCreateNewList = async (name: string) => {
    setIsAdding(true)
    try {
      const result = await createList(name, gift)
      toast({
        title: "Success",
        description: `"<span class="font-semibold text-gray-900">${gift.name}</span>" has been added to your new list "<span class="font-semibold text-purple-600">${name}</span>"!`,
        variant: "success",
      })
      setShowListModal(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create list. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleAddToExistingList = async (listId: string) => {
    setIsAdding(true)
    try {
      const result = await addGiftToList(listId, gift)
      if (result.success) {
        toast({
          title: "Success",
          description: `"<span class="font-semibold text-gray-900">${gift.name}</span>" has been added to "<span class="font-semibold text-purple-600">${result.listName}</span>"!`,
          variant: "success",
        })
        setShowListModal(false)
      } else {
        // 根据result.message判断具体原因
        const isAlreadyInList = result.message?.includes('already') || result.message?.includes('exists')
        
        if (isAlreadyInList) {
          toast({
            title: "Already in list",
            description: `"<span class="font-semibold text-gray-900">${gift.name}</span>" is already in "<span class="font-semibold text-purple-600">${result.listName}</span>".`,
            variant: "default", // 使用默认样式，不是错误
          })
        } else {
          toast({
            title: "Unable to add",
            description: result.message || "Please try again later.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Error adding gift to list:', error)
      toast({
        title: "Unable to add",
        description: "There was an issue adding the gift. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleShopNow = () => {
    // Direct link to eBay product page
    if (gift.shopUrl) {
      window.open(gift.shopUrl, '_blank', 'noopener,noreferrer')
    } else {
      // Fallback: open shopping modal if no direct link
      setShowShoppingModal(true)
    }
  }

  return (
    <Card className="group bg-white border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden rounded-md py-0 h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="aspect-square relative overflow-hidden bg-gray-50 flex-shrink-0">
          <Image
            src={gift.image || "/placeholder.svg"}
            alt={gift.name || `Gift item`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex-shrink-0">
            {/* Brand name - light gray uppercase */}
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
              {gift.brand || 'Not Available'}
            </p>
            {/* Product name - single line with ellipsis for overflow */}
            <h3 className="font-semibold text-gray-900 truncate leading-tight text-sm">
              {gift.name || 'Gift Item'}
            </h3>
          </div>

                    {/* Tags display (only on Popular page) */}
          {showTags && (
            <div className="flex-shrink-0 mt-2">
              <div className="flex gap-1 overflow-hidden">
                {getTags().slice(0, 3).map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 hover:bg-gray-200 whitespace-nowrap"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0 mt-2">
            {gift.rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-gray-900">{gift.rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">No rating</span>
            )}
          </div>

          <div className="flex items-center justify-between flex-shrink-0 mt-3">
            <span className="text-xl font-bold text-purple-600">
              {gift.price > 0 ? `$${gift.price.toFixed(2)}` : 'Price not available'}
            </span>
          </div>

          {isSharedPage ? (
            <div className="pt-4 mt-auto">
              <Button
                onClick={() => onToggleSelection?.(gift)}
                disabled={isProcessing}
                className={`w-full h-10 text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  isSelected
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-2 border-green-400'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isSelected ? 'Selected' : 'Select This Gift'}
                  </>
                )}
              </Button>
            </div>
          ) : showActionButtons ? (
            <div className="flex gap-2 pt-4 mt-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddToList}
                disabled={isAdding}
                className="flex-1 h-8 text-xs"
              >
                {isAdding ? "Adding..." : "Add to List"}
              </Button>
              <Button size="sm" onClick={handleShopNow} className="flex-1 h-8 text-xs">
                Shop Now
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
      
      <ShoppingModal
        gift={gift}
        isOpen={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
      />
      
      <ListSelectionModal
        open={showListModal}
        onOpenChange={setShowListModal}
        gift={gift}
        lists={lists}
        onCreateList={handleCreateNewList}
        onAddToList={handleAddToExistingList}
      />
      
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </Card>
  )
}
