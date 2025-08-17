"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Cake, GraduationCap, Baby, Home, Briefcase, TreePine, Gift, Sparkles, Calendar } from "lucide-react"

const occasions = [
  {
    id: "birthday",
    name: "Birthday",
    icon: Cake,
    color: "bg-pink-500",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "wedding",
    name: "Wedding",
    icon: Heart,
    color: "bg-rose-500",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "christmas",
    name: "Christmas",
    icon: TreePine,
    color: "bg-green-600",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "graduation",
    name: "Graduation",
    icon: GraduationCap,
    color: "bg-blue-600",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "baby-shower",
    name: "Baby Shower",
    icon: Baby,
    color: "bg-yellow-500",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "housewarming",
    name: "Housewarming",
    icon: Home,
    color: "bg-orange-500",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "retirement",
    name: "Retirement",
    icon: Briefcase,
    color: "bg-purple-600",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "anniversary",
    name: "Anniversary",
    icon: Heart,
    color: "bg-red-500",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "mothers-day",
    name: "Mother's Day",
    icon: Heart,
    color: "bg-pink-600",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "fathers-day",
    name: "Father's Day",
    icon: Gift,
    color: "bg-blue-700",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "valentines-day",
    name: "Valentine's Day",
    icon: Heart,
    color: "bg-red-600",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
  {
    id: "just-because",
    name: "Just Because",
    icon: Sparkles,
    color: "bg-indigo-500",
    popularGifts: ["/placeholder-rkc74.png", "/wireless-headphones.png", "/smart-fitness-watch.png"],
  },
]

export default function OccasionsPage() {
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
          {occasions.map((occasion) => {
            const IconComponent = occasion.icon
            return (
              <Card
                key={occasion.id}
                className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 shadow-none"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{occasion.name}</CardTitle>
                    </div>
                  </div>
                  
                  {/* 热门商品图片 */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {occasion.popularGifts.map((image, index) => (
                      <div key={index} className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={image}
                          alt={`Popular gift ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href={`/recommendations?occasion=${occasion.id}`}>
                    <Button className="w-full hover:bg-primary/90 transition-colors">View Gifts</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
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
                <Sparkles className="mr-2 h-5 w-5" />
                Take Our Quiz
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
