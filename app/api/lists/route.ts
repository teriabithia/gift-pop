import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"

/**
 * GET /api/lists
 * 获取用户的所有礼品列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const lists = await prisma.giftList.findMany({
      where: {
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transform the data to match frontend expectations
    const transformedLists = lists.map(list => ({
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
    }))

    return NextResponse.json({
      success: true,
      data: transformedLists
    })

  } catch (error) {
    console.error("Get lists error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/lists
 * 创建新的礼品列表
 */
export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/lists - 开始处理 ===")
    
    const session = await getServerSession(authOptions)
    console.log("Session retrieved:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: (session?.user as any)?.id
    })
    
    if (!session?.user) {
      console.log("❌ Unauthorized: No session or user")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 如果session中的用户ID不正确（Google Provider ID），通过email查找数据库用户ID
    let userId = (session.user as any).id
    if (!userId || (typeof userId === 'string' && userId.length > 20)) {
      console.log("🔧 Fixing user ID - current ID:", userId)
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

    const { name, description, isPublic = false } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "List name is required" },
        { status: 400 }
      )
    }

    // Check if a list with the same name already exists for this user
    const existingList = await prisma.giftList.findFirst({
      where: {
        name: name.trim(),
        userId: userId
      }
    })

    if (existingList) {
      console.log("⚠️ List with same name already exists:", existingList.id)
      return NextResponse.json({
        success: true,
        data: {
          id: existingList.id,
          name: existingList.name,
          userId: existingList.userId,
          gifts: [],
          createdAt: existingList.createdAt,
          updatedAt: existingList.updatedAt,
          isPublic: existingList.isPublic,
          shareId: existingList.shareToken,
          specialPreferences: existingList.description || "",
        },
        message: "List with this name already exists"
      })
    }

    // 生成唯一的shareToken
    const shareToken = `list_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    console.log("Creating list with data:", {
      name: name.trim(),
      description: description || "",
      isPublic,
      shareToken,
      userId: userId // 使用修复后的用户ID
    })

    const newList = await prisma.giftList.create({
      data: {
        name: name.trim(),
        description: description || "",
        isPublic,
        shareToken,
        userId: userId // 使用修复后的用户ID
      }
    })

    console.log("✅ List created successfully:", newList.id)

    // Transform to match frontend expectations
    const transformedList = {
      id: newList.id,
      name: newList.name,
      userId: newList.userId,
      gifts: [],
      createdAt: newList.createdAt,
      updatedAt: newList.updatedAt,
      isPublic: newList.isPublic,
      shareId: newList.shareToken,
      specialPreferences: newList.description || "",
    }

    return NextResponse.json({
      success: true,
      data: transformedList
    })

  } catch (error) {
    console.error("Create list error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
