// Enhanced Next.js config with real-time features
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  swcMinify: true,
  images: { unoptimized: true },
  experimental: {
    instrumentationHook: false,
    serverComponentsExternalPackages: ['@supabase/supabase-js', 'recharts'],
    esmExternals: true
  },
  webpack: (config, { isServer, webpack }) => {
    // Properly handle globals in all environments
    if (isServer) {
      // Ensure globals are properly defined for server-side code
      config.plugins.push(
        new webpack.DefinePlugin({
          'global.self': 'global',
          'global.window': 'global'
        })
      );
    }

    // Add MiniCssExtractPlugin for proper CSS handling
    if (!isServer) {
      const MiniCssExtractPlugin = require('mini-css-extract-plugin');
      config.plugins.push(
        new MiniCssExtractPlugin({
          filename: 'static/css/[contenthash].css',
          chunkFilename: 'static/css/[contenthash].css',
          ignoreOrder: true,
        })
      );
    }

    // Fallbacks for various Node.js modules that might be imported but not needed
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false
    };

    return config;
  }
};

export default nextConfig;
