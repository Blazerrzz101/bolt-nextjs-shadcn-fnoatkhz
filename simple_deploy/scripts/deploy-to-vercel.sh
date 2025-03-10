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
echo -e "${BLUE}     Tier'd Vercel Deployment Script    ${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to ask for user confirmation
confirm() {
  read -p "Continue? (y/n): " choice
  case "$choice" in 
    y|Y ) return 0;;
    * ) return 1;;
  esac
}

# Verify environment variables
echo -e "${BLUE}Verifying environment variables...${NC}"
node scripts/verify-env.js
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to verify environment variables. Please check the error messages above.${NC}"
  exit 1
fi

# Create vercel.json
echo -e "${BLUE}Creating vercel.json...${NC}"
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": {
    "MOCK_DB": "true",
    "SKIP_BUILD_TEST": "true",
    "DEPLOY_ENV": "production"
  }
}
EOF
echo -e "${GREEN}Created vercel.json.${NC}"

# Update .env.local for production
echo -e "${BLUE}Updating .env.local for production...${NC}"
sed -i.bak 's/DEPLOY_ENV=development/DEPLOY_ENV=production/g' .env.local
sed -i.bak 's/NEXT_PUBLIC_SITE_URL=http:\/\/localhost:3000/NEXT_PUBLIC_SITE_URL=https:\/\/tierd-app.vercel.app/g' .env.local
echo -e "${GREEN}Updated .env.local for production.${NC}"

# Add MOCK_DB and SKIP_BUILD_TEST to .env.local if not already present
if ! grep -q "MOCK_DB" .env.local; then
  echo -e "\n# Deployment settings" >> .env.local
  echo "MOCK_DB=true" >> .env.local
  echo "SKIP_BUILD_TEST=true" >> .env.local
  echo -e "${GREEN}Added deployment settings to .env.local.${NC}"
fi

# Check if Vercel CLI is installed
echo -e "${BLUE}Checking for Vercel CLI...${NC}"
if command -v vercel &> /dev/null; then
  echo -e "${GREEN}Vercel CLI is installed.${NC}"
  VERCEL_CMD="vercel"
elif command -v npx &> /dev/null; then
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