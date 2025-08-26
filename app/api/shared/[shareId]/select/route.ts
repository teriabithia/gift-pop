import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    const { giftId, selectedBy, selectionNote, action } = await request.json()

    // 验证必填字段
    if (!giftId || !selectedBy || !action) {
      return NextResponse.json(
        { error: "Missing required fields: giftId, selectedBy, and action" },
        { status: 400 }
      )
    }

    // 验证action值
    if (!['select', 'deselect'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'select' or 'deselect'" },
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

    // 查找列表项
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

    // 根据action明确设置状态
    const newSelectionState = action === 'select'
    
    // 检查当前状态是否已经是目标状态
    if (currentItem.isSelected === newSelectionState) {
      return NextResponse.json({
        success: true,
        message: `Gift is already ${newSelectionState ? 'selected' : 'deselected'}`,
        alreadyInTargetState: true
      })
    }

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

    return NextResponse.json({
      success: true,
      message: `Gift ${newSelectionState ? 'selected' : 'deselected'} successfully`,
      isSelected: newSelectionState
    })
  } catch (error) {
    console.error("Error updating gift selection:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
