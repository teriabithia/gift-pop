"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Mail, MessageCircle } from "lucide-react"

const faqs = [
  {
    id: "1",
    question: "How does GiftPop's AI recommendation system work?",
    answer:
      "Our AI analyzes the information you provide about the gift recipient - their relationship to you, interests, age, and preferences - to suggest personalized gift recommendations. We use machine learning algorithms trained on thousands of successful gift-giving scenarios to find presents that truly match the recipient's personality and your budget.",
  },
  {
    id: "2",
    question: "Is GiftPop free to use?",
    answer:
      "Yes! GiftPop is completely free to use. You can get personalized gift recommendations, create and manage gift lists, and share them with others at no cost. We earn a small commission when you purchase gifts through our partner retailers, but this never affects the price you pay.",
  },
  {
    id: "3",
    question: "How do I create and manage gift lists?",
    answer:
      "After creating a free account, you can create unlimited gift lists for different occasions or people. Simply click 'Add to List' on any recommended gift, or create a new list from your My Lists page. You can rename, share, or delete lists anytime, and add personal notes to remember why you chose certain gifts.",
  },
  {
    id: "4",
    question: "Can I share my gift lists with others?",
    answer:
      "You can share any of your gift lists by clicking the 'Share' button. This generates a unique link that you can send to family and friends. They can view your list and even help you choose the perfect gift. Shared lists are view-only for others unless you give them editing permissions.",
  },
  {
    id: "5",
    question: "How accurate are the gift recommendations?",
    answer:
      "Our recommendations have a 98% satisfaction rate based on user feedback. The more detailed information you provide about the recipient, the more accurate our suggestions become. We continuously improve our AI based on user interactions and feedback to ensure you find the perfect gift every time.",
  },
  {
    id: "6",
    question: "Do you store my personal information?",
    answer:
      "We take privacy seriously. We only store the information necessary to provide personalized recommendations and manage your account. We never sell your personal data to third parties, and you can delete your account and all associated data at any time from your account settings.",
  },
  {
    id: "7",
    question: "What if I'm not satisfied with the recommendations?",
    answer:
      "If our initial recommendations don't feel right, you can easily start over with different preferences or provide more specific details about the recipient. You can also browse our Popular Gifts or Occasions pages for additional inspiration. Our goal is to help you find the perfect gift, so don't hesitate to try different approaches.",
  },
  {
    id: "8",
    question: "How do I purchase the recommended gifts?",
    answer:
      "We partner with trusted retailers to bring you the best prices and selection. When you click 'Shop Now' on any gift, you'll be taken directly to the retailer's website to complete your purchase. We don't handle transactions directly, ensuring you get the retailer's full customer service and return policies.",
  },
  {
    id: "9",
    question: "Can I use GiftPop for business or corporate gifts?",
    answer:
      "Yes! GiftPop works great for corporate gifting, client appreciation, and employee recognition. You can create separate lists for different business relationships and occasions. For bulk corporate gifting needs, please contact our support team for personalized assistance.",
  },
  {
    id: "10",
    question: "Is there a mobile app available?",
    answer:
      "Currently, GiftPop is available as a web application that works perfectly on all devices - desktop, tablet, and mobile. We're working on dedicated mobile apps for iOS and Android, which will be available soon. You can add our website to your home screen for a native app-like experience.",
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleContactSupport = () => {
    window.location.href = "mailto:support@giftpop.com?subject=GiftPop Support Request"
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about GiftPop's AI-powered gift recommendations and features.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq) => (
            <Card key={faq.id} className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
              <Collapsible open={openItems.includes(faq.id)} onOpenChange={() => toggleItem(faq.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-left text-lg font-semibold pr-4">{faq.question}</CardTitle>
                      {openItems.includes(faq.id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Contact Support Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 hover:shadow-lg transition-all duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Still have questions?</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Our support team is here to help you find the perfect gifts and make the most of GiftPop.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleContactSupport} className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:hello@giftpop.com" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  General Inquiries
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              We typically respond within 24 hours during business days.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
