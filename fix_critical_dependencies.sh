#!/bin/bash

# Critical Dependency Fixes for Tier'd Deployment
# This script addresses specific dependency issues highlighted by recent errors

echo "🔧 Tier'd Critical Dependency Fix"
echo "================================="

# Check if we're in the right directory
if [ -f "package.json" ]; then
  echo "✅ Found package.json in current directory"
else
  # Try to find the fresh_tier_d directory
  if [ -d "fresh_tier_d" ]; then
    echo "📂 Found fresh_tier_d directory, changing to it"
    cd fresh_tier_d
  else
    echo "❌ Could not find package.json or fresh_tier_d directory"
    echo "Please run this script from the project root or fresh_tier_d directory"
    exit 1
  fi
fi

# 1. Install PostCSS properly
echo "📦 Installing PostCSS with exact version..."
npm install postcss@8.4.31 --save --legacy-peer-deps

# 2. Install other crucial dependencies
echo "📦 Installing critical dependencies with exact versions..."
npm install autoprefixer@10.4.16 framer-motion@10.16.4 sonner@1.2.0 --save --legacy-peer-deps

# 3. Clean up existing installation and reinstall
echo "🧹 Cleaning up node_modules and package-lock.json..."
rm -rf node_modules package-lock.json .next

echo "🧹 Cleaning npm cache..."
npm cache clean --force

# 4. Reinstall with legacy peer deps
echo "📦 Reinstalling all dependencies..."
npm install --force --legacy-peer-deps

# 5. Deduplicate dependencies
echo "🔍 Deduplicating dependencies to prevent conflicts..."
npm dedupe

# 6. Check for shadcn components and install if needed
if [ ! -d "components/ui" ]; then
  echo "🔍 shadcn/ui components not detected, creating basic components directory structure..."
  mkdir -p components/ui
fi

echo "✅ Dependencies have been fixed successfully!"
echo "🚀 Ready for next steps" 