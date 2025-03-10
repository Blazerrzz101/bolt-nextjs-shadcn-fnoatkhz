import { NextRequest, NextResponse } from 'next/server';

// Mock database of votes
let votes: Record<string, number> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, voteType, clientId } = body;

    // Validate input
    if (!productId || !voteType || !clientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Generate a unique key for this vote
    const voteKey = `${clientId}-${productId}`;
    
    // Check if user already voted
    const existingVote = votes[voteKey];

    // Handle vote toggling (voting the same way twice removes the vote)
    if (existingVote === voteType) {
      // Remove the vote
      delete votes[voteKey];
      return NextResponse.json({ 
        success: true, 
        data: {
          message: 'Vote removed successfully',
          voteType: null
        }
      });
    }

    // Store the new vote
    votes[voteKey] = voteType;

    return NextResponse.json({ 
      success: true, 
      data: {
        message: 'Vote recorded successfully',
        voteType
      }
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process vote' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const clientId = searchParams.get('clientId');

    if (!productId || !clientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }

    const voteKey = `${clientId}-${productId}`;
    const voteType = votes[voteKey] || null;

    return NextResponse.json({
      success: true,
      data: {
        hasVoted: voteType !== null,
        voteType
      }
    });
  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check vote status' 
    }, { status: 500 });
  }
} 