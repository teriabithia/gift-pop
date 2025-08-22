import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params

    // Find the shared list by shareToken (not shareId)
    const sharedList = await prisma.giftList.findFirst({
      where: {
        shareToken: shareId,
        isPublic: true,
      },
      include: {
        user: true, // Include user information
        listItems: {
          include: {
            gift: true,
          },
        },
      },
    })

    if (!sharedList) {
      return NextResponse.json(
        { error: "List not found or not public" },
        { status: 404 }
      )
    }

    // Transform the data to match the expected format
    const transformedList = {
      id: sharedList.id,
      name: sharedList.name,
      description: sharedList.description,
      specialPreferences: sharedList.specialPreferences,
      shareId: sharedList.shareId,
      isPublic: sharedList.isPublic,
      createdAt: sharedList.createdAt,
      updatedAt: sharedList.updatedAt,
      creatorName: sharedList.user?.name || 'Anonymous', // Add creator's name
      gifts: sharedList.listItems.map((item) => ({
        ...item.gift,
        isSelected: item.isSelected,
        selectedBy: item.selectedBy,
        selectionNote: item.selectionNote,
        selectedAt: item.selectedAt,
      })),
    }

    return NextResponse.json(transformedList)
  } catch (error) {
    console.error("Error fetching shared list:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
