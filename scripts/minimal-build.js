/**
 * Minimal build script for Vercel
 */
console.log('🔨 Starting minimal build for Vercel...');

// Polyfill globals early
if (typeof global !== 'undefined') {
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  console.log('✅ Polyfilled globals');
}

// The rest is handled by next build
require('child_process').execSync('next build', {
  stdio: 'inherit',
  env: {
    ...process.env,
    MOCK_DB: 'true',
    SKIP_BUILD_TEST: 'true'
  }
});

console.log('✅ Build completed successfully');
