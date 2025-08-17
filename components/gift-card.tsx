"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import type { Gift } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useLists } from "@/contexts/lists-context"

interface GiftCardProps {
  gift: Gift
  onAddToList: (gift: Gift) => void
  showCategoryBadge?: boolean
  showTags?: boolean
}

export function GiftCard({ gift, onAddToList, showCategoryBadge = true, showTags = false }: GiftCardProps) {
  const { user } = useAuth()
  const { lists } = useLists()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

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
      onAddToList(gift)
      return
    }

    setIsAdding(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Call the parent handler to show list selection modal
      onAddToList(gift)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to list. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleShopNow = () => {
    // Show message if no valid link is available
    if (!gift.shopUrl || gift.shopUrl === '#') {
      toast({
        title: "Link not available",
        description: "Shopping link is not available for this item.",
        variant: "default",
      })
      return
    }
    window.open(gift.shopUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Card className="group bg-white border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden rounded-md py-0 h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="aspect-square relative overflow-hidden bg-gray-50 flex-shrink-0">
          <Image
            src={gift.image || "/placeholder.svg"}
            alt={gift.name}
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
              <>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-gray-900">{gift.rating}</span>
                </div>
                <span className="text-xs text-gray-500">
                  ({gift.reviewCount > 0 ? gift.reviewCount.toLocaleString() : 0})
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">No rating</span>
            )}
          </div>

          <div className="flex items-center justify-between flex-shrink-0 mt-3">
            <span className="text-xl font-bold text-purple-600">
              {gift.price > 0 ? `$${gift.price}` : 'Price not available'}
            </span>
          </div>

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
        </div>
      </CardContent>
    </Card>
  )
}
