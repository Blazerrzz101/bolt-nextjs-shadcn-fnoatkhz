/**
 * Minimal polyfills for browser globals in Node.js environment
 * This resolves the "self is not defined" error in Vercel deploys
 */

// Apply polyfills if we're in a Node.js environment
if (typeof window === 'undefined') {
  // Basic globals
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.navigator) global.navigator = { userAgent: 'node.js' };
  
  // Document with required methods
  if (!global.document) {
    global.document = {
      createElement: () => ({}),
      getElementsByTagName: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      documentElement: {
        style: {},
        setAttribute: () => {},
        getElementsByTagName: () => [],
        appendChild: () => {}
      }
    };
  }

  // HTMLElement constructor
  if (!global.HTMLElement) {
    global.HTMLElement = class HTMLElement {
      constructor() { this.style = {}; }
    };
  }

  // CSSStyleSheet constructor for styled-jsx
  if (!global.CSSStyleSheet) {
    global.CSSStyleSheet = class CSSStyleSheet {
      constructor() { this.cssRules = []; }
      insertRule() { return 0; }
    };
  }

  // Location object
  if (!global.location) {
    global.location = {
      protocol: 'https:',
      host: 'localhost',
      hostname: 'localhost',
      href: 'https://localhost',
      origin: 'https://localhost'
    };
  }

  console.log('✅ Minimal polyfills applied successfully');
}

// Function to verify polyfills are working
export function ensurePolyfills() {
  return {
    hasSelf: typeof self !== 'undefined',
    hasWindow: typeof window !== 'undefined',
    hasNavigator: typeof navigator !== 'undefined',
    hasDocument: typeof document !== 'undefined',
    hasHTMLElement: typeof HTMLElement !== 'undefined',
    hasCSSStyleSheet: typeof CSSStyleSheet !== 'undefined'
  };
}
