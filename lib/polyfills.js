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
