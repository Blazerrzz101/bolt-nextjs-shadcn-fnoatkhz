import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Product } from '@/types/product'

// Create a client-side compatible Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Mock implementation for client-side use (no server-side headers dependency)
export async function getProductClient(slug: string): Promise<Product | null> {
  try {
    console.log('Fetching product with slug (client):', slug)
    
    // For now, this is a mock implementation to bypass server component issues
    // In a real app, this would make API calls to endpoints that use the server-side client
    
    // Mock product data
    return {
      id: `mock-${slug}`,
      name: `Mock Product: ${slug}`,
      description: 'This is a mock product for client-side rendering',
      category: 'peripherals',
      price: 99.99,
      url_slug: slug,
      image_url: `/images/products/placeholder-${slug}.svg`,
      imageUrl: `/images/products/placeholder-${slug}.svg`,
      specifications: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      upvotes: 5,
      downvotes: 2,
      rating: 4.5,
      review_count: 10,
      score: 3, // upvotes - downvotes
      rank: 1,
      reviews: [],
      threads: []
    };
  } catch (error) {
    console.error('Error in getProductClient:', error)
    return null
  }
} 