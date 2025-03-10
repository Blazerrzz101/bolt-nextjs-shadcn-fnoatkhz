#!/bin/bash

# Complete Fix Script for Tier'd Deployment
# This script applies all fixes including dependency and file structure fixes

echo "🚀 Tier'd Complete Fix Script"
echo "==========================="

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
chmod +x fix_file_structure.sh

# Step 1: Apply critical dependency fixes
echo "🔧 Step 1: Fixing critical dependencies..."
./fix_critical_dependencies.sh

# Step 2: Update next.config.js to remove optimizeFonts
echo "🔧 Step 2: Updating Next.js configuration..."
cp fixed_next_config.js $TARGET_DIR/next.config.js
echo "✅ Updated next.config.js, removed optimizeFonts option"

# Step 3: Fix file structure issues
echo "🔧 Step 3: Fixing file structure issues..."
./fix_file_structure.sh

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
    "baseUrl": ".",
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

# Step 5: Fix .env.local configuration if needed
echo "🔧 Step 5: Checking .env.local configuration..."
if [ -f "$TARGET_DIR/.env.local" ]; then
  if grep -q "ADMIN_PASSWORD=REMOVED_EXPOSED_ADMIN_PASSWORDMOCK_DB=false" "$TARGET_DIR/.env.local"; then
    echo "⚠️ Found error in .env.local file, fixing..."
    sed -i -e 's/ADMIN_PASSWORD=REMOVED_EXPOSED_ADMIN_PASSWORDMOCK_DB=false/ADMIN_PASSWORD=REMOVED_EXPOSED_ADMIN_PASSWORD\n\n# This value is correctly set above\n# MOCK_DB=false/' "$TARGET_DIR/.env.local"
    echo "✅ Fixed .env.local file"
  else
    echo "✅ .env.local file looks good"
  fi
else
  echo "⚠️ .env.local file not found, creating..."
  cat > "$TARGET_DIR/.env.local" << 'EOL'
# Set production environment
NODE_ENV=production
ENABLE_REALTIME=true
ENABLE_ANALYTICS=true

# Database Configuration
MOCK_DB=true
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Public Settings
NEXT_PUBLIC_SITE_URL=https://tierd.vercel.app
DEPLOY_ENV=production

# Feature Flags
NEXT_PUBLIC_ENABLE_VOTES=true
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_DISCUSSIONS=true
NEXT_PUBLIC_MAX_VOTES_PER_DAY=10

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=REMOVED_EXPOSED_ADMIN_PASSWORD
EOL
  echo "✅ Created .env.local file with proper configuration"
fi

# Step 6: Check package.json and ensure no duplicate dependencies
echo "🔧 Step 6: Cleaning up package.json..."
if [ -f "$TARGET_DIR/package.json" ]; then
  # Use node to clean up package.json
  node -e '
    const fs = require("fs");
    const packagePath = process.argv[1];
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    
    // Move devDependencies to dependencies if they exist in both
    if (pkg.devDependencies) {
      Object.keys(pkg.devDependencies).forEach(dep => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
          console.log(`Found duplicate dependency: ${dep}, removing from devDependencies`);
          delete pkg.devDependencies[dep];
        }
      });
    }
    
    // Ensure specific versions for critical dependencies
    if (pkg.dependencies) {
      pkg.dependencies.postcss = "^8.4.31";
      pkg.dependencies["framer-motion"] = "^10.16.4";
      pkg.dependencies.sonner = "^1.2.0";
      pkg.dependencies.autoprefixer = "^10.4.16";
    }
    
    // Add the build:vercel script if missing
    if (!pkg.scripts["build:vercel"]) {
      pkg.scripts["build:vercel"] = "next build";
    }
    
    // Remove any duplicate next values
    if (pkg.dependencies && pkg.dependencies.next) {
      // Ensure a stable version
      pkg.dependencies.next = "^14.0.1";
    }
    
    // Write the cleaned package.json
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    console.log("✅ package.json cleaned successfully");
  ' "$TARGET_DIR/package.json"
else
  echo "⚠️ package.json not found in $TARGET_DIR"
fi

# Step 7: Try to build and see if fixes worked
echo "🔧 Step 7: Attempting to build the application..."
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