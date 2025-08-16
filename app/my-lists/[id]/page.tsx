"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Share2, Edit, Plus, ExternalLink, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLists } from "@/contexts/lists-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ShareModal } from "@/components/share-modal"

export default function ListDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { getListById, updateList, removeGiftFromList, generateShareLink } = useLists()
  const { toast } = useToast()

  const listId = params.id as string
  const list = getListById(listId)

  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(list?.specialPreferences || "")
  const [removingGift, setRemovingGift] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  // Redirect if not logged in or list not found
  if (!user) {
    router.push("/")
    return null
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">List not found</h1>
          <p className="text-muted-foreground mb-6">The list you're looking for doesn't exist or has been deleted.</p>
          <Link href="/my-lists">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Lists
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSaveNotes = () => {
    updateList(listId, { specialPreferences: notes })
    setIsEditing(false)
    toast({
      title: "Notes saved!",
      description: "Your list notes have been updated.",
    })
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleGenerateShareLink = (listId: string) => {
    const shareLink = generateShareLink(listId)
    return shareLink
  }

  const handleRemoveGift = (giftId: string) => {
    removeGiftFromList(listId, giftId)
    setRemovingGift(null)
    toast({
      title: "Gift removed",
      description: "The gift has been removed from your list.",
    })
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/my-lists">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{list.name}</h1>
            <div className="flex items-center gap-4">
              <Badge variant={list.isPublic ? "default" : "secondary"}>{list.isPublic ? "Public" : "Private"}</Badge>
              <span className="text-sm text-muted-foreground">
                Updated {formatDistanceToNow(list.updatedAt, { addSuffix: true })}
              </span>
              <span className="text-sm text-muted-foreground">
                {list.gifts.length} {list.gifts.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Notes Section */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notes</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSaveNotes()
                  } else {
                    setIsEditing(true)
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this list, special preferences, or reminders..."
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveNotes} size="sm">
                    Save Notes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setNotes(list.specialPreferences || "")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                {notes || "No notes added yet. Click Edit to add notes about this list."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Gifts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Gifts in this list</h2>
            <Link href="/recommendations">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add More Gifts
              </Button>
            </Link>
          </div>

          {list.gifts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {list.gifts.map((gift) => (
                <Card
                  key={gift.id}
                  className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
                >
                  <CardContent className="p-4">
                    <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={gift.image || "/placeholder.svg"}
                        alt={gift.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setRemovingGift(gift.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {gift.category && (
                        <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground">
                          {gift.category}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">{gift.brand}</p>
                        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">{gift.name}</h3>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${gift.price}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{gift.rating}</span>
                          <span className="text-sm text-muted-foreground">({gift.reviewCount})</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full hover:bg-primary/90"
                        onClick={() => window.open(gift.shopUrl, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Shop Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>No gifts in this list yet</CardTitle>
                <CardDescription>Start adding gifts to organize your ideas for this occasion.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/recommendations">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Find Gifts to Add
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Share Modal */}
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          lists={[list]}
          onGenerateLink={handleGenerateShareLink}
        />

        {/* Remove Gift Confirmation Dialog */}
        <AlertDialog open={!!removingGift} onOpenChange={() => setRemovingGift(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Gift</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this gift from your list? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => removingGift && handleRemoveGift(removingGift)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
