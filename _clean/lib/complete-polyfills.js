/**
 * Complete polyfills for browser globals in Node.js environment
 * This file ensures that browser globals are available in server-side environments
 * like Vercel's serverless functions, allowing libraries that expect a browser environment
 * to work correctly.
 */

// Only apply polyfills in non-browser environments
if (typeof window === 'undefined') {
  // Basic globals
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.navigator) global.navigator = { 
    userAgent: 'node.js', 
    product: 'Gecko', 
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    hardwareConcurrency: 4,
    maxTouchPoints: 0
  };
  
  // Document object with methods needed by various libraries
  if (!global.document) {
    global.document = {
      createElement: (tag) => {
        const element = {
          style: {},
          setAttribute: () => {},
          getAttribute: () => null,
          addEventListener: () => {},
          removeEventListener: () => {},
          appendChild: () => {},
          removeChild: () => {},
          classList: {
            add: () => {},
            remove: () => {},
            contains: () => false,
            toggle: () => {}
          }
        };
        if (tag === 'canvas') {
          element.getContext = () => ({
            fillRect: () => {},
            clearRect: () => {},
            getImageData: () => ({ data: new Uint8Array(0) }),
            putImageData: () => {},
            createImageData: () => ({ data: new Uint8Array(0) }),
            drawImage: () => {}
          });
          element.toDataURL = () => '';
        }
        return element;
      },
      createElementNS: (ns, tag) => global.document.createElement(tag),
      getElementsByTagName: () => [],
      head: { appendChild: () => {}, removeChild: () => {} },
      body: { appendChild: () => {}, removeChild: () => {} },
      documentElement: { style: {}, appendChild: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {},
      createTextNode: () => ({}),
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      createComment: () => ({}),
      location: {
        href: 'https://example.com',
        protocol: 'https:',
        host: 'example.com',
        hostname: 'example.com',
        pathname: '/',
        search: '',
        hash: ''
      }
    };
  }

  // HTML Element constructor
  if (!global.HTMLElement) {
    global.HTMLElement = class HTMLElement {
      constructor() { this.style = {}; }
    };
  }

  // CSSStyleSheet constructor
  if (!global.CSSStyleSheet) {
    global.CSSStyleSheet = class CSSStyleSheet {
      constructor() { this.cssRules = []; }
      insertRule() { return 0; }
    };
  }

  // LocalStorage and SessionStorage polyfills
  if (!global.localStorage) {
    const store = {};
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); },
      key: (index) => Object.keys(store)[index] || null,
      length: 0
    };
    Object.defineProperty(global.localStorage, 'length', {
      get: () => Object.keys(store).length
    });
  }

  if (!global.sessionStorage) {
    const sessionStore = {};
    global.sessionStorage = {
      getItem: (key) => sessionStore[key] || null,
      setItem: (key, value) => { sessionStore[key] = String(value); },
      removeItem: (key) => { delete sessionStore[key]; },
      clear: () => { Object.keys(sessionStore).forEach(key => delete sessionStore[key]); },
      key: (index) => Object.keys(sessionStore)[index] || null,
      length: 0
    };
    Object.defineProperty(global.sessionStorage, 'length', {
      get: () => Object.keys(sessionStore).length
    });
  }

  // Headers, Request, Response for fetch API (if not already polyfilled)
  if (!global.Headers) {
    global.Headers = class Headers {
      constructor(init) {
        this._headers = {};
        if (init instanceof Headers) {
          // Copy from existing Headers object
          Object.keys(init._headers).forEach(key => {
            this._headers[key.toLowerCase()] = init._headers[key];
          });
        } else if (typeof init === 'object') {
          // Initialize from object
          Object.keys(init).forEach(key => {
            this._headers[key.toLowerCase()] = init[key];
          });
        }
      }
      append(name, value) { 
        this._headers[name.toLowerCase()] = value; 
      }
      delete(name) { 
        delete this._headers[name.toLowerCase()]; 
      }
      get(name) { 
        return this._headers[name.toLowerCase()] || null; 
      }
      has(name) { 
        return name.toLowerCase() in this._headers; 
      }
      set(name, value) { 
        this._headers[name.toLowerCase()] = value; 
      }
      forEach(callback) {
        Object.keys(this._headers).forEach(key => {
          callback(this._headers[key], key, this);
        });
      }
    };
  }

  if (!global.Request) {
    global.Request = class Request {
      constructor(input, init = {}) {
        this.url = typeof input === 'string' ? input : input.url;
        this.method = init.method || 'GET';
        this.headers = new Headers(init.headers);
        this.body = init.body || null;
        this.mode = init.mode || 'cors';
        this.credentials = init.credentials || 'same-origin';
      }
    };
  }

  // Only define Response if not already defined (Next.js may provide its own)
  if (!global.Response) {
    global.Response = class Response {
      constructor(body, init = {}) {
        this.body = body;
        this.status = init.status || 200;
        this.statusText = init.statusText || '';
        this.ok = this.status >= 200 && this.status < 300;
        this.headers = new Headers(init.headers);
        this._bodyInit = body;
      }
      
      json() {
        return Promise.resolve(
          typeof this._bodyInit === 'string' 
            ? JSON.parse(this._bodyInit) 
            : this._bodyInit
        );
      }
      
      text() {
        return Promise.resolve(
          typeof this._bodyInit === 'string' 
            ? this._bodyInit 
            : JSON.stringify(this._bodyInit)
        );
      }
      
      static json(data, init = {}) {
        const body = JSON.stringify(data);
        return new Response(body, {
          ...init,
          headers: {
            ...init.headers,
            'Content-Type': 'application/json'
          }
        });
      }
    };
  }

  // WebSocket (basic mock)
  if (!global.WebSocket) {
    global.WebSocket = class WebSocket {
      constructor(url, protocols) {
        this.url = url;
        this.protocols = protocols;
        this.readyState = 0; // CONNECTING
        
        // Auto-connect after creation
        setTimeout(() => {
          this.readyState = 1; // OPEN
          if (typeof this.onopen === 'function') {
            this.onopen({ target: this });
          }
        }, 50);
      }
      
      send(data) {
        // Mock sending data
        console.log('WebSocket mock: sent data', data);
      }
      
      close() {
        this.readyState = 3; // CLOSED
        if (typeof this.onclose === 'function') {
          this.onclose({ code: 1000, reason: 'Mock closed', wasClean: true });
        }
      }
    };
    
    // WebSocket constants
    global.WebSocket.CONNECTING = 0;
    global.WebSocket.OPEN = 1;
    global.WebSocket.CLOSING = 2;
    global.WebSocket.CLOSED = 3;
  }

  // Create a console.error that doesn't crash when multiple arguments are passed
  const originalConsoleError = console.error;
  console.error = function(...args) {
    try {
      originalConsoleError.apply(console, args);
    } catch (e) {
      // If multiple arguments cause an error, try one at a time
      args.forEach(arg => {
        try {
          originalConsoleError.call(console, arg);
        } catch (err) {
          // If that still fails, convert to string
          try {
            originalConsoleError.call(console, String(arg));
          } catch (finalErr) {
            // If all else fails, log a simple message
            originalConsoleError.call(console, "[Error logging value]");
          }
        }
      });
    }
  };

  // Add requestAnimationFrame/cancelAnimationFrame
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
  }
  
  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = (id) => clearTimeout(id);
  }

  console.log('✅ Applied complete polyfills for server environment');
}
