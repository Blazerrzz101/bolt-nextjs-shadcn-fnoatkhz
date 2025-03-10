#!/bin/bash

# Comprehensive dependency fix script for Tier'd

echo "🔧 Tier'd Dependency Fix Script"
echo "------------------------------"

# Step 1: Install missing dependencies with exact versions
echo "📦 Installing critical dependencies with specific versions..."
npm install autoprefixer@10.4.16 framer-motion@10.16.4 sonner@1.2.0 --save --legacy-peer-deps

# Step 2: Update package.json to ensure these dependencies are listed
if ! grep -q '"autoprefixer"' package.json || ! grep -q '"framer-motion"' package.json || ! grep -q '"sonner"' package.json; then
  echo "📝 Updating package.json with missing dependencies..."
  
  # Create a temporary file with the updated dependencies
  node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    
    // Ensure dependencies object exists
    if (!pkg.dependencies) pkg.dependencies = {};
    
    // Add missing dependencies if they don't exist
    if (!pkg.dependencies.autoprefixer) pkg.dependencies.autoprefixer = "^10.4.16";
    if (!pkg.dependencies["framer-motion"]) pkg.dependencies["framer-motion"] = "^10.16.4";
    if (!pkg.dependencies.sonner) pkg.dependencies.sonner = "^1.2.0";
    
    // Write the updated package.json
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
    
    console.log("✅ package.json updated successfully");
  '
fi

# Step 3: Clean up node_modules and reinstall everything
echo "🧹 Cleaning up node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Step 4: Reinstall with legacy peer deps
echo "📦 Reinstalling all dependencies..."
npm install --force --legacy-peer-deps

# Step 5: Deduplicate dependencies
echo "🔍 Deduplicating dependencies to prevent conflicts..."
npm dedupe

echo "✅ Dependencies have been fixed successfully!"
echo "🚀 You can now proceed with the deployment process." 