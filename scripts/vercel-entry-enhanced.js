/**
 * Vercel Entry Point - Enhanced Version
 * 
 * This script is loaded at the very beginning of Vercel's build process
 * to ensure all necessary polyfills are in place before any code runs.
 */

console.log('🚀 Vercel build initializing with enhanced polyfills');

// Core polyfills to be applied as early as possible
if (typeof global !== 'undefined') {
  // Self - critical for Supabase
  if (!global.self) {
    console.log('📦 Setting up global.self polyfill (early)');
    global.self = global;
  }
  
  // Window - used by many libraries
  if (!global.window) {
    console.log('📦 Setting up global.window polyfill (early)');
    global.window = global;
  }
  
  // Navigator - used for feature detection
  if (!global.navigator) {
    console.log('📦 Setting up global.navigator polyfill (early)');
    global.navigator = { 
      userAgent: 'node.js',
      platform: 'node',
      appName: 'nodejs',
    };
  }
  
  // Document - minimal implementation
  if (!global.document) {
    console.log('📦 Setting up global.document polyfill (early)');
    global.document = {
      createElement: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {},
      documentElement: { style: {} },
    };
  }
}

// Load the full polyfills at startup if possible
try {
  // This is a dynamic require that will work in most environments
  // but might fail in some edge cases
  if (typeof require !== 'undefined') {
    const path = require('path');
    const fullPolyfillsPath = path.resolve(__dirname, '../lib/enhanced-polyfills.js');
    
    try {
      require(fullPolyfillsPath);
      console.log('✅ Full enhanced polyfills loaded successfully');
    } catch (err) {
      console.log('⚠️ Could not load full polyfills, using basic ones: ' + err.message);
    }
  }
} catch (err) {
  console.log('ℹ️ Skipping dynamic loading of enhanced polyfills: ' + err.message);
}

console.log('✅ Vercel entry point initialization complete');

// Export functions to verify polyfills
exports.verifyPolyfills = function() {
  return {
    self: typeof self !== 'undefined',
    window: typeof window !== 'undefined',
    document: typeof document !== 'undefined',
    navigator: typeof navigator !== 'undefined',
    location: typeof location !== 'undefined'
  };
};

exports.diagnostics = function() {
  return {
    environment: typeof window !== 'undefined' ? 'browser' : 'server',
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      MOCK_DB: process.env.MOCK_DB,
    }
  };
}; 