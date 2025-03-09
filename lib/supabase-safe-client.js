// Polyfill global objects for server environment
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  // Define self for server-side
  global.self = global;
}

if (typeof window === 'undefined') {
  // Define required browser globals for server environment
  global.window = {};
  global.navigator = { userAgent: 'node.js' };
  global.document = { 
    createElement: () => ({}), 
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  global.location = { protocol: 'https:', host: 'example.com' };
  global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  global.WebSocket = function() { 
    this.addEventListener = () => {}; 
    this.removeEventListener = () => {};
    this.close = () => {};
  };
  global.XMLHttpRequest = function() { 
    this.open = () => {};
    this.send = () => {};
    this.setRequestHeader = () => {};
  };
}

// Now we can safely import Supabase
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmyvtvvdnoktrwzrdflp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXZ0dnZkbm9rdHJ3enJkZmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDY4NjcsImV4cCI6MjA1NDAyMjg2N30.ZJydLlAMne7sy49slYl7xymJE0dsQqWwV8-4g2pf-EY';

// Check if we're using mock mode
const isMockMode = () => {
  return process.env.DEPLOY_ENV === 'production' || process.env.MOCK_DB === 'true';
};

// Create a safe Supabase client that handles server-side environments
let supabaseClient;

try {
  if (isMockMode()) {
    console.log('Using mock Supabase client');
    // Mock client implementation
    supabaseClient = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: (table) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      rpc: () => Promise.resolve({ data: null, error: null }),
    };
  } else {
    // Real Supabase client
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined',
      },
    });
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Provide a fallback mock client
  supabaseClient = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  };
}

export const supabase = supabaseClient;

// For server-only code
export function getServerClient() {
  if (typeof process === 'undefined' || !process.env) {
    return supabaseClient;
  }
  
  try {
    // For server environments
    const serverClient = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    return serverClient;
  } catch (error) {
    console.error('Error creating server Supabase client:', error);
    return supabaseClient;
  }
}

// Helper function to check if a request is from a client or server component
export function isServerComponent() {
  return typeof window === 'undefined';
}

export default supabase; 