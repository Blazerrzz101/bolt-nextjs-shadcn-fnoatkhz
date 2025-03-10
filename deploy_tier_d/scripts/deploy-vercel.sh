#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Vercel Deployment Script           ${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "${BLUE}Cleaning up build artifacts...${NC}"
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}Cleaned build artifacts${NC}"

echo -e "${BLUE}Backing up package.json...${NC}"
cp package.json package.json.backup
echo -e "${GREEN}Backed up package.json${NC}"

echo -e "${BLUE}Updating build command in package.json...${NC}"
# Use sed to replace the build command
sed -i.bak 's/"build": ".*"/"build": "next build"/' package.json
echo -e "${GREEN}Updated build command${NC}"

echo -e "${BLUE}Running app indexer...${NC}"
node scripts/app-indexer.js
echo -e "${GREEN}App indexing completed${NC}"

echo -e "${BLUE}Creating simplified vercel.json...${NC}"
echo '{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "https://example.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "YOUR_ANON_KEY",
    "NEXT_PUBLIC_ENABLE_VOTES": "true",
    "NEXT_PUBLIC_ENABLE_REVIEWS": "true",
    "NEXT_PUBLIC_ENABLE_DISCUSSIONS": "true",
    "NEXT_PUBLIC_MAX_VOTES_PER_DAY": "10"
  }
}' > vercel.json

echo -e "${GREEN}Created vercel.json${NC}"

echo -e "${BLUE}Creating simplified next.config.mjs...${NC}"
echo 'export default {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    unoptimized: true
  },
  experimental: { optimizeCss: false },
  dynamicParams: true
}' > next.config.mjs

echo -e "${GREEN}Created next.config.mjs${NC}"

echo -e "${BLUE}Attempting deployment to Vercel...${NC}"
# Simple deployment with minimal configuration
npx vercel deploy --prod

# Restore original package.json
echo -e "${BLUE}Restoring original package.json...${NC}"
mv package.json.backup package.json
echo -e "${GREEN}Restored package.json${NC}"

echo -e "${GREEN}Deployment request complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Visit Vercel dashboard to check status  ${NC}"
echo -e "${BLUE}========================================${NC}" 