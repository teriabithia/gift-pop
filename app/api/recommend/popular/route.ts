import { NextRequest, NextResponse } from 'next/server';
import { recommendationService } from '@/lib/services/recommendation';
import { PopularRequest } from '@/lib/types/recommendation';

export async function POST(request: NextRequest) {
  try {
    const body: PopularRequest = await request.json();
    
    console.log('🎁 Popular recommendation request:', body);
    
    const result = await recommendationService.recommendPopular(body);
    
    console.log(`✅ Popular recommendation completed: ${result.items.length} items`);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Popular recommendation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate popular recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const region = searchParams.get('region') || 'CA/US';
    const budget = searchParams.get('budget')?.split(',') as any;
    
    const body: PopularRequest = { limit, region, budget };
    
    console.log('🎁 Popular recommendation GET request:', body);
    
    const result = await recommendationService.recommendPopular(body);
    
    console.log(`✅ Popular recommendation GET completed: ${result.items.length} items`);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Popular recommendation GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate popular recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
