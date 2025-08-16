"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { GiftList, Gift } from "@/lib/types"
import { useAuth } from "./auth-context"

interface ListsContextType {
  lists: GiftList[]
  createList: (name: string) => GiftList
  updateList: (listId: string, updates: Partial<GiftList>) => void
  deleteList: (listId: string) => void
  addGiftToList: (listId: string, gift: Gift) => void
  removeGiftFromList: (listId: string, giftId: string) => void
  getListById: (listId: string) => GiftList | undefined
  generateShareLink: (listId: string) => string
}

const ListsContext = createContext<ListsContextType | undefined>(undefined)

export function ListsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [lists, setLists] = useState<GiftList[]>([])

  // Initialize mock lists when user logs in
  useEffect(() => {
    if (user) {
      setLists([
        {
          id: "1",
          name: "Mom's Birthday",
          userId: user.id,
          gifts: [],
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
          isPublic: false,
        },
        {
          id: "2",
          name: "Holiday Gifts 2024",
          userId: user.id,
          gifts: [],
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-20"),
          isPublic: true,
          shareId: "abc123",
        },
      ])
    } else {
      setLists([])
    }
  }, [user])

  const createList = (name: string): GiftList => {
    if (!user) throw new Error("User must be logged in to create lists")

    const newList: GiftList = {
      id: Date.now().toString(),
      name,
      userId: user.id,
      gifts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
    }

    setLists((prev) => [...prev, newList])
    return newList
  }

  const updateList = (listId: string, updates: Partial<GiftList>) => {
    setLists((prev) => prev.map((list) => (list.id === listId ? { ...list, ...updates, updatedAt: new Date() } : list)))
  }

  const deleteList = (listId: string) => {
    setLists((prev) => prev.filter((list) => list.id !== listId))
  }

  const addGiftToList = (listId: string, gift: Gift) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId ? { ...list, gifts: [...list.gifts, gift], updatedAt: new Date() } : list,
      ),
    )
  }

  const removeGiftFromList = (listId: string, giftId: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, gifts: list.gifts.filter((gift) => gift.id !== giftId), updatedAt: new Date() }
          : list,
      ),
    )
  }

  const getListById = (listId: string) => {
    return lists.find((list) => list.id === listId)
  }

  const generateShareLink = (listId: string) => {
    const list = lists.find((l) => l.id === listId)
    if (!list) return ""

    // Generate share ID if it doesn't exist
    if (!list.shareId) {
      const shareId = Math.random().toString(36).substring(2, 8)
      updateList(listId, { shareId, isPublic: true })
      return `${window.location.origin}/shared/${shareId}`
    }

    return `${window.location.origin}/shared/${list.shareId}`
  }

  return (
    <ListsContext.Provider
      value={{
        lists,
        createList,
        updateList,
        deleteList,
        addGiftToList,
        removeGiftFromList,
        getListById,
        generateShareLink,
      }}
    >
      {children}
    </ListsContext.Provider>
  )
}

export function useLists() {
  const context = useContext(ListsContext)
  if (context === undefined) {
    throw new Error("useLists must be used within a ListsProvider")
  }
  return context
}
