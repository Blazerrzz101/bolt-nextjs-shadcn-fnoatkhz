// Early polyfill loader for Vercel build process
console.log('🚀 Initializing Vercel build with Supabase polyfills');

// Set up polyfills as early as possible
if (typeof global !== 'undefined') {
  if (!global.self) {
    console.log('📦 Setting up global.self polyfill');
    global.self = global;
  }
  
  if (!global.window) {
    console.log('📦 Setting up global.window polyfill');
    global.window = global;
  }
  
  if (!global.navigator) {
    console.log('📦 Setting up global.navigator polyfill');
    global.navigator = { userAgent: 'node.js' };
  }
}

console.log('✅ Vercel build polyfills initialized');

// Export a function to verify polyfills are loaded
exports.verifyPolyfills = function() {
  return {
    self: typeof self !== 'undefined',
    window: typeof window !== 'undefined',
    navigator: typeof navigator !== 'undefined'
  };
}; 