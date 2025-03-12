// Apply universal polyfill first
import '../universal-polyfill';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { Product } from '@/types/product';
import supabaseWrapper from '../supabase-wrapper';

// Log initialization to debug server-side rendering issues
console.log('🔄 Initializing Supabase server client');

// Check for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables in server.ts. Setting mock mode.');
  supabaseWrapper.setMockMode(true);
} else {
  console.log('✅ Supabase environment variables found for server-side operations');
}

// Create a cached server client to avoid redundant client creation
export async function createServerSupabaseClient() {
  try {
    if (supabaseWrapper.isMockMode) {
      console.log('Using mock Supabase client (server)');
      return supabaseWrapper.getMockClient();
    }
    
    const cookieStore = cookies();
    
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options);
          },
        },
      }
    );
  } catch (error) {
    console.error('Error creating server Supabase client:', error);
    console.log('Falling back to mock client');
    return supabaseWrapper.getMockClient();
  }
}

// Initialize a server client for direct use in API routes
export const supabaseServer = createServerSupabaseClient();

// Get a product by slug with detailed error handling
export async function getProduct(slug: string): Promise<Product | null> {
  console.log(`Attempting to fetch product with slug: ${slug}`);
  try {
    // Use mock data if in mock mode
    if (supabaseWrapper.isMockMode) {
      console.log('Using mock data for product fetch');
      const mockData = supabaseWrapper.getMockData();
      // Type assertion to ensure TypeScript knows the structure
      const mockProducts = (mockData as any).products || [];
      const product = mockProducts.find((p: any) => p.url_slug === slug);
      
      if (!product) {
        console.log(`Product with slug ${slug} not found in mock data`);
        return null;
      }
      
      // Transform to match Product type
      return {
        ...product,
        imageUrl: product.image_url || '/images/placeholder.png',
        rank: product.rank || 0,
        reviews: [],
        threads: [],
      };
    }
    
    // Use real Supabase client
    console.log('Fetching product from Supabase');
    const supabase = await createServerSupabaseClient();
    // Type assertion to ensure TypeScript knows the structure
    const { data, error } = await (supabase as any)
      .from('products')
      .select(`
        *,
        reviews (*),
        threads (*)
      `)
      .eq('url_slug', slug)
      .single();
      
    if (error) {
      console.error('Error fetching product:', error.message);
      return null;
    }
    
    if (!data) {
      console.log(`Product with slug ${slug} not found in database`);
      return null;
    }
    
    // Transform to match Product type
    return {
      ...data,
      imageUrl: data.image_url || '/images/placeholder.png',
      reviews: data.reviews || [],
      threads: data.threads || [],
    };
  } catch (error) {
    console.error('Unexpected error fetching product:', error);
    return null;
  }
}

// Define minimal mock data directly for use in case of failure
const fallbackProducts = [
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
    upvotes: 5,
    downvotes: 2,
    rating: 4.8,
    review_count: 156,
    score: 3,
    reviews: [],
    threads: []
  }
];

// Cache the server client to avoid redundant client creation
export const createCachedServerSupabaseClient = cache(createServerSupabaseClient);

// Type-safe version for API routes
export async function getTypedSupabaseClient() {
  const client = await createServerSupabaseClient();
  
  // Add proper typing to make TS happy
  return client as any;
}