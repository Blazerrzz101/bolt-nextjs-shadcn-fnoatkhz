import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { 
  getProductById, 
  getVoteCounts, 
  setVoteCounts,
  addActivity
} from '@/lib/mock-data';

// Ensure Vote API is dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Mock products import to maintain consistency
import { mockProducts, testProducts } from '@/lib/mock-data';

// Define interfaces for clarity
interface VoteCounts {
  upvotes: number;
  downvotes: number;
}

interface UserVote {
  productId: string;
  clientId: string;
  voteType: number;
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

// Mock user votes storage as Record<string, number>
const mockUserVotes: Record<string, number> = {};

// Max votes per day for anonymous users
const MAX_VOTES_PER_DAY = parseInt(process.env.NEXT_PUBLIC_MAX_VOTES_PER_DAY || '10', 10);

// Prepare consistent error and success response formats
const createErrorResponse = (message: string, status: number = 400) => {
  console.error(`Vote API Error: ${message}`);
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      upvotes: 0,
      downvotes: 0,
      voteType: null,
      score: 0,
      hasVoted: false
    },
    { status }
  );
};

const createSuccessResponse = (data: any) => {
  // Ensure all expected properties are present
  const response = {
    success: true,
    productId: data.productId || null,
    voteType: data.voteType !== undefined ? data.voteType : null,
    upvotes: typeof data.upvotes === 'number' ? data.upvotes : 0,
    downvotes: typeof data.downvotes === 'number' ? data.downvotes : 0,
    score: typeof data.score === 'number' ? data.score : 0,
    hasVoted: !!data.hasVoted,
    message: data.message || '',
    ...data,
  };
  
  return NextResponse.json(response);
};

