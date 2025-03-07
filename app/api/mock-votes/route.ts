import { NextRequest, NextResponse } from 'next/server';

// Ensure this API is always dynamic
export const dynamic = 'force-dynamic';

// In-memory storage for votes in this session
const voteStore = {
  votes: {},
  voteCounts: {
    'p1': { upvotes: 5, downvotes: 2 },
    'p2': { upvotes: 10, downvotes: 3 },
    'p3': { upvotes: 7, downvotes: 1 },
    'p4': { upvotes: 8, downvotes: 4 },
    'p5': { upvotes: 12, downvotes: 2 }
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const clientId = searchParams.get('clientId');

  if (!productId) {
    return NextResponse.json({ 
      success: false, 
      error: "Product ID is required" 
    }, { status: 400 });
  }

  const voteKey = `${productId}:${clientId}`;
  const voteType = voteStore.votes[voteKey] || null;
  const voteCounts = voteStore.voteCounts[productId] || { upvotes: 0, downvotes: 0 };
  const score = voteCounts.upvotes - voteCounts.downvotes;

  return NextResponse.json({
    success: true,
    productId,
    voteType,
    hasVoted: voteType !== null,
    upvotes: voteCounts.upvotes,
    downvotes: voteCounts.downvotes,
    score
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, voteType, clientId = 'anonymous' } = body;
    
    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: "Product ID is required" 
      }, { status: 400 });
    }

    if (voteType !== 1 && voteType !== -1) {
      return NextResponse.json({ 
        success: false, 
        error: "Vote type must be 1 (upvote) or -1 (downvote)" 
      }, { status: 400 });
    }

    const voteKey = `${productId}:${clientId}`;
    const currentVote = voteStore.votes[voteKey];
    
    // Initialize vote counts if they don't exist
    if (!voteStore.voteCounts[productId]) {
      voteStore.voteCounts[productId] = { upvotes: 0, downvotes: 0 };
    }
    
    const currentCounts = voteStore.voteCounts[productId];

    // Handle vote logic
    if (currentVote === voteType) {
      // Toggling vote (same vote type)
      if (currentVote === 1) {
        currentCounts.upvotes = Math.max(0, currentCounts.upvotes - 1);
      } else {
        currentCounts.downvotes = Math.max(0, currentCounts.downvotes - 1);
      }
      
      // Remove the vote
      delete voteStore.votes[voteKey];
    } else {
      // New vote or changing vote
      
      // Remove old vote first if exists
      if (currentVote === 1) {
        currentCounts.upvotes = Math.max(0, currentCounts.upvotes - 1);
      } else if (currentVote === -1) {
        currentCounts.downvotes = Math.max(0, currentCounts.downvotes - 1);
      }
      
      // Add new vote
      if (voteType === 1) {
        currentCounts.upvotes += 1;
      } else {
        currentCounts.downvotes += 1;
      }
      
      // Store the new vote
      voteStore.votes[voteKey] = voteType;
    }
    
    // Calculate score
    const score = currentCounts.upvotes - currentCounts.downvotes;
    
    return NextResponse.json({
      success: true,
      productId,
      upvotes: currentCounts.upvotes,
      downvotes: currentCounts.downvotes,
      voteType: voteStore.votes[voteKey] || null,
      score,
      remainingVotes: 10 // Mock remaining votes
    });
  } catch (error) {
    console.error("Error in POST /api/mock-votes:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to process vote" 
    }, { status: 500 });
  }
} 