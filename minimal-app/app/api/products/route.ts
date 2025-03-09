import { NextResponse } from 'next/server';

// Define Product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  upvotes: number;
  downvotes: number;
  score: number;
}

// Mock data
const productsData: Product[] = [
  {
    id: "prod_1",
    name: "Premium Ergonomic Chair",
    description: "Experience ultimate comfort with our premium ergonomic office chair, designed to support your back during long work hours.",
    price: 299.99,
    category: "office",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    upvotes: 15,
    downvotes: 3,
    score: 12
  },
  {
    id: "prod_2",
    name: "Smart Home Assistant Hub",
    description: "Control your entire home with our voice-activated smart hub. Compatible with all major smart home ecosystems.",
    price: 149.99,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7",
    upvotes: 22,
    downvotes: 5,
    score: 17
  },
  {
    id: "prod_3",
    name: "Wireless Noise-Cancelling Headphones",
    description: "Immerse yourself in your favorite music with our premium wireless headphones featuring active noise cancellation.",
    price: 199.99,
    category: "audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    upvotes: 18,
    downvotes: 2,
    score: 16
  },
  {
    id: "prod_4",
    name: "Ultralight Hiking Backpack",
    description: "A 45L hiking backpack that weighs less than 2 pounds, perfect for multi-day adventures in the backcountry.",
    price: 179.99,
    category: "outdoor",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3",
    upvotes: 12,
    downvotes: 1,
    score: 11
  },
  {
    id: "prod_5",
    name: "Professional Chef's Knife Set",
    description: "A set of 5 essential kitchen knives crafted from high-carbon stainless steel, perfect for professional and home chefs alike.",
    price: 249.99,
    category: "kitchen",
    image: "https://images.unsplash.com/photo-1563861826100-c7f8049945e4",
    upvotes: 9,
    downvotes: 0,
    score: 9
  }
];

// Force dynamic to prevent edge caching
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // Filter products by category if provided
    let filteredProducts = [...productsData];
    if (category && category !== 'all') {
      filteredProducts = productsData.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Sort by score (descending)
    filteredProducts.sort((a, b) => b.score - a.score);
    
    return NextResponse.json({
      success: true,
      data: filteredProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 