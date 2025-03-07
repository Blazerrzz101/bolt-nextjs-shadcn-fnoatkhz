import { NextRequest, NextResponse } from 'next/server';

// Ensure endpoint is always dynamic
export const dynamic = 'force-dynamic';

// Mock data for testing
const mockData = {
  user: {
    id: 'mock-user-1',
    email: 'user@example.com',
    name: 'Test User',
    avatar_url: 'https://avatar.vercel.sh/test',
    isAnonymous: false
  },
  status: {
    status: 'ok',
    services: {
      database: 'online',
      auth: 'online',
      storage: 'online',
      api: 'online'
    },
    version: '1.0.0'
  }
};

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: mockData,
    message: 'Mock API is working correctly!'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      data: {
        ...mockData,
        request: body
      },
      message: 'Mock API processed your request successfully!'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request'
      },
      { status: 400 }
    );
  }
}
