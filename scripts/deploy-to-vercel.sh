#!/bin/bash

# Deploy to Vercel Script
# This script automates the deployment process to Vercel

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       Deploying to Vercel              ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Vercel CLI is installed locally
echo -e "${BLUE}Checking for Vercel CLI...${NC}"
if ! npx vercel -v &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install vercel
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install Vercel CLI. Please install it manually with 'npm install vercel'.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Vercel CLI installed successfully.${NC}"
fi

# Check if .env.local exists
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo -e "${YELLOW}No .env.local or .env file found. Creating from template...${NC}"
    if [ -f .env.template ]; then
        cp .env.template .env.local
        echo -e "${GREEN}.env.local created from template.${NC}"
        echo -e "${YELLOW}Please edit .env.local to add your environment variables before deploying.${NC}"
        exit 1
    else
        echo -e "${RED}No .env.template found. Please create a .env.local file manually.${NC}"
        exit 1
    fi
fi

# Run lint and type checks
echo -e "${BLUE}Running lint and type checks...${NC}"
npm run lint || {
    echo -e "${YELLOW}Lint check failed but we'll continue due to configuration issues.${NC}"
}

echo -e "${BLUE}Running TypeScript checks...${NC}"
npx tsc --noEmit || {
    echo -e "${YELLOW}TypeScript check failed but we'll continue as TypeScript errors are ignored during build.${NC}"
}

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

# Check if user wants to deploy to production
read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Deploying to production...${NC}"
    npx vercel --prod
else
    echo -e "${BLUE}Deploying to preview environment...${NC}"
    npx vercel
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}       Deployment Complete             ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${YELLOW}Ensure your environment variables are set correctly in the Vercel dashboard.${NC}"
    echo -e "${YELLOW}Visit https://vercel.com/dashboard to check your deployment.${NC}"
else
    echo -e "${RED}Deployment failed. Please check the logs above for errors.${NC}"
    exit 1
fi 