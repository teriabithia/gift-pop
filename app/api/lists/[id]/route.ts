import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

/**
 * GET /api/lists/[id]
 * 获取特定列表的详细信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const list = await prisma.giftList.findFirst({
      where: {
        id: id,
        userId: (session.user as any).id
      },
      include: {
        listItems: {
          include: {
            gift: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    })

    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      )
    }

    // Transform to match frontend expectations
    const transformedList = {
      id: list.id,
      name: list.name,
      userId: list.userId,
      gifts: list.listItems.map(item => ({
        ...item.gift,
        isSelected: item.isSelected,
        selectedBy: item.selectedBy,
        selectionNote: item.selectionNote,
        selectedAt: item.selectedAt,
      })),
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      isPublic: list.isPublic,
      shareId: list.shareToken,
      specialPreferences: list.description || "",
    }

    return NextResponse.json({
      success: true,
      data: transformedList
    })

  } catch (error) {
    console.error("Get list error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/lists/[id]
 * 更新列表信息
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("=== PUT /api/lists/[id] - 更新列表 ===")
    const { id } = await params
    console.log("List ID:", id)
    
    const session = await getServerSession(authOptions)
    
    // 修复用户ID问题（与其他API相同的逻辑）
    if (!session?.user) {
      console.log("❌ No session or user")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let userId = (session.user as any).id
    if (!userId || (typeof userId === 'string' && userId.length > 20)) {
      console.log("🔧 Fixing user ID for update API - current ID:", userId)
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

    const { name, description, isPublic, shareId } = await request.json()
    console.log("Update data:", { name, description, isPublic, shareId })

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

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (shareId !== undefined) updateData.shareToken = shareId // Map shareId to shareToken

    console.log("Updating list with data:", updateData)
    const updatedList = await prisma.giftList.update({
      where: { id: id },
      data: updateData,
      include: {
        listItems: {
          include: {
            gift: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    })

    // Transform to match frontend expectations
    const transformedList = {
      id: updatedList.id,
      name: updatedList.name,
      userId: updatedList.userId,
      gifts: updatedList.listItems.map(item => item.gift),
      createdAt: updatedList.createdAt,
      updatedAt: updatedList.updatedAt,
      isPublic: updatedList.isPublic,
      shareId: updatedList.shareToken,
      specialPreferences: updatedList.description || "",
    }

    return NextResponse.json({
      success: true,
      data: transformedList
    })

  } catch (error) {
    console.error("Update list error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/lists/[id]
 * 删除列表
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if list exists and belongs to user
    const existingList = await prisma.giftList.findFirst({
      where: {
        id: id,
        userId: (session.user as any).id
      }
    })

    if (!existingList) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      )
    }

    await prisma.giftList.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: "List deleted successfully"
    })

  } catch (error) {
    console.error("Delete list error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
