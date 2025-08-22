import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/prisma"

/**
 * POST /api/lists/[id]/items
 * 添加商品到列表
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("=== POST /api/lists/[id]/items - 开始处理 ===")
    const { id } = await params
    console.log("List ID:", id)
    
    const session = await getServerSession(authOptions)
    
    // 修复用户ID问题（与lists/route.ts相同的逻辑）
    if (!session?.user) {
      console.log("❌ No session or user")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let userId = (session.user as any).id
    if (!userId || (typeof userId === 'string' && userId.length > 20)) {
      console.log("🔧 Fixing user ID for items API - current ID:", userId)
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! }
        })
        if (dbUser) {
          userId = dbUser.id
          console.log("✅ Found correct user ID:", userId)
        } else {
          console.log("❌ No database user found for:", session.user.email)
          return NextResponse.json(
            { error: "User not found in database" },
            { status: 401 }
          )
        }
      } catch (error) {
        console.error("❌ Error finding user:", error)
        return NextResponse.json(
          { error: "Database error" },
          { status: 500 }
        )
      }
    }

    console.log("Final user ID to use:", userId)

    const { gift } = await request.json()
    console.log("Gift to add:", gift?.name, "ID:", gift?.id)

    if (!gift || !gift.id) {
      console.log("❌ No gift data provided")
      return NextResponse.json(
        { error: "Gift data is required" },
        { status: 400 }
      )
    }

    // Check if list exists and belongs to user
    console.log("Checking list ownership - List ID:", id, "User ID:", userId)
    const existingList = await prisma.giftList.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })

    if (!existingList) {
      console.log("❌ List not found or doesn't belong to user")
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      )
    }
    
    console.log("✅ List found:", existingList.name)

    // Check if gift already exists in database, if not create it
    let dbGift = await prisma.gift.findUnique({
      where: { id: gift.id }
    })

    if (!dbGift) {
      // Create the gift in database
      dbGift = await prisma.gift.create({
        data: {
          id: gift.id,
          name: gift.name,
          brand: gift.brand || "Unknown",
          price: gift.price || 0,
          rating: gift.rating || 0,
          reviewCount: gift.reviewCount || 0,
          image: gift.image || "",
          shopUrl: gift.shopUrl || "",
          category: gift.category,
          description: gift.description,
          tags: gift.tags ? JSON.stringify(gift.tags) : null,
          occasions: gift.occasions ? JSON.stringify(gift.occasions) : null,
          targetDemographics: gift.targetDemographics ? JSON.stringify(gift.targetDemographics) : null,
          popularityScore: gift.popularityScore || 0,
          embedding: gift.embedding ? JSON.stringify(gift.embedding) : null,
        }
      })
    }

    // Check if item already exists in the list
    const existingItem = await prisma.listItem.findUnique({
      where: {
        listId_giftId: {
          listId: id,
          giftId: gift.id
        }
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: "Gift already exists in this list" },
        { status: 409 }
      )
    }

    // Get the next sort order
    const maxSortOrder = await prisma.listItem.findFirst({
      where: { listId: id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true }
    })

    const nextSortOrder = (maxSortOrder?.sortOrder || 0) + 1

    // Add gift to list
    console.log("Creating list item:", {
      listId: id,
      giftId: gift.id,
      sortOrder: nextSortOrder
    })
    
    const newListItem = await prisma.listItem.create({
      data: {
        listId: id,
        giftId: gift.id,
        sortOrder: nextSortOrder
      }
    })
    
    console.log("✅ List item created:", newListItem.id)

    // Update list's updatedAt
    await prisma.giftList.update({
      where: { id: id },
      data: { updatedAt: new Date() }
    })
    
    console.log("✅ List updated successfully")

    return NextResponse.json({
      success: true,
      message: `"${gift.name}" has been added to the list`
    })

  } catch (error) {
    console.error("Add item to list error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/lists/[id]/items/[giftId]
 * 从列表中移除商品
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const giftId = searchParams.get('giftId')

    if (!giftId) {
      return NextResponse.json(
        { error: "Gift ID is required" },
        { status: 400 }
      )
    }

    // Check if list exists and belongs to user
    const existingList = await prisma.giftList.findFirst({
      where: {
        id: id,
        userId: (session!.user as any).id
      }
    })

    if (!existingList) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      )
    }

    // Remove item from list
    const deletedItem = await prisma.listItem.deleteMany({
      where: {
        listId: id,
        giftId: giftId
      }
    })

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: "Item not found in list" },
        { status: 404 }
      )
    }

    // Update list's updatedAt
    await prisma.giftList.update({
      where: { id: id },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      message: "Item removed from list successfully"
    })

  } catch (error) {
    console.error("Remove item from list error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
