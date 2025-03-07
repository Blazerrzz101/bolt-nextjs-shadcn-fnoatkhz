import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';

// Ensure API is dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Path for storing votes
const DATA_DIR = path.join(process.cwd(), 'data');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');

// Constants
const MAX_VOTES_PER_USER = 5;
const TIME_WINDOW_HOURS = 24; // Consider votes in the last 24 hours

// Max votes per day for anonymous users
const MAX_VOTES_PER_DAY = 10;

// Vote state type definition
interface VoteState {
  votes: Record<string, number>;
  voteCounts: Record<string, { upvotes: number; downvotes: number }>;
  userVotes: Array<{
    productId: string;
    clientId: string;
    voteType: number;
    timestamp: string;
  }>;
  lastUpdated: string;
}

// Get vote state from file
async function getVoteState(): Promise<VoteState> {
  try {
    // Check if data dir exists, create if not
    if (!existsSync(DATA_DIR)) {
      console.log(`Creating data directory at ${DATA_DIR}`);
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    if (!existsSync(VOTES_FILE)) {
      console.log(`Vote state file not found at ${VOTES_FILE}, initializing empty state`);
      return {
        votes: {},
        voteCounts: {},
        userVotes: [],
        lastUpdated: new Date().toISOString(),
      };
    }

    console.log(`Reading vote state from: ${VOTES_FILE}`);
    const data = await fs.readFile(VOTES_FILE, 'utf8');
    const state = JSON.parse(data) as VoteState;
    
    console.log(`Successfully read vote state: ${JSON.stringify(state, null, 2)}`);
    return state;
  } catch (error) {
    console.error('Error reading vote state:', error);
    return {
      votes: {},
      voteCounts: {},
      userVotes: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Prepare consistent error and success response formats
const createErrorResponse = (message: string, status: number = 400) => {
  console.error(`Remaining Votes API Error: ${message}`);
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      remainingVotes: 0,
      maxVotes: MAX_VOTES_PER_USER,
      votesUsed: 0
    },
    { status }
  );
};

const createSuccessResponse = (data: any) => {
  // Ensure all expected properties are present
  const response = {
    success: true,
    remainingVotes: typeof data.remainingVotes === 'number' ? data.remainingVotes : 0,
    maxVotes: typeof data.maxVotes === 'number' ? data.maxVotes : MAX_VOTES_PER_USER,
    votesUsed: typeof data.votesUsed === 'number' ? data.votesUsed : 0,
    ...data,
  };
  
  return NextResponse.json(response);
};

// Helper to check if a user has remaining votes
export async function hasRemainingVotes(clientId: string, userId?: string): Promise<boolean> {
  // If user is authenticated (has a userId), they have unlimited votes
  if (userId) {
    return true;
  }

  try {
    if (!existsSync(VOTES_FILE)) {
      // If votes file doesn't exist, user has all votes available
      return true;
    }

    const data = await fs.readFile(VOTES_FILE, 'utf8');
    const state = JSON.parse(data);

    // Make sure userVotes exists
    if (!state.userVotes) {
      return true;
    }

    // Get the timestamp for 24 hours ago
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - TIME_WINDOW_HOURS);

    // Count recent votes by this client
    const recentVotes = state.userVotes.filter((vote: any) => {
      return (
        vote.clientId === clientId &&
        new Date(vote.timestamp) > cutoffTime
      );
    });

    // Check if user has used all their votes
    return recentVotes.length < MAX_VOTES_PER_USER;
  } catch (error) {
    console.error('Error checking remaining votes:', error);
    // In case of error, allow voting (fail open)
    return true;
  }
}

// API handler to get remaining votes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId') || 'anonymous';
  
  // In a real implementation, this would check a database
  // For our mock, we'll always return the maximum votes
  
  return NextResponse.json({
    success: true,
    clientId,
    remainingVotes: MAX_VOTES_PER_DAY,
    maxVotesPerDay: MAX_VOTES_PER_DAY,
    votesUsedToday: 0
  });
} 