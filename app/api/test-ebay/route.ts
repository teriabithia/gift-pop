import { NextRequest, NextResponse } from 'next/server'
import { ebayService } from '@/lib/ebay-service'

export async function GET(request: NextRequest) {
  try {
    // Check if eBay service is available
    const isAvailable = ebayService.isAvailable()
    
    // Get environment variables (for debugging)
    const envCheck = {
      EBAY_CLIENT_ID: process.env.EBAY_CLIENT_ID ? 'Set' : 'Not set',
      EBAY_CLIENT_SECRET: process.env.EBAY_CLIENT_SECRET ? 'Set' : 'Not set',
      EBAY_SANDBOX: process.env.EBAY_SANDBOX,
    }

    if (!isAvailable) {
      return NextResponse.json({
        success: false,
        message: 'eBay API not available',
        envCheck
      })
    }

    // Try a simple search
    const testResults = await ebayService.searchProducts('gift', { limit: 5 })
    
    return NextResponse.json({
      success: true,
      message: 'eBay API is working',
      envCheck,
      resultsCount: testResults.length,
      sampleResults: testResults.slice(0, 2)
    })

  } catch (error) {
    console.error('eBay test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      envCheck: {
        EBAY_CLIENT_ID: process.env.EBAY_CLIENT_ID ? 'Set' : 'Not set',
        EBAY_CLIENT_SECRET: process.env.EBAY_CLIENT_SECRET ? 'Set' : 'Not set',
        EBAY_SANDBOX: process.env.EBAY_SANDBOX,
      }
    }, { status: 500 })
  }
}
