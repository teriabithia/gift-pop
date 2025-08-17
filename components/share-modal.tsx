"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { CheckCircle, Copy, Share2 } from "lucide-react"
import type { GiftList } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lists: GiftList[]
  onGenerateLink: (listId: string) => string
}

export function ShareModal({ open, onOpenChange, lists, onGenerateLink }: ShareModalProps) {
  const [selectedListId, setSelectedListId] = useState("")
  const [step, setStep] = useState<"select" | "success">("select")
  const [generatedLink, setGeneratedLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const { toast } = useToast()

  const handleGenerateLink = () => {
    if (!selectedListId) return

    const shareLink = onGenerateLink(selectedListId)
    setGeneratedLink(shareLink)

    // Copy to clipboard
    navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)
    setStep("success")

    // Reset copied state after 3 seconds
    setTimeout(() => setLinkCopied(false), 3000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setLinkCopied(true)
    toast({
      title: "Link copied!",
      description: "Share link has been copied to your clipboard.",
    })

    // Reset copied state after 3 seconds
    setTimeout(() => setLinkCopied(false), 3000)
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state when modal closes
    setTimeout(() => {
      setStep("select")
      setSelectedListId("")
      setGeneratedLink("")
      setLinkCopied(false)
    }, 200)
  }

  const selectedList = lists.find((list) => list.id === selectedListId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm rounded-2xl border-gray-100 shadow-[0_25px_50px_rgba(0,0,0,0.25)] p-6">
        {step === "select" ? (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-bold">Share Gift List</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Choose a list to share with others
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-xs font-medium text-foreground">Select a list to share</Label>

                {lists.length > 0 ? (
                  <div className="space-y-2">
                    {lists.map((list) => (
                      <div
                        key={list.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedListId === list.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-200"
                        }`}
                        onClick={() => setSelectedListId(list.id)}
                      >
                        <div className="font-medium text-sm text-foreground">{list.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {list.gifts.length} {list.gifts.length === 1 ? "item" : "items"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No lists available to share</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent h-9 text-sm">
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateLink}
                  disabled={!selectedListId}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-9 text-sm"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Generate Link
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-bold">Share Gift List</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Your shareable link is ready!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium text-sm">Link copied to clipboard!</span>
                </div>
              </div>

              {/* Generated Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg border min-w-0">
                  <span className="text-xs font-mono text-foreground truncate flex-1 mr-2 min-w-0">
                    {generatedLink}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-6 w-6 p-0 text-primary hover:text-primary/80 flex-shrink-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view your gift list and see which items you've selected.
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-9 text-sm"
              >
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
