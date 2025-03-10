// This file serves as a preload script for Vercel builds
// It sets up all necessary polyfills before any other code is loaded

console.log('Setting up global polyfills for Vercel deployment...');

// Set up core polyfills for server environment
if (typeof global !== 'undefined') {
  if (typeof self === 'undefined') {
    global.self = global;
    console.log('Polyfilled self in global scope');
  }

  if (typeof window === 'undefined') {
    global.window = global;
    console.log('Polyfilled window in global scope');
  }

  if (typeof document === 'undefined') {
    global.document = {
      createElement: () => ({}),
      getElementsByTagName: () => [],
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      documentElement: { style: {} },
      createEvent: () => ({
        initEvent: () => {},
      }),
    };
    console.log('Polyfilled document in global scope');
  }

  if (typeof navigator === 'undefined') {
    global.navigator = {
      userAgent: 'node.js',
      platform: 'node',
    };
    console.log('Polyfilled navigator in global scope');
  }

  if (typeof location === 'undefined') {
    global.location = {
      protocol: 'https:',
      host: 'localhost',
      hostname: 'localhost',
      href: 'https://localhost',
      pathname: '/',
      search: '',
      hash: '',
    };
    console.log('Polyfilled location in global scope');
  }

  // Object.defineProperty polyfill
  global.defineProperty = Object.defineProperty;

  // Additional browser APIs
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
  global.atob = (str) => Buffer.from(str, 'base64').toString('binary');

  // Websocket polyfill
  global.WebSocket = function() {
    this.addEventListener = () => {};
    this.removeEventListener = () => {};
    this.send = () => {};
    this.close = () => {};
  };

  // XMLHttpRequest polyfill
  global.XMLHttpRequest = function() {
    this.open = () => {};
    this.send = () => {};
    this.setRequestHeader = () => {};
    this.addEventListener = () => {};
    this.upload = { addEventListener: () => {} };
  };

  // Fetch API polyfill
  if (typeof fetch === 'undefined') {
    global.fetch = () => Promise.resolve({ 
      ok: true, 
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve({}),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    });
    global.Response = class {};
    global.Headers = class {};
    global.Request = class {};
  }

  console.log('All global polyfills have been set up successfully');
}

// Export a function that can be called to verify the polyfills are working
module.exports = {
  verifyPolyfills: () => {
    return {
      hasGlobal: typeof global !== 'undefined',
      hasSelf: typeof self !== 'undefined',
      hasWindow: typeof window !== 'undefined',
      hasDocument: typeof document !== 'undefined',
      hasNavigator: typeof navigator !== 'undefined',
      hasLocation: typeof location !== 'undefined',
      hasWebSocket: typeof WebSocket !== 'undefined',
      hasXMLHttpRequest: typeof XMLHttpRequest !== 'undefined',
      hasFetch: typeof fetch !== 'undefined',
    };
  }
}; 