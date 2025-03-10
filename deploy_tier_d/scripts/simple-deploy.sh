#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   TIER'D SIMPLE DEPLOYMENT            ${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if a command succeeds
check_success() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success: $1${NC}"
    return 0
  else
    echo -e "${RED}✗ Failed: $1${NC}"
    return 1
  fi
}

# Step 1: Create a clean deployment directory
echo -e "${CYAN}STEP 1: Creating clean deployment directory${NC}"

# Create clean directory
mkdir -p simple_deploy
check_success "Created deployment directory"

# Step 2: Copy essential files
echo -e "${CYAN}STEP 2: Copying essential files${NC}"

# Copy required directories
cp -r lib simple_deploy/
cp -r scripts simple_deploy/
cp -r hooks simple_deploy/
cp -r components simple_deploy/
cp -r app simple_deploy/
cp -r mock simple_deploy/
mkdir -p simple_deploy/public

# Copy configuration files
cp next.config.mjs simple_deploy/
cp vercel.json simple_deploy/
cp .env.local simple_deploy/
cp package.json simple_deploy/
cp package-lock.json simple_deploy/
check_success "Copied essential files"

# Step 3: Create minimal essential files if they don't exist
echo -e "${CYAN}STEP 3: Ensuring all essential files exist${NC}"

# Create complete-polyfills.js if it doesn't exist
if [ ! -f "simple_deploy/lib/complete-polyfills.js" ]; then
  mkdir -p simple_deploy/lib
  cat > simple_deploy/lib/complete-polyfills.js << 'EOF'
// Complete polyfills for browser globals in Node.js environment
if (typeof window === 'undefined') {
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.navigator) global.navigator = { userAgent: 'node.js' };
  console.log('✅ Applied polyfills for server environment');
}
EOF
  check_success "Created minimal polyfills"
fi

# Create minimal entry script if it doesn't exist
if [ ! -f "simple_deploy/scripts/minimal-entry.js" ]; then
  mkdir -p simple_deploy/scripts
  cat > simple_deploy/scripts/minimal-entry.js << 'EOF'
// Import polyfills at the very beginning
require('../lib/complete-polyfills.js');
console.log('✅ Applied polyfills via entry script');
EOF
  check_success "Created minimal entry script"
fi

# Create a basic README
cat > simple_deploy/README.md << 'EOF'
# Tier'd Application

A Next.js application for product ranking and reviews with real-time updates and analytics.

## Features

- Real-time voting and reviews
- CMS analytics dashboard
- Mock mode for development and testing

## Deployment

This is a simplified deployment package created by the simple-deploy.sh script.
EOF
check_success "Created README"

# Step 4: Create a package.json with only essential dependencies
echo -e "${CYAN}STEP 4: Building deployment package${NC}"

# Change to deployment directory
cd simple_deploy

# Install only production dependencies
echo -e "${YELLOW}Installing dependencies (this may take a while)...${NC}"
npm install --omit=dev
check_success "Installed dependencies"

# Step 5: Deploy to Vercel
echo -e "${CYAN}STEP 5: Deploying to Vercel${NC}"

# Prompt for deployment confirmation
read -p "Ready to deploy to Vercel production. Continue? (y/n): " deploy_confirm

if [[ "$deploy_confirm" =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deploying to Vercel...${NC}"
  
  # Create temporary file for environment variables
  env_file=$(mktemp)
  
  cat > "$env_file" << EOF
MOCK_DB="true"
NODE_ENV="production"
ENABLE_REALTIME="true"
ENABLE_ANALYTICS="true"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="Tier-dAdmin2024!"
CACHE_TTL="300"
RATE_LIMIT_DEFAULT="60"
RATE_LIMIT_STRICT="20"
NODE_OPTIONS="--require=./scripts/minimal-entry.js"
EOF
  
  CI='' vercel deploy --prod -y --env-file="$env_file"
  
  deploy_result=$?
  rm "$env_file" # Clean up
  
  if [ $deploy_result -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel --prod -n 2>&1 | grep -o 'https://[a-zA-Z0-9.-]*\.vercel\.app' | head -n 1)
    
    if [ -n "$DEPLOYMENT_URL" ]; then
      echo -e "${GREEN}Your application is deployed at: ${DEPLOYMENT_URL}${NC}"
      echo -e "${GREEN}Admin login: ${DEPLOYMENT_URL}/admin/login${NC}"
      
      # Save deployment info to parent directory
      cd ..
      cat > deployment-info.txt << EOF
Tier'd Application Deployment Information
=========================================

Deployment URL: ${DEPLOYMENT_URL}
Admin Dashboard: ${DEPLOYMENT_URL}/admin/login
Username: admin
Password: Tier-dAdmin2024!

IMPORTANT: Please change these credentials in the Vercel dashboard.
EOF
      echo -e "${GREEN}Deployment information saved to deployment-info.txt${NC}"
    else
      echo -e "${YELLOW}Deployment URL not found. Check the Vercel dashboard.${NC}"
    fi
    
  else
    echo -e "${RED}✗ Deployment failed. Please check the Vercel logs for details.${NC}"
    cd ..
    exit 1
  fi
else
  echo -e "${YELLOW}Deployment cancelled.${NC}"
  cd ..
  exit 0
fi

# Return to original directory
cd ..

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  DEPLOYMENT PROCESS COMPLETE          ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Your Tier'd application has been deployed!${NC}"
echo -e "${GREEN}Check deployment-info.txt for details.${NC}" 