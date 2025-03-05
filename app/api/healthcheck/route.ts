import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('Healthcheck API called');
  
  try {
    // Basic system information
    const info = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      apiVersion: 'v1',
    };
    
    return NextResponse.json(info, { status: 200 });
  } catch (error) {
    console.error('Error in healthcheck:', error);
    
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
} 