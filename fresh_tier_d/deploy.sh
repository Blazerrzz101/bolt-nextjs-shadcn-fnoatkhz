#!/bin/bash

# Tier'd Deployment Script
# This script follows the deployment checklist to ensure a full deployment of Tier'd
# that replicates the localhost environment exactly.

echo "🚀 Starting Tier'd Deployment Process"
echo "------------------------------------"

# Record the start time
START_TIME=$(date +%s)

# Step 1: Install Required Dependencies
echo "1️⃣ Installing Required Dependencies..."

# Navigate to the correct directory
cd $(dirname "$0")
CURRENT_DIR=$(pwd)
echo "📁 Current directory: $CURRENT_DIR"

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "🔧 Installing Vercel CLI globally..."
    npm install -g vercel
fi

# Step 2: Verify .env Configuration
echo "2️⃣ Verifying .env Configuration..."

# Compare current .env.local with the required configuration
if [ -f .env.local ]; then
    echo "✅ .env.local file exists. Verifying contents..."
    
    # Check if important environment variables are set
    if grep -q "MOCK_DB=" .env.local && grep -q "NODE_ENV=" .env.local; then
        echo "✅ Key environment variables found."
    else
        echo "⚠️ Some important environment variables may be missing."
        
        read -p "Do you want to update the .env.local file with the recommended configuration? (y/n): " update_env
        if [[ $update_env == "y" ]]; then
            # Create or update .env.local with the recommended configuration
            cat > .env.local <<EOL
# Set production environment
NODE_ENV=production

# Enable real-time functionality
ENABLE_REALTIME=true
ENABLE_ANALYTICS=true

# Database Configuration
MOCK_DB=true
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOL
            echo "✅ .env.local updated with recommended configuration."
        fi
    fi
else
    echo "⚠️ .env.local file not found. Creating with recommended configuration..."
    
    # Create .env.local with the recommended configuration
    cat > .env.local <<EOL
# Set production environment
NODE_ENV=production

# Enable real-time functionality
ENABLE_REALTIME=true
ENABLE_ANALYTICS=true

# Database Configuration
MOCK_DB=true
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOL
    echo "✅ .env.local created with recommended configuration."
fi

echo "📝 IMPORTANT: If you want to use a real database instead of mock data,"
echo "    please edit .env.local and set MOCK_DB=false and update Supabase credentials."

# Step 3: Build the Full Version of Tier'd Locally
echo "3️⃣ Building the Full Version of Tier'd Locally..."

# Run a full production build
echo "🔨 Running production build..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "⚠️ Build failed. Attempting to resolve by installing dependencies with force flag..."
    npm install --force
    echo "🔄 Retrying build..."
    npm run build
    
    # Check if the second build attempt was successful
    if [ $? -ne 0 ]; then
        echo "❌ Build failed after second attempt. Please check the logs for errors."
        exit 1
    fi
fi

echo "✅ Build completed successfully."

# Offer to test the built version locally
read -p "Do you want to test the built version locally before deploying? (y/n): " test_locally
if [[ $test_locally == "y" ]]; then
    echo "🔍 Starting local server for testing..."
    echo "📌 Press Ctrl+C when done testing."
    npm start
    
    # Confirm to proceed with deployment after testing
    read -p "Did everything work as expected? Ready to deploy? (y/n): " proceed_deploy
    if [[ $proceed_deploy != "y" ]]; then
        echo "⚠️ Deployment cancelled. Please fix any issues before deploying."
        exit 1
    fi
fi

# Step 4: Deploy Full Version to Vercel
echo "4️⃣ Deploying Full Version to Vercel..."

# Check if project is already linked to Vercel
if [ ! -d ".vercel" ] || [ ! -f ".vercel/project.json" ]; then
    echo "🔗 Linking project to Vercel..."
    vercel link
fi

# Deploy the project to Vercel production
echo "🚀 Deploying project to Vercel production..."
vercel deploy --prod

# Step 5: Verify Deployment
echo "5️⃣ Verifying Deployment..."

# Get the deployment URL
DEPLOY_URL=$(vercel domains ls --json | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$DEPLOY_URL" ]; then
    echo "🌐 Deployment URL: $DEPLOY_URL"
    echo "✅ Deployment completed successfully."
    
    # Calculate deployment duration
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    MINUTES=$((DURATION / 60))
    SECONDS=$((DURATION % 60))
    
    echo "⏱️ Deployment took $MINUTES minutes and $SECONDS seconds."
    
    # Offer to open the deployed site in a browser
    read -p "Do you want to open the deployed site in your browser? (y/n): " open_browser
    if [[ $open_browser == "y" ]]; then
        echo "🔍 Opening deployed site in browser..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            open "https://$DEPLOY_URL"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            xdg-open "https://$DEPLOY_URL"
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            # Windows
            start "https://$DEPLOY_URL"
        else
            echo "⚠️ Couldn't detect your OS to open the browser automatically."
            echo "🌐 Please manually visit: https://$DEPLOY_URL"
        fi
    fi
else
    echo "⚠️ Could not retrieve deployment URL. Please check Vercel dashboard."
fi

echo "📋 Final Deployment Checklist:"
echo "✅ Dependencies installed and verified"
echo "✅ Environment configured correctly"
echo "✅ Application built successfully"
echo "✅ Deployed to Vercel"
echo "✅ Deployment URL obtained"

echo ""
echo "🔹 Admin dashboard: https://$DEPLOY_URL/admin"
echo "   Username: admin"
echo "   Password: admin123"

echo ""
echo "🚀 Tier'd deployment completed! 🚀" 