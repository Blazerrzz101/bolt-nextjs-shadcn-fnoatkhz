"use client";

import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Product } from '@/types/product'

// Placeholder for the Supabase client - only create it in browser environments
let supabaseClient: any = null;

// Helper function to safely get the Supabase client
export function createClient() {
  // Only initialize in the browser, not during SSR or build
  if (typeof window !== 'undefined') {
    try {
      if (!supabaseClient) {
        supabaseClient = createSupabaseClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
      }
      return supabaseClient
    } catch (e) {
      console.error('Error creating Supabase client:', e)
      // Return a mock client if real client fails
      return getMockClient()
    }
  }
  
  // Return a mock for SSR/build
  return getMockClient()
}

// Export a default client instance for compatibility with existing code
export const supabase = typeof window !== 'undefined' ? createClient() : getMockClient();

// Helper to get a mock client
function getMockClient() {
  return {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
      in: () => Promise.resolve({ data: [], error: null }),
      limit: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock.jpg' } }),
        list: () => Promise.resolve({ data: [], error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
      }),
    },
  };
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const client = createClient()
    const { data, error } = await client.from('products').select('id').limit(1)
    
    if (error) {
      console.error('Database connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (e) {
    console.error('Failed to test database connection:', e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// Product-related functions with error handling
export async function fetchProducts(): Promise<{ data: Product[] | null; error: Error | null }> {
  try {
    const client = createClient()
    const { data, error } = await client.from('products').select('*')
    
    if (error) {
      console.error('Error fetching products:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (e) {
    console.error('Unexpected error in fetchProducts:', e)
    return { 
      data: null, 
      error: e instanceof Error ? e : new Error('Unknown error in fetchProducts') 
    }
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await fetchProducts()
    
    if (error || !data) {
      console.error('Failed to get products:', error)
      
      // Return mock data in case of error
      return [
        {
          id: '1',
          name: 'Sample Product 1',
          description: 'This is a sample product',
          slug: 'sample-product-1',
          price: 99.99,
          image_url: 'https://example.com/sample1.jpg',
          category: 'sample',
          upvotes: 5,
          downvotes: 1,
          rank: 1,
          score: 4,
          severity: 'low'
        },
        {
          id: '2',
          name: 'Sample Product 2',
          description: 'This is another sample product',
          slug: 'sample-product-2',
          price: 149.99,
          image_url: 'https://example.com/sample2.jpg',
          category: 'sample',
          upvotes: 8,
          downvotes: 2,
          rank: 2,
          score: 6,
          severity: 'medium'
        }
      ]
    }
    
    return data
  } catch (e) {
    console.error('Unexpected error in getProducts:', e)
    return []
  }
}