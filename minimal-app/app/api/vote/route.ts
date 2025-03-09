import { NextResponse } from 'next/server';

// In-memory vote store
const voteStore: {
  votes: Record<string, number>;
  voteCounts: Record<string, { upvotes: number; downvotes: number }>;
} = {
  votes: {},
  voteCounts: {
    prod_1: { upvotes: 15, downvotes: 3 },
    prod_2: { upvotes: 22, downvotes: 5 },
    prod_3: { upvotes: 18, downvotes: 2 },
    prod_4: { upvotes: 12, downvotes: 1 },
    prod_5: { upvotes: 9, downvotes: 0 }
  }
};

// Force dynamic to prevent edge caching
export const dynamic = 'force-dynamic';

// Calculate score
function calculateScore(upvotes: number, downvotes: number): number {
  return upvotes - downvotes;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const clientId = searchParams.get('clientId');
    
    if (!productId || !clientId) {
      return NextResponse.json(
        { success: false, error: 'Missing productId or clientId' },
        { status: 400 }
      );
    }
    
    const voteKey = `${productId}:${clientId}`;
    const voteType = voteStore.votes[voteKey] || null;
    const voteCounts = voteStore.voteCounts[productId] || { upvotes: 0, downvotes: 0 };
    const score = calculateScore(voteCounts.upvotes, voteCounts.downvotes);
    
    return NextResponse.json({
      success: true,
      voteType,
      upvotes: voteCounts.upvotes,
      downvotes: voteCounts.downvotes,
      score,
      hasVoted: voteType !== null
    });
  } catch (error) {
    console.error('Error getting vote status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get vote status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, voteType, clientId } = body;
    
    if (!productId || voteType === undefined || !clientId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const voteKey = `${productId}:${clientId}`;
    const currentVoteType = voteStore.votes[voteKey] || null;
    
    // Initialize vote counts if they don't exist
    if (!voteStore.voteCounts[productId]) {
      voteStore.voteCounts[productId] = { upvotes: 0, downvotes: 0 };
    }
    
    // Remove previous vote if exists
    if (currentVoteType === 1) {
      voteStore.voteCounts[productId].upvotes = Math.max(0, voteStore.voteCounts[productId].upvotes - 1);
    } else if (currentVoteType === -1) {
      voteStore.voteCounts[productId].downvotes = Math.max(0, voteStore.voteCounts[productId].downvotes - 1);
    }
    
    // Toggle vote if same vote type
    if (currentVoteType === voteType) {
      delete voteStore.votes[voteKey];
    } else {
      // Add new vote
      voteStore.votes[voteKey] = voteType;
      
      if (voteType === 1) {
        voteStore.voteCounts[productId].upvotes++;
      } else if (voteType === -1) {
        voteStore.voteCounts[productId].downvotes++;
      }
    }
    
    const voteCounts = voteStore.voteCounts[productId];
    const score = calculateScore(voteCounts.upvotes, voteCounts.downvotes);
    
    return NextResponse.json({
      success: true,
      voteType: voteStore.votes[voteKey] || null,
      upvotes: voteCounts.upvotes,
      downvotes: voteCounts.downvotes,
      score,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record vote' },
      { status: 500 }
    );
  }
} 