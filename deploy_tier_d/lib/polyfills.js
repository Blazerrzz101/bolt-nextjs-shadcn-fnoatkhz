// Essential polyfills for Supabase to work in server environments
if (typeof global !== 'undefined' && !global.self) {
  console.log('Setting up global.self polyfill');
  global.self = global;
}

if (typeof global !== 'undefined' && !global.window) {
  console.log('Setting up global.window polyfill');
  global.window = global;
}

// Export dummy function to prevent tree-shaking
export function ensurePolyfills() {
  return typeof self !== 'undefined' && typeof window !== 'undefined';
}

// Basic polyfills for browser globals in Node.js environment
if (typeof window === 'undefined') {
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.navigator) global.navigator = { userAgent: 'node.js' };
  
  console.log('✅ Applied basic polyfills for server environment');
}
