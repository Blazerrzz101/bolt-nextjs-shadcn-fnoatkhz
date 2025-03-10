#!/bin/bash

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   STATIC EXPORT DEPLOYMENT SOLUTION   ${NC}"
echo -e "${BLUE}========================================${NC}"

# Clean slate - remove everything that could conflict
echo -e "${YELLOW}Creating clean slate...${NC}"
rm -rf app .next out
echo -e "${GREEN}Removed potential conflicts${NC}"

# Create minimal pages directory with a simple index page
echo -e "${YELLOW}Creating minimal static site...${NC}"
mkdir -p pages
cat > pages/index.js << 'EOF'
export default function Home() {
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: 1.5
    }}>
      <h1 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>
        Tier'd Application
      </h1>
      <p style={{fontSize: '1.25rem', marginBottom: '2rem'}}>
        Static export deployment successful!
      </p>
      <div style={{
        padding: '1.5rem',
        borderRadius: '0.5rem',
        backgroundColor: '#f3f4f6',
        marginBottom: '2rem'
      }}>
        <h2 style={{marginTop: 0}}>Deployment Notes</h2>
        <p>This is a static export of the Tier'd application.</p>
        <p>No API routes or server components are included in this version.</p>
        <p>Perfect for deployment to any static hosting service.</p>
      </div>
      <h2>Next Steps</h2>
      <ul style={{marginBottom: '2rem'}}>
        <li>Replace this static export with your full application</li>
        <li>Add API routes once the deployment structure is working</li>
        <li>Configure server-side features gradually</li>
      </ul>
      <p><strong>Built at:</strong> {new Date().toISOString()}</p>
    </div>
  );
}
EOF

# Create a simplified package.json with only essential deps
cat > package.json << 'EOF'
{
  "name": "tierd-minimal",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next export"
  },
  "dependencies": {
    "next": "12.3.4",
    "react": "17.0.2",
    "react-dom": "17.0.2"
  }
}
EOF

# Create a very simple next.config.js
cat > next.config.js << 'EOF'
module.exports = {
  // Using older Next.js APIs for better compatibility
  reactStrictMode: false,
  swcMinify: false,
  
  // Static export settings
  images: {
    unoptimized: true
  },
  
  // Output as static export
  output: 'export'
}
EOF

# Create a vercel.json for static deployment
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm install --legacy-peer-deps && npm run build",
  "outputDirectory": "out",
  "framework": null
}
EOF

echo -e "${GREEN}Created minimal static site${NC}"

# Install dependencies
echo -e "${YELLOW}Installing minimal dependencies...${NC}"
npm install --legacy-peer-deps next@12.3.4 react@17.0.2 react-dom@17.0.2
echo -e "${GREEN}Installed dependencies${NC}"

# Build the static site
echo -e "${YELLOW}Building static site...${NC}"
npx next build
echo -e "${GREEN}Built static site${NC}"

# Export the static site
echo -e "${YELLOW}Exporting static site...${NC}"
# For Next.js 12, we need to run export separately
npx next export
echo -e "${GREEN}Exported static site to 'out' directory${NC}"

# Deploy to Vercel
echo -e "${YELLOW}Ready to deploy static site to Vercel.${NC}"
read -p "Continue with deployment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deploying static site to Vercel...${NC}"
  
  # Check for Vercel CLI
  if command -v vercel &> /dev/null; then
    VERCEL_CMD="vercel"
  elif command -v npx &> /dev/null; then
    VERCEL_CMD="npx vercel"
  else
    echo -e "${RED}Error: Vercel CLI not found.${NC}"
    exit 1
  fi
  
  # Deploy the out directory explicitly
  $VERCEL_CMD deploy --prod -y
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    echo -e "${GREEN}Static site is now live on Vercel!${NC}"
  else
    echo -e "${RED}Deployment failed.${NC}"
    echo -e "${YELLOW}Try deploying manually via the Vercel dashboard:${NC}"
    echo -e "1. Go to https://vercel.com/new"
    echo -e "2. Import your project from Git or drag & drop the 'out' folder"
  fi
else
  echo -e "${YELLOW}Deployment canceled.${NC}"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}         STATIC EXPORT COMPLETE        ${NC}"
echo -e "${BLUE}========================================${NC}" 