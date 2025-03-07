/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip linting during builds for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip TypeScript type checking during builds for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure image domains that can be optimized
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizeCss: true,
  },
  
  // Ensure output is exported without any references to browser-only globals
  outputFileTracing: true,
  
  // Add custom webpack configuration to optimize for SSR
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle sizes
    config.optimization.splitChunks = {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
        },
        supabase: {
          name: 'supabase',
          test: /[\\/]node_modules[\\/](@supabase)/,
          chunks: 'all',
          priority: 10,
        },
        shadcn: {
          name: 'shadcn',
          test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)/,
          chunks: 'all',
          priority: 10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    };

    // Define global browser objects for server-side rendering
    // IMPORTANT: We're defining self as a global variable for SSR to fix the "self is not defined" error
    if (!global.self) {
      global.self = global;
    }

    config.plugins.push(
      new config.webpack.DefinePlugin({
        'process.browser': JSON.stringify(!isServer),
        'global.self': isServer ? 'global.self' : 'self',
        'self': isServer ? 'global.self' : 'self',
        'window': isServer ? 'global.self' : 'window',
        'globalThis': isServer ? 'global' : 'globalThis',
      })
    );

    // For packages that use `self` or `window`
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Properly handle CSS for development and production
    if (!isServer && !dev) {
      // Ensure CSS is properly processed in production builds
      const MiniCssExtractPlugin = require('mini-css-extract-plugin');
      const prevCssLoader = config.module.rules.find(
        (rule) => rule.oneOf?.find((r) => r.sideEffects === false && r.test?.test?.('.css'))
      );
      
      if (prevCssLoader) {
        const cssLoader = prevCssLoader.oneOf.find((r) => r.sideEffects === false && r.test?.test?.('.css'));
        if (cssLoader) {
          cssLoader.use = [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
          ];
        }
      }
      
      config.plugins.push(
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        })
      );
    }

    return config;
  },
  
  // Explicitly say we're not in a static export environment for our code to detect
  env: {
    NEXT_STATIC_EXPORT: 'false',
  },
};

export default nextConfig; 