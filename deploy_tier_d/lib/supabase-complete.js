import { createClient } from '@supabase/supabase-js';

// Make sure polyfills are applied
import './complete-polyfills.js';

// Check if running in mock mode
export const isMockMode = () => {
  return process.env.MOCK_DB === 'true' || 
         process.env.NODE_ENV === 'test' || 
         process.env.NODE_ENV === 'development' || 
         typeof window === 'undefined'; // For server components in production
};

// Check if running in a server component
export const isServerComponent = () => {
  return typeof window === 'undefined';
};

// Create a mock Supabase client with all required methods
function createMockClient() {
  console.log('Creating mock Supabase client');
  
  // Base mock client with all common methods
  const mockClient = {
    // Auth methods
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getUrl: () => ({ origin: 'http://localhost:3000' }),
      // ... add any other auth methods you use
    },
    
    // Database methods
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
          order: (column, options) => ({
            range: (from, to) => ({
              limit: (limit) => ({
                then: async (callback) => callback({ data: [], error: null })
              })
            })
          }),
          limit: (limit) => ({
            then: async (callback) => callback({ data: [], error: null })
          }),
          then: async (callback) => callback({ data: [], error: null })
        }),
        order: (column, options) => ({
          limit: (limit) => ({
            then: async (callback) => callback({ data: [], error: null })
          })
        }),
        limit: (limit) => ({
          then: async (callback) => callback({ data: [], error: null })
        }),
        then: async (callback) => callback({ data: [], error: null })
      }),
      insert: (data) => ({
        select: () => ({
          single: async () => ({ data: data, error: null }),
          then: async (callback) => callback({ data: [data], error: null })
        }),
        then: async (callback) => callback({ data, error: null })
      }),
      update: (data) => ({
        eq: (column, value) => ({
          then: async (callback) => callback({ data, error: null })
        }),
        match: (conditions) => ({
          then: async (callback) => callback({ data, error: null })
        }),
        then: async (callback) => callback({ data, error: null })
      }),
      delete: () => ({
        eq: (column, value) => ({
          then: async (callback) => callback({ data: null, error: null })
        }),
        match: (conditions) => ({
          then: async (callback) => callback({ data: null, error: null })
        }),
        then: async (callback) => callback({ data: null, error: null })
      }),
      // ... add any other database methods you use
    }),
    
    // Storage methods
    storage: {
      from: (bucket) => ({
        upload: async (path, file) => ({ data: { path }, error: null }),
        getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } }),
        list: async (prefix) => ({ data: [], error: null }),
        remove: async (paths) => ({ data: {}, error: null }),
        download: async (path) => ({ data: null, error: null }),
        // ... add any other storage methods you use
      }),
    },
    
    // Real-time subscriptions
    channel: (name) => ({
      on: (event, schema, callback) => ({
        subscribe: (callback) => {
          if (callback) callback();
          return {
            unsubscribe: () => {},
          };
        },
      }),
    }),
    
    // Helper for mocking other functions
    rpc: (fn, params) => ({
      then: async (callback) => callback({ data: {}, error: null })
    }),
  };

  return mockClient;
}

// Create the real Supabase client
function createRealClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials. Using mock client.');
    return createMockClient();
  }
  
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return createMockClient();
  }
}

// Main client getter with appropriate fallbacks
export default function getSupabaseClient() {
  if (isMockMode()) {
    return createMockClient();
  }
  
  // Create and return the real client
  try {
    return createRealClient();
  } catch (error) {
    console.error('Error getting Supabase client, falling back to mock:', error);
    return createMockClient();
  }
}
