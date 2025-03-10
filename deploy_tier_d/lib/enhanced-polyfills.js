/**
 * Enhanced Polyfills for Supabase
 * 
 * This file provides all necessary polyfills to make Supabase work in all environments.
 * The implementation uses a detection mechanism to only apply polyfills when needed,
 * and provides diagnostic information for debugging.
 */

// Configuration flags
const DEBUG = process.env.DEBUG_POLYFILLS === 'true';
const ENV = typeof window !== 'undefined' ? 'browser' : 'server';

// Logging helper
function logPolyfill(name) {
  if (DEBUG) {
    console.log(`[${ENV}] 🔧 Setting up ${name} polyfill`);
  }
}

// Apply all polyfills needed for Supabase
function applyPolyfills() {
  if (DEBUG) {
    console.log(`[${ENV}] ⚡ Enhanced polyfills initializing...`);
  }

  // Only apply polyfills on server-side
  if (typeof global !== 'undefined') {
    // Core browser globals
    if (!global.self) {
      logPolyfill('global.self');
      global.self = global;
    }
    
    if (!global.window) {
      logPolyfill('global.window');
      global.window = global;
    }
    
    if (!global.document) {
      logPolyfill('global.document');
      global.document = {
        createElement: () => ({}),
        createElementNS: () => ({}),
        getElementsByTagName: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        documentElement: { style: {} },
        querySelector: () => null,
        querySelectorAll: () => [],
        createRange: () => ({ setStart: () => {}, setEnd: () => {} }),
        head: { appendChild: () => {} },
      };
    }
    
    // Navigation and location
    if (!global.navigator) {
      logPolyfill('global.navigator');
      global.navigator = { 
        userAgent: 'node.js',
        platform: 'node',
        appName: 'nodejs',
        onLine: true,
        cookieEnabled: false,
      };
    }
    
    if (!global.location) {
      logPolyfill('global.location');
      global.location = {
        protocol: 'https:',
        host: process.env.NEXT_PUBLIC_SITE_URL || 'localhost',
        hostname: process.env.NEXT_PUBLIC_SITE_URL || 'localhost',
        href: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost',
        origin: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost',
        pathname: '/',
        search: '',
        hash: '',
      };
    }
    
    // LocalStorage and SessionStorage
    if (!global.localStorage) {
      logPolyfill('global.localStorage');
      const storage = {};
      global.localStorage = {
        getItem: (key) => storage[key] || null,
        setItem: (key, value) => { storage[key] = value; },
        removeItem: (key) => { delete storage[key]; },
        clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
        key: (index) => Object.keys(storage)[index] || null,
        length: 0,
      };
      Object.defineProperty(global.localStorage, 'length', {
        get: () => Object.keys(storage).length,
      });
    }
    
    if (!global.sessionStorage) {
      logPolyfill('global.sessionStorage');
      const storage = {};
      global.sessionStorage = {
        getItem: (key) => storage[key] || null,
        setItem: (key, value) => { storage[key] = value; },
        removeItem: (key) => { delete storage[key]; },
        clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
        key: (index) => Object.keys(storage)[index] || null,
        length: 0,
      };
      Object.defineProperty(global.sessionStorage, 'length', {
        get: () => Object.keys(storage).length,
      });
    }
    
    // Network API polyfills
    if (!global.WebSocket) {
      logPolyfill('global.WebSocket');
      global.WebSocket = class MockWebSocket {
        constructor() {
          this.readyState = 3; // CLOSED
          this.onopen = null;
          this.onclose = null;
          this.onerror = null;
          this.onmessage = null;
        }
        addEventListener(event, callback) {}
        removeEventListener(event, callback) {}
        send(data) {}
        close() {}
      };
    }
    
    if (!global.XMLHttpRequest) {
      logPolyfill('global.XMLHttpRequest');
      global.XMLHttpRequest = class MockXMLHttpRequest {
        constructor() {
          this.readyState = 0;
          this.status = 0;
          this.onreadystatechange = null;
        }
        open(method, url, async) {}
        send(data) {}
        setRequestHeader(header, value) {}
        getResponseHeader(header) { return null; }
        getAllResponseHeaders() { return ''; }
        abort() {}
      };
    }
    
    // Utility functions
    if (!global.btoa) {
      logPolyfill('global.btoa');
      global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
    }
    
    if (!global.atob) {
      logPolyfill('global.atob');
      global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
    }
    
    // For Fetch API
    if (!global.Headers) {
      logPolyfill('global.Headers');
      global.Headers = class Headers {
        constructor(init) {
          this._headers = new Map();
          if (init) {
            if (init instanceof Headers) {
              init._headers.forEach((value, name) => {
                this._headers.set(name.toLowerCase(), value);
              });
            } else if (Array.isArray(init)) {
              init.forEach(([name, value]) => {
                this._headers.set(name.toLowerCase(), value);
              });
            } else {
              Object.getOwnPropertyNames(init).forEach(name => {
                this._headers.set(name.toLowerCase(), init[name]);
              });
            }
          }
        }
        append(name, value) {
          this._headers.set(name.toLowerCase(), value);
        }
        delete(name) {
          this._headers.delete(name.toLowerCase());
        }
        get(name) {
          return this._headers.get(name.toLowerCase()) || null;
        }
        has(name) {
          return this._headers.has(name.toLowerCase());
        }
        set(name, value) {
          this._headers.set(name.toLowerCase(), value);
        }
      };
    }
    
    if (!global.Response) {
      logPolyfill('global.Response');
      global.Response = class Response {
        constructor(body, init = {}) {
          this._body = body;
          this.status = init.status || 200;
          this.ok = this.status >= 200 && this.status < 300;
          this.statusText = init.statusText || '';
          this.headers = new Headers(init.headers);
          this.type = 'default';
          this.url = '';
        }
        
        text() {
          return Promise.resolve(typeof this._body === 'string' 
            ? this._body 
            : JSON.stringify(this._body));
        }
        
        json() {
          return Promise.resolve(typeof this._body === 'string' 
            ? JSON.parse(this._body) 
            : this._body);
        }
      };
    }
    
    if (!global.Request) {
      logPolyfill('global.Request');
      global.Request = class Request {
        constructor(input, init = {}) {
          this.method = init.method || 'GET';
          this.url = typeof input === 'string' ? input : input.url;
          this.headers = new Headers(init.headers || {});
          this.body = init.body || null;
          this.credentials = init.credentials || 'same-origin';
        }
      };
    }
  }

  if (DEBUG) {
    console.log(`[${ENV}] ✅ Enhanced polyfills initialized`);
  }
}

