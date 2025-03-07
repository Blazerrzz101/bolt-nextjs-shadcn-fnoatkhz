import { NextResponse } from 'next/server';

// Mock response for static builds
const mockResponse = {
  success: true,
  message: "Permissions fixed (mock)",
};

// Simple handler that returns a mock response
export async function POST() {
  return NextResponse.json(mockResponse);
} 