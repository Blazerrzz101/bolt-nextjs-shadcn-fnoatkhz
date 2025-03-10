#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   FINAL DEPLOYMENT SOLUTION          ${NC}"
echo -e "${BLUE}   Minimalist Approach                ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Ensure we have the required directories
mkdir -p lib app/api pages

# Function to check if a file exists and create it if it doesn't
ensure_file_exists() {
  local file=$1
  local content=$2
  
  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}Creating $file...${NC}"
    echo "$content" > "$file"
    echo -e "${GREEN}Created $file${NC}"
  else
    echo -e "${GREEN}$file already exists${NC}"
  fi
}

# Create a minimal polyfills file
POLYFILLS_CONTENT='// Minimal polyfills for server-side rendering
if (typeof global !== "undefined") {
  // Essential browser globals for Supabase and other libraries
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  
  // Basic navigator mock
  if (!global.navigator) {
    global.navigator = {
      userAgent: "Node.js",
      platform: process.platform,
    };
  }
  
  // Document mock with methods needed by styled-jsx
  if (!global.document) {
    global.document = {
      createElement: () => ({}),
      getElementsByTagName: () => [],
      querySelector: () => null,
      querySelectorAll: () => [],
      documentElement: { style: {} },
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {},
      createTextNode: () => ({}),
    };
  }
  
  // Constructors that might be used
  if (!global.HTMLElement) {
    global.HTMLElement = class HTMLElement {};
  }
  
  if (!global.CSSStyleSheet) {
    global.CSSStyleSheet = class CSSStyleSheet {};
  }
}
'
ensure_file_exists "lib/minimal-polyfills.js" "$POLYFILLS_CONTENT"

# Create a minimal entry point script
ENTRY_SCRIPT_CONTENT='// Load polyfills at startup
require("../lib/minimal-polyfills.js");

console.log("Polyfills loaded for Vercel environment");
'
ensure_file_exists "scripts/minimal-entry.js" "$ENTRY_SCRIPT_CONTENT"

# Create a health check API route
HEALTH_CHECK_CONTENT='import "../../lib/minimal-polyfills.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({
      status: "ok",
      time: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      mockDbEnabled: process.env.MOCK_DB === "true",
    }, { status: 200 });
  } catch (error) {
    return Response.json({
      status: "error",
      error: error.message,
    }, { status: 500 });
  }
}
'
ensure_file_exists "app/api/health-check/route.js" "$HEALTH_CHECK_CONTENT"

# Create a simple Next.js config
NEXT_CONFIG_CONTENT='/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: ["styled-jsx", "@supabase/supabase-js"],
  webpack: (config, { isServer }) => {
    // Load polyfills at the very start
    if (isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        // Add our polyfill directly
        if (entries["main.js"]) {
          entries["main.js"] = ["./scripts/minimal-entry.js", ...entries["main.js"]];
        }
        
        return entries;
      };
    }
    
    return config;
  },
};

export default nextConfig;
'
ensure_file_exists "next.config.mjs" "$NEXT_CONFIG_CONTENT"

# Create a Vercel config file
VERCEL_CONFIG_CONTENT='{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "MOCK_DB": "true",
    "NODE_OPTIONS": "--require ./scripts/minimal-entry.js"
  }
}
'
ensure_file_exists "vercel.json" "$VERCEL_CONFIG_CONTENT"

# Ensure .env.local has required values
ENV_CONTENT='MOCK_DB=true
'
ensure_file_exists ".env.local" "$ENV_CONTENT"

# Create minimal package.json scripts
update_package_json() {
  # Check if jq is installed
  if command -v jq >/dev/null 2>&1; then
    echo -e "${YELLOW}Updating package.json scripts...${NC}"
    
    # Read current package.json
    if [ -f package.json ]; then
      # Add our scripts
      jq '.scripts.deploy = "npx vercel --prod"' package.json > package.json.tmp
      jq '.scripts.build = "NODE_OPTIONS=\"--require ./scripts/minimal-entry.js\" next build"' package.json.tmp > package.json
      rm package.json.tmp
      echo -e "${GREEN}Updated package.json scripts${NC}"
    else
      echo -e "${RED}package.json not found${NC}"
    fi
  else
    echo -e "${YELLOW}jq not installed, skipping package.json update${NC}"
  fi
}

update_package_json

# Test the build locally
test_local_build() {
  echo -e "${YELLOW}Testing local Next.js build...${NC}"
  
  # Check if next is available directly or via npx
  NEXT_CMD="next"
  if ! command -v next >/dev/null 2>&1; then
    NEXT_CMD="npx next"
  fi
  
  # Set environment for test build
  export MOCK_DB=true
  export NODE_OPTIONS="--require ./scripts/minimal-entry.js"
  
  # Run the build
  if $NEXT_CMD build; then
    echo -e "${GREEN}Local build successful!${NC}"
    return 0
  else
    echo -e "${RED}Local build failed. See errors above.${NC}"
    return 1
  fi
}

# Deploy to Vercel
deploy_to_vercel() {
  echo -e "${YELLOW}Deploying to Vercel...${NC}"
  
  # Check if Vercel CLI is installed
  if command -v vercel >/dev/null 2>&1; then
    VERCEL_CMD="vercel"
  else
    VERCEL_CMD="npx vercel"
  fi
  
  # Deploy with environment variables
  if MOCK_DB=true NODE_OPTIONS="--require ./scripts/minimal-entry.js" $VERCEL_CMD --prod; then
    echo -e "${GREEN}Deployment successful!${NC}"
    return 0
  else
    echo -e "${RED}Deployment failed. See errors above.${NC}"
    return 1
  fi
}

# Main execution flow
echo -e "${YELLOW}Starting deployment process...${NC}"

# Test local build first
if test_local_build; then
  echo -e "${GREEN}Local build passed. Proceeding with deployment...${NC}"
  deploy_to_vercel
else
  read -p "Local build failed. Do you want to attempt deployment anyway? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    deploy_to_vercel
  else
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
  fi
fi

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   DEPLOYMENT PROCESS COMPLETE        ${NC}"
echo -e "${BLUE}=======================================${NC}" 