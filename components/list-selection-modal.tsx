"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Gift } from "lucide-react"
import type { Gift as GiftType, GiftList } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ListSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gift?: GiftType
  lists: GiftList[]
  onCreateList: (name: string) => void
  onAddToList: (listId: string, gift?: GiftType) => void
}

export function ListSelectionModal({
  open,
  onOpenChange,
  gift,
  lists,
  onCreateList,
  onAddToList,
}: ListSelectionModalProps) {
  const [newListName, setNewListName] = useState("")
  const { toast } = useToast()

  const handleAddToList = (listId: string) => {
    onAddToList(listId, gift)
    onOpenChange(false)
  }

  const handleCreateNewList = () => {
    if (!newListName.trim()) return
    
    // Call parent's create list handler which handles both creation and adding gift
    onCreateList(newListName.trim())
    
    onOpenChange(false)
    setNewListName("")

    // Remove toast from here since parent component will handle it
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] rounded-2xl border-gray-100 shadow-[0_25px_50px_rgba(0,0,0,0.25)] p-6 overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">Add to List</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {lists.length > 0 && (
            <div className="flex-1 min-h-0">
              <h3 className="text-base font-semibold mb-4">Select existing list:</h3>
              <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Gift className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{list.name}</div>
                        <div className="text-sm text-gray-500">{list.gifts.length} items</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddToList(list.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl"
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-base font-semibold mb-4">Create New List</h3>
            <div className="space-y-3">
              <Input
                placeholder="Enter list name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNewList()}
                className="h-12 px-4 border-gray-200 rounded-xl"
              />
              <Button
                onClick={handleCreateNewList}
                disabled={!newListName.trim()}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium"
              >
                Create New List
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
