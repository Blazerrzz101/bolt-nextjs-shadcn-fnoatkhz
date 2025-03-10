#!/bin/bash

# Master Fix Script for Tier'd Deployment
# This script applies all fixes suggested in the summary

echo "🚀 Tier'd Deployment Fix - Master Script"
echo "========================================"

# Check if we're in the right directory
if [ -d "fresh_tier_d" ]; then
  echo "📂 Found fresh_tier_d directory"
  TARGET_DIR="fresh_tier_d"
else
  echo "⚠️ Could not find fresh_tier_d directory in current location"
  echo "Using current directory as target"
  TARGET_DIR="."
fi

echo "📋 Target directory: $TARGET_DIR"

# Make scripts executable
chmod +x fix_critical_dependencies.sh
chmod +x install_shadcn.js

# Step 1: Apply critical dependency fixes
echo "🔧 Step 1: Fixing critical dependencies..."
./fix_critical_dependencies.sh

# Step 2: Update next.config.js to remove optimizeFonts
echo "🔧 Step 2: Updating Next.js configuration..."
cp fixed_next_config.js $TARGET_DIR/next.config.js
echo "✅ Updated next.config.js, removed optimizeFonts option"

# Step 3: Install shadcn/ui components
echo "🔧 Step 3: Installing shadcn/ui components..."
node install_shadcn.js $TARGET_DIR

# Step 4: Updating tsconfig.json to ensure paths are correct
echo "🔧 Step 4: Updating TypeScript configuration..."
cat > $TARGET_DIR/tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOL
echo "✅ Updated tsconfig.json with proper paths configuration"

# Step 5: Try to build and see if fixes worked
echo "🔧 Step 5: Attempting to build the application..."
cd $TARGET_DIR
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Build successful! All fixes have been applied correctly."
  echo ""
  echo "🚀 You can now deploy using:"
  echo "  cd $TARGET_DIR"
  echo "  npx vercel --prod"
else
  echo "⚠️ Build still has issues. Please check the error messages above."
  echo "Additional troubleshooting may be required."
  exit 1
fi 