// Apply polyfills immediately
applyPolyfills();

/**
 * Verify that all polyfills are properly applied
 * @returns {Object} Object with verification results
 */
export function verifyPolyfills() {
  const verification = {
    self: typeof self !== 'undefined',
    window: typeof window !== 'undefined',
    document: typeof document !== 'undefined',
    navigator: typeof navigator !== 'undefined',
    location: typeof location !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    btoa: typeof btoa !== 'undefined',
    atob: typeof atob !== 'undefined',
    WebSocket: typeof WebSocket !== 'undefined',
    XMLHttpRequest: typeof XMLHttpRequest !== 'undefined',
    Headers: typeof Headers !== 'undefined',
    Response: typeof Response !== 'undefined',
    Request: typeof Request !== 'undefined',
  };
  
  const missing = Object.entries(verification)
    .filter(([_, exists]) => !exists)
    .map(([name]) => name);
  
  return {
    allPresent: missing.length === 0,
    verification,
    missing,
  };
}

/**
 * Ensure polyfills are applied
 * @returns {boolean} True if all polyfills are applied
 */
export function ensurePolyfills() {
  const result = verifyPolyfills();
  
  if (!result.allPresent) {
    applyPolyfills();
    
    // Check again after applying
    const secondCheck = verifyPolyfills();
    
    if (!secondCheck.allPresent && DEBUG) {
      console.warn(`[${ENV}] ⚠️ Failed to apply all polyfills. Still missing: ${secondCheck.missing.join(', ')}`);
    }
    
    return secondCheck.allPresent;
  }
  
  return true;
} 