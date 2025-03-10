#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   PURE HTML DEPLOYMENT SOLUTION       ${NC}"
echo -e "${BLUE}========================================${NC}"

# Ensure the fallback directory exists
mkdir -p fallback

# Check if index.html exists, create if not
if [ ! -f "fallback/index.html" ]; then
  echo -e "${YELLOW}Creating pure HTML fallback...${NC}"
  
  # Create a simple HTML file
  cat > fallback/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tier'd Application - Static Site</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 { color: #2563eb; }
    .card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 2rem 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .success {
      background-color: #ecfdf5;
      border-left: 4px solid #10b981;
    }
  </style>
</head>
<body>
  <h1>Tier'd Application</h1>
  
  <div class="card success">
    <h2>Deployment Successful!</h2>
    <p>This pure HTML site has been successfully deployed to Vercel.</p>
    <p>No build process, no JavaScript framework, just HTML and CSS.</p>
  </div>
  
  <div class="card">
    <h2>Next Steps</h2>
    <p>Now that you have a successful base deployment, you can:</p>
    <ol>
      <li>Gradually add Next.js components</li>
      <li>Add API routes one by one</li>
      <li>Incrementally build back to your full application</li>
    </ol>
  </div>
  
  <p><small>Built on: <span id="timestamp"></span></small></p>
  
  <script>
    document.getElementById('timestamp').textContent = new Date().toLocaleString();
  </script>
</body>
</html>
EOF
  echo -e "${GREEN}Created pure HTML fallback${NC}"
else
  echo -e "${GREEN}HTML fallback already exists${NC}"
fi

# Create a vercel.json for static deployment
echo -e "${YELLOW}Creating Vercel config for static HTML...${NC}"
cat > fallback/vercel.json << 'EOF'
{
  "version": 2,
  "framework": null,
  "buildCommand": null,
  "outputDirectory": "."
}
EOF
echo -e "${GREEN}Created Vercel config${NC}"

# Deploy to Vercel
echo -e "${YELLOW}Ready to deploy pure HTML to Vercel.${NC}"
echo -e "${YELLOW}This approach requires zero build process and should work 100% of the time.${NC}"
read -p "Continue with deployment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deploying to Vercel...${NC}"
  
  # Check for Vercel CLI
  if command -v vercel &> /dev/null; then
    VERCEL_CMD="vercel"
  elif command -v npx &> /dev/null; then
    VERCEL_CMD="npx vercel"
  else
    echo -e "${RED}Error: Vercel CLI not found.${NC}"
    exit 1
  fi
  
  # Navigate to fallback directory to deploy
  cd fallback
  
  # Deploy with no build step
  $VERCEL_CMD deploy --prod -y
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    echo -e "${GREEN}Your pure HTML site is now live on Vercel!${NC}"
  else
    echo -e "${RED}Deployment failed.${NC}"
    echo -e "${YELLOW}Please try deploying manually by:${NC}"
    echo -e "1. Going to https://vercel.com/new"
    echo -e "2. Drag and drop the 'fallback' folder"
  fi
  
  # Navigate back
  cd ..
else
  echo -e "${YELLOW}Deployment canceled.${NC}"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      PURE HTML PROCESS COMPLETE       ${NC}"
echo -e "${BLUE}========================================${NC}" 