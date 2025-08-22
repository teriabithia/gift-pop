"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CreateListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateList: (name: string) => void
  isLoading?: boolean
}

export function CreateListModal({
  open,
  onOpenChange,
  onCreateList,
  isLoading = false,
}: CreateListModalProps) {
  const [newListName, setNewListName] = useState("")

  const handleCreateList = () => {
    if (!newListName.trim()) return
    
    onCreateList(newListName.trim())
    setNewListName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-gray-100 shadow-[0_25px_50px_rgba(0,0,0,0.25)] p-8">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">Create New List</DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            Give your gift list a memorable name.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="list-name" className="text-base font-medium text-gray-900">
              List Name
            </Label>
            <Input
              id="list-name"
              placeholder="e.g., Mom's Birthday, Holiday Gifts"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
              className="h-14 rounded-3xl border-gray-200 text-base focus:ring-2 focus:ring-purple-primary focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleCreateList} 
              disabled={!newListName.trim() || isLoading} 
              className="flex-1 h-12"
            >
              {isLoading ? "Creating..." : "Create List"}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => onOpenChange(false)} 
              className="h-12"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
