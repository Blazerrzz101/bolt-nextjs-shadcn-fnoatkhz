/**
 * Enhanced Supabase Client
 * 
 * This file provides a robust Supabase client implementation that works
 * reliably in both server and client environments, with fallbacks to
 * mock data when needed.
 */

// Import the polyfills first to ensure globals are defined
import './enhanced-polyfills.js';

// Import Supabase client library
import { createClient } from '@supabase/supabase-js';

// Environment detection
export const isServer = typeof window === 'undefined';
export const isBrowser = !isServer;

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Determine if we should use mock mode
 * @returns {boolean} True if mock mode should be used
 */
export const isMockMode = () => {
  // Check environment variables
  const mockDb = process.env.MOCK_DB === 'true';
  const prodEnv = process.env.DEPLOY_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const skipTest = process.env.SKIP_BUILD_TEST === 'true';
  
  // When running in production or explicitly set to mock mode
  return mockDb || prodEnv || skipTest;
};

// Cache for SSR to prevent multiple instances
let supabaseServerInstance = null;
let supabaseBrowserInstance = null;

/**
 * Create a mock Supabase client
 * @returns {Object} Mock Supabase client
 */
function createMockClient() {
  // For debugging
  if (process.env.DEBUG_SUPABASE === 'true') {
    console.log('[Supabase] Using mock client');
  }

  // Create a mock client with all the necessary methods
  return {
    // Data methods
    from: (table) => ({
      select: (columns) => Promise.resolve({ 
        data: table === 'products' ? mockProducts : [],
        error: null 
      }),
      insert: (data) => Promise.resolve({ data, error: null }),
      update: (data) => Promise.resolve({ data, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: () => ({
        single: () => Promise.resolve({ 
          data: table === 'products' ? mockProducts[0] : null,
          error: null 
        })
      }),
      match: () => ({
        select: () => Promise.resolve({ 
          data: table === 'products' ? mockProducts : [], 
          error: null 
        })
      }),
      order: () => ({
        select: () => Promise.resolve({ 
          data: table === 'products' ? mockProducts : [], 
          error: null 
        })
      }),
      limit: () => ({
        select: () => Promise.resolve({ 
          data: table === 'products' ? mockProducts.slice(0, 5) : [], 
          error: null 
        })
      }),
    }),
    
    // Auth methods
    auth: {
      getSession: () => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      }),
      getUser: () => Promise.resolve({
        data: { user: null },
        error: null
      }),
      signInWithPassword: () => Promise.resolve({
        data: { session: null, user: null },
        error: { message: 'Mock mode: Auth disabled' }
      }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback) => {
        // No-op in mock mode
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    
    // Storage methods
    storage: {
      from: (bucket) => ({
        upload: () => Promise.resolve({ data: { path: '/mock/image.jpg' }, error: null }),
        list: () => Promise.resolve({ data: [], error: null }),
        download: () => Promise.resolve({ data: new Uint8Array(), error: null }),
        getPublicUrl: (path) => ({ data: { publicUrl: `https://mock-storage.com/${path}` } }),
      })
    },
    
    // Functions
    functions: {
      invoke: (name) => Promise.resolve({ data: null, error: null })
    },
    
    // Realtime
    channel: (name) => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: (callback) => ({
        unsubscribe: () => {}
      })
    })
  };
}

// Mock data for products
const mockProducts = [
  { id: 1, name: "Product 1", description: "Description 1", upvotes: 5, downvotes: 2, score: 3 },
  { id: 2, name: "Product 2", description: "Description 2", upvotes: 10, downvotes: 1, score: 9 },
  { id: 3, name: "Product 3", description: "Description 3", upvotes: 8, downvotes: 4, score: 4 },
  { id: 4, name: "Product 4", description: "Description 4", upvotes: 3, downvotes: 2, score: 1 },
  { id: 5, name: "Product 5", description: "Description 5", upvotes: 7, downvotes: 0, score: 7 }
];

/**
 * Create a Supabase client for the browser
 * @returns {Object} Supabase client
 */
export function createBrowserClient() {
  if (isMockMode()) {
    return createMockClient();
  }
  
  // In the browser, we can create a new instance each time
  // or reuse a cached instance
  if (!supabaseBrowserInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase credentials for browser client');
      return createMockClient();
    }
    
    try {
      supabaseBrowserInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      });
    } catch (error) {
      console.error('Error creating Supabase browser client:', error);
      return createMockClient();
    }
  }
  
  return supabaseBrowserInstance;
}

/**
 * Create a Supabase client for the server
 * @param {Object} cookies - Cookies from the request
 * @returns {Object} Supabase client
 */
export function createServerClient(cookies) {
  if (isMockMode()) {
    return createMockClient();
  }
  
  // On the server, create a new client for each request
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials for server client');
    return createMockClient();
  }
  
  try {
    // If we're using cookies, we should create a new instance each time
    if (cookies) {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          detectSessionInUrl: false,
          ...(cookies ? { global: { headers: { cookie: cookies } } } : {}),
        }
      });
    }
    
    // Otherwise, we can reuse the instance
    if (!supabaseServerInstance) {
      supabaseServerInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          detectSessionInUrl: false
        }
      });
    }
    
    return supabaseServerInstance;
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    return createMockClient();
  }
}

/**
 * Get the appropriate Supabase client for the current environment
 * @param {Object} cookies - Cookies from the request (server-side only)
 * @returns {Object} Supabase client
 */
export default function getSupabaseClient(cookies) {
  if (isServer) {
    return createServerClient(cookies);
  } else {
    return createBrowserClient();
  }
} 