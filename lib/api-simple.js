/**
 * Simple API Utilities
 * 
 * Provides utility functions for API routes
 */

// Import minimal polyfills
import './minimal-polyfills.js';

// Import Supabase client
import getSupabaseClient from './supabase-simple.js';

/**
 * Create a success response
 * @param {any} data - The data to include in the response
 * @param {string} message - Optional success message
 * @param {number} status - HTTP status code
 */
export function createSuccessResponse(data, message = 'Success', status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {any} error - Optional error details
 * @param {number} status - HTTP status code
 */
export function createErrorResponse(message, error = null, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
      error,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Wrap an API handler with error handling
 * @param {Function} handler - The handler function
 */
export function withErrorHandling(handler) {
  return async (request) => {
    try {
      // Ensure polyfills are loaded (they're imported at the top)
      // Call the handler
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);
      return createErrorResponse(
        'An unexpected error occurred',
        { message: error.message },
        500
      );
    }
  };
}

/**
 * Get query parameters from a request
 * @param {Request} request - The request object
 */
export function getQueryParams(request) {
  const url = new URL(request.url);
  const params = {};
  
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
}

/**
 * Parse request body as JSON
 * @param {Request} request - The request object
 */
export async function parseBody(request) {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
} 