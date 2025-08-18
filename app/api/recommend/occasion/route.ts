import { NextRequest, NextResponse } from 'next/server';
import { recommendationService } from '@/lib/services/recommendation';
import { OccasionRequest } from '@/lib/types/recommendation';

export async function POST(request: NextRequest) {
  try {
    const body: OccasionRequest = await request.json();
    
    if (!body.occasion) {
      return NextResponse.json(
        { error: 'Occasion is required' },
        { status: 400 }
      );
    }
    
    console.log('🎁 Occasion recommendation request:', body);
    
    const result = await recommendationService.recommendOccasion(body);
    
    console.log(`✅ Occasion recommendation completed: ${result.items.length} items`);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Occasion recommendation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate occasion recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const occasion = searchParams.get('occasion');
    const limit = parseInt(searchParams.get('limit') || '10');
    const region = searchParams.get('region') || 'CA/US';
    const budget = searchParams.get('budget')?.split(',') as any;
    
    if (!occasion) {
      return NextResponse.json(
        { error: 'Occasion parameter is required' },
        { status: 400 }
      );
    }
    
    const body: OccasionRequest = { occasion, limit, region, budget };
    
    console.log('🎁 Occasion recommendation GET request:', body);
    
    const result = await recommendationService.recommendOccasion(body);
    
    console.log(`✅ Occasion recommendation GET completed: ${result.items.length} items`);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Occasion recommendation GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate occasion recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
