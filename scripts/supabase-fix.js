/**
 * Supabase Fix Script for Vercel Deployment
 * 
 * This script provides the essential polyfills needed to make Supabase
 * work properly in server environments like Vercel.
 */

console.log('🔧 Setting up Supabase polyfills for Vercel...');

// Essential polyfills for Supabase in server environments
if (typeof global !== 'undefined') {
  // Define self if it doesn't exist (required by Supabase)
  if (!global.self) {
    console.log('📦 Setting up global.self polyfill');
    global.self = global;
  }

  // Define window if it doesn't exist (used by some Supabase components)
  if (!global.window) {
    console.log('📦 Setting up global.window polyfill');
    global.window = global;
  }

  // Define navigator if it doesn't exist
  if (!global.navigator) {
    console.log('📦 Setting up global.navigator polyfill');
    global.navigator = {
      userAgent: 'node.js',
      platform: 'node',
    };
  }

  // Define document if it doesn't exist
  if (!global.document) {
    console.log('📦 Setting up global.document polyfill');
    global.document = {
      createElement: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
    };
  }

  // Basic fetch polyfill if it doesn't exist
  if (!global.fetch) {
    console.log('📦 Setting up global.fetch polyfill');
    // This is a very minimal implementation just to prevent errors
    global.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    });
  }

  // WebSocket polyfill (used by Supabase realtime)
  if (!global.WebSocket) {
    console.log('📦 Setting up global.WebSocket polyfill');
    global.WebSocket = class MockWebSocket {
      constructor() {
        this.readyState = 3; // CLOSED
      }
      addEventListener() {}
      removeEventListener() {}
      send() {}
      close() {}
    };
  }
}

console.log('✅ Supabase polyfills setup complete');

/**
 * Use this function in your API routes to ensure polyfills are loaded
 */
export function ensureSupabasePolyfills() {
  return typeof self !== 'undefined' && 
         typeof window !== 'undefined' &&
         typeof navigator !== 'undefined';
}

/**
 * Wrap your API handlers with this function to ensure polyfills are applied
 */
export function withSupabasePolyfills(handler) {
  return async (req, ...args) => {
    // Ensure polyfills are loaded
    ensureSupabasePolyfills();
    
    // Call the original handler
    return handler(req, ...args);
  };
} 