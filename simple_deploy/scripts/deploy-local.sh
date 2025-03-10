#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Deploying Tier'd to Vercel (Local)   ${NC}"
echo -e "${BLUE}========================================${NC}"

# Run pre-build checks
echo -e "${BLUE}Running pre-build checks...${NC}"
npm run pre-build-check
if [ $? -ne 0 ]; then
    echo -e "${RED}Pre-build checks failed. Please fix the issues and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}Pre-build checks passed.${NC}"

# Build the application
echo -e "${BLUE}Building the application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Please fix the errors and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}Build successful.${NC}"

# Prepare for Vercel deployment
echo -e "${BLUE}Preparing for Vercel deployment...${NC}"
npm run prepare-for-vercel
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Failed to prepare for Vercel deployment. Continuing anyway...${NC}"
fi

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

# Ask if user wants to deploy to production
echo -e "${BLUE}Do you want to deploy to production? (y/n)${NC}"
read -r deploy_to_production
if [[ $deploy_to_production =~ ^[Yy]$ ]]; then
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
