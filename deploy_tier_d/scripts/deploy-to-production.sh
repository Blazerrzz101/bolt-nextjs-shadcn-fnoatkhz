#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   TIER'D PRODUCTION DEPLOYMENT        ${NC}"
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

# Step 1: Verify environment and dependencies
echo -e "${CYAN}STEP 1: Verifying environment and dependencies${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install it and try again.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install it and try again.${NC}"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI is not installed. Installing...${NC}"
    npm install -g vercel
    check_success "Installed Vercel CLI"
fi

# Check for all necessary files
required_files=(
  "lib/complete-polyfills.js"
  "lib/auth.js"
  "lib/cache.js"
  "lib/rate-limit.js"
  "lib/supabase-client.js"
  "components/AdminProtected.js"
  "app/admin/login/page.js"
  "app/admin/dashboard/page.js"
  "app/dashboard/page.js"
  "app/dashboard/AnalyticsDashboard.js"
  "app/api/admin/login/route.js"
  "next.config.mjs"
  "vercel.json"
  ".env.local"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}Missing required file: $file${NC}"
    exit 1
  fi
done

echo -e "${GREEN}✓ Environment and dependencies verified${NC}"

# Step 2: Run pre-build checks
echo -e "${CYAN}STEP 2: Running pre-build checks${NC}"

# Run our custom pre-build check script
node scripts/pre-build-check.js
if [ $? -ne 0 ]; then
  echo -e "${RED}Pre-build checks failed. Please fix the issues and try again.${NC}"
  exit 1
fi

# Ensure we have the latest NPM dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
check_success "Installed dependencies"

# Step 3: Build the application
echo -e "${CYAN}STEP 3: Building application${NC}"
echo -e "${YELLOW}Running production build...${NC}"

CI='' NODE_OPTIONS="--require=./scripts/minimal-entry.js" npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Build successful!${NC}"
else
  echo -e "${RED}✗ Build failed. Please check the error messages above.${NC}"
  echo -e "${YELLOW}Attempting to create a minimal clean build...${NC}"
  
  # Create a clean directory for the minimal build
  mkdir -p _clean_build
  
  # Copy essential files
  cp -r lib _clean_build/
  cp -r scripts _clean_build/
  cp -r app _clean_build/
  cp -r components _clean_build/
  cp -r hooks _clean_build/
  cp -r mock _clean_build/
  cp next.config.mjs _clean_build/
  cp vercel.json _clean_build/
  cp .env.local _clean_build/
  cp package.json _clean_build/
  
  # Create a simple README.md
  cat > _clean_build/README.md << 'EOF'
# Tier'd Application

A Next.js application for product ranking and reviews with real-time updates and analytics.
EOF
  
  echo -e "${YELLOW}Clean build files prepared. Please check the _clean_build directory.${NC}"
  echo -e "${RED}Please fix the build issues before continuing.${NC}"
  exit 1
fi

# Step 4: Deploy to Vercel
echo -e "${CYAN}STEP 4: Deploying to Vercel${NC}"
echo -e "${YELLOW}Preparing for deployment...${NC}"

# Create temporary file for storing environment variables
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

echo -e "${YELLOW}Environment variables prepared.${NC}"

# Prompt for deployment confirmation
read -p "Ready to deploy to production. Continue? (y/n): " deploy_confirm

if [[ "$deploy_confirm" =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deploying to Vercel production...${NC}"
  
  CI='' vercel deploy --prod -y --env-file="$env_file"
  
  deploy_result=$?
  rm "$env_file" # Clean up temp file
  
  if [ $deploy_result -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo -e "${GREEN}Your application is now live on Vercel!${NC}"
    
    # Try to grab the deployment URL
    DEPLOYMENT_URL=$(vercel --prod -n 2>&1 | grep -o 'https://[a-zA-Z0-9.-]*\.vercel\.app' | head -n 1)
    
    if [ -n "$DEPLOYMENT_URL" ]; then
      echo -e "${GREEN}Your application is deployed at: ${DEPLOYMENT_URL}${NC}"
      echo -e "${GREEN}Admin Dashboard: ${DEPLOYMENT_URL}/admin/login${NC}"
    fi
    
    echo -e "${YELLOW}Important security notes:${NC}"
    echo -e "  1. ${YELLOW}The CMS dashboard is protected with the following credentials:${NC}"
    echo -e "     ${CYAN}Username:${NC} admin"
    echo -e "     ${CYAN}Password:${NC} Tier-dAdmin2024!"
    echo -e "  2. ${YELLOW}Please change these credentials immediately in the Vercel dashboard:${NC}"
    echo -e "     ${CYAN}Vercel Dashboard > Project Settings > Environment Variables${NC}"
    echo -e "  3. ${YELLOW}Update ADMIN_USERNAME and ADMIN_PASSWORD with secure values${NC}"
    
    # Create a deployment-info.txt file
    cat > deployment-info.txt << EOF
Tier'd Application Deployment Information
=========================================

Deployment Date: $(date)
Deployment URL: ${DEPLOYMENT_URL:-"Check your Vercel dashboard"}

Admin Dashboard Access:
- URL: ${DEPLOYMENT_URL:-"Your-deployment-url"}/admin/login
- Username: admin
- Password: Tier-dAdmin2024!

IMPORTANT: Please change these credentials immediately in the Vercel dashboard.

Features Enabled:
- Real-time voting and reviews
- Password-protected CMS analytics dashboard
- Rate limiting for high-traffic protection
- Caching for improved performance
- Complete polyfills for cross-platform compatibility

For support, contact the development team.
EOF
    
    echo -e "${GREEN}Deployment information saved to deployment-info.txt${NC}"
    
  else
    echo -e "${RED}✗ Deployment failed. Please check the Vercel logs for details.${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}Deployment cancelled.${NC}"
  rm "$env_file" # Clean up temp file
  exit 0
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  DEPLOYMENT PROCESS COMPLETE          ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Your Tier'd application has been deployed with:${NC}"
echo -e "${GREEN}• Real-time voting and reviews${NC}"
echo -e "${GREEN}• Password-protected CMS analytics dashboard${NC}"
echo -e "${GREEN}• Rate limiting for high-traffic protection${NC}"
echo -e "${GREEN}• Caching for improved performance${NC}"
echo -e "${GREEN}• Complete polyfills for cross-platform compatibility${NC}"

# Ask if user wants to run a deployment health check
read -p "Would you like to run a health check on the deployed application? (y/n): " health_check_confirm

if [[ "$health_check_confirm" =~ ^[Yy]$ ]]; then
  DEPLOYMENT_URL=${DEPLOYMENT_URL:-$(vercel --prod -n 2>&1 | grep -o 'https://[a-zA-Z0-9.-]*\.vercel\.app' | head -n 1)}
  
  if [ -n "$DEPLOYMENT_URL" ]; then
    echo -e "${YELLOW}Running health check on ${DEPLOYMENT_URL}...${NC}"
    npm run health-check:production -- $DEPLOYMENT_URL
  else
    echo -e "${YELLOW}Deployment URL not detected. Please run the health check manually:${NC}"
    echo -e "${CYAN}npm run health-check:production -- https://your-deployment-url.vercel.app${NC}"
  fi
fi

echo -e "${GREEN}Thank you for using Tier'd!${NC}" 