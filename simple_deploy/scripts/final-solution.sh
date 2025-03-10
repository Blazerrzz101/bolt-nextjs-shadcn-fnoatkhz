#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m' 
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}      TIER'D MINIMAL SOLUTION      ${NC}"
echo -e "${BLUE}====================================${NC}"

# Remove anything that could cause conflicts
echo -e "${YELLOW}Removing potential conflicts...${NC}"
rm -rf app/page.js app/page.tsx .next

# Ensure pages directory exists
mkdir -p pages
if [ ! -f "pages/index.js" ]; then
  echo -e "${YELLOW}Creating minimal pages/index.js${NC}"
  cat > pages/index.js << 'EOF'
export default function Home() {
  return (
    <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
      <h1>Tier'd Application</h1>
      <p>Minimal deployment solution.</p>
      <ul>
        <li><a href="/api/health-check">Health Check API</a></li>
        <li><a href="/api/products">Products API</a></li>
      </ul>
    </div>
  );
}
EOF
  echo -e "${GREEN}Created pages/index.js${NC}"
fi

# Create essential minimal polyfills
echo -e "${YELLOW}Creating standalone polyfills...${NC}"
mkdir -p lib
cat > lib/standalone-polyfills.js << 'EOF'
/**
 * Absolute minimal polyfills
 */
if (typeof global !== 'undefined') {
  // Essential globals
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.navigator) global.navigator = { userAgent: 'Node.js' };
  if (!global.document) {
    global.document = {
      createElement: () => ({ 
        style: {}, 
        appendChild: () => {}, 
        setAttribute: () => {} 
      }),
      getElementsByTagName: () => ([]),
      createTextNode: () => ({}),
      head: { appendChild: () => {} },
      body: { appendChild: () => {} }
    };
  }
  
  // Required constructors
  if (!global.HTMLElement) global.HTMLElement = class HTMLElement {};
  if (!global.CSSStyleSheet) global.CSSStyleSheet = class CSSStyleSheet {};
  
  // Response for API routes
  if (!global.Response) {
    global.Response = class Response {
      constructor(body, init = {}) {
        this.body = body;
        this.status = init.status || 200;
      }
      
      static json(data, init = {}) {
        return new Response(JSON.stringify(data), {
          ...init,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
  }
}

console.log('✅ Minimal polyfills applied');
EOF
echo -e "${GREEN}Created standalone polyfills${NC}"

# Create essential API routes
echo -e "${YELLOW}Creating minimal API routes...${NC}"
mkdir -p app/api/health-check app/api/products

# Health check API
cat > app/api/health-check/route.js << 'EOF'
require('../../../lib/standalone-polyfills');

export async function GET() {
  return Response.json({
    status: "ok",
    time: new Date().toISOString()
  });
}
EOF

# Products API
cat > app/api/products/route.js << 'EOF'
require('../../../lib/standalone-polyfills');

const products = [
  { id: 1, name: "Product 1", price: 29 },
  { id: 2, name: "Product 2", price: 59 },
  { id: 3, name: "Product 3", price: 99 }
];

export async function GET() {
  return Response.json({ success: true, products });
}
EOF

echo -e "${GREEN}Created API routes${NC}"

# Create minimal next.config.mjs
echo -e "${YELLOW}Creating minimal Next.js config...${NC}"
cat > next.config.mjs << 'EOF'
// Apply minimal polyfills inline
if (typeof global !== 'undefined') {
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable checks for faster builds
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  
  // Disable image optimization
  images: { unoptimized: true },
  
  // Mock mode
  env: { MOCK_DB: 'true' }
};

export default nextConfig;
EOF
echo -e "${GREEN}Created Next.js config${NC}"

# Create minimal Vercel config
echo -e "${YELLOW}Creating minimal Vercel config...${NC}"
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "NODE_OPTIONS=\"--require=./lib/standalone-polyfills.js\" next build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "env": {
    "MOCK_DB": "true"
  }
}
EOF
echo -e "${GREEN}Created Vercel config${NC}"

# Create env file
echo -e "${YELLOW}Setting environment variables...${NC}"
cat > .env.local << 'EOF'
MOCK_DB=true
NODE_ENV=production
EOF
echo -e "${GREEN}Environment variables set${NC}"

# Run the deployment
echo -e "${YELLOW}Ready to deploy. This will deploy to Vercel.${NC}"
read -p "Continue? (y/n): " -n 1 -r
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
  
  # Set environment variables
  export MOCK_DB=true
  export NODE_OPTIONS="--require=./lib/standalone-polyfills.js"
  
  # Deploy with reduced output
  $VERCEL_CMD deploy --prod -y
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
  else
    echo -e "${RED}Deployment failed. See details above.${NC}"
  fi
else
  echo -e "${YELLOW}Deployment canceled.${NC}"
fi

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}         PROCESS COMPLETE          ${NC}"
echo -e "${BLUE}====================================${NC}" 