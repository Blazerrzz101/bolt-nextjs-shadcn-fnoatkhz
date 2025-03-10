#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${MAGENTA}    TIER'D POLYFILLED DEPLOYMENT      ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${CYAN}Deploying with all polyfill solutions...${NC}"
echo -e ""

# Function to check if a file exists
check_file() {
  if [ ! -f "$1" ]; then
    echo -e "${RED}Missing required file: $1${NC}"
    return 1
  else
    echo -e "${GREEN}Found required file: $1${NC}"
    return 0
  fi
}

# Function to check if all required files exist
check_required_files() {
  echo -e "${BLUE}Checking for required files...${NC}"
  
  local all_files_exist=true
  
  # Check for polyfill files
  check_file "lib/polyfills.js" || all_files_exist=false
  check_file "lib/supabase-safe-client.js" || all_files_exist=false
  check_file "lib/api-wrapper.js" || all_files_exist=false
  check_file "scripts/vercel-entry.js" || all_files_exist=false
  check_file "scripts/build-for-vercel.js" || all_files_exist=false
  check_file "scripts/deep-fix-api-routes.js" || all_files_exist=false
  
  if [ "$all_files_exist" = false ]; then
    echo -e "${RED}Some required files are missing. Please run the verification script first.${NC}"
    return 1
  fi
  
  echo -e "${GREEN}All required files exist.${NC}"
  return 0
}

# Function to update API routes
update_api_routes() {
  echo -e "${BLUE}Updating API routes with polyfill wrappers...${NC}"
  
  # First run the standard update script
  node scripts/update-api-routes.js
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to update API routes.${NC}"
    return 1
  fi
  
  # Then run the fix script
  node scripts/fix-api-routes.js
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to fix API routes.${NC}"
    return 1
  fi
  
  # Finally run the deep fix script to resolve any remaining syntax errors
  echo -e "${BLUE}Applying deep fixes to API routes...${NC}"
  node scripts/deep-fix-api-routes.js
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to deep fix API routes.${NC}"
    return 1
  fi
  
  echo -e "${GREEN}API routes updated and fixed successfully.${NC}"
  return 0
}

# Function to update environment
update_environment() {
  echo -e "${BLUE}Updating environment variables...${NC}"
  
  # Check for .env.local
  if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}No .env.local found. Creating from template...${NC}"
    
    cat > .env.local << EOF
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://qmyvtvvdnoktrwzrdflp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXZ0dnZkbm9rdHJ3enJkZmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDY4NjcsImV4cCI6MjA1NDAyMjg2N30.ZJydLlAMne7sy49slYl7xymJE0dsQqWwV8-4g2pf-EY

# Application configuration
NEXT_PUBLIC_SITE_URL=https://tier-d.vercel.app
DEPLOY_ENV=production

# Feature flags
NEXT_PUBLIC_ENABLE_VOTES=true
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_DISCUSSIONS=true

# Rate limiting
NEXT_PUBLIC_MAX_VOTES_PER_DAY=10

# Deployment settings
MOCK_DB=true
SKIP_BUILD_TEST=true
EOF
  else
    # Update existing .env.local file
    sed -i.bak 's/DEPLOY_ENV=.*/DEPLOY_ENV=production/g' .env.local
    
    # Add required variables if they don't exist
    if ! grep -q "MOCK_DB" .env.local; then
      echo -e "\n# Deployment settings" >> .env.local
      echo "MOCK_DB=true" >> .env.local
      echo "SKIP_BUILD_TEST=true" >> .env.local
    fi
    
    # Clean up backup
    rm -f .env.local.bak
  fi
  
  echo -e "${GREEN}Environment updated successfully.${NC}"
  return 0
}

# Function to create/update vercel.json
create_vercel_config() {
  echo -e "${BLUE}Creating Vercel configuration...${NC}"
  
  cat > vercel.json << EOF
{
  "version": 2,
  "buildCommand": "node -r ./scripts/vercel-entry.js scripts/build-for-vercel.js",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": {
    "MOCK_DB": "true",
    "SKIP_BUILD_TEST": "true",
    "DEPLOY_ENV": "production",
    "NODE_OPTIONS": "--max-old-space-size=4096 --require=./scripts/vercel-entry.js"
  },
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096 --require=./scripts/vercel-entry.js"
    }
  }
}
EOF
  
  echo -e "${GREEN}Vercel configuration created successfully.${NC}"
  return 0
}

# Function to verify setup
verify_build_setup() {
  echo -e "${BLUE}Verifying build setup...${NC}"
  
  # Run a local build test with verbose output
  echo -e "${BLUE}Running local build test...${NC}"
  NODE_OPTIONS="-r ./scripts/vercel-entry.js" MOCK_DB=true npx next build --no-lint
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Local build test failed. This indicates there may still be issues with the API routes.${NC}"
    echo -e "${YELLOW}Do you want to continue anyway? (y/n)${NC}"
    read -p "" CONTINUE_DESPITE_FAILURE
    
    if [[ ! "$CONTINUE_DESPITE_FAILURE" =~ ^[Yy]$ ]]; then
      return 1
    fi
    
    echo -e "${YELLOW}Continuing despite build failure.${NC}"
  else
    echo -e "${GREEN}Local build test passed!${NC}"
  fi
  
  return 0
}

# Function to deploy to Vercel
deploy_to_vercel() {
  echo -e "${BLUE}Deploying to Vercel...${NC}"
  
  # Check if Vercel CLI is installed
  if command -v vercel &> /dev/null; then
    VERCEL_CMD="vercel"
  elif command -v npx &> /dev/null; then
    VERCEL_CMD="npx vercel"
  else
    echo -e "${RED}Neither vercel nor npx command found. Please install Vercel CLI.${NC}"
    return 1
  fi
  
  # Ask if production deployment
  echo -e "${MAGENTA}Deploy to production? (y/n)${NC}"
  read -p "" DEPLOY_PROD
  
  if [[ "$DEPLOY_PROD" =~ ^[Yy]$ ]]; then
    $VERCEL_CMD deploy --prod
  else
    $VERCEL_CMD deploy
  fi
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed.${NC}"
    return 1
  fi
  
  echo -e "${GREEN}Deployment completed successfully.${NC}"
  return 0
}

# Main function
main() {
  # Step 1: Check required files
  check_required_files || exit 1
  
  # Step 2: Update API routes with polyfills
  update_api_routes || exit 1
  
  # Step 3: Update environment
  update_environment || exit 1
  
  # Step 4: Create Vercel configuration
  create_vercel_config || exit 1
  
  # Step 5: Verify build setup
  verify_build_setup || exit 1
  
  # Step 6: Deploy to Vercel
  echo -e "${MAGENTA}Ready to deploy. Continue? (y/n)${NC}"
  read -p "" CONTINUE
  
  if [[ "$CONTINUE" =~ ^[Yy]$ ]]; then
    deploy_to_vercel || exit 1
  else
    echo -e "${YELLOW}Deployment cancelled. Setup is complete and ready for deployment.${NC}"
    exit 0
  fi
  
  # Success
  echo -e "${BLUE}========================================${NC}"
  echo -e "${MAGENTA}    DEPLOYMENT COMPLETED SUCCESSFULLY    ${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "${CYAN}Your application is now globally deployed!${NC}"
}

# Run the main function
main 