// Helper function to initialize vote state if it doesn't exist
async function initializeVoteState(): Promise<VoteState> {
  try {
    // Create data directory if it doesn't exist
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }

    // Initialize vote state if file doesn't exist
    if (!existsSync(VOTES_FILE)) {
      // Create initial state
      const initialState: VoteState = {
        votes: {},
        voteCounts: {},
        userVotes: [],
        lastUpdated: new Date().toISOString(),
      };

      // Initialize vote counts for mock products
      mockProducts.forEach(product => {
        initialState.voteCounts[product.id] = {
          upvotes: Math.floor(Math.random() * 10),
          downvotes: Math.floor(Math.random() * 5),
        };
      });

      // Initialize vote counts for test products
      Object.values(testProducts).forEach(product => {
        initialState.voteCounts[product.id] = {
          upvotes: product.upvotes || 0,
          downvotes: product.downvotes || 0,
        };
      });

      // Write initial state to file
      await fs.writeFile(
        VOTES_FILE,
        JSON.stringify(initialState, null, 2),
        'utf8'
      );

      return initialState;
    }

    // Read existing file
    const data = await fs.readFile(VOTES_FILE, 'utf8');
    const state = JSON.parse(data) as VoteState;

    // Ensure userVotes array exists (for backward compatibility)
    if (!state.userVotes) {
      state.userVotes = [];
    }

    return state;
  } catch (error) {
    console.error('Error initializing vote state:', error);
    // Return empty state in case of error
    return {
      votes: {},
      voteCounts: {},
      userVotes: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Helper function to get vote state
async function getVoteState(): Promise<VoteState> {
  return await initializeVoteState();
}

// Helper function to save vote state
async function saveVoteState(state: VoteState): Promise<void> {
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

// Helper function to calculate score
function calculateScore(upvotes: number, downvotes: number): number {
  return upvotes - downvotes;
}

// Helper function to add vote to history (for rate limiting)
function recordVote(state: VoteState, productId: string, clientId: string, voteType: number): void {
  // Add to vote history for tracking
  state.userVotes.push({
    productId,
    clientId,
    voteType,
    timestamp: new Date().toISOString(),
  });

  // Limit history size to prevent excessive growth
  if (state.userVotes.length > 10000) {
    // Keep only the most recent 1000 votes
    state.userVotes = state.userVotes.slice(-1000);
  }
}

// Get vote status for a product
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/vote called");
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const clientId = searchParams.get("clientId") || 'anonymous';

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: "Product ID is required" 
      }, { status: 400 });
    }

    // Get vote counts
    const voteCounts = voteStore.voteCounts[productId] || { upvotes: 0, downvotes: 0 };
    const voteKey = `${productId}:${clientId}`;
    const voteType = mockUserVotes[voteKey] || null;
    const hasVoted = voteType !== null;
    const score = (voteCounts.upvotes || 0) - (voteCounts.downvotes || 0);

    console.log(`Vote status for ${productId} by ${clientId}:`, {
      voteType,
      hasVoted,
      upvotes: voteCounts.upvotes,
      downvotes: voteCounts.downvotes,
      score
    });

    return NextResponse.json({
      success: true,
      productId,
      voteType,
      hasVoted,
      upvotes: voteCounts.upvotes,
      downvotes: voteCounts.downvotes,
      score
    });
  } catch (error) {
    console.error("Error in GET /api/vote:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// Process a vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, voteType, clientId = 'anonymous' } = body;
    
    console.log(`Processing vote: product=${productId}, client=${clientId}, voteType=${voteType}, currentVote=${mockUserVotes[`${productId}:${clientId}`]}`);

    // Validate request
    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: "Product ID is required" 
      }, { status: 400 });
    }

    if (voteType !== 1 && voteType !== -1 && voteType !== 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Vote type must be 1 (upvote), -1 (downvote), or 0 (clear vote)" 
      }, { status: 400 });
    }

    // Check vote counts
    if (!voteStore.voteCounts[productId]) {
      voteStore.voteCounts[productId] = { upvotes: 0, downvotes: 0 };
    }
    
    // Get current vote counts
    const currentCounts = voteStore.voteCounts[productId];
    
    // Check the user's current vote
    const voteKey = `${productId}:${clientId}`;
    const currentVote = mockUserVotes[voteKey] || null;

    // Handle vote logic
    if ((voteType === 0) || (currentVote === voteType)) {
      // Clearing vote or toggle (voting the same way twice)
      if (currentVote === 1) {
        currentCounts.upvotes = Math.max(0, currentCounts.upvotes - 1);
      } else if (currentVote === -1) {
        currentCounts.downvotes = Math.max(0, currentCounts.downvotes - 1);
      }
      
      // Remove the vote
      delete mockUserVotes[voteKey];
      console.log(`Vote removed for ${productId} by ${clientId}`);
    } else {
      // Changing vote or adding new vote
      
      // Remove old vote first if exists
      if (currentVote === 1) {
        currentCounts.upvotes = Math.max(0, currentCounts.upvotes - 1);
      } else if (currentVote === -1) {
        currentCounts.downvotes = Math.max(0, currentCounts.downvotes - 1);
      }
      
      // Add new vote
      if (voteType === 1) {
        currentCounts.upvotes += 1;
        console.log(`Upvote recorded: ${voteType} for ${productId} by ${clientId}`);
      } else if (voteType === -1) {
        currentCounts.downvotes += 1;
        console.log(`Downvote recorded: ${voteType} for ${productId} by ${clientId}`);
      }
      
      // Store the new vote
      mockUserVotes[voteKey] = voteType;
    }
    
    // Calculate score
    const score = currentCounts.upvotes - currentCounts.downvotes;
    
    console.log(`New counts: upvotes=${currentCounts.upvotes}, downvotes=${currentCounts.downvotes}, score=${score}`);
    
    return NextResponse.json({
      success: true,
      productId,
      upvotes: currentCounts.upvotes,
      downvotes: currentCounts.downvotes,
      voteType: mockUserVotes[voteKey] || null,
      score,
      remainingVotes: MAX_VOTES_PER_DAY
    });
  } catch (error) {
    console.error("Error in POST /api/vote:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to process vote" 
    }, { status: 500 });
  }
} 