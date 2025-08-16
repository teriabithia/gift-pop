"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Cake, GraduationCap, Baby, Home, Briefcase, TreePine, Gift, Sparkles, Calendar } from "lucide-react"

const occasions = [
  {
    id: "birthday",
    name: "Birthday",
    description: "Celebrate another year of life with thoughtful birthday gifts",
    icon: Cake,
    color: "bg-pink-500",
    popularFor: ["Friends", "Family", "Colleagues"],
  },
  {
    id: "wedding",
    name: "Wedding",
    description: "Honor the happy couple with meaningful wedding gifts",
    icon: Heart,
    color: "bg-rose-500",
    popularFor: ["Couples", "Newlyweds", "Bridal Party"],
  },
  {
    id: "christmas",
    name: "Christmas",
    description: "Spread holiday joy with festive Christmas presents",
    icon: TreePine,
    color: "bg-green-600",
    popularFor: ["Family", "Children", "Everyone"],
  },
  {
    id: "graduation",
    name: "Graduation",
    description: "Celebrate academic achievements with inspiring gifts",
    icon: GraduationCap,
    color: "bg-blue-600",
    popularFor: ["Students", "Graduates", "Achievers"],
  },
  {
    id: "baby-shower",
    name: "Baby Shower",
    description: "Welcome new arrivals with adorable baby gifts",
    icon: Baby,
    color: "bg-yellow-500",
    popularFor: ["New Parents", "Babies", "Expecting"],
  },
  {
    id: "housewarming",
    name: "Housewarming",
    description: "Help make a house feel like home with practical gifts",
    icon: Home,
    color: "bg-orange-500",
    popularFor: ["New Homeowners", "Couples", "Families"],
  },
  {
    id: "retirement",
    name: "Retirement",
    description: "Honor years of hard work with thoughtful retirement gifts",
    icon: Briefcase,
    color: "bg-purple-600",
    popularFor: ["Retirees", "Colleagues", "Mentors"],
  },
  {
    id: "anniversary",
    name: "Anniversary",
    description: "Commemorate special milestones with romantic gifts",
    icon: Heart,
    color: "bg-red-500",
    popularFor: ["Couples", "Spouses", "Partners"],
  },
  {
    id: "mothers-day",
    name: "Mother's Day",
    description: "Show appreciation for mom with heartfelt gifts",
    icon: Heart,
    color: "bg-pink-600",
    popularFor: ["Mothers", "Grandmothers", "Mother Figures"],
  },
  {
    id: "fathers-day",
    name: "Father's Day",
    description: "Celebrate dad with gifts that show you care",
    icon: Gift,
    color: "bg-blue-700",
    popularFor: ["Fathers", "Grandfathers", "Father Figures"],
  },
  {
    id: "valentines-day",
    name: "Valentine's Day",
    description: "Express your love with romantic Valentine's gifts",
    icon: Heart,
    color: "bg-red-600",
    popularFor: ["Partners", "Spouses", "Crushes"],
  },
  {
    id: "just-because",
    name: "Just Because",
    description: "Surprise someone special for no reason at all",
    icon: Sparkles,
    color: "bg-indigo-500",
    popularFor: ["Anyone", "Friends", "Family"],
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
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{occasion.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed">{occasion.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {occasion.popularFor.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/recommendations?occasion=${occasion.id}`}>
                    <Button className="w-full hover:bg-primary/90 transition-colors">View Gifts</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <CardContent className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <Sparkles className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">Not sure what occasion this is for?</h2>
              <p className="text-xl mb-8 opacity-90">
                Take our personalized quiz to get AI-powered recommendations tailored specifically to your gift
                recipient.
              </p>
              <Link href="/wizard/step-1">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Take Our Quiz
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
