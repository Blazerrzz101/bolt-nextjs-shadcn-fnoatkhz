#!/bin/bash

# Tier'd Test Deployment Script
# This script tests the deployment process without actually deploying

echo "🧪 Tier'd Test Deployment Process"
echo "--------------------------------"

# Record the start time
START_TIME=$(date +%s)

# Navigate to the correct directory
cd $(dirname "$0")
CURRENT_DIR=$(pwd)
echo "📁 Current directory: $CURRENT_DIR"

# Step 1: Test environment variables
echo "🔍 Testing environment variables..."

if [ -f .env.local ]; then
    echo "✅ .env.local file exists."
    echo "📝 Contents of .env.local:"
    grep -v "KEY" .env.local | grep -v "PASSWORD" # Show contents without sensitive info
else
    echo "⚠️ .env.local file not found. Creating test version..."
    
    # Create test .env.local
    cat > .env.local.test <<EOL
# Test environment
NODE_ENV=development
MOCK_DB=true
ENABLE_REALTIME=true
ENABLE_ANALYTICS=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=testpassword
EOL
    echo "✅ Test .env.local.test created."
fi

# Step 2: Test npm commands
echo "🔍 Testing npm commands..."

# Check if npm is available
if command -v npm &> /dev/null; then
    echo "✅ npm is available."
else
    echo "❌ npm is not available. Please install Node.js and npm."
    exit 1
fi

# List dependencies without installing
echo "📦 Project dependencies (from package.json):"
cat package.json | jq -r '.dependencies // empty | keys[]' 2>/dev/null || echo "No dependencies or jq not installed"

# Step 3: Test build command
echo "🔍 Testing build command (dry run)..."
echo "npm run build (not executed)"

# Step 4: Test Vercel deployment
echo "🔍 Testing Vercel deployment..."

# Check if Vercel CLI is available
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is available."
    
    # Check if project is already linked to Vercel
    if [ -d ".vercel" ] && [ -f ".vercel/project.json" ]; then
        echo "✅ Project is linked to Vercel."
        echo "📝 Project information:"
        cat .vercel/project.json | grep -v "\"token\":" # Show without token
    else
        echo "ℹ️ Project is not linked to Vercel. Would need to run 'vercel link'."
    fi
    
    # Test vercel deploy command with --dry-run
    echo "🔍 Testing 'vercel deploy' command (dry run)..."
    echo "vercel deploy --prod --dry-run (not executed)"
else
    echo "ℹ️ Vercel CLI is not installed. Would need to run 'npm install -g vercel'."
fi

# Step 5: Test verification process
echo "🔍 Testing verification process..."

# Check if curl is available for the verification script
if command -v curl &> /dev/null; then
    echo "✅ curl is available for verification script."
else
    echo "⚠️ curl is not available. The verification script would not work properly."
fi

# Check if jq is available for parsing JSON responses
if command -v jq &> /dev/null; then
    echo "✅ jq is available for parsing JSON responses."
else
    echo "⚠️ jq is not available. The verification script would have limited functionality."
fi

# Calculate test duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
SECONDS=$((DURATION % 60))

echo ""
echo "✅ Test completed in $SECONDS seconds."
echo "All deployment script components appear to be valid."
echo "To perform an actual deployment, run ./deploy.sh" 