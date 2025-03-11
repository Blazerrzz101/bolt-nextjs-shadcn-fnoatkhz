/**
 * Supabase Fix for Vercel Deployment
 * 
 * This file provides comprehensive fixes for Supabase in serverless environments.
 * It should be imported before any Supabase-related code.
 */

// Apply fixes immediately on import
(function() {
  // Fix for "self is not defined"
  if (typeof global !== 'undefined') {
    // Console indicator that fix is running
    console.log('🔧 Applying Supabase serverless fixes...');
    
    // Define self when in Node.js environment
    if (typeof self === 'undefined') {
      global.self = global;
      console.log('✓ Polyfilled self');
    }
    
    // Define window when in Node.js environment
    if (typeof window === 'undefined') {
      global.window = global;
      console.log('✓ Polyfilled window');
    }
    
    // Define document
    if (typeof document === 'undefined') {
      global.document = {
        createElement: () => ({}),
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => null,
        documentElement: {
          style: {},
          setAttribute: () => {}
        },
        createTextNode: () => ({}),
        location: {
          protocol: 'https:',
          host: 'localhost',
        },
        implementation: {
          createHTMLDocument: () => ({
            body: {}
          })
        }
      };
      console.log('✓ Polyfilled document');
    }
    
    // Define navigator
    if (typeof navigator === 'undefined') {
      global.navigator = {
        userAgent: 'node',
        product: 'node',
        language: 'en',
        languages: ['en'],
        onLine: true,
        hardwareConcurrency: 4,
        appName: 'node',
        appCodeName: 'node',
        appVersion: process.version
      };
      console.log('✓ Polyfilled navigator');
    }
    
    // Define location
    if (typeof location === 'undefined') {
      global.location = {
        protocol: 'https:',
        host: 'localhost',
        hostname: 'localhost',
        port: '',
        pathname: '/',
        search: '',
        hash: '',
        href: 'https://localhost/',
        origin: 'https://localhost',
        assign: () => {},
        reload: () => {},
        replace: () => {},
        toString: () => 'https://localhost/'
      };
      console.log('✓ Polyfilled location');
    }
    
    // WebSocket polyfill
    if (typeof WebSocket === 'undefined') {
      global.WebSocket = class MockWebSocket {
        constructor() {
          this.binaryType = 'arraybuffer';
          this.bufferedAmount = 0;
          this.extensions = '';
          this.protocol = '';
          this.readyState = 0;
          this.url = '';
          this.onopen = null;
          this.onerror = null;
          this.onclose = null;
          this.onmessage = null;
          
          // Immediately set to CLOSED state
          setTimeout(() => {
            if (this.onclose) {
              this.onclose({ code: 1000, reason: 'Mock WebSocket closed', wasClean: true });
            }
          }, 0);
          
          console.log('MockWebSocket initialized (with auto-close behavior)');
        }
        
        addEventListener(event, callback) {
          if (event === 'close') {
            setTimeout(() => {
              callback({ code: 1000, reason: 'Mock WebSocket closed', wasClean: true });
            }, 0);
          }
        }
        
        removeEventListener() {}
        send() {}
        close() {}
      };
      console.log('✓ Polyfilled WebSocket with auto-close behavior');
    }
    
    // LocalStorage polyfill
    if (typeof localStorage === 'undefined') {
      const store = {};
      global.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(key => { delete store[key]; }); },
        key: (i) => Object.keys(store)[i] || null,
        get length() { return Object.keys(store).length; }
      };
      console.log('✓ Polyfilled localStorage');
    }
    
    // SessionStorage polyfill
    if (typeof sessionStorage === 'undefined') {
      const store = {};
      global.sessionStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(key => { delete store[key]; }); },
        key: (i) => Object.keys(store)[i] || null,
        get length() { return Object.keys(store).length; }
      };
      console.log('✓ Polyfilled sessionStorage');
    }
    
    // URL polyfill
    if (typeof URL === 'undefined' || typeof URLSearchParams === 'undefined') {
      try {
        const url = require('url');
        if (typeof URL === 'undefined') {
          global.URL = url.URL;
          console.log('✓ Polyfilled URL');
        }
        if (typeof URLSearchParams === 'undefined') {
          global.URLSearchParams = url.URLSearchParams;
          console.log('✓ Polyfilled URLSearchParams');
        }
      } catch (e) {
        console.warn('Failed to polyfill URL/URLSearchParams', e);
      }
    }
    
    // Crypto polyfill
    if ((typeof crypto === 'undefined' || !crypto.subtle) && typeof require !== 'undefined') {
      try {
        const nodeCrypto = require('crypto');
        if (typeof crypto === 'undefined') {
          global.crypto = {
            getRandomValues: (buffer) => {
              const bytes = nodeCrypto.randomBytes(buffer.length);
              buffer.set(bytes);
              return buffer;
            },
            subtle: {
              digest: async (algorithm, data) => {
                const hash = nodeCrypto.createHash(algorithm.replace('-', '').toLowerCase());
                hash.update(new Uint8Array(data));
                return Promise.resolve(hash.digest().buffer);
              }
            }
          };
          console.log('✓ Polyfilled crypto');
        } else if (!crypto.subtle) {
          crypto.subtle = {
            digest: async (algorithm, data) => {
              const hash = nodeCrypto.createHash(algorithm.replace('-', '').toLowerCase());
              hash.update(new Uint8Array(data));
              return Promise.resolve(hash.digest().buffer);
            }
          };
          console.log('✓ Polyfilled crypto.subtle');
        }
      } catch (e) {
        console.warn('Failed to polyfill crypto', e);
      }
    }
    
    // Blob and File polyfills
    if (typeof Blob === 'undefined' || typeof File === 'undefined') {
      try {
        // Simple Blob polyfill
        if (typeof Blob === 'undefined') {
          global.Blob = class Blob {
            constructor(parts, options = {}) {
              this.parts = parts;
              this.options = options;
              this.size = parts.reduce((acc, part) => acc + (part.length || 0), 0);
              this.type = options.type || '';
            }
            
            // Mock methods
            slice() { return new Blob(this.parts, this.options); }
            stream() { throw new Error('Blob.stream not implemented in polyfill'); }
            text() { return Promise.resolve(this.parts.join('')); }
            arrayBuffer() { throw new Error('Blob.arrayBuffer not implemented in polyfill'); }
          };
          console.log('✓ Polyfilled Blob');
        }
        
        // Simple File polyfill based on Blob
        if (typeof File === 'undefined' && typeof Blob !== 'undefined') {
          global.File = class File extends Blob {
            constructor(parts, filename, options = {}) {
              super(parts, options);
              this.name = filename;
              this.lastModified = options.lastModified || Date.now();
            }
          };
          console.log('✓ Polyfilled File');
        }
      } catch (e) {
        console.warn('Failed to polyfill Blob/File', e);
      }
    }
    
    // Fetch polyfill (if needed)
    if (typeof fetch === 'undefined') {
      try {
        global.fetch = require('node-fetch');
        console.log('✓ Polyfilled fetch with node-fetch');
      } catch (e) {
        console.warn('Failed to polyfill fetch', e);
      }
    }
    
    // XMLHttpRequest polyfill
    if (typeof XMLHttpRequest === 'undefined') {
      global.XMLHttpRequest = class MockXMLHttpRequest {
        constructor() {
          this.readyState = 0;
          this.status = 0;
          this.statusText = '';
          this.responseText = '';
          this.responseXML = null;
          this.responseURL = '';
          this.response = '';
          this.responseType = '';
          this.onreadystatechange = null;
          this.onload = null;
          this.onerror = null;
          this.headers = {};
        }
        
        open(method, url, async = true) {
          this.method = method;
          this.url = url;
          this.async = async;
          this.readyState = 1;
          if (this.onreadystatechange) this.onreadystatechange();
        }
        
        setRequestHeader(header, value) {
          this.headers[header] = value;
        }
        
        send(data) {
          // Mock response - always success in mock
          setTimeout(() => {
            this.readyState = 4;
            this.status = 200;
            this.statusText = 'OK';
            this.responseText = '{"mock":"true"}';
            this.response = '{"mock":"true"}';
            if (this.onreadystatechange) this.onreadystatechange();
            if (this.onload) this.onload();
          }, 0);
        }
        
        abort() {
          this.readyState = 0;
          if (this.onreadystatechange) this.onreadystatechange();
        }
        
        getAllResponseHeaders() {
          return 'content-type: application/json';
        }
        
        getResponseHeader(name) {
          if (name.toLowerCase() === 'content-type') return 'application/json';
          return null;
        }
      };
      console.log('✓ Polyfilled XMLHttpRequest');
    }
    
    // Console output that all fixes have been applied
    console.log('✅ All Supabase serverless environment fixes applied');
  }
})();

// Export an empty object for ESM compatibility
module.exports = {
  installed: true
}; 