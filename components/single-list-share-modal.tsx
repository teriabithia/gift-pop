"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Share2 } from "lucide-react"
import type { GiftList } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface SingleListShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: GiftList | null
  onGenerateLink: (listId: string) => Promise<string>
}

export function SingleListShareModal({ open, onOpenChange, list, onGenerateLink }: SingleListShareModalProps) {
  const [step, setStep] = useState<"loading" | "success">("loading")
  const [generatedLink, setGeneratedLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const { toast } = useToast()

  // Generate link when modal opens
  useEffect(() => {
    if (open && list) {
      handleGenerateLink()
    }
  }, [open, list])

  const handleGenerateLink = async () => {
    if (!list) return

    try {
      setStep("loading")
      const shareLink = await onGenerateLink(list.id)
      setGeneratedLink(shareLink)

      // Copy to clipboard
      navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)
      setStep("success")

      // Reset copied state after 3 seconds
      setTimeout(() => setLinkCopied(false), 3000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      })
      onOpenChange(false)
    }
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
      setStep("loading")
      setGeneratedLink("")
      setLinkCopied(false)
    }, 200)
  }

  if (!list) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full rounded-2xl border-gray-100 shadow-[0_25px_50px_rgba(0,0,0,0.25)] p-6">
        {step === "loading" ? (
          <>
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-bold">Share Gift List</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Generating shareable link for "{list.name}"...
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-bold">Share Gift List</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Your shareable link for "{list.name}" is ready!
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

              {/* List Info */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="font-medium text-sm text-foreground">{list.name}</div>
                <div className="text-xs text-muted-foreground">
                  {list.gifts.length} {list.gifts.length === 1 ? "item" : "items"} • Now Public
                </div>
              </div>

              {/* Generated Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg border min-w-0">
                  <span className="text-sm font-mono text-foreground break-all flex-1 mr-3 min-w-0 leading-relaxed">
                    {generatedLink}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-8 w-8 p-0 text-primary hover:text-primary/80 flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
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


