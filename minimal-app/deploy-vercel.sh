#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE} Deploy to Vercel via GitHub Integration ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo -e "${RED}Error: git is not installed. Please install git first.${NC}"
  exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
  echo -e "${YELLOW}Initializing git repository...${NC}"
  git init
fi

# Ensure index.html is in place as a fallback
if [ ! -d "public" ]; then
  mkdir -p public
fi

# Ensure .gitignore has proper settings
if [ ! -f ".gitignore" ]; then
  echo -e "${YELLOW}Creating .gitignore file...${NC}"
  cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF
  echo -e "${GREEN}Created .gitignore${NC}"
fi

# Create vercel.json
echo -e "${BLUE}Creating vercel.json...${NC}"
cat > vercel.json << 'EOF'
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_ENABLE_VOTES": "true",
    "NEXT_PUBLIC_ENABLE_REVIEWS": "true",
    "NEXT_PUBLIC_ENABLE_DISCUSSIONS": "true",
    "NEXT_PUBLIC_MAX_VOTES_PER_DAY": "10"
  }
}
EOF
echo -e "${GREEN}Created vercel.json${NC}"

# Create .npmrc
echo -e "${BLUE}Creating .npmrc file...${NC}"
cat > .npmrc << 'EOF'
ignore-scripts=false
legacy-peer-deps=true
strict-peer-dependencies=false
auto-install-peers=true
EOF
echo -e "${GREEN}Created .npmrc${NC}"

# Commit files
echo -e "${BLUE}Committing files to git...${NC}"
git add .
git commit -m "Updated configuration for Vercel deployment"

# Prompt for repository URL
echo -e "${YELLOW}Do you have a GitHub repository for this project? (y/n)${NC}"
read -r has_repo

if [[ $has_repo =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Enter your GitHub repository URL (e.g., https://github.com/username/repo):${NC}"
  read -r repo_url
  
  # Check if remote exists
  if git remote | grep -q "origin"; then
    git remote set-url origin $repo_url
  else
    git remote add origin $repo_url
  fi
  
  echo -e "${BLUE}Pushing to GitHub...${NC}"
  git push -u origin main || git push -u origin master
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to push to GitHub. Please push manually:${NC}"
    echo -e "git push -u origin main"
    exit 1
  fi
  
  echo -e "${GREEN}Successfully pushed to GitHub.${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}  Import your project on Vercel:        ${NC}"
  echo -e "${BLUE}  https://vercel.com/import/git         ${NC}"
  echo -e "${BLUE}========================================${NC}"
  
  # Try to open browser
  if command -v open &> /dev/null; then
    open https://vercel.com/import/git
  elif command -v xdg-open &> /dev/null; then
    xdg-open https://vercel.com/import/git
  else
    echo -e "${YELLOW}Please visit https://vercel.com/import/git to import your project.${NC}"
  fi
else
  echo -e "${YELLOW}You need to create a GitHub repository and push this project to it.${NC}"
  echo -e "${YELLOW}Then import it on Vercel: https://vercel.com/import/git${NC}"
fi

echo -e "${GREEN}Deployment preparation complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}        Next Steps                     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "1. Create a GitHub repository if you don't have one"
echo -e "2. Push this project to GitHub"
echo -e "3. Import the repository on Vercel"
echo -e "4. Set up environment variables on Vercel"
echo -e "5. Deploy your project" 