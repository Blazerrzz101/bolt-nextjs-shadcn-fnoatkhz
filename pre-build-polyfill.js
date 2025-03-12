/**
 * Pre-build Polyfills for Next.js and Supabase
 * This file ensures critical polyfills are applied before the build process starts
 */

console.log('⚙️ Applying pre-build polyfills...');

// Apply critical global polyfills
global.self = global;
global.window = global;
global.document = {
  createElement: () => ({}),
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelector: () => null,
  documentElement: { style: {} },
  createTextNode: () => ({}),
  location: { protocol: 'https:' },
  body: {},
  head: { appendChild: () => {} },
  cookie: '',
};

// Apply navigator with safe fallbacks
if (!global.navigator) {
  try {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'node',
        product: 'node',
      },
      writable: true,
      configurable: true
    });
    console.log('✅ Polyfilled navigator successfully');
  } catch (e) {
    console.warn('⚠️ Could not polyfill navigator:', e.message);
    global.navigator = { userAgent: 'node', product: 'node' };
  }
}

// Apply core web APIs
global.fetch = global.fetch || require('node-fetch');
global.URL = global.URL || require('url').URL;

console.log('✅ Pre-build polyfills applied successfully');

// Make the polyfills available
module.exports = {
  applied: true
}; 