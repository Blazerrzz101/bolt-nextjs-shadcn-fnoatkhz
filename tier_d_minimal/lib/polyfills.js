// Basic polyfills for browser globals in Node.js environment
if (typeof window === 'undefined') {
  global.self = global;
  global.window = global;
  global.navigator = { userAgent: 'node.js' };
  
  // Create minimal localStorage implementation
  if (!global.localStorage) {
    const store = {};
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); },
      length: 0
    };
    Object.defineProperty(global.localStorage, 'length', {
      get: () => Object.keys(store).length
    });
  }
  
  console.log('✅ Applied polyfills for server environment');
}

// Helper to check if browser APIs are available
export function isBrowser() {
  return typeof self !== 'undefined' && typeof window !== 'undefined';
}

// Function to ensure polyfills are applied
export function ensurePolyfills() {
  if (typeof window === 'undefined') {
    if (!global.self) global.self = global;
    if (!global.window) global.window = global;
    if (!global.navigator) global.navigator = { userAgent: 'node.js' };
    return false; // Not browser environment
  }
  return true; // Browser environment
} 