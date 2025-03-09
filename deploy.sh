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
echo -e "${BLUE}   Tier'd Comprehensive Deployment      ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${CYAN}This script will guide you through deploying the full Tier'd application.${NC}"
echo -e "${CYAN}It incorporates environment validation, integration checks, and deployment.${NC}"
echo -e ""

# Function to ask for user confirmation
confirm() {
  read -p "Continue? (y/n): " choice
  case "$choice" in 
    y|Y ) return 0;;
    * ) return 1;;
  esac
}

# Function to verify scripts are executable
verify_executables() {
  echo -e "${BLUE}Verifying script permissions...${NC}"
  
  chmod +x scripts/*.js scripts/*.sh
  
  echo -e "${GREEN}All scripts are now executable.${NC}"
}

# Function to check if Supabase keys are in environment
check_supabase_env() {
  if [[ -z "${NEXT_PUBLIC_SUPABASE_URL}" || -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" ]]; then
    echo -e "${YELLOW}Supabase environment variables not found in current shell.${NC}"
    return 1
  else
    echo -e "${GREEN}Supabase environment variables found.${NC}"
    return 0
  fi
}

# Show deployment options
show_options() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${MAGENTA}Deployment Options:${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "1. ${CYAN}Full Application Deployment${NC} - Deploy the complete Tier'd application"
  echo -e "2. ${CYAN}Minimal Application Deployment${NC} - Deploy the minimal version (fallback)"
  echo -e "3. ${CYAN}Validate Only${NC} - Run validation without deployment"
  echo -e "4. ${CYAN}Exit${NC}"
  echo -e "${BLUE}========================================${NC}"
}

# Run validation
run_validation() {
  # Verify environment
  echo -e "${BLUE}Step 1: Verifying environment variables...${NC}"
  node scripts/verify-env.js
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Environment verification failed. Please fix the issues and try again.${NC}"
    return 1
  fi
  
  echo -e "${GREEN}Environment verification completed successfully.${NC}"
  
  # Validate integration
  echo -e "${BLUE}Step 2: Validating application integration...${NC}"
  node scripts/validate-integration.js
  
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Integration validation found issues.${NC}"
    echo -e "${YELLOW}Do you want to continue with deployment anyway?${NC}"
    
    if ! confirm; then
      echo -e "${RED}Deployment cancelled.${NC}"
      return 1
    fi
    
    echo -e "${YELLOW}Continuing with deployment despite validation issues.${NC}"
  else
    echo -e "${GREEN}Integration validation completed successfully.${NC}"
  fi
  
  return 0
}

# Deploy full application
deploy_full() {
  if run_validation; then
    echo -e "${BLUE}Step 3: Deploying full application...${NC}"
    
    # Use the Vercel-specific build script
    echo -e "${BLUE}Building application for Vercel...${NC}"
    npm run build:vercel
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Build failed. Please check the error messages above.${NC}"
      return 1
    fi
    
    echo -e "${GREEN}Build completed successfully!${NC}"
    
    # Deploy to Vercel
    echo -e "${BLUE}Deploying to Vercel...${NC}"
    
    if command -v vercel &> /dev/null; then
      echo -e "${BLUE}Detected Vercel CLI, using it for deployment...${NC}"
      vercel deploy --prod
    else
      echo -e "${YELLOW}Vercel CLI not found, using npx...${NC}"
      npx vercel deploy --prod
    fi
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Deployment failed. Please check the error messages above.${NC}"
      return 1
    fi
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
  else
    echo -e "${RED}Validation failed. Please fix the issues and try again.${NC}"
    return 1
  fi
  
  return 0
}

# Deploy minimal application
deploy_minimal() {
  echo -e "${BLUE}Deploying minimal application...${NC}"
  
  if [ -d "minimal-app" ]; then
    cd minimal-app
    
    if [ -f "one-click-deploy.sh" ]; then
      ./one-click-deploy.sh
    elif [ -f "deploy.sh" ]; then
      ./deploy.sh
    else
      echo -e "${RED}No deployment script found in minimal-app directory.${NC}"
      return 1
    fi
    
    cd ..
    
    echo -e "${GREEN}Minimal application deployment completed!${NC}"
  else
    echo -e "${RED}Minimal app directory not found.${NC}"
    return 1
  fi
  
  return 0
}

# Main function
main() {
  # Verify scripts are executable
  verify_executables
  
  # Show options
  show_options
  
  # Get user choice
  read -p "Enter your choice (1-4): " choice
  
  case $choice in
    1)
      echo -e "${BLUE}You selected: Full Application Deployment${NC}"
      
      echo -e "${CYAN}This will deploy the complete Tier'd application with all features.${NC}"
      echo -e "${CYAN}It will validate environment variables and integration before deployment.${NC}"
      
      if confirm; then
        deploy_full
        
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}Full application deployment completed successfully!${NC}"
          echo -e "${CYAN}Your application should now be available on Vercel.${NC}"
        fi
      else
        echo -e "${YELLOW}Deployment cancelled.${NC}"
      fi
      ;;
    2)
      echo -e "${BLUE}You selected: Minimal Application Deployment${NC}"
      
      echo -e "${CYAN}This will deploy the minimal version of Tier'd.${NC}"
      echo -e "${CYAN}This is useful if you're having issues with the full application.${NC}"
      
      if confirm; then
        deploy_minimal
        
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}Minimal application deployment completed successfully!${NC}"
          echo -e "${CYAN}Your minimal application should now be available on Vercel.${NC}"
        fi
      else
        echo -e "${YELLOW}Deployment cancelled.${NC}"
      fi
      ;;
    3)
      echo -e "${BLUE}You selected: Validate Only${NC}"
      
      echo -e "${CYAN}This will validate environment variables and integration without deploying.${NC}"
      
      if confirm; then
        run_validation
        
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}Validation completed successfully!${NC}"
          echo -e "${CYAN}Your application is ready for deployment.${NC}"
        else
          echo -e "${RED}Validation failed. Please fix the issues before deploying.${NC}"
        fi
      else
        echo -e "${YELLOW}Validation cancelled.${NC}"
      fi
      ;;
    4)
      echo -e "${YELLOW}Exiting...${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please select a number between 1 and 4.${NC}"
      main
      ;;
  esac
}

# Run the main function
main

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Tier'd Deployment Process Complete   ${NC}"
echo -e "${BLUE}========================================${NC}" 