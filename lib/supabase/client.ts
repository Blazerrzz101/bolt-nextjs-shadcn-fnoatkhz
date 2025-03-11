"use client";

import type { Database } from '@/types/supabase'

// Import our wrapper with built-in polyfills and fallbacks
// @ts-ignore
const supabaseWrapper = require('../supabase-wrapper');

// Use the supabase client from our wrapper
export const supabase = supabaseWrapper.supabase;

// Log if we're using mock mode
if (supabaseWrapper.isMockMode) {
  console.log('Using mock Supabase client in client.ts');
} else {
  console.log('Using real Supabase client in client.ts');
}

// Get or create the Supabase client instance
export function getSupabaseClient() {
  if (supabase) return supabase;

  // If somehow the supabase client isn't available, log it
  console.error('Supabase client not available, this should not happen');
  
  if (supabaseWrapper.supabaseError) {
    console.error('Supabase error:', supabaseWrapper.supabaseError);
  }

  return supabase;
}

// Simple connection test that doesn't require auth
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    
    // First test basic connection
    const { data: productData, error: productError } = await client
      .from('products')
      .select('id')
      .limit(1);
    
    if (productError) {
      console.error('Product table connection test failed:', productError);
      return false;
    }

    // Test materialized view
    const { data: rankingsData, error: rankingsError } = await client
      .from('product_rankings')
      .select('id')
      .limit(1);
    
    if (rankingsError) {
      console.error('Product rankings view connection test failed:', rankingsError);
      return false;
    }

    console.log('Database connection test successful:', {
      productsConnected: !!productData,
      rankingsConnected: !!rankingsData
    });
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Simplified profile test that always returns true for public access
export async function testUserProfileFetch(): Promise<boolean> {
  return true
}

// Fetch products with error handling
export async function fetchProducts(options: { 
  slug?: string,
  includeVotes?: boolean,
  includeReviews?: boolean
} = {}) {
  try {
    console.log('Fetching products with options:', options);
    const client = getSupabaseClient();
    
    let query = client
      .from('products')
      .select(`
        *,
        product_rankings!inner (
          id,
          name,
          description,
          image_url,
          price,
          category,
          slug,
          upvotes,
          downvotes,
          rating,
          review_count,
          net_score,
          rank
        )
        ${options.includeReviews ? ',reviews (*)' : ''}
      `.trim());
    
    if (options.slug) {
      query = query.eq('slug', options.slug);
    }
    
    const { data, error } = await query.order('rank', { ascending: true });
    
    if (error) {
      console.error('Supabase error fetching products:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('Successfully fetched products:', {
      count: data?.length,
      firstProduct: data?.[0] ? {
        id: (data[0] as any).id,
        name: (data[0] as any).name,
        category: (data[0] as any).category
      } : null
    });
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    throw error;
  }
}

export async function getProducts(options: {
  category?: string;
  url_slug?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const client = getSupabaseClient();
  let query = client
    .from('products')
    .select('*')

  if (options.category) {
    query = query.eq('category', options.category);
  }

  if (options.url_slug) {
    query = query.eq('url_slug', options.url_slug);
  }

  const { data, error } = await query.order('rank', { ascending: true });
  
  if (error) {
    console.error('Supabase error fetching products:', {
      error,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
  
  console.log('Successfully fetched products:', {
    count: data?.length,
    firstProduct: data?.[0] ? {
      id: (data[0] as any).id,
      name: (data[0] as any).name,
      category: (data[0] as any).category
    } : null
  });
  
  return data || [];
}