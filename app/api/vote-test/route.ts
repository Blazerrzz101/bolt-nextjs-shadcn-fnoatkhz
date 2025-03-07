import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock response for vote test
const mockGetResponse = {
  success: true,
  message: "Vote test status (mock implementation)",
  voteStatus: {
    productId: "test-product-1",
    upvotes: 5,
    downvotes: 2,
    voteType: null,
    hasVoted: false,
    score: 3
  }
};

const mockPostResponse = {
  success: true,
  message: "Vote submitted (mock implementation)",
  productId: "test-product-1",
  upvotes: 6,
  downvotes: 2,
  voteType: 1,
  score: 4,
  remainingVotes: 10
};

// Simple GET handler that returns a mock response
export async function GET(request: NextRequest) {
  console.log('Vote Test API GET called (mock implementation)');
  return NextResponse.json(mockGetResponse);
}

// Simple POST handler that returns a mock response
export async function POST(request: NextRequest) {
  console.log('Vote Test API POST called (mock implementation)');
  return NextResponse.json(mockPostResponse);
} 