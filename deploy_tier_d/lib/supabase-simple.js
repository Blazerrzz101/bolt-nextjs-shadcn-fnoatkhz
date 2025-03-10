/**
 * Simple Supabase Client
 * 
 * A minimal wrapper for Supabase client that works in all environments
 */

// Import the minimal polyfills first
import './minimal-polyfills.js';

// Import Supabase
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock data for products
const mockProducts = [
  { id: 1, name: "Product 1", description: "Description 1", upvotes: 5, downvotes: 2, score: 3 },
  { id: 2, name: "Product 2", description: "Description 2", upvotes: 10, downvotes: 1, score: 9 },
  { id: 3, name: "Product 3", description: "Description 3", upvotes: 8, downvotes: 4, score: 4 }
];

// Check if we're in mock mode
const isMockMode = () => {
  return process.env.MOCK_DB === 'true' || process.env.NODE_ENV === 'production';
};

// Create a mock client
function createMockClient() {
  return {
    from: (table) => ({
      select: () => Promise.resolve({ data: table === 'products' ? mockProducts : [], error: null }),
      insert: (data) => Promise.resolve({ data, error: null }),
      update: (data) => Promise.resolve({ data, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
}

// Singleton instance
let supabaseInstance = null;

// Get Supabase client (creates it if it doesn't exist)
export default function getSupabaseClient() {
  // Always use mock in production
  if (isMockMode()) {
    return createMockClient();
  }
  
  if (!supabaseInstance) {
    // Check for environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase credentials. Using mock client.');
      return createMockClient();
    }
    
    // Create Supabase client
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Error creating Supabase client:', error);
      return createMockClient();
    }
  }
  
  return supabaseInstance;
} 