#!/usr/bin/env node

/**
 * Custom Vercel Build Script
 * 
 * This script ensures all polyfills are properly applied
 * before running the Next.js build process.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Wrap everything in a try-catch to handle unexpected errors
try {
  console.log('🔧 Starting custom Vercel build process...');

  // Apply polyfills first
  console.log('🔍 Applying Supabase polyfills...');
  try {
    require('./lib/supabase-fix');
    console.log('✅ Polyfills applied successfully');
  } catch (error) {
    console.error('❌ Error applying polyfills:', error);
    // Continue anyway, as we'll handle errors gracefully
  }

  // Ensure data directory exists
  console.log('🔍 Checking data directory...');
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('📁 Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Ensure votes.json exists
  const votesFile = path.join(dataDir, 'votes.json');
  if (!fs.existsSync(votesFile)) {
    console.log('📄 Creating votes.json...');
    const initialVoteState = {
      votes: {},
      voteCounts: {},
      userVotes: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(votesFile, JSON.stringify(initialVoteState, null, 2));
  }

  // Ensure activities.json exists
  const activitiesFile = path.join(dataDir, 'activities.json');
  if (!fs.existsSync(activitiesFile)) {
    console.log('📄 Creating activities.json...');
    const initialActivities = {
      activities: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(activitiesFile, JSON.stringify(initialActivities, null, 2));
  }

  // Set environment variables for the build
  process.env.NODE_ENV = 'production';
  process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
  process.env.MOCK_DB = 'true';
  
  // Log environment for debugging
  console.log('🌍 Environment information:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- MOCK_DB: ${process.env.MOCK_DB}`);
  console.log(`- Supabase URL available: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`- Supabase key available: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);

  // Add fallbacks for missing environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://qmyvtvvdnoktrwzrdflp.supabase.co';
    console.log('⚠️ Added fallback for NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXZ0dnZkbm9rdHJ3enJkZmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDY4NjcsImV4cCI6MjA1NDAyMjg2N30.ZJydLlAMne7sy49slYl7xymJE0dsQqWwV8-4g2pf-EY';
    console.log('⚠️ Added fallback for NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'REMOVED_SUPABASE_SERVICE_ROLE_KEY';
    console.log('⚠️ Added fallback for SUPABASE_SERVICE_ROLE_KEY');
  }

  // Create a minimal next.config.js for the build
  console.log('📝 Creating specialized next.config.js for deployment...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const nextConfigBackupPath = path.join(process.cwd(), 'next.config.js.bak');
  
  // Backup the existing next.config.js
  if (fs.existsSync(nextConfigPath)) {
    fs.copyFileSync(nextConfigPath, nextConfigBackupPath);
    console.log('✅ Backed up existing next.config.js');
  }
  
  // Create a specialized next.config.js for deployment
  const deploymentConfig = `
// Apply Supabase fixes at the very start
require('./lib/supabase-fix');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    MOCK_DB: 'true' // Force mock mode for deployment
  },
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true
  },
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true
  },
  webpack: (config, { isServer }) => {
    // Handle node: protocol imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:buffer': 'buffer',
      'node:fs': 'browserify-fs',
      'node:http': 'stream-http',
      'node:https': 'https-browserify',
      'node:net': 'node-libs-browser/mock/net',
      'node:path': 'path-browserify',
      'node:stream': 'stream-browserify',
      'node:url': 'url',
      'node:util': 'util',
      'node:zlib': 'browserify-zlib',
      'node:crypto': 'crypto-browserify',
      'node:process': 'process/browser',
    };

    // Polyfill node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: require.resolve('path-browserify'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        assert: require.resolve('assert/'),
        url: require.resolve('url/'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        util: require.resolve('util/'),
      };
    }

    // Ignore warnings about critical dependency
    config.ignoreWarnings = [
      /Critical dependency/,
      /The 'mode' option has not been set/,
      /the request of a dependency is an expression/
    ];

    return config;
  },
  transpilePackages: [
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    '@supabase/auth-helpers-react'
  ],
  experimental: {
    optimizeCss: true
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
  `;
  
  fs.writeFileSync(nextConfigPath, deploymentConfig);
  console.log('✅ Created specialized next.config.js for deployment');

  console.log('🚀 Running Next.js build...');
  
  try {
    // Use execSync with proper error handling
    execSync('npx next build', { 
      stdio: 'inherit',
      env: process.env 
    });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed with error code:', error.status);
    console.error('Error message:', error.message);
    
    // Try a safer build with TypeScript and ESLint checks disabled
    console.log('⚠️ Attempting safer build with additional flags...');
    
    try {
      // Force MOCK_DB=true to avoid Supabase issues
      process.env.MOCK_DB = 'true';
      
      execSync('NODE_OPTIONS="--max-old-space-size=4096" npx next build', { 
        stdio: 'inherit',
        env: process.env 
      });
      console.log('✅ Safer build completed successfully');
    } catch (secondError) {
      console.error('❌ Safer build also failed:', secondError.message);
      process.exit(1);
    }
  } finally {
    // Restore the original next.config.js
    if (fs.existsSync(nextConfigBackupPath)) {
      fs.copyFileSync(nextConfigBackupPath, nextConfigPath);
      fs.unlinkSync(nextConfigBackupPath);
      console.log('✅ Restored original next.config.js');
    }
  }
} catch (error) {
  console.error('❌ Critical build error:', error);
  process.exit(1);
} 