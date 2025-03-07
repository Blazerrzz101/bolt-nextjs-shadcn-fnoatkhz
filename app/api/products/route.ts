import { NextRequest, NextResponse } from "next/server";
import { getVoteState } from '../../lib/vote-utils';
import fs from 'fs';
import path from 'path';
import { 
  mockProducts, 
  getProductsByCategory, 
  getProductsSortedByVotes 
} from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Simplified version of getVoteState if file operations fail
const getVoteCountsFromJson = () => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'votes.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(data);
    }
    return { votes: {}, voteCounts: {} };
  } catch (error) {
    console.error('Error reading votes.json:', error);
    return { votes: {}, voteCounts: {} };
  }
};

export async function GET(request: NextRequest) {
  console.log('GET /api/products called');
  
  try {
    // Get category filter from query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const clientId = searchParams.get('clientId') || 'anonymous';
    
    // Filter products by category if specified
    let filteredProducts = category && category !== 'all'
      ? getProductsByCategory(category)
      : [...mockProducts];
      
    // Get vote state to add vote counts
    let voteState;
    try {
      voteState = await getVoteState();
    } catch (error) {
      console.error('Error getting vote state from function, falling back to JSON:', error);
      voteState = getVoteCountsFromJson();
    }
    
    if (!voteState || !voteState.voteCounts) {
      console.error('Invalid vote state, using empty object');
      voteState = { votes: {}, voteCounts: {} };
    }
    
    // Enhance products with vote data
    filteredProducts = filteredProducts.map(product => {
      const voteCounts = voteState.voteCounts[product.id] || { upvotes: 0, downvotes: 0 };
      const voteKey = `${product.id}:${clientId}`;
      const userVote = voteState.votes ? voteState.votes[voteKey] : null;
      const score = (voteCounts.upvotes || 0) - (voteCounts.downvotes || 0);
      
      return {
        ...product,
        upvotes: voteCounts.upvotes || product.upvotes || 0,
        downvotes: voteCounts.downvotes || product.downvotes || 0,
        userVote,
        score: score || product.score || 0
      };
    });
    
    // Sort by score (descending)
    filteredProducts.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Add debugging info to console
    console.log(`Returning ${filteredProducts.length} products`);
    
    // Return the array directly, not wrapped in an object
    return NextResponse.json(filteredProducts);
    
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    // Return empty array in case of error
    return NextResponse.json([]);
  }
} 