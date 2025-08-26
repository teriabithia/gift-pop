import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    const { selectedGiftIds, selectedBy, selectionNote } = await request.json()

    // 验证必填字段
    if (!selectedGiftIds || !Array.isArray(selectedGiftIds) || selectedGiftIds.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid selectedGiftIds array" },
        { status: 400 }
      )
    }

    if (!selectedBy) {
      return NextResponse.json(
        { error: "Missing selectedBy field" },
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

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 先将所有列表项重置为未选择状态
      await tx.listItem.updateMany({
        where: {
          listId: sharedList.id,
        },
        data: {
          isSelected: false,
          selectedBy: null,
          selectionNote: null,
          selectedAt: null,
        },
      })

      // 2. 将选中的礼物设置为已选择状态
      const updatePromises = selectedGiftIds.map(giftId =>
        tx.listItem.updateMany({
          where: {
            listId: sharedList.id,
            giftId: giftId,
          },
          data: {
            isSelected: true,
            selectedBy: selectedBy,
            selectionNote: selectionNote || null,
            selectedAt: new Date(),
          },
        })
      )

      await Promise.all(updatePromises)

      // 3. 验证更新结果
      const updatedItems = await tx.listItem.findMany({
        where: {
          listId: sharedList.id,
          isSelected: true,
        },
        select: {
          giftId: true,
          isSelected: true,
          selectedBy: true,
          selectedAt: true,
        },
      })

      return updatedItems
    })

    return NextResponse.json({
      success: true,
      message: `Successfully submitted ${result.length} gift selections`,
      selectedCount: result.length,
      selectedGiftIds: result.map(item => item.giftId)
    })

  } catch (error) {
    console.error("Error submitting gift selections:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
