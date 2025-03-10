/**
 * Enhanced API Wrapper
 * 
 * This file provides utilities for API routes, including:
 * - Polyfill handling
 * - Consistent response formatting
 * - Error handling
 * - Mock data support
 */

// Import polyfills first
import './enhanced-polyfills.js';

// Import the enhanced Supabase client
import getSupabaseClient, { isMockMode, isServer } from './supabase-enhanced-client.js';

/**
 * Determine if the current request is a server component
 * @returns {boolean} True if in a server component
 */
export const isServerComponent = () => {
  return isServer;
};

/**
 * Create a success response with standard format
 * @param {Object} data - The data to include in the response
 * @param {string} message - Optional success message
 * @param {number} status - HTTP status code
 * @returns {Response} A formatted Response object
 */
export const createSuccessResponse = (data = {}, message = 'Success', status = 200) => {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
};

/**
 * Create an error response with standard format
 * @param {string} message - Error message
 * @param {Object} details - Optional error details
 * @param {number} status - HTTP status code
 * @returns {Response} A formatted Response object
 */
export const createErrorResponse = (message = 'An error occurred', details = null, status = 400) => {
  const errorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  
  if (details) {
    errorResponse.error = details;
  }
  
  return new Response(
    JSON.stringify(errorResponse),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
};

/**
 * Get a Supabase client for the current request
 * @param {Request} request - The request object
 * @returns {Object} A Supabase client
 */
export const getClientForRequest = (request) => {
  // Extract cookies from request if available
  let cookies = null;
  if (request && request.headers && request.headers.get) {
    cookies = request.headers.get('cookie');
  }
  
  return getSupabaseClient(cookies);
};

/**
 * Wrapper for API handlers that ensures polyfills are applied
 * @param {Function} handler - The API handler function
 * @returns {Function} A wrapped handler function
 */
export const withPolyfills = (handler) => {
  return async (request, ...args) => {
    try {
      // Ensure polyfills are loaded
      return await handler(request, ...args);
    } catch (error) {
      console.error('API Error:', error);
      return createErrorResponse(
        error.message || 'An unexpected error occurred',
        process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          name: error.name,
        } : null,
        500
      );
    }
  };
};

/**
 * Wrapper for API handlers that handles static build issues
 * @param {Function} handler - The API handler function
 * @returns {Function} A wrapped handler function
 */
export const withStaticBuildHandler = (handler) => {
  return async (request, ...args) => {
    // During static builds, provide mock responses
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return createSuccessResponse({ mockMode: true });
    }
    
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error('API Error in Static Build Handler:', error);
      return createErrorResponse(
        error.message || 'An unexpected error occurred',
        process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          name: error.name,
        } : null,
        500
      );
    }
  };
};

/**
 * Helper to extract and parse JSON from a request
 * @param {Request} request - The request object
 * @returns {Promise<Object>} The parsed request body
 */
export const parseRequestBody = async (request) => {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid request body: ' + error.message);
  }
};

/**
 * Helper to extract query parameters from a request URL
 * @param {Request} request - The request object
 * @returns {Object} Object containing the query parameters
 */
export const getQueryParams = (request) => {
  const url = new URL(request.url);
  const params = {};
  
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
};

/**
 * Get mock data for a specified entity type
 * @param {string} type - The type of mock data to retrieve
 * @returns {Array|Object} Mock data
 */
export const getMockData = (type) => {
  const mockData = {
    products: [
      { id: 1, name: "Product 1", description: "Description 1", upvotes: 5, downvotes: 2, score: 3 },
      { id: 2, name: "Product 2", description: "Description 2", upvotes: 10, downvotes: 1, score: 9 },
      { id: 3, name: "Product 3", description: "Description 3", upvotes: 8, downvotes: 4, score: 4 },
      { id: 4, name: "Product 4", description: "Description 4", upvotes: 3, downvotes: 2, score: 1 },
      { id: 5, name: "Product 5", description: "Description 5", upvotes: 7, downvotes: 0, score: 7 }
    ],
    categories: [
      { id: 1, name: "Category 1" },
      { id: 2, name: "Category 2" },
      { id: 3, name: "Category 3" }
    ],
    users: [
      { id: 1, name: "User 1", email: "user1@example.com" },
      { id: 2, name: "User 2", email: "user2@example.com" }
    ],
    votes: [
      { id: 1, productId: 1, userId: 1, voteType: 1 },
      { id: 2, productId: 2, userId: 1, voteType: 1 },
      { id: 3, productId: 3, userId: 2, voteType: -1 }
    ]
  };
  
  return mockData[type] || [];
};

/**
 * Wrapper that combines all API enhancements
 * @param {Function} handler - The API handler function
 * @returns {Function} A fully wrapped handler function
 */
export const withEnhancedApi = (handler) => {
  return withPolyfills(withStaticBuildHandler(handler));
}; 