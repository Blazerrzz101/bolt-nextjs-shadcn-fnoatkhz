import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Ensure Vote Reset API is dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Path constants
const DATA_DIR = path.resolve(process.cwd(), 'data');
const VOTES_FILE = path.resolve(DATA_DIR, 'votes.json');

// Create consistent response formats
const createErrorResponse = (message: string, status: number = 400) => {
  console.error(`Vote Reset API Error: ${message}`);
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
};

const createSuccessResponse = (data: any) => {
  return NextResponse.json({ success: true, ...data });
};

// Helper function to get vote state
async function getVoteState() {
  try {
    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
      return { votes: {}, voteCounts: {}, userVotes: [], lastUpdated: new Date().toISOString() };
    }

    // If vote file doesn't exist, return empty state
    if (!existsSync(VOTES_FILE)) {
      return { votes: {}, voteCounts: {}, userVotes: [], lastUpdated: new Date().toISOString() };
    }

    // Read existing file
    const data = await fs.readFile(VOTES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting vote state:', error);
    return { votes: {}, voteCounts: {}, userVotes: [], lastUpdated: new Date().toISOString() };
  }
}

// Helper function to save vote state
async function saveVoteState(state: any) {
  try {
    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }

    // Update lastUpdated timestamp
    state.lastUpdated = new Date().toISOString();

    // Write state to file
    await fs.writeFile(VOTES_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving vote state:', error);
    throw error;
  }
}

// POST handler to reset votes for a client ID
export async function POST(request: NextRequest) {
  console.log('Vote Reset API called');
  
  try {
    const body = await request.json();
    const { oldClientId, newClientId } = body;

    // Validate parameters
    if (!oldClientId) {
      return createErrorResponse('Old client ID is required');
    }

    // Log the reset request
    console.log(`Resetting votes for client ID: ${oldClientId} -> ${newClientId}`);

    // Get current vote state
    const state = await getVoteState();

    // Remove all votes for this client ID
    let voteCount = 0;
    
    // 1. Filter out votes from this client
    Object.keys(state.votes).forEach(key => {
      if (key.startsWith(`${oldClientId}:`)) {
        // Extract product ID from the key
        const productId = key.split(':')[1];
        
        // Determine vote type
        const voteType = state.votes[key];
        
        // Update vote counts
        if (voteType === 1) {
          if (state.voteCounts[productId]) {
            state.voteCounts[productId].upvotes = Math.max(0, (state.voteCounts[productId].upvotes || 0) - 1);
          }
        } else if (voteType === -1) {
          if (state.voteCounts[productId]) {
            state.voteCounts[productId].downvotes = Math.max(0, (state.voteCounts[productId].downvotes || 0) - 1);
          }
        }
        
        // Remove the vote
        delete state.votes[key];
        voteCount++;
      }
    });
    
    // 2. Filter user votes history
    state.userVotes = state.userVotes.filter((vote: any) => vote.clientId !== oldClientId);

    // Save the updated state
    await saveVoteState(state);

    return createSuccessResponse({ 
      message: `Successfully reset ${voteCount} votes for client ID: ${oldClientId}`,
      resetCount: voteCount,
      newClientId
    });
  } catch (error) {
    console.error('Error resetting votes:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to reset votes',
      500
    );
  }
} 