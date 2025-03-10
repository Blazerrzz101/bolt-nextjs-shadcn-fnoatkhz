#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Basic Deployment to Vercel          ${NC}"
echo -e "${BLUE}========================================${NC}"

# Clean up any existing .next directory
echo -e "${BLUE}Cleaning up previous build artifacts...${NC}"
rm -rf .next
echo -e "${GREEN}Cleanup complete.${NC}"

# Create a simplified vercel.json file
echo -e "${BLUE}Creating simplified vercel.json...${NC}"

cat > vercel.json << 'EOL'
{
  "version": 2,
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "https://qmyvtvvdnoktrwzrdflp.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXZ0dnZkbm9rdHJ3enJkZmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDY4NjcsImV4cCI6MjA1NDAyMjg2N30.ZJydLlAMne7sy49slYl7xymJE0dsQqWwV8-4g2pf-EY",
    "NEXT_PUBLIC_ENABLE_VOTES": "true",
    "NEXT_PUBLIC_ENABLE_REVIEWS": "true",
    "NEXT_PUBLIC_ENABLE_DISCUSSIONS": "true",
    "NEXT_PUBLIC_MAX_VOTES_PER_DAY": "10"
  }
}
EOL

echo -e "${GREEN}vercel.json created.${NC}"

# Update next.config.mjs to enable static export for Vercel
echo -e "${BLUE}Creating deployment-optimized next.config.mjs...${NC}"

# Backup original next.config.mjs
cp next.config.mjs next.config.mjs.backup

# Create simplified next.config.mjs
cat > next.config.mjs << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true
  },
  experimental: {
    optimizeCss: false
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Define globals
      config.plugins.push(
        new config.webpack.DefinePlugin({
          'process.browser': JSON.stringify(true),
          'global.self': JSON.stringify({}),
          'self': JSON.stringify({}),
          'window': JSON.stringify({}),
          'globalThis': 'globalThis'
        })
      );
    }
    
    if (isServer) {
      // Add fallbacks for browser modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    
    return config;
  }
};

export default nextConfig;
EOL

echo -e "${GREEN}next.config.mjs updated.${NC}"

# Deploy to Vercel
echo -e "${BLUE}Deploying to Vercel...${NC}"
npx vercel deploy

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Deployment initiated successfully!${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}       Deployment In Progress          ${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "${YELLOW}Check the Vercel dashboard for build status: https://vercel.com/dashboard${NC}"
else
  echo -e "${RED}Deployment failed. Please check the logs above for errors.${NC}"
  exit 1
fi 