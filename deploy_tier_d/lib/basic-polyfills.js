// Basic polyfills for browser globals in Node.js environment
if (typeof window === 'undefined') {
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.navigator) global.navigator = { userAgent: 'node.js' };
  
  console.log('✅ Applied basic polyfills for server environment');
} 