/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    unoptimized: true
  },
  experimental: { optimizeCss: false },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  }
};

module.exports = nextConfig;
