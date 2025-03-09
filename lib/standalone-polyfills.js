/**
 * Absolute minimal polyfills
 */
if (typeof global !== 'undefined') {
  // Essential globals
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.navigator) global.navigator = { userAgent: 'Node.js' };
  if (!global.document) {
    global.document = {
      createElement: () => ({ 
        style: {}, 
        appendChild: () => {}, 
        setAttribute: () => {} 
      }),
      getElementsByTagName: () => ([]),
      createTextNode: () => ({}),
      head: { appendChild: () => {} },
      body: { appendChild: () => {} }
    };
  }
  
  // Required constructors
  if (!global.HTMLElement) global.HTMLElement = class HTMLElement {};
  if (!global.CSSStyleSheet) global.CSSStyleSheet = class CSSStyleSheet {};
  
  // Response for API routes
  if (!global.Response) {
    global.Response = class Response {
      constructor(body, init = {}) {
        this.body = body;
        this.status = init.status || 200;
      }
      
      static json(data, init = {}) {
        return new Response(JSON.stringify(data), {
          ...init,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
  }
}

console.log('✅ Minimal polyfills applied');
