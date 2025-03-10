/**
 * Entry point for Vercel builds
 * This file is loaded via NODE_OPTIONS to ensure polyfills are applied early
 * and preserves ALL functionality
 */

// Apply polyfills
require('../lib/complete-polyfills.js');

console.log('✅ Complete polyfills loaded for Vercel build');

// Export the verification function
module.exports = {
  verifyPolyfills: () => require('../lib/complete-polyfills.js').verifyPolyfills()
};
