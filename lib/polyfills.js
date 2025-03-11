/**
 * Polyfills for Node.js environment
 * 
 * This file provides polyfills for browser globals not available in Node.js
 * Used to fix Supabase "self is not defined" error in server components
 */

// Apply polyfills immediately on import
if (typeof global !== 'undefined') {
  // Define self when in Node.js environment
  if (typeof self === 'undefined') {
    global.self = global;
    console.log('Polyfilled self');
  }
  
  // Add other browser globals if needed
  if (typeof window === 'undefined') {
    global.window = global;
    console.log('Polyfilled window');
  }
  
  if (typeof document === 'undefined') {
    global.document = {
      createElement: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
    };
    console.log('Polyfilled document');
  }
  
  if (typeof navigator === 'undefined') {
    global.navigator = {
      userAgent: 'node',
    };
    console.log('Polyfilled navigator');
  }
  
  if (typeof location === 'undefined') {
    global.location = {
      protocol: 'https:',
      host: 'localhost',
      pathname: '/',
      search: '',
      href: 'https://localhost/',
    };
    console.log('Polyfilled location');
  }
  
  // WebSocket polyfill if needed
  if (typeof WebSocket === 'undefined') {
    global.WebSocket = class MockWebSocket {
      constructor() {
        console.log('Mock WebSocket initialized');
      }
      addEventListener() {}
      removeEventListener() {}
      send() {}
      close() {}
    };
    console.log('Polyfilled WebSocket');
  }

  // Add localStorage polyfill for server environment
  if (typeof localStorage === 'undefined') {
    global.localStorage = {
      getItem: (key) => {
        console.log('Mock localStorage.getItem', key);
        return null;
      },
      setItem: (key, value) => {
        console.log('Mock localStorage.setItem', key, value);
      },
      removeItem: (key) => {
        console.log('Mock localStorage.removeItem', key);
      },
      clear: () => {
        console.log('Mock localStorage.clear');
      },
    };
    console.log('Polyfilled localStorage');
  }

  // Add sessionStorage polyfill
  if (typeof sessionStorage === 'undefined') {
    global.sessionStorage = {
      getItem: (key) => {
        console.log('Mock sessionStorage.getItem', key);
        return null;
      },
      setItem: (key, value) => {
        console.log('Mock sessionStorage.setItem', key, value);
      },
      removeItem: (key) => {
        console.log('Mock sessionStorage.removeItem', key);
      },
      clear: () => {
        console.log('Mock sessionStorage.clear');
      },
    };
    console.log('Polyfilled sessionStorage');
  }
  
  // Don't try to polyfill fetch - it's already available in Node.js
  
  console.log('Polyfills applied');
}

// Export for explicit importing
module.exports = {
  setup: () => {
    console.log('Polyfills already applied on import');
  }
}; 