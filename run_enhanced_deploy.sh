#!/bin/bash

# Tier'd Enhanced Deployment Script Wrapper
# This script runs the Node.js enhanced deployment script

echo "🚀 Starting Enhanced Tier'd Deployment Process"
echo "==============================================="

# Make sure Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Verify the enhanced_deploy.js script exists
if [ ! -f "enhanced_deploy.js" ]; then
    echo "❌ enhanced_deploy.js script not found in the current directory."
    exit 1
fi

# Check fresh_tier_d directory exists
if [ ! -d "fresh_tier_d" ]; then
    echo "❌ fresh_tier_d directory not found. Please make sure it exists before running this script."
    exit 1
fi

echo "✅ All prerequisites verified."
echo "📂 Found fresh_tier_d directory and enhanced_deploy.js script."

# Set Node.js memory limit to avoid issues with large projects
export NODE_OPTIONS="--max-old-space-size=4096"

# Run the enhanced deployment script
echo "🔧 Running the enhanced deployment script..."
node enhanced_deploy.js

# Check if the script executed successfully
if [ $? -eq 0 ]; then
    echo "✅ Enhanced deployment script completed successfully."
else
    echo "❌ Enhanced deployment script failed with error code $?."
    exit 1
fi

echo "✨ Tier'd deployment process completed!" 