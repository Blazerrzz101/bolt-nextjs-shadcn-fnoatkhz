// Apply Supabase fixes at the very start
require('./pre-build-polyfill');
require('./lib/supabase-entry');

/** @type {import('next').NextConfig} */

const path = require('path');
const isMockDB = process.env.MOCK_DB === 'true';

// Log environment configuration
console.log('🔧 Next.js build configuration:');
console.log(`- MOCK_DB: ${process.env.MOCK_DB || 'false'}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`- Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set'}`);

const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    MOCK_DB: process.env.MOCK_DB || 'false', // Keep real Supabase integration
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  eslint: {
    // Only enforce eslint in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'production'
  },
  typescript: {
    // Only enforce typescript in development
    ignoreBuildErrors: process.env.NODE_ENV === 'production'
  },
  webpack: (config, { dev, isServer }) => {
    // Log webpack configuration
    console.log(`🔧 Configuring webpack (${isServer ? 'server' : 'client'}, ${dev ? 'development' : 'production'})`);
    
    // Properly handle Supabase with more comprehensive fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url/'),
      zlib: require.resolve('browserify-zlib'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      assert: require.resolve('assert/'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      'process/browser': require.resolve('process/browser'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
    };

    // Support node: protocol imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:buffer': require.resolve('buffer/'),
      'node:util': require.resolve('util/'),
      'node:stream': require.resolve('stream-browserify'),
      'node:zlib': require.resolve('browserify-zlib'),
      'node:http': require.resolve('stream-http'),
      'node:https': require.resolve('https-browserify'),
      'node:url': require.resolve('url/'),
      'node:crypto': require.resolve('crypto-browserify'),
      'node:os': require.resolve('os-browserify/browser'),
      'node:path': require.resolve('path-browserify'),
      'node:process': require.resolve('process/browser'),
      'node:fs': false,
      'node:net': false,
      'node:tls': false,
    };

    // Add our universal polyfill to entry points
    const entry = config.entry;
    config.entry = async () => {
      const entries = await entry();
      
      // Only apply to server entries
      if (isServer) {
        Object.keys(entries).forEach(key => {
          if (typeof entries[key] === 'object' && !Array.isArray(entries[key])) {
            entries[key].import = [
              path.resolve('./lib/universal-polyfill.js'),
              ...(Array.isArray(entries[key].import) ? entries[key].import : [entries[key].import])
            ];
          } else {
            entries[key] = [
              path.resolve('./lib/universal-polyfill.js'),
              ...(Array.isArray(entries[key]) ? entries[key] : [entries[key]])
            ];
          }
        });
      }
      
      return entries;
    };

    // Handle node protocol imports
    config.module.rules.push({
      test: /node:/,
      loader: 'ignore-loader',
    });

    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
              chunks: 'all',
              name(module) {
                if (!module.context) return 'vendor';
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (!match) return 'vendor';
                const packageName = match[1];
                return `vendor.${packageName.replace('@', '')}`;
              }
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            }
          }
        }
      }

      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                drop_console: false, // Keep console logs for debugging
                drop_debugger: true
              },
              output: {
                comments: false
              }
            }
          }
        })
      }
    }

    // Add global to process for webpack 5
    if (!isServer) {
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
          // Don't try to provide self and window directly
        }),
      );
    }

    config.ignoreWarnings = [
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /Can't resolve '(fs|crypto|stream)' in/ },
      { message: /Module not found: Can't resolve 'pg-native'/ }
    ]

    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@heroicons/react'
    ],
    turbotrace: {
      logLevel: 'error',
      contextDirectory: __dirname,
      processCwd: __dirname
    }
  },
  serverRuntimeConfig: {
    PORT: process.env.PORT || 3000
  },
  publicRuntimeConfig: {
    staticFolder: '/static',
    isDevelopment: process.env.NODE_ENV === 'development'
  },
  output: 'standalone',
  productionBrowserSourceMaps: false,
  generateEtags: true,
  distDir: process.env.BUILD_DIR || '.next',
}

module.exports = nextConfig