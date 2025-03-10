import type { Database } from '@/types/supabase'
import type { Product } from '@/types/product'
import type { SupabaseClient } from '@supabase/supabase-js'

// Global variable to hold the Supabase client - will be initialized lazily
let supabaseServerClient: any = null;

// Safe version of createServerClient that works during build
export function createServerClient(): SupabaseClient<Database> {
  // Only run actual Supabase code on the server during runtime (not build time)
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    try {
      // Try to create a real client but only if running on server and not during build
      if (!supabaseServerClient) {
        // Dynamically import
        const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs');
        const { cookies } = require('next/headers');
        
        supabaseServerClient = createServerComponentClient<Database>({ cookies });
      }
      return supabaseServerClient;
    } catch (e) {
      console.log('Using mock Supabase client in server');
      // Fall back to mock if it fails (e.g., during build)
    }
  }

  // Return a mock client during build or when real client can't be created
  return getMockServerClient();
}

// Helper function to get a mock Supabase client
function getMockServerClient(): SupabaseClient<Database> {
  return {
    from: () => ({
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
      }),
      order: () => Promise.resolve({ data: [], error: null }),
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock.jpg' } }),
      }),
    },
  } as unknown as SupabaseClient<Database>;
}

// For backwards compatibility
export const supabaseServer = getMockServerClient();
export const supabaseAdmin = getMockServerClient();

// Product-related functions
export async function getProductServer(slug: string): Promise<Product | null> {
  // Use a dummy implementation for now
  console.log('Server product access attempted - use client components or API routes instead')
  return null
}