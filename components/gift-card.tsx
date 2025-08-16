"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import type { Gift } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface GiftCardProps {
  gift: Gift
  onAddToList: (gift: Gift) => void
  showCategoryBadge?: boolean
}

export function GiftCard({ gift, onAddToList, showCategoryBadge = true }: GiftCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

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

      toast({
        title: "Ready to add!",
        description: `Select a list to add ${gift.name}.`,
      })
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
    window.open(gift.shopUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Card className="group bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden rounded-md py-0">
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden bg-gray-50">
          <Image
            src={gift.image || "/placeholder.svg"}
            alt={gift.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4 flex flex-col h-full">
          <div className="flex-shrink-0">
            <h3 className="font-semibold text-gray-900 line-clamp-1 leading-tight min-h-[1.4rem] text-sm">
              {gift.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-warning text-yellow-warning" />
              <span className="text-xs font-medium text-gray-900">{gift.rating}</span>
            </div>
            <span className="text-xs text-gray-500">({gift.reviewCount.toLocaleString()})</span>
          </div>

          <div className="flex items-center justify-between flex-shrink-0 mt-3">
            <span className="text-xl font-bold text-purple-primary">${gift.price}</span>
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
