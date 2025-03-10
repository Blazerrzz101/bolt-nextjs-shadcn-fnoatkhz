/**
 * Centralized Supabase client creation
 * This file safely handles different environments and build scenarios
 */

// Handle 'self is not defined' error in various environments
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  // @ts-ignore
  global.self = global;
}

// Set browser environment flag
if (typeof process !== 'undefined' && typeof process === 'object') {
  try {
    Object.defineProperty(process, 'browser', { value: false });
  } catch (e) {
    console.warn('Could not set process.browser:', e);
  }
}

// This ensures we use the mock during static export builds
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
const isSSG = process.env.NEXT_STATIC_EXPORT === 'true';
const shouldUseMock = isBuildTime || isSSG || (typeof window === 'undefined' && process.env.NODE_ENV === 'production');

let createClientImpl;

// In server-side build context, use the mock
if (shouldUseMock) {
  console.log('Using Supabase mock for build/SSG');
  const mock = require('../mocks/supabase-client-mock');
  createClientImpl = mock.createClient;
} else {
  try {
    // In browser or non-SSG server context, use the real client
    const { createClient: realClient } = require('@supabase/supabase-js');
    createClientImpl = (options = {}) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase URL or key missing, using mock client');
        return require('../mocks/supabase-client-mock').createClient();
      }
      
      return realClient(supabaseUrl, supabaseKey, options);
    };
  } catch (error) {
    console.warn('Failed to import Supabase client, using mock:', error.message);
    const mock = require('../mocks/supabase-client-mock');
    createClientImpl = mock.createClient;
  }
}

/**
 * Creates a Supabase client
 * Automatically uses a mock client during static builds
 * @param {Object} options - Client options
 * @returns {Object} Supabase client instance
 */
export const createClient = (options = {}) => {
  try {
    return createClientImpl(options);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Fallback to mock in case of any error
    return require('../mocks/supabase-client-mock').createClient();
  }
};

export default createClient; 