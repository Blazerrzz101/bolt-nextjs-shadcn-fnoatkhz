/**
 * Vercel Entry Point Script
 * 
 * This script is executed at the beginning of the Vercel build process via NODE_OPTIONS.
 * It ensures all necessary polyfills are applied before any Next.js code runs.
 */

console.log('🚀 Initializing Vercel build with polyfills');

// Import and apply the complete polyfills
require('../lib/complete-polyfills');

// Additional verification to ensure polyfills are working
const verifyEnvironment = () => {
  console.log(`📋 Environment check:`);
  console.log(`  - Node version: ${process.version}`);
  console.log(`  - Platform: ${process.platform}`);
  console.log(`  - MOCK_DB: ${process.env.MOCK_DB || 'not set'}`);
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  
  // Verify critical polyfills
  try {
    if (typeof self !== 'undefined' && 
        typeof window !== 'undefined' && 
        typeof document !== 'undefined' &&
        typeof Response !== 'undefined') {
      console.log('✅ Critical polyfills verified successfully');
    } else {
      console.error('❌ Critical polyfills verification failed');
      // Don't exit - we'll continue anyway and let Next.js handle errors
    }
  } catch (error) {
    console.error(`❌ Error during polyfill verification: ${error.message}`);
  }
};

// Verify WebSocket implementation for Supabase
const verifyWebSocket = () => {
  try {
    const ws = new WebSocket('wss://example.com');
    if (typeof ws.addEventListener === 'function' && 
        typeof ws.send === 'function' && 
        typeof ws.close === 'function') {
      console.log('✅ WebSocket implementation verified');
    } else {
      console.warn('⚠️ WebSocket implementation incomplete');
    }
  } catch (error) {
    console.error(`❌ WebSocket verification failed: ${error.message}`);
  }
};

// Verify Response implementation for Next.js API routes
const verifyResponse = () => {
  try {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const response = new Response(JSON.stringify({ status: 'ok' }), { 
      status: 200, 
      headers 
    });
    
    if (response.status === 200 && 
        response.headers instanceof Headers && 
        typeof response.json === 'function') {
      console.log('✅ Response implementation verified');
    } else {
      console.warn('⚠️ Response implementation incomplete');
    }
  } catch (error) {
    console.error(`❌ Response verification failed: ${error.message}`);
  }
};

// Run all verifications
verifyEnvironment();
verifyWebSocket();
verifyResponse();

// Set up global error handlers
process.on('uncaughtException', (error) => {
  console.error(`❌ Uncaught Exception: ${error.message}`);
  console.error(error.stack);
  // Don't exit - let Next.js handle the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection');
  console.error(reason);
});

console.log('✅ Vercel build initialization complete'); 