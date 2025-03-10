// Import polyfills first
import './complete-polyfills.js';

// Import Supabase client
import getSupabaseClient from './supabase-complete.js';

// Helper to check if running on server
export const isServerComponent = () => {
  return typeof window === 'undefined';
};

// Helper to check if in mock mode
export const isMockMode = () => {
  return process.env.MOCK_DB === 'true' || 
         process.env.NODE_ENV === 'test' || 
         typeof window === 'undefined'; // Server components always use mock
};

// Standard response format for success
export const createSuccessResponse = (data = {}, message = 'Success', status = 200) => {
  return Response.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  );
};

// Standard response format for errors
export const createErrorResponse = (message = 'An error occurred', details = null, status = 400) => {
  console.error(`API Error: ${message}`, details);
  return Response.json(
    {
      success: false,
      message,
      error: details,
      timestamp: new Date().toISOString()
    },
    { status }
  );
};

// Get appropriate Supabase client
export const getClientForRequest = (request) => {
  // We always use the same client in this implementation
  return getSupabaseClient();
};

// Wrap handlers with polyfill support
export const withPolyfills = (handler) => {
  return async (request, ...args) => {
    try {
      // Ensure polyfills are applied
      await import('./complete-polyfills.js').then(module => {
        if (typeof module.ensurePolyfills === 'function') {
          module.ensurePolyfills();
        }
      });
      
      // Call the original handler
      return await handler(request, ...args);
    } catch (error) {
      console.error('API Error with polyfills:', error);
      return createErrorResponse(
        error.message || 'An unexpected error occurred',
        error.stack,
        500
      );
    }
  };
};

// Wrap handlers to ensure they work in static builds
export const withStaticBuildHandler = (handler) => {
  return async (request, ...args) => {
    // If we're in mock mode, we should always return a mock response
    if (isMockMode()) {
      try {
        console.log('Executing handler in mock mode');
        return await handler(request, ...args);
      } catch (error) {
        console.error('Error in mock handler:', error);
        return createErrorResponse(
          error.message || 'An unexpected error occurred in mock mode',
          error.stack,
          500
        );
      }
    }
    
    // Otherwise, call the normal handler
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error('API Error in normal handler:', error);
      return createErrorResponse(
        error.message || 'An unexpected error occurred',
        error.stack,
        500
      );
    }
  };
};

// Helper to parse request body
export const parseRequestBody = async (request) => {
  try {
    return await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    return null;
  }
};

// Helper to get query parameters
export const getQueryParams = (request) => {
  try {
    const url = new URL(request.url);
    return Object.fromEntries(url.searchParams.entries());
  } catch (error) {
    console.error('Error parsing query parameters:', error);
    return {};
  }
};

// Mock data for various types
export const getMockData = (type) => {
  const mockData = {
    products: [
      { id: 1, name: "Product 1", description: "Description for product 1", price: 19.99, category: "electronics", upvotes: 5, downvotes: 2, score: 3 },
      { id: 2, name: "Product 2", description: "Description for product 2", price: 29.99, category: "clothing", upvotes: 10, downvotes: 3, score: 7 },
      { id: 3, name: "Product 3", description: "Description for product 3", price: 39.99, category: "home", upvotes: 8, downvotes: 1, score: 7 },
      { id: 4, name: "Product 4", description: "Description for product 4", price: 49.99, category: "electronics", upvotes: 15, downvotes: 5, score: 10 },
      { id: 5, name: "Product 5", description: "Description for product 5", price: 59.99, category: "clothing", upvotes: 3, downvotes: 2, score: 1 }
    ],
    votes: {
      '1': { upvotes: 5, downvotes: 2, votes: {} },
      '2': { upvotes: 10, downvotes: 3, votes: {} },
      '3': { upvotes: 8, downvotes: 1, votes: {} },
      '4': { upvotes: 15, downvotes: 5, votes: {} },
      '5': { upvotes: 3, downvotes: 2, votes: {} }
    },
    users: [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' }
    ],
    categories: ['electronics', 'clothing', 'home']
  };
  
  return mockData[type] || [];
};

// Combined wrapper for simplicity
export const withEnhancedApi = (handler) => {
  return withPolyfills(withStaticBuildHandler(handler));
};
