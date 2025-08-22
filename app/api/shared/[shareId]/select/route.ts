import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    const { giftId, selectedBy, selectionNote } = await request.json()

    // 验证必填字段
    if (!giftId || !selectedBy) {
      return NextResponse.json(
        { error: "Missing required fields: giftId and selectedBy" },
        { status: 400 }
      )
    }

    // 查找分享的列表
    const sharedList = await prisma.giftList.findFirst({
      where: {
        shareToken: shareId,
        isPublic: true,
      },
    })

    if (!sharedList) {
      return NextResponse.json(
        { error: "List not found or not public" },
        { status: 404 }
      )
    }

    // 先检查当前的选择状态
    const currentItem = await prisma.listItem.findFirst({
      where: {
        listId: sharedList.id,
        giftId: giftId,
      },
    })

    if (!currentItem) {
      return NextResponse.json(
        { error: "Gift not found in list" },
        { status: 404 }
      )
    }

    // 如果已经选择，则取消选择；如果未选择，则选择
    const newSelectionState = !currentItem.isSelected

    // 更新选择状态
    const updatedItem = await prisma.listItem.update({
      where: {
        id: currentItem.id,
      },
      data: {
        isSelected: newSelectionState,
        selectedBy: newSelectionState ? selectedBy : null,
        selectionNote: newSelectionState ? (selectionNote || null) : null,
        selectedAt: newSelectionState ? new Date() : null,
      },
    })

    if (updatedItem.count === 0) {
      return NextResponse.json(
        { error: "Gift not found in list" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Gift selection updated successfully",
    })
  } catch (error) {
    console.error("Error updating gift selection:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
