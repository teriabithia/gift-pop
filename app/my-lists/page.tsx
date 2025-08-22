"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Plus, List, MoreVertical, Share2, Edit, Trash2, Calendar, Gift, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLists } from "@/contexts/lists-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ShareModal } from "@/components/share-modal"
import { SingleListShareModal } from "@/components/single-list-share-modal"

export default function MyListsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { lists, createList, updateList, deleteList, generateShareLink } = useLists()
  const { toast } = useToast()

  // Check if user came from recommendations
  const fromRecommendations = searchParams.get('from') === 'recommendations'

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [editingList, setEditingList] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [deletingList, setDeletingList] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharingList, setSharingList] = useState<string | null>(null)

  // Redirect if not logged in
  if (!user) {
    if (typeof window !== 'undefined') {
    router.push("/")
    }
    return null
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) return

    try {
      await createList(newListName.trim()) // No initial gift for direct list creation
      setNewListName("")
      setShowCreateDialog(false)
      toast({
        title: "List created!",
        description: `"<span class="font-semibold text-purple-600">${newListName}</span>" has been created successfully.`,
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create list. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRenameList = async (listId: string) => {
    if (!editName.trim()) return

    try {
      const result = await updateList(listId, { name: editName.trim() })
      if (result.success) {
        setEditingList(null)
        setEditName("")
        toast({
          title: "List renamed!",
          description: "Your list has been renamed successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to rename list. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename list. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShareList = (listId: string) => {
    setSharingList(listId)
  }

  const handleGenerateShareLink = async (listId: string) => {
    const shareLink = await generateShareLink(listId)
    return shareLink
  }

  const handleDeleteList = (listId: string) => {
    const listToDelete = lists.find(l => l.id === listId)
    deleteList(listId)
    setDeletingList(null)
    toast({
      title: "List deleted",
      description: `"<span class="font-semibold text-purple-600">${listToDelete?.name || 'List'}</span>" has been deleted.`,
      variant: "success",
    })
  }

  const getListThumbnail = (list: any) => {
    if (list.gifts.length > 0) {
      return list.gifts[0].image
    }
    return "/gift-list-placeholder.png"
  }

  // 获取礼品网格图片（最多显示4个）
  const getGiftGrid = (list: any) => {
    const gifts = list.gifts.slice(0, 4)
    return gifts.map((gift: any) => gift.image || "/placeholder.svg")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 条件性返回按钮 - 只在从推荐页面进入时显示 */}
        {fromRecommendations && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Recommendations
            </Button>
          </div>
        )}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lists.map((list, index) => (
              <div
                key={list.id}
                className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <Card className="group bg-white border-0 shadow-none hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
                  {/* 图片网格区域 - 可点击 */}
                  <Link href={`/my-lists/${list.id}`}>
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer">
                      {list.gifts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-0.5 h-full">
                          {getGiftGrid(list).map((image: string, idx: number) => (
                            <div key={idx} className="relative overflow-hidden bg-gray-200">
                              <img
                                src={image}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                          {/* 如果少于4个礼品，填充空白区域 */}
                          {Array.from({ length: Math.max(0, 4 - list.gifts.length) }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="bg-gray-100"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400 font-medium">Empty list</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  {/* 右上角操作菜单 */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-sm backdrop-blur-sm"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-lg">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingList(list.id)
                            setEditName(list.name)
                          }}
                          className="rounded-lg p-3"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareList(list.id)} className="rounded-lg p-3">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingList(list.id)}
                          className="text-red-600 focus:text-red-600 rounded-lg p-3"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* 内容区域 */}
                  <div className="p-4">
                        {editingList === list.id ? (
                      <div className="mb-3">
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
                          className="text-lg font-semibold border border-gray-200 rounded-lg px-3 py-2 h-auto focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        ) : (
                          <Link href={`/my-lists/${list.id}`}>
                        <h3 className="font-semibold text-lg text-gray-900 mb-3 hover:text-purple-600 transition-colors cursor-pointer line-clamp-1">
                              {list.name}
                        </h3>
                          </Link>
                        )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {list.gifts.length} gifts
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-400">
                            {formatDistanceToNow(list.updatedAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 h-9 rounded-full text-sm font-medium border-gray-200 hover:bg-gray-50"
                            onClick={() => {
                              setEditingList(list.id)
                              setEditName(list.name)
                            }}
                          >
                        <Edit className="h-4 w-4 mr-2" />
                            Rename
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="px-6 h-9 rounded-full text-sm font-medium bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleShareList(list.id)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                            Share
                      </Button>
                    </div>
                    </div>
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

        {/* Single List Share Modal */}
        <SingleListShareModal
          open={!!sharingList}
          onOpenChange={(open) => !open && setSharingList(null)}
          list={sharingList ? lists.find(l => l.id === sharingList) || null : null}
          onGenerateLink={handleGenerateShareLink}
        />
      </div>
    </div>
  )
}