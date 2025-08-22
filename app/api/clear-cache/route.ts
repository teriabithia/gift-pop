import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { occasion } = await request.json()
    
    if (occasion) {
      // 清除特定 occasion 的缓存
      await prisma.recommendation.deleteMany({
        where: {
          type: 'occasion',
          occasion: occasion
        }
      })
      
      return NextResponse.json({
        success: true,
        message: `Cache cleared for ${occasion}`
      })
    } else {
      // 清除所有 occasion 缓存
      await prisma.recommendation.deleteMany({
        where: {
          type: 'occasion'
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'All occasion caches cleared'
      })
    }
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 })
  }
}

