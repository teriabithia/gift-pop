"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface Gift {
  id: string
  name: string
  price: number
  image: string
  rating: number
  reviewCount: number
  shopUrl: string
  brand?: string
  description?: string
}

const occasions = [
  {
    id: "birthday",
    name: "Birthday",
    icon: "🎂",
    color: "bg-pink-500",
  },
  {
    id: "wedding",
    name: "Wedding",
    icon: "💒",
    color: "bg-rose-500",
  },
  {
    id: "christmas",
    name: "Christmas",
    icon: "🎄",
    color: "bg-green-600",
  },
  {
    id: "graduation",
    name: "Graduation",
    icon: "🎓",
    color: "bg-blue-600",
  },
  {
    id: "baby-shower",
    name: "Baby Shower",
    icon: "👶",
    color: "bg-yellow-500",
  },
  {
    id: "housewarming",
    name: "Housewarming",
    icon: "🏠",
    color: "bg-orange-500",
  },
  {
    id: "retirement",
    name: "Retirement",
    icon: "💼",
    color: "bg-purple-600",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    icon: "💕",
    color: "bg-red-500",
  },
  {
    id: "mothers-day",
    name: "Mother's Day",
    icon: "💝",
    color: "bg-pink-600",
  },
  {
    id: "fathers-day",
    name: "Father's Day",
    icon: "🎁",
    color: "bg-blue-700",
  },
  {
    id: "valentines-day",
    name: "Valentine's Day",
    icon: "💖",
    color: "bg-red-600",
  },
  {
    id: "just-because",
    name: "Just Because",
    icon: "✨",
    color: "bg-indigo-500",
  },
]

export default function OccasionsPage() {
  const [occasionGifts, setOccasionGifts] = useState<{ [key: string]: Gift[] }>({})
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // 为每个occasion获取前3个推荐商品
    occasions.forEach(occasion => {
      fetchOccasionGifts(occasion.id)
    })
  }, [])

  const fetchOccasionGifts = async (occasionId: string) => {
    try {
      setLoading(prev => ({ ...prev, [occasionId]: true }))
      
      const response = await fetch(`/api/occasions?occasion=${occasionId}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // 只取前3个商品
        const top3Gifts = result.data.slice(0, 3)
        setOccasionGifts(prev => ({ ...prev, [occasionId]: top3Gifts }))
      }
    } catch (err) {
      console.error(`Error fetching gifts for ${occasionId}:`, err)
    } finally {
      setLoading(prev => ({ ...prev, [occasionId]: false }))
    }
  }

  const getGiftImages = (occasionId: string) => {
    const gifts = occasionGifts[occasionId] || []
    const isLoading = loading[occasionId]
    
    if (isLoading) {
      return Array(3).fill(null).map((_, index) => (
        <div key={`loading-${occasionId}-${index}`} className="aspect-square relative overflow-hidden rounded-lg bg-gray-200 animate-pulse">
          <div className="w-full h-full bg-gray-300"></div>
        </div>
      ))
    }
    
      if (gifts.length === 0) {
    return Array(3).fill(null).map((_, index) => (
      <div key={`placeholder-${occasionId}-${index}`} className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
        <Image
          src="https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=Gift"
          alt={`Popular gift ${index + 1}`}
          fill
          className="object-cover"
        />
      </div>
    ))
  }
    
    return gifts.map((gift, index) => (
      <div key={gift.id} className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 group">
        <Image
          src={gift.image && typeof gift.image === 'string' && gift.image.trim() !== '' ? gift.image : 'https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=Gift'}
          alt={gift.name || `Gift item ${gift.id || index}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* 价格标签 */}
        {gift.price && typeof gift.price === 'number' && (
          <div className="absolute top-1 right-1 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
            ${gift.price.toFixed(2)}
          </div>
        )}
        {/* 评分 */}
        {gift.rating && typeof gift.rating === 'number' && gift.rating > 0 && (
          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            {gift.rating.toFixed(1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Gifts by Occasions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect gift for any celebration or milestone. Browse our curated collections organized by special
            occasions and life events.
          </p>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {occasions.map((occasion) => (
            <Card
              key={occasion.id}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 shadow-none"
            >
              <CardHeader className="pb-4">
                                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="text-2xl">{occasion.icon}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{occasion.name}</CardTitle>
                    </div>
                  </div>
                
                {/* 热门商品图片 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {getGiftImages(occasion.id)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={`/occasions/${occasion.id}`}>
                  <Button className="w-full hover:bg-primary/90 transition-colors">View Gifts</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-primary/20 -mx-4 border-none py-20 px-0">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Not sure what occasion this is for?</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Take our personalized quiz to get AI-powered recommendations tailored specifically to your gift recipient.
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full">
              <Link href="/wizard/step-1?reset=true">
                <span className="mr-2 text-lg">✨</span>
                Take Our Quiz
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
