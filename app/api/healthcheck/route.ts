import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock response for healthcheck
const mockResponse = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development'
};

// Simple handler that returns a mock response
export async function GET(req: NextRequest) {
  console.log('Healthcheck API called (mock implementation)');
  return NextResponse.json(mockResponse);
} 