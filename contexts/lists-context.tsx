"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { GiftList, Gift } from "@/lib/types"
import { useAuth } from "./auth-context"

interface ListsContextType {
  lists: GiftList[]
  createList: (name: string, initialGift?: Gift) => Promise<GiftList>
  updateList: (listId: string, updates: Partial<GiftList>) => Promise<{ success: boolean; error?: string }>
  deleteList: (listId: string) => void
  addGiftToList: (listId: string, gift: Gift) => Promise<{ success: boolean; message: string; listName: string }>
  removeGiftFromList: (listId: string, giftId: string) => void
  getListById: (listId: string) => GiftList | undefined
  generateShareLink: (listId: string) => Promise<string>
}

const ListsContext = createContext<ListsContextType | undefined>(undefined)

export function ListsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [lists, setLists] = useState<GiftList[]>([])

  // Load lists from database when user logs in
  useEffect(() => {
    if (user) {
      loadLists()
    } else {
      setLists([])
    }
  }, [user])

  // Load lists from database
  const loadLists = async () => {
    try {
      const response = await fetch('/api/lists', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLists(data.data)
        }
      } else {
        console.error('Failed to load lists:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading lists:', error)
    }
  }

  const createList = async (name: string, initialGift?: Gift): Promise<GiftList> => {
    if (!user) throw new Error("User must be logged in to create lists")

    // Check if a list with the same name already exists
    const existingList = lists.find(list => list.name === name)
    if (existingList) {
      // If list exists and we have an initial gift, add it to the existing list
      if (initialGift) {
        const result = await addGiftToList(existingList.id, initialGift)
        if (result.success) {
          return existingList
        }
      } else {
        // If no initial gift, just return the existing list
        return existingList
      }
    }

    try {
      // Create list in database
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description: "",
          isPublic: false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create list')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error('Failed to create list')
      }

      const newList = data.data

      // If there's an initial gift, add it to the list
      if (initialGift) {
        try {
          // Add gift to list in database
          const giftResponse = await fetch(`/api/lists/${newList.id}/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ gift: initialGift })
          })

          if (giftResponse.ok) {
            const giftData = await giftResponse.json()
            if (giftData.success) {
              // Update the newList with the gift
              newList.gifts = [initialGift]
            }
          }
        } catch (error) {
          console.error('Error adding initial gift to new list:', error)
        }
      }

      // Update local state
      setLists((prev) => [...prev, newList])
      return newList

    } catch (error) {
      console.error('Error creating list:', error)
      throw error
    }
  }

  const updateList = async (listId: string, updates: Partial<GiftList>) => {
    try {
      // Update list in database
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: updates.name,
          description: updates.specialPreferences, // Map specialPreferences to description
          isPublic: updates.isPublic,
          shareId: updates.shareId // Include shareId for sharing functionality
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update list')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error('Failed to update list')
      }

      // Update local state
      setLists((prev) => prev.map((list) => (list.id === listId ? { ...list, ...updates, updatedAt: new Date() } : list)))
      
      return { success: true }
    } catch (error) {
      console.error('Error updating list:', error)
      return { success: false, error: 'Failed to update list' }
    }
  }

  const deleteList = (listId: string) => {
    setLists((prev) => prev.filter((list) => list.id !== listId))
  }

  const addGiftToList = async (listId: string, gift: Gift) => {
    const list = lists.find((l) => l.id === listId)
    if (!list) {
      return { success: false, message: "List not found", listName: "" }
    }

    // 检查商品是否已存在于该清单中
    const isGiftInList = list.gifts.some(listGift => listGift.id === gift.id)
    
    if (isGiftInList) {
      return { 
        success: false, 
        message: `"${gift.name}" is already in "${list.name}"`, 
        listName: list.name 
      }
    }

    try {
      // Add gift to list in database
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ gift })
      })

      if (!response.ok) {
        throw new Error('Failed to add gift to list')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error('Failed to add gift to list')
      }

      // Update local state
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId ? { ...l, gifts: [...l.gifts, gift], updatedAt: new Date() } : l,
        ),
      )

      return { 
        success: true, 
        message: `"${gift.name}" has been added to "${list.name}".`, 
        listName: list.name 
      }

    } catch (error) {
      console.error('Error adding gift to list:', error)
      return { 
        success: false, 
        message: "Failed to add gift to list", 
        listName: list.name 
      }
    }
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

  const generateShareLink = async (listId: string) => {
    const list = lists.find((l) => l.id === listId)
    if (!list) return ""

    // Generate share ID if it doesn't exist
    if (!list.shareId) {
      const shareId = Math.random().toString(36).substring(2, 8)
      await updateList(listId, { shareId, isPublic: true })
      return `${window.location.origin}/shared/${shareId}`
    }

    // If list is private but has shareId, make it public when sharing
    if (!list.isPublic) {
      await updateList(listId, { isPublic: true })
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
