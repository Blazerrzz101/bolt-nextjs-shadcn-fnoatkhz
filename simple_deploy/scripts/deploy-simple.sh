#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Simplified Deployment to Vercel      ${NC}"
echo -e "${BLUE}========================================${NC}"

# Ensure all mock API routes are in place
echo -e "${BLUE}Checking mock API routes...${NC}"
mkdir -p app/api/supabase-mock
touch app/api/supabase-mock/route.ts

# Create a basic mock API for Supabase-related routes
cat > app/api/supabase-mock/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Mock Supabase API is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Mock Supabase API received your request',
    timestamp: new Date().toISOString()
  });
}
EOF

echo -e "${GREEN}Mock API routes checked and created.${NC}"

# Create a minimum vercel.json if it doesn't exist yet
echo -e "${BLUE}Ensuring vercel.json exists...${NC}"
if [ ! -f "vercel.json" ]; then
  cat > vercel.json << 'EOF'
{
  "version": 2,
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "https://qmyvtvvdnoktrwzrdflp.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXZ0dnZkbm9rdHJ3enJkZmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDY4NjcsImV4cCI6MjA1NDAyMjg2N30.ZJydLlAMne7sy49slYl7xymJE0dsQqWwV8-4g2pf-EY",
    "DEPLOY_ENV": "production",
    "NEXT_PUBLIC_ENABLE_VOTES": "true",
    "NEXT_PUBLIC_ENABLE_REVIEWS": "true",
    "NEXT_PUBLIC_ENABLE_DISCUSSIONS": "true",
    "NEXT_PUBLIC_MAX_VOTES_PER_DAY": "10",
    "NEXT_PUBLIC_MAX_REVIEWS_PER_DAY": "3"
  }
}
EOF
  echo -e "${GREEN}vercel.json created.${NC}"
else
  echo -e "${GREEN}vercel.json already exists.${NC}"
fi

# Ensure .npmrc file to skip build cache
echo -e "${BLUE}Creating .npmrc to bypass build cache...${NC}"
echo "ignore-scripts=false" > .npmrc
echo -e "${GREEN}.npmrc created.${NC}"

# Clean the .next directory and node_modules
echo -e "${BLUE}Cleaning previous build files...${NC}"
rm -rf .next
echo -e "${GREEN}Previous build files cleaned.${NC}"

# Login to Vercel if not already logged in
echo -e "${BLUE}Checking Vercel login status...${NC}"
npx vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Not logged in to Vercel. Please log in:${NC}"
  npx vercel login
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to log in to Vercel. Please try again.${NC}"
    exit 1
  fi
fi

# Deploy with direct deployment to Vercel's build system
echo -e "${BLUE}Do you want to deploy to production? (y/n)${NC}"
read -r deploy_to_production
if [[ $deploy_to_production =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Deploying to production...${NC}"
  # Deploy directly to Vercel, skipping local build
  npx vercel deploy --prod --skip-build
else
  echo -e "${BLUE}Deploying to preview environment...${NC}"
  # Deploy to preview environment
  npx vercel deploy --skip-build
fi

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Deployment initiated successfully!${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}       Deployment In Progress          ${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "${YELLOW}Vercel is now building and deploying your app.${NC}"
  echo -e "${YELLOW}Check the Vercel dashboard for build status: https://vercel.com/dashboard${NC}"
else
  echo -e "${RED}Deployment failed. Please check the logs above for errors.${NC}"
  exit 1
fi 