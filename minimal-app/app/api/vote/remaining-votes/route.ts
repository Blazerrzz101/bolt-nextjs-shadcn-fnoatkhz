import { NextResponse } from 'next/server';

// Force dynamic to prevent edge caching
export const dynamic = 'force-dynamic';

// Set maximum votes per day
const MAX_VOTES_PER_DAY = parseInt(process.env.NEXT_PUBLIC_MAX_VOTES_PER_DAY || '10');

// In-memory store for vote tracking
const userVotes: Record<string, {
  votes: number,
  lastReset: string
}> = {};

function getVotesRemaining(clientId: string): number {
  // Ensure user exists in the tracking store
  if (!userVotes[clientId]) {
    userVotes[clientId] = {
      votes: 0,
      lastReset: new Date().toISOString()
    };
  }
  
  // Check if we need to reset (new day)
  const lastReset = new Date(userVotes[clientId].lastReset);
  const now = new Date();
  if (lastReset.getDate() !== now.getDate() || 
      lastReset.getMonth() !== now.getMonth() || 
      lastReset.getFullYear() !== now.getFullYear()) {
    // Reset for new day
    userVotes[clientId] = {
      votes: 0,
      lastReset: now.toISOString()
    };
  }
  
  // Calculate remaining votes
  return Math.max(0, MAX_VOTES_PER_DAY - userVotes[clientId].votes);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Missing clientId' },
        { status: 400 }
      );
    }
    
    const remainingVotes = getVotesRemaining(clientId);
    
    return NextResponse.json({
      success: true,
      remainingVotes,
      maxVotesPerDay: MAX_VOTES_PER_DAY
    });
  } catch (error) {
    console.error('Error checking remaining votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check remaining votes' },
      { status: 500 }
    );
  }
} 