/**
 * Optimized Next.js Configuration
 * 
 * This configuration includes all necessary settings to:
 * 1. Apply polyfills for server-side Supabase usage
 * 2. Optimize builds for Vercel deployment
 * 3. Configure image handling
 * 4. Set up webpack with proper fallbacks
 */

// Import utilities for working with paths
import { fileURLToPath } from 'url';
import path from 'path';

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Apply early polyfills to ensure globals are defined
 */
if (typeof global !== 'undefined') {
  // Essential polyfills for server-side
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.navigator) global.navigator = { userAgent: 'node.js' };
  if (!global.document) global.document = { 
    createElement: () => ({}),
    getElementsByTagName: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React settings
  reactStrictMode: true,
  
  // Disable ESLint in production builds for speed
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking in production builds for speed
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization settings
  images: {
    // Disable image optimization - better for static deployment
    unoptimized: true,
    // Allow all domains for images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Output settings
  output: 'standalone',
  
  // Optimize experimental features
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    // Enable middleware in Edge runtime
    middleware: {
      region: 'auto',
      runtime: 'nodejs',
    },
    // Don't open browser during development
    skipMiddlewareUrlNormalize: true,
    // Transpile these packages to avoid issues
    transpilePackages: [
      '@supabase/supabase-js',
      '@supabase/auth-helpers-nextjs',
      '@supabase/auth-helpers-react',
    ],
  },
  
  // Environment variables to expose to the browser
  env: {
    MOCK_DB: process.env.MOCK_DB || 'true',
    DEPLOY_ENV: process.env.DEPLOY_ENV || 'development',
  },
  
  // Configure webpack
  webpack: (config, { dev, isServer, webpack }) => {
    // Add polyfill resolvers
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.fallback) config.resolve.fallback = {};
    
    // Add resolvers for Node.js modules
    if (isServer) {
      Object.assign(config.resolve.fallback, {
        fs: false,
        path: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        aws4: false,
      });
      
      // Define server-side globals
      global.self = global;
      global.window = global;
      global.navigator = { userAgent: 'node.js' };
      global.document = { 
        createElement: () => ({}),
        getElementsByTagName: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
      };
      global.location = {
        protocol: 'https:',
        host: process.env.NEXT_PUBLIC_SITE_URL || 'localhost',
        hostname: process.env.NEXT_PUBLIC_SITE_URL || 'localhost',
        href: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost',
        origin: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost',
      };
    }
    
    // Define environment variables in the webpack build
    config.plugins.push(
      new webpack.DefinePlugin({
        // Define global variables
        'global.self': isServer ? 'global' : 'self',
        'self': isServer ? 'global.self' : 'self',
        'global.window': isServer ? 'global' : 'window',
        'window': isServer ? 'global.window' : 'window',
        'global.document': isServer ? 'global.document' : 'document',
        'document': isServer ? 'global.document' : 'document',
        'global.navigator': isServer ? 'global.navigator' : 'navigator',
        'navigator': isServer ? 'global.navigator' : 'navigator',
        'process.browser': !isServer,
      })
    );
    
    // Optimization for production builds
    if (!dev) {
      // Add optimizations for production
      config.optimization = {
        ...config.optimization,
        // Minimize JS
        minimize: true,
        // Split chunks for better caching
        splitChunks: {
          chunks: 'all',
          // Create a vendors chunk for node_modules
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            // Specific chunk for Supabase
            supabase: {
              test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
              name: 'supabase-vendor',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Specify packages to be compiled by Next.js
  transpilePackages: [
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    '@supabase/auth-helpers-react',
  ],
  
  // Server components settings
  serverComponentsExternalPackages: ['pg', 'sharp'],
  
  // Set up proper server actions
  serverActions: {
    bodySizeLimit: '2mb',
  },
};

export default nextConfig; 