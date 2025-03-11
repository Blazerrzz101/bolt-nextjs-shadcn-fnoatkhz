import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Ensure this API is dynamic
export const dynamic = 'force-dynamic';

// Mock product data for testing
export const mockProducts = [
  {
    id: "j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6",
    name: "ASUS ROG Swift PG279QM",
    description: "27-inch gaming monitor with 240Hz refresh rate and G-SYNC",
    category: "monitors",
    price: 849.99,
    url_slug: "asus-rog-swift-pg279qm",
    image_url: "/images/products/placeholder-monitor.svg",
    specifications: {
      "Screen Size": "27 inches",
      "Resolution": "2560 x 1440",
      "Refresh Rate": "240Hz",
      "Response Time": "1ms",
      "Panel Type": "IPS",
      "HDR": "HDR400",
      "G-SYNC": "Yes"
    },
    created_at: "2023-01-15T12:00:00Z",
    updated_at: "2023-06-20T15:30:00Z",
    rating: 4.8,
    review_count: 156,
    rank: 1,
    reviews: [],
    threads: []
  },
  {
    id: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    name: "Sony WH-1000XM5",
    description: "Wireless noise-cancelling headphones with exceptional sound quality",
    category: "audio",
    price: 399.99,
    url_slug: "sony-wh-1000xm5",
    image_url: "/images/products/placeholder-headphones.svg",
    specifications: {
      "Driver Size": "30mm",
      "Noise Cancelling": "Yes",
      "Battery Life": "30 hours",
      "Bluetooth": "5.2",
      "Weight": "250g",
      "Charging": "USB-C"
    },
    created_at: "2023-02-10T09:15:00Z",
    updated_at: "2023-05-18T14:20:00Z",
    rating: 4.9,
    review_count: 203,
    rank: 2,
    reviews: [],
    threads: []
  }
];

// Path constants for vote counts
const DATA_DIR = path.resolve(process.cwd(), 'data');
const VOTES_FILE = path.resolve(DATA_DIR, 'votes.json');

// Read vote state if available
function getVoteCounts() {
  try {
    if (!fs.existsSync(VOTES_FILE)) {
      return {};
    }
    const data = fs.readFileSync(VOTES_FILE, 'utf8');
    const voteState = JSON.parse(data);
    return voteState.voteCounts || {};
  } catch (error) {
    console.error('Error reading vote counts:', error);
    return {};
  }
}

// GET route to get all products or a specific product
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const category = searchParams.get('category');
  
  // Get vote counts from the data file
  const voteCounts = getVoteCounts();
  
  // Add vote counts to products
  const productsWithVotes = mockProducts.map(product => {
    const counts = voteCounts[product.id] || { upvotes: 0, downvotes: 0 };
    return {
      ...product,
      upvotes: counts.upvotes || 0,
      downvotes: counts.downvotes || 0,
      score: (counts.upvotes || 0) - (counts.downvotes || 0)
    };
  });
  
  // Sort by score (highest first)
  productsWithVotes.sort((a, b) => {
    // First sort by score
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    
    // Then by total votes
    const totalVotesA = (a.upvotes || 0) + (a.downvotes || 0);
    const totalVotesB = (b.upvotes || 0) + (b.downvotes || 0);
    if (totalVotesB !== totalVotesA) return totalVotesB - totalVotesA;
    
    // Finally by name
    return a.name.localeCompare(b.name);
  });
  
  // If a slug is provided, return the specific product
  if (slug) {
    const product = productsWithVotes.find(p => p.url_slug === slug);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product
    });
  }
  
  // If a category is provided, filter products by category
  let filteredProducts = productsWithVotes;
  if (category) {
    filteredProducts = productsWithVotes.filter(p => p.category === category);
  }
  
  return NextResponse.json({
    success: true,
    products: filteredProducts
  });
} 