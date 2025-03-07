import { NextRequest, NextResponse } from 'next/server';

// Ensure this API is always dynamic
export const dynamic = 'force-dynamic';

// Mock products data
const mockProducts = [
  {
    id: 'p1',
    name: 'Gaming Mouse X1',
    description: 'High performance gaming mouse with adjustable DPI',
    price: 59.99,
    image_url: 'https://placehold.co/300x200?text=Gaming+Mouse',
    category: 'peripherals',
    upvotes: 5,
    downvotes: 2,
    score: 3,
    slug: 'gaming-mouse-x1',
    created_at: '2025-01-15T08:30:00.000Z'
  },
  {
    id: 'p2',
    name: 'Gaming Keyboard K2',
    description: 'Mechanical keyboard with RGB lighting',
    price: 89.99,
    image_url: 'https://placehold.co/300x200?text=Gaming+Keyboard',
    category: 'peripherals',
    upvotes: 10,
    downvotes: 3,
    score: 7,
    slug: 'gaming-keyboard-k2',
    created_at: '2025-01-16T10:15:00.000Z'
  },
  {
    id: 'p3',
    name: 'Gaming Headset H3',
    description: 'Surround sound gaming headset with noise cancellation',
    price: 79.99,
    image_url: 'https://placehold.co/300x200?text=Gaming+Headset',
    category: 'audio',
    upvotes: 7,
    downvotes: 1,
    score: 6,
    slug: 'gaming-headset-h3',
    created_at: '2025-01-17T14:45:00.000Z'
  },
  {
    id: 'p4',
    name: 'Gaming Monitor M4',
    description: '4K gaming monitor with high refresh rate',
    price: 299.99,
    image_url: 'https://placehold.co/300x200?text=Gaming+Monitor',
    category: 'displays',
    upvotes: 8,
    downvotes: 4,
    score: 4,
    slug: 'gaming-monitor-m4',
    created_at: '2025-01-18T11:30:00.000Z'
  },
  {
    id: 'p5',
    name: 'Gaming Chair C5',
    description: 'Ergonomic gaming chair with lumbar support',
    price: 199.99,
    image_url: 'https://placehold.co/300x200?text=Gaming+Chair',
    category: 'furniture',
    upvotes: 12,
    downvotes: 2,
    score: 10,
    slug: 'gaming-chair-c5',
    created_at: '2025-01-19T09:20:00.000Z'
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryFilter = searchParams.get('category');
  const idFilter = searchParams.get('id');
  const slugFilter = searchParams.get('slug');
  
  // Handle product detail request
  if (idFilter) {
    const product = mockProducts.find(product => product.id === idFilter);
    
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      product
    });
  }
  
  // Handle product lookup by slug
  if (slugFilter) {
    const product = mockProducts.find(product => product.slug === slugFilter);
    
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      product
    });
  }
  
  // Filter by category if provided
  let filteredProducts = categoryFilter 
    ? mockProducts.filter(product => product.category === categoryFilter)
    : mockProducts;
  
  // Sort products by score (descending)
  filteredProducts.sort((a, b) => b.score - a.score);
  
  return NextResponse.json({
    success: true,
    products: filteredProducts
  });
} 