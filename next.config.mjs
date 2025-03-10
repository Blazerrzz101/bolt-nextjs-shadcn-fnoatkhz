// Enhanced Next.js config with real-time features
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  swcMinify: true,
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Add polyfills for browser APIs used by real-time features
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false
      };
    }
    return config;
  }
};

export default nextConfig;
