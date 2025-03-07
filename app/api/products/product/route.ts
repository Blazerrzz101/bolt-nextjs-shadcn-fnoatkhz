import { NextRequest, NextResponse } from 'next/server';
import { 
  mockProducts, 
  getProductById, 
  getProductBySlug,
  getVoteCounts,
  setVoteCounts,
  addActivity
} from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Mock vote data storage
const mockUserVotes: Record<string, number> = {};

// Vote validation schema
type VoteRequest = {
  productId: string;
  voteType: number; // 1 for upvote, -1 for downvote
  clientId: string;
};

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/products/product");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const clientId = searchParams.get("clientId") || 'anonymous';

    if (!id && !slug) {
      console.log("Either product ID or slug is required");
      return NextResponse.json({ success: false, error: "Either product ID or slug is required" }, { status: 400 });
    }

    // Find the product by ID or slug
    let product;
    if (id) {
      product = getProductById(id);
    } else if (slug) {
      product = getProductBySlug(slug);
    }

    if (!product) {
      console.log(`Product not found: ${id || slug}`);
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Get vote data from mock store
    const voteCounts = getVoteCounts(product.id);
    const voteKey = `${product.id}:${clientId}`;
    const userVote = mockUserVotes[voteKey] || null;
    const score = (voteCounts.upvotes || 0) - (voteCounts.downvotes || 0);

    // Create a new product object with the vote data
    const productWithVotes = {
      ...product,
      upvotes: voteCounts.upvotes,
      downvotes: voteCounts.downvotes,
      userVote,
      score
    };

    console.log(`Returning product details for: ${id || slug}, client: ${clientId}`);
    return NextResponse.json({ success: true, product: productWithVotes });
  } catch (error) {
    console.error("Error in GET /api/products/product:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/products/product called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate request body
    const { productId, voteType, clientId = 'anonymous' } = body as VoteRequest;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    if (voteType !== 1 && voteType !== -1 && voteType !== 0) {
      return NextResponse.json(
        { success: false, error: "Vote type must be 1 (upvote), -1 (downvote), or 0 (remove vote)" },
        { status: 400 }
      );
    }
    
    // Find the product with the matching ID
    const product = getProductById(productId);
    
    if (!product) {
      console.log(`Product not found: ${productId}`);
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Get current vote counts
    const currentCounts = getVoteCounts(productId);
    
    const voteKey = `${clientId}:${productId}`;
    const currentVote = mockUserVotes[voteKey] || 0;
    
    // Handle voting logic
    if (voteType === 0 || (currentVote === voteType)) {
      // Remove vote if setting to 0 or voting the same way twice
      if (currentVote === 1) {
        currentCounts.upvotes = Math.max(0, currentCounts.upvotes - 1);
      } else if (currentVote === -1) {
        currentCounts.downvotes = Math.max(0, currentCounts.downvotes - 1);
      }
      
      // Clear the user's vote
      delete mockUserVotes[voteKey];
      console.log(`Vote removed for ${productId} by ${clientId}`);
    } else {
      // Removing previous vote if changing vote direction
      if (currentVote === 1) {
        currentCounts.upvotes = Math.max(0, currentCounts.upvotes - 1);
      } else if (currentVote === -1) {
        currentCounts.downvotes = Math.max(0, currentCounts.downvotes - 1);
      }
      
      // Adding new vote
      if (voteType === 1) {
        currentCounts.upvotes += 1;
        console.log(`Upvote added for ${productId} by ${clientId}`);
      } else if (voteType === -1) {
        currentCounts.downvotes += 1;
        console.log(`Downvote added for ${productId} by ${clientId}`);
      }
      
      // Store the user's vote
      mockUserVotes[voteKey] = voteType;
      
      // Add activity
      addActivity({
        id: `act-${Date.now()}`,
        type: 'vote',
        action: voteType === 1 ? 'upvote' : 'downvote',
        productId: productId,
        productName: product.name,
        timestamp: new Date().toISOString(),
        userId: clientId
      });
    }
    
    // Update vote counts
    setVoteCounts(productId, currentCounts);
    
    // Calculate the score
    const score = currentCounts.upvotes - currentCounts.downvotes;
    
    // Update product score
    product.score = score;
    
    console.log(`Vote counts for ${productId}:`, {
      upvotes: currentCounts.upvotes,
      downvotes: currentCounts.downvotes,
      score
    });
    
    return NextResponse.json({
      success: true,
      productId,
      upvotes: currentCounts.upvotes,
      downvotes: currentCounts.downvotes,
      voteType: mockUserVotes[voteKey] || null,
      score
    });
  } catch (error) {
    console.error(`Error in POST /api/products/product:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update vote", message: String(error) },
      { status: 500 }
    );
  }
} 