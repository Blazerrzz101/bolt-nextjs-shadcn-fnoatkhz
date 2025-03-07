/**
 * API Route wrapper to safely handle static builds
 * This provides a unified approach for all API routes
 */

// Define global.self if it doesn't exist (prevents 'self is not defined' errors)
if (typeof global !== 'undefined') {
  // Only define self if it doesn't exist
  if (typeof self === 'undefined') {
    // @ts-ignore
    global.self = {};
  }
  
  // Only define window if it doesn't exist
  if (typeof window === 'undefined') {
    // @ts-ignore
    global.window = {};
  }
}

// Set browser environment flag
if (typeof process !== 'undefined' && typeof process === 'object') {
  try {
    Object.defineProperty(process, 'browser', { value: false });
  } catch (e) {
    console.warn('Could not set process.browser:', e);
  }
}

// Handle build-time vs runtime detection
const isBuildTime = typeof process !== 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';
const isSSG = typeof process !== 'undefined' && process.env.NEXT_STATIC_EXPORT === 'true';
const isStaticBuild = isBuildTime || isSSG || (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');

// Mock response for static builds
const mockResponse = {
  success: true,
  message: "Using mock implementation during static build",
  data: []
};

/**
 * Wraps an API handler to safely handle static builds
 * @param {Function} handler - The actual API handler function
 * @returns {Function} A wrapped handler that works in static builds
 */
export function withStaticBuildHandler(handler) {
  return async function wrappedHandler(req, ...args) {
    // During static builds, return a mock response
    if (isStaticBuild) {
      console.log('Static build detected - using mock response for API handler');
      return new Response(JSON.stringify(mockResponse), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Otherwise execute the original handler
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error('Error in API handler:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

/**
 * Gets the Supabase server client only if not in a static build
 * @returns {Object|null} Supabase client or null during static builds
 */
export function getServerClient() {
  // During static builds, return null
  if (isStaticBuild) {
    console.log('Static build detected - using mock responses for Supabase client');
    return null;
  }
  
  try {
    // Dynamically import to avoid issues during static builds
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase URL or key not found in environment variables');
      return null;
    }
    
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error getting Supabase client:', error);
    return null;
  }
}

/**
 * Standard error response creator
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Response} JSON response with error
 */
export function createErrorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Standard success response creator
 * @param {any} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Response} JSON response with data
 */
export function createSuccessResponse(data, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...(typeof data === 'object' ? data : { data })
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export default {
  withStaticBuildHandler,
  getServerClient,
  createErrorResponse,
  createSuccessResponse
}; 