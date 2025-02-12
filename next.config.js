/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co'
      },
      {
        protocol: 'https',
        hostname: 'example.com'
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com'
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp']
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
    dirs: ['app', 'components', 'lib', 'hooks']
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production'
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    }

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
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1]
                return `vendor.${packageName.replace('@', '')}`
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
                drop_console: true,
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

    config.ignoreWarnings = [
      { message: /Critical dependency: the request of a dependency is an expression/ }
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
  }
}

module.exports = nextConfig