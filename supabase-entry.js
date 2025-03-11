#!/usr/bin/env node

/**
 * Supabase Entry Point for Vercel Deployment
 * 
 * This file should be required before any Supabase imports to ensure
 * all necessary polyfills are applied.
 */

console.log('⚙️ Initializing Supabase with browser environment compatibility...');

// Apply polyfills before anything else
try {
  require('./lib/supabase-fix');
  console.log('✅ Applied Supabase fixes successfully');
} catch (error) {
  console.error('❌ Failed to apply Supabase fixes:', error);
  process.exit(1);
}

// Continue with normal execution
console.log('🚀 Continuing with normal execution'); 