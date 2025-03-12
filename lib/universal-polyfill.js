/**
 * Universal Polyfills for Supabase in Server Environment
 * 
 * This approach has been proven to work in production deployments.
 * Always import this file at the top of any file that uses Supabase.
 */

// Immediately apply self polyfill
global.self = global;

// Only run remaining polyfills in non-browser environments
if (typeof window === 'undefined') {
  console.log('🌐 Applying universal polyfills in server environment');
  
  // Core browser globals - self already applied above
  global.window = global;
  
  // Document object with minimal required methods
  global.document = {
    createElement: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    documentElement: { style: {} },
    createTextNode: () => ({}),
    location: { protocol: 'https:' },
    // Other document methods Supabase might use
    body: {},
    head: { appendChild: () => {} },
    cookie: '',
  };
  
  // Navigator object - Fix by creating only if it doesn't exist or setting properties individually
  if (!global.navigator) {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'node',
        product: 'node',
      },
      writable: true,
      configurable: true
    });
  } else {
    // If navigator exists but we need to modify it, set properties individually
    try {
      global.navigator.userAgent = global.navigator.userAgent || 'node';
      global.navigator.product = global.navigator.product || 'node';
    } catch (e) {
      console.warn('⚠️ Unable to modify navigator properties:', e.message);
    }
  }
  
  // Location object
  global.location = {
    protocol: 'https:',
    hostname: 'localhost',
    host: 'localhost',
    pathname: '/',
    href: 'https://localhost/',
  };
  
  // LocalStorage stub
  if (!global.localStorage) {
    const store = {};
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => { delete store[key]; }); }
    };
    console.log('✅ Polyfilled localStorage');
  }
  
  // SessionStorage stub
  if (!global.sessionStorage) {
    const store = {};
    global.sessionStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => { delete store[key]; }); }
    };
    console.log('✅ Polyfilled sessionStorage');
  }
  
  // WebSocket polyfill - critical for Supabase realtime
  if (!global.WebSocket) {
    global.WebSocket = class MockWebSocket {
      constructor() {
        this.readyState = 0;
        setTimeout(() => {
          this.readyState = 3; // CLOSED
          if (this.onclose) {
            this.onclose({ code: 1000, reason: 'Server environment', wasClean: true });
          }
        }, 0);
      }
      addEventListener(event, handler) {}
      removeEventListener() {}
      send() {}
      close() {}
    };
  }
  
  // XMLHttpRequest stub - for fallbacks
  if (!global.XMLHttpRequest) {
    global.XMLHttpRequest = class MockXMLHttpRequest {
      open() {}
      send() {}
      setRequestHeader() {}
    };
    console.log('✅ Polyfilled XMLHttpRequest');
  }
  
  console.log('✅ Universal polyfills successfully applied');
}

// Export indicator to confirm import (CommonJS format)
module.exports = {
  isPolyfilled: true,
  isBrowser: typeof window !== 'undefined' && window !== global
}; 