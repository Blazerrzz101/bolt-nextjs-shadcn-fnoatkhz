import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock response for auth status
const mockResponse = {
  success: true,
  isAuthenticated: false,
  isAnonymous: true,
  user: null,
  message: "Auth status check (mock implementation)",
  timestamp: new Date().toISOString(),
  environment: {
    nodeEnv: process.env.NODE_ENV || 'unknown',
    isProduction: process.env.NODE_ENV === 'production',
  }
};

// Simple handler that returns a mock response
export async function GET(req: NextRequest) {
  console.log('Auth Status API called (mock implementation)');
  return NextResponse.json(mockResponse);
} 