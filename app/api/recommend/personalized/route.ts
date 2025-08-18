import { NextRequest, NextResponse } from 'next/server';
import { recommendationService } from '@/lib/services/recommendation';
import { PersonalizedRequest } from '@/lib/types/recommendation';

export async function POST(request: NextRequest) {
  try {
    const body: PersonalizedRequest = await request.json();
    
    if (!body.answers?.relationship) {
      return NextResponse.json(
        { error: 'Relationship is required in answers' },
        { status: 400 }
      );
    }
    
    console.log('🎁 Personalized recommendation request:', body);
    
    const result = await recommendationService.recommendPersonalized(body);
    
    console.log(`✅ Personalized recommendation completed: ${result.items.length} items`);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Personalized recommendation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate personalized recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relationship = searchParams.get('relationship');
    const gender = searchParams.get('gender');
    const age = searchParams.get('age') ? parseInt(searchParams.get('age')!) : undefined;
    const interests = searchParams.get('interests')?.split(',');
    const budget = searchParams.get('budget')?.split(',') as any;
    const otherRequirements = searchParams.get('other_requirements')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '10');
    const region = searchParams.get('region') || 'CA/US';
    
    if (!relationship) {
      return NextResponse.json(
        { error: 'Relationship parameter is required' },
        { status: 400 }
      );
    }
    
    const body: PersonalizedRequest = {
      answers: {
        relationship,
        gender: gender as any,
        age,
        interests,
        budget,
        other_requirements: otherRequirements
      },
      limit,
      region
    };
    
    console.log('🎁 Personalized recommendation GET request:', body);
    
    const result = await recommendationService.recommendPersonalized(body);
    
    console.log(`✅ Personalized recommendation GET completed: ${result.items.length} items`);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Personalized recommendation GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate personalized recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
