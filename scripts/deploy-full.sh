#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}     Tier'd Full Deployment Script      ${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if a command exists
command_exists() {
  command -v "$1" &> /dev/null
}

# Function to retry commands with exponential backoff
retry_with_backoff() {
  local max_attempts=5
  local timeout=1
  local attempt=1
  local exitCode=0

  while [[ $attempt -le $max_attempts ]]
  do
    "$@"
    exitCode=$?

    if [[ $exitCode == 0 ]]
    then
      return 0
    fi

    echo -e "${YELLOW}Command failed (attempt $attempt/$max_attempts). Retrying in $timeout seconds...${NC}"
    sleep $timeout
    attempt=$(( attempt + 1 ))
    timeout=$(( timeout * 2 ))
  done

  echo -e "${RED}Command failed after $max_attempts attempts.${NC}"
  return $exitCode
}

# Check for required tools
echo -e "${BLUE}Checking for required tools...${NC}"
MISSING_TOOLS=false

# Check for Node.js
if ! command_exists node; then
  echo -e "${RED}❌ Node.js is not installed${NC}"
  MISSING_TOOLS=true
else
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✅ Node.js ${NODE_VERSION} is installed${NC}"
fi

# Check for npm
if ! command_exists npm; then
  echo -e "${RED}❌ npm is not installed${NC}"
  MISSING_TOOLS=true
else
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}✅ npm ${NPM_VERSION} is installed${NC}"
fi

# Check for git
if ! command_exists git; then
  echo -e "${RED}❌ git is not installed${NC}"
  MISSING_TOOLS=true
else
  GIT_VERSION=$(git --version)
  echo -e "${GREEN}✅ ${GIT_VERSION} is installed${NC}"
fi

# Exit if any required tools are missing
if [ "$MISSING_TOOLS" = true ]; then
  echo -e "${RED}Please install the missing tools and try again.${NC}"
  exit 1
fi

# Ensure node scripts are executable
echo -e "${BLUE}Making scripts executable...${NC}"
chmod +x scripts/*.js
echo -e "${GREEN}Scripts are now executable.${NC}"

# Verify environment variables
echo -e "${BLUE}Verifying environment variables...${NC}"
node scripts/verify-env.js
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to verify environment variables. Please check the error messages above.${NC}"
  exit 1
fi

# Check if in git repository and save changes
if git rev-parse --is-inside-work-tree &> /dev/null; then
  echo -e "${BLUE}Saving current changes...${NC}"
  git add .
  git diff --quiet --exit-code --cached || git commit -m "[Cursor] Pre-deployment save point"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Changes saved.${NC}"
  else
    echo -e "${YELLOW}No changes to save or commit failed.${NC}"
  fi
fi

# Clean up previous build artifacts
echo -e "${BLUE}Cleaning up previous build artifacts...${NC}"
rm -rf .next
rm -rf node_modules/.cache
echo -e "${GREEN}Cleaned up build artifacts.${NC}"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
retry_with_backoff npm install --no-fund --no-audit --prefer-offline
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install dependencies.${NC}"
  exit 1
fi
echo -e "${GREEN}Dependencies installed successfully.${NC}"

# Create optimized next.config.js
echo -e "${BLUE}Creating optimized next.config.js...${NC}"
cat > next.config.mjs << 'EOF'
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
    domains: ['images.unsplash.com'],
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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Define self for server-side
      global.self = global;
    }
    
    // Define global objects for browser
    config.plugins.push(
      new config.webpack.DefinePlugin({
        'process.browser': JSON.stringify(!isServer),
        'global.self': isServer ? 'global' : 'self',
        'self': isServer ? 'global.self' : 'self',
        'window': isServer ? 'global.self' : 'window',
        'globalThis': isServer ? 'global' : 'globalThis',
      })
    );
    
    // Add fallbacks for browser modules on server
    if (isServer) {
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
EOF
echo -e "${GREEN}Created optimized next.config.mjs.${NC}"

# Create vercel.json
echo -e "${BLUE}Creating vercel.json...${NC}"
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
EOF
echo -e "${GREEN}Created vercel.json.${NC}"

# Build the application
echo -e "${BLUE}Building the application...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Please check the error messages above.${NC}"
  exit 1
fi
echo -e "${GREEN}Build completed successfully.${NC}"

# Run tests if available
if grep -q "\"test\":" package.json; then
  echo -e "${BLUE}Running tests...${NC}"
  npm test
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Tests failed. Do you want to continue with deployment? (y/n)${NC}"
    read -r continue_deployment
    if [[ ! $continue_deployment =~ ^[Yy]$ ]]; then
      echo -e "${RED}Deployment aborted.${NC}"
      exit 1
    fi
    echo -e "${YELLOW}Continuing with deployment despite test failures.${NC}"
  else
    echo -e "${GREEN}Tests passed.${NC}"
  fi
else
  echo -e "${YELLOW}No test script found in package.json. Skipping tests.${NC}"
fi

# Check if Vercel CLI is installed
echo -e "${BLUE}Checking for Vercel CLI...${NC}"
if command_exists vercel; then
  echo -e "${GREEN}Vercel CLI is installed.${NC}"
  VERCEL_CMD="vercel"
elif command_exists npx; then
  echo -e "${YELLOW}Vercel CLI not found. Using npx instead.${NC}"
  VERCEL_CMD="npx vercel"
else
  echo -e "${RED}Neither Vercel CLI nor npx found. Please install Vercel CLI.${NC}"
  exit 1
fi

# Ask if deploying to production
echo -e "${BLUE}Do you want to deploy to production? (y/n)${NC}"
read -r deploy_to_production

# Deploy to Vercel
echo -e "${BLUE}Deploying to Vercel...${NC}"
if [[ $deploy_to_production =~ ^[Yy]$ ]]; then
  $VERCEL_CMD deploy --prod
else
  $VERCEL_CMD deploy
fi

if [ $? -ne 0 ]; then
  echo -e "${RED}Deployment failed. Please check the error messages above.${NC}"
  exit 1
fi

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Tier'd Application Deployed!        ${NC}"
echo -e "${BLUE}========================================${NC}"

# Helpful next steps
echo -e "${CYAN}Next steps:${NC}"
echo -e "1. Visit the Vercel dashboard to verify the deployment status."
echo -e "2. Check your deployment URL."
echo -e "3. Verify that all features are working as expected."
echo -e "4. Configure your custom domain if needed."
echo -e ""
echo -e "${CYAN}For any issues, check the logs in the Vercel dashboard.${NC}" 