import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Ensure this API is dynamic
export const dynamic = 'force-dynamic';

// Define interfaces for clarity
interface VoteCounts {
  upvotes: number;
  downvotes: number;
}

interface UserVote {
  productId: string;
  clientId: string;
  voteType: number; // 1 for upvote, -1 for downvote
  timestamp: string;
}

interface VoteState {
  votes: Record<string, number>; // key is clientId:productId
  voteCounts: Record<string, VoteCounts>;
  userVotes: UserVote[]; // history of votes for rate limiting
  lastUpdated: string;
}

// Path constants
const DATA_DIR = path.resolve(process.cwd(), 'data');
const VOTES_FILE = path.resolve(DATA_DIR, 'votes.json');

// Create the data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('Created data directory');
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Create initial vote state if it doesn't exist
if (!fs.existsSync(VOTES_FILE)) {
  try {
    const initialVoteState: VoteState = {
      votes: {},
      voteCounts: {},
      userVotes: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(VOTES_FILE, JSON.stringify(initialVoteState, null, 2));
    console.log('Created votes.json file');
  } catch (error) {
    console.error('Error creating votes.json file:', error);
  }
}

// Helper to read vote state
function readVoteState(): VoteState {
  try {
    if (!fs.existsSync(VOTES_FILE)) {
      return {
        votes: {},
        voteCounts: {},
        userVotes: [],
        lastUpdated: new Date().toISOString()
      };
    }
    const data = fs.readFileSync(VOTES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading vote state:', error);
    return {
      votes: {},
      voteCounts: {},
      userVotes: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Helper to write vote state
function writeVoteState(state: VoteState) {
  try {
    fs.writeFileSync(VOTES_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error writing vote state:', error);
  }
}

// Helper to get or create a client ID
function getClientId(request: NextRequest) {
  const cookieStore = cookies();
  let clientId = cookieStore.get('clientId')?.value;
  
  // If no client ID exists, create one
  if (!clientId) {
    clientId = `${uuidv4().substring(0, 8)}_${Date.now()}`;
    // Set cookie for future requests
    cookieStore.set('clientId', clientId, { 
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/' 
    });
  }
  
  return clientId;
}

// GET route to check vote status
export async function GET(request: NextRequest) {
  // Get the product ID from the URL
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  
  if (!productId) {
    return NextResponse.json(
      { success: false, error: 'Product ID is required' },
      { status: 400 }
    );
  }
  
  // Get the client ID
  const clientId = getClientId(request);
  
  // Read the current vote state
  const voteState = readVoteState();
  
  // Get the vote key
  const voteKey = `${productId}:${clientId}`;
  
  // Get the vote type (-1, 0, or 1)
  const voteType = voteState.votes[voteKey] || null;
  
  // Get vote counts for this product
  const voteCounts = voteState.voteCounts[productId] || { upvotes: 0, downvotes: 0 };
  
  // Calculate the score
  const score = voteCounts.upvotes - voteCounts.downvotes;
  
  return NextResponse.json({
    success: true,
    productId,
    clientId,
    voteType,
    upvotes: voteCounts.upvotes,
    downvotes: voteCounts.downvotes,
    score,
    hasVoted: voteType !== null
  });
}

// POST route to cast a vote
export async function POST(request: NextRequest) {
  // Parse the request body
  const body = await request.json();
  const { productId, voteType } = body;
  
  if (!productId) {
    return NextResponse.json(
      { success: false, error: 'Product ID is required' },
      { status: 400 }
    );
  }
  
  if (voteType !== 1 && voteType !== -1) {
    return NextResponse.json(
      { success: false, error: 'Vote type must be 1 (upvote) or -1 (downvote)' },
      { status: 400 }
    );
  }
  
  // Get the client ID
  const clientId = getClientId(request);
  
  // Read the current vote state
  const voteState = readVoteState();
  
  // Get the vote key
  const voteKey = `${productId}:${clientId}`;
  
  // Get the current vote type
  const currentVoteType = voteState.votes[voteKey] || null;
  
  // Get or initialize vote counts for this product
  if (!voteState.voteCounts[productId]) {
    voteState.voteCounts[productId] = { upvotes: 0, downvotes: 0 };
  }
  
  // Handle vote toggling (voting the same way twice removes the vote)
  if (currentVoteType === voteType) {
    // Remove the vote
    delete voteState.votes[voteKey];
    
    // Update the vote counts
    if (voteType === 1) {
      voteState.voteCounts[productId].upvotes = Math.max(0, voteState.voteCounts[productId].upvotes - 1);
    } else {
      voteState.voteCounts[productId].downvotes = Math.max(0, voteState.voteCounts[productId].downvotes - 1);
    }
    
    // Set the new vote type to null (no vote)
    const newVoteType = null;
    
    // Add to vote history
    voteState.userVotes.push({
      productId,
      clientId,
      voteType: 0, // 0 means vote removed
      timestamp: new Date().toISOString()
    });
    
    // Calculate the new score
    const score = voteState.voteCounts[productId].upvotes - voteState.voteCounts[productId].downvotes;
    
    // Save the vote state
    voteState.lastUpdated = new Date().toISOString();
    writeVoteState(voteState);
    
    return NextResponse.json({
      success: true,
      productId,
      clientId,
      voteType: newVoteType,
      upvotes: voteState.voteCounts[productId].upvotes,
      downvotes: voteState.voteCounts[productId].downvotes,
      score,
      action: 'removed',
      hasVoted: false
    });
  }
  
  // Handle changing vote (from upvote to downvote or vice versa)
  if (currentVoteType !== null && currentVoteType !== voteType) {
    // If changing from upvote to downvote
    if (currentVoteType === 1 && voteType === -1) {
      voteState.voteCounts[productId].upvotes = Math.max(0, voteState.voteCounts[productId].upvotes - 1);
      voteState.voteCounts[productId].downvotes++;
    }
    // If changing from downvote to upvote
    else if (currentVoteType === -1 && voteType === 1) {
      voteState.voteCounts[productId].downvotes = Math.max(0, voteState.voteCounts[productId].downvotes - 1);
      voteState.voteCounts[productId].upvotes++;
    }
  }
  // Handle new vote
  else {
    if (voteType === 1) {
      voteState.voteCounts[productId].upvotes++;
    } else {
      voteState.voteCounts[productId].downvotes++;
    }
  }
  
  // Set the vote
  voteState.votes[voteKey] = voteType;
  
  // Add to vote history
  voteState.userVotes.push({
    productId,
    clientId,
    voteType,
    timestamp: new Date().toISOString()
  });
  
  // Calculate the new score
  const score = voteState.voteCounts[productId].upvotes - voteState.voteCounts[productId].downvotes;
  
  // Save the vote state
  voteState.lastUpdated = new Date().toISOString();
  writeVoteState(voteState);
  
  return NextResponse.json({
    success: true,
    productId,
    clientId,
    voteType,
    upvotes: voteState.voteCounts[productId].upvotes,
    downvotes: voteState.voteCounts[productId].downvotes,
    score,
    action: currentVoteType ? 'changed' : 'added',
    hasVoted: true
  });
} 