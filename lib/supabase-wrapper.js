/**
 * Enhanced Supabase Client Wrapper
 * 
 * This file provides a unified interface for Supabase operations,
 * handling both real and mock modes with comprehensive error handling.
 * Enhanced to support the universal polyfill system.
 */

// Apply universal polyfills
require('./universal-polyfill');

// Import mock data and client
const { createMockSupabaseClient } = require('./supabase/mock');
const mockData = require('../data/mock-data');

// State management
let isMockMode = process.env.MOCK_DB === 'true';
let supabaseClient = null;
let supabaseError = null;

// Debug helper
const debug = (message, data = null) => {
  console.log(`[SupabaseWrapper] ${message}`, data ? data : '');
};

/**
 * Initialize or retrieve the Supabase client
 * @returns {Object} The Supabase client
 */
function getSupabaseClient() {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient;
  }
  
  try {
    if (isMockMode) {
      debug('Creating MOCK Supabase client');
      supabaseClient = createMockSupabaseClient();
    } else {
      debug('Attempting to create REAL Supabase client');
      
      // Try to import Supabase
      try {
        const { createClient } = require('@supabase/supabase-js');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase credentials');
        }
        
        supabaseClient = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        
        debug('Successfully created REAL Supabase client');
      } catch (error) {
        debug('Failed to create REAL Supabase client, using mock:', error);
        supabaseClient = createMockSupabaseClient();
        supabaseError = error;
        isMockMode = true; // Set mock mode if we failed to create real client
      }
    }
  } catch (error) {
    debug('Critical error creating Supabase client:', error);
    
    // Create a minimal fallback client that won't crash
    supabaseClient = createMinimalFallbackClient();
    supabaseError = error;
    isMockMode = true;
  }
  
  return supabaseClient;
}

/**
 * Create a minimal fallback client that won't crash
 */
function createMinimalFallbackClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signUp: async () => ({ data: null, error: new Error('Supabase client not available') }),
      signIn: async () => ({ data: null, error: new Error('Supabase client not available') }),
      signOut: async () => ({ error: null })
    },
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          single: async () => ({ data: null, error: null }),
          limit: (limit) => ({
            async: async () => ({ data: [], error: null }),
          }),
          async: async () => ({ data: [], error: null })
        }),
        async: async () => ({ data: [], error: null })
      }),
      insert: (data) => ({
        single: async () => ({ data: null, error: null })
      }),
      update: (data) => ({
        eq: (column, value) => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      delete: () => ({
        eq: (column, value) => ({
          async: async () => ({ data: null, error: null })
        })
      })
    }),
    rpc: (func, args) => ({
      single: async () => ({ data: null, error: null }),
      async: async () => ({ data: null, error: null })
    })
  };
}

/**
 * Set mock mode explicitly
 * @param {boolean} mode True to use mock, false to use real
 */
function setMockMode(mode) {
  if (isMockMode !== mode) {
    isMockMode = mode;
    // Reset client to force recreation with new mode
    supabaseClient = null;
    debug(`Mock mode set to: ${mode}`);
  }
}

/**
 * Get the mock client
 * @returns {Object} Mock Supabase client
 */
function getMockClient() {
  if (!supabaseClient || !isMockMode) {
    setMockMode(true);
    getSupabaseClient();
  }
  return supabaseClient;
}

/**
 * Get mock data for use in server components
 * @returns {Object} Mock data
 */
function getMockData() {
  return mockData || {
    products: [],
    categories: [],
    reviews: []
  };
}

// Initialize the client when the module is loaded
getSupabaseClient();

// Module exports
module.exports = {
  supabase: getSupabaseClient(),
  supabaseError,
  isMockMode,
  setMockMode,
  getMockClient,
  getMockData,
  getSupabaseClient
}; 