"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Plus, List, MoreVertical, Share2, Edit, Trash2, Calendar, Gift } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLists } from "@/contexts/lists-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ShareModal } from "@/components/share-modal"

export default function MyListsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { lists, createList, updateList, deleteList, generateShareLink } = useLists()
  const { toast } = useToast()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [editingList, setEditingList] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [deletingList, setDeletingList] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  // Redirect if not logged in
  if (!user) {
    router.push("/")
    return null
  }

  const handleCreateList = () => {
    if (!newListName.trim()) return

    createList(newListName.trim())
    setNewListName("")
    setShowCreateDialog(false)
    toast({
      title: "List created!",
      description: `"${newListName}" has been created successfully.`,
    })
  }

  const handleRenameList = (listId: string) => {
    if (!editName.trim()) return

    updateList(listId, { name: editName.trim() })
    setEditingList(null)
    setEditName("")
    toast({
      title: "List renamed!",
      description: "Your list has been renamed successfully.",
    })
  }

  const handleShareList = (listId: string) => {
    setShowShareModal(true)
  }

  const handleGenerateShareLink = (listId: string) => {
    const shareLink = generateShareLink(listId)
    return shareLink
  }

  const handleDeleteList = (listId: string) => {
    deleteList(listId)
    setDeletingList(null)
    toast({
      title: "List deleted",
      description: "Your list has been deleted successfully.",
    })
  }

  const getListThumbnail = (list: any) => {
    if (list.gifts.length > 0) {
      return list.gifts[0].image
    }
    return "/gift-list-placeholder.png"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:justify-between mb-12 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 lg:flex-row lg:items-end">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight lg:text-3xl">
              My Gift Lists
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl md:text-lg">
              Organize and manage your gift ideas for different occasions and people.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="xl" className="shadow-lg min-w-[160px]">
                  <Plus className="h-5 w-5 mr-3" />
                  Create List
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl border-gray-100 shadow-[0_25px_50px_rgba(0,0,0,0.25)] p-8">
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
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleCreateList} disabled={!newListName.trim()} className="flex-1 h-12">
                      Create List
                    </Button>
                    <Button variant="secondary" onClick={() => setShowCreateDialog(false)} className="h-12">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {lists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {lists.map((list, index) => (
              <div
                key={list.id}
                className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <Card className="group bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-200 rounded-lg">
                  <CardHeader className="p-6 pt-0 pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingList === list.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameList(list.id)
                                if (e.key === "Escape") {
                                  setEditingList(null)
                                  setEditName("")
                                }
                              }}
                              onBlur={() => handleRenameList(list.id)}
                              autoFocus
                              className="text-lg font-semibold rounded-2xl"
                            />
                          </div>
                        ) : (
                          <Link href={`/my-lists/${list.id}`}>
                            <CardTitle className="text-xl font-semibold hover:text-purple-primary transition-colors cursor-pointer truncate">
                              {list.name}
                            </CardTitle>
                          </Link>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge
                            variant={list.isPublic ? "default" : "secondary"}
                            className="text-sm px-3 py-1 rounded-xl"
                          >
                            {list.isPublic ? "Public" : "Private"}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {formatDistanceToNow(list.updatedAt, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 shadow-lg">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingList(list.id)
                              setEditName(list.name)
                            }}
                            className="rounded-xl p-3"
                          >
                            <Edit className="h-4 w-4 mr-3" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareList(list.id)} className="rounded-xl p-3">
                            <Share2 className="h-4 w-4 mr-3" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingList(list.id)}
                            className="text-red-error focus:text-red-error rounded-xl p-3"
                          >
                            <Trash2 className="h-4 w-4 mr-3" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 pb-0 rounded-lg">
                    <Link href={`/my-lists/${list.id}`}>
                      <div className="aspect-video relative mb-6 overflow-hidden rounded-2xl bg-gray-100 cursor-pointer">
                        <img
                          src={getListThumbnail(list) || "/placeholder.svg"}
                          alt={list.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {list.gifts.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-sm">
                            <div className="text-center">
                              <List className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                              <p className="text-base text-gray-500 font-medium">Empty list</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-base text-gray-600">
                        <Gift className="h-5 w-5" />
                        <span className="font-medium">
                          {list.gifts.length} {list.gifts.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <Link href={`/my-lists/${list.id}`}>
                        <Button variant="secondary" size="sm" className="rounded-2xl">
                          View List
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <Card className="text-center py-16 max-w-2xl mx-auto bg-white border-gray-100 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <CardHeader className="pb-8">
                <div className="mx-auto mb-6 p-4 bg-purple-primary/10 rounded-3xl w-fit">
                  <List className="h-12 w-12 text-purple-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">No lists yet</CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-4">
                  Create your first gift list to start organizing your gift ideas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowCreateDialog(true)} size="xl">
                  <Plus className="h-5 w-5 mr-3" />
                  Create Your First List
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Share Modal */}
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          lists={lists}
          onGenerateLink={handleGenerateShareLink}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingList} onOpenChange={() => setDeletingList(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete List</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this list? This action cannot be undone and all gifts in the list will
                be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingList && handleDeleteList(deletingList)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
