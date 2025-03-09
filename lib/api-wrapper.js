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

// Import polyfills first
import '../lib/polyfills';

import { NextResponse } from 'next/server';

// Check if we're using mock mode
export const isMockMode = () => {
  return process.env.DEPLOY_ENV === 'production' || process.env.MOCK_DB === 'true';
};

// Helper to create success response
export const createSuccessResponse = (data = {}) => {
  return NextResponse.json({
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Helper to create error response
export const createErrorResponse = (message, details = null, status = 400) => {
  // If details is a string, use it, otherwise use null
  const detailsValue = typeof details === 'string' ? details : null;
  
  return NextResponse.json({
    success: false,
    error: message,
    details: detailsValue,
    timestamp: new Date().toISOString()
  }, { status });
};

// Safe import of Supabase client
export const getServerClient = () => {
  try {
    // Import dynamically to ensure polyfills are loaded first
    const { getServerClient: getClient } = require('../lib/supabase-safe-client');
    return getClient();
  } catch (error) {
    console.error('Error getting server client:', error);
    return null;
  }
};

// Helper for API routes that need to handle the 'self is not defined' error
export const withPolyfills = (handler) => {
  return async (req, ...args) => {
    try {
      // Polyfills are already imported at the top
      return await handler(req, ...args);
    } catch (error) {
      console.error('API route error:', error);
      return createErrorResponse(
        'Internal server error',
        process.env.NODE_ENV === 'development' ? error.message : null,
        500
      );
    }
  };
};

// Helper for static builds
export const withStaticBuildHandler = (handler) => {
  return async (req, ...args) => {
    try {
      // Check if we're in a static build
      if (isMockMode()) {
        console.log('Using mock implementation for API route');
        // Default mock response
        return createSuccessResponse({
          message: 'Mock API response',
          data: []
        });
      }
      
      // Otherwise, call the real handler
      return await handler(req, ...args);
    } catch (error) {
      console.error('API handler error:', error);
      return createErrorResponse(
        'Internal server error', 
        process.env.NODE_ENV === 'development' ? error.message : null,
        500
      );
    }
  };
};

export default {
  withStaticBuildHandler,
  getServerClient,
  createErrorResponse,
  createSuccessResponse
}; 