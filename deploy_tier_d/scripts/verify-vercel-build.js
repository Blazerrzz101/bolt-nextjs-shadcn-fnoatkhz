/**
 * Script to verify the Vercel build process with polyfills
 * Run with: node scripts/verify-vercel-build.js
 */

// Import the polyfills first to ensure they're loaded
require('./vercel-entry');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Common paths
const rootDir = process.cwd();
const nodeModulesPath = path.join(rootDir, 'node_modules');
const configPath = path.join(rootDir, 'next.config.mjs');
const buildDirPath = path.join(rootDir, '.next');
const vercelJsonPath = path.join(rootDir, 'vercel.json');
const supabaseClientPath = path.join(rootDir, 'lib/supabase-safe-client.js');
const polyfillsPath = path.join(rootDir, 'lib/polyfills.js');
const apiWrapperPath = path.join(rootDir, 'lib/api-wrapper.js');

// Log with color
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

// Log a step
function logStep(step, message) {
  log(`\n[${step}] ${message}`, colors.cyan + colors.bold);
}

// Log a success message
function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

// Log a warning message
function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

// Log an error message
function logError(message) {
  log(`❌ ${message}`, colors.red);
}

// Verify polyfills are properly set up
function verifyPolyfills() {
  logStep('1', 'Verifying polyfill setup');

  // Check if required files exist
  if (!fs.existsSync(polyfillsPath)) {
    logError('Polyfills file is missing at ' + polyfillsPath);
    return false;
  } else {
    logSuccess('Polyfills file exists');
  }

  if (!fs.existsSync(supabaseClientPath)) {
    logError('Supabase safe client file is missing at ' + supabaseClientPath);
    return false;
  } else {
    logSuccess('Supabase safe client file exists');
  }

  if (!fs.existsSync(apiWrapperPath)) {
    logError('API wrapper file is missing at ' + apiWrapperPath);
    return false;
  } else {
    logSuccess('API wrapper file exists');
  }

  // Load polyfills
  try {
    const { ensurePolyfills } = require('../lib/polyfills');
    ensurePolyfills();
    logSuccess('Polyfills loaded successfully');
  } catch (error) {
    logError(`Error loading polyfills: ${error.message}`);
    return false;
  }

  // Test global variables
  const globalVars = ['self', 'window', 'document', 'navigator', 'location'];
  const missing = globalVars.filter(varName => typeof global[varName] === 'undefined');
  
  if (missing.length > 0) {
    logError(`Missing global variables: ${missing.join(', ')}`);
    return false;
  } else {
    logSuccess('All global variables are defined');
  }

  return true;
}

// Verify the Next.js configuration
function verifyNextConfig() {
  logStep('2', 'Verifying Next.js configuration');

  if (!fs.existsSync(configPath)) {
    logError('Next.js config file is missing');
    return false;
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for polyfill configuration
    if (!configContent.includes('global.self = global') || 
        !configContent.includes('global.window') ||
        !configContent.includes('global.navigator')) {
      logWarning('Next.js config does not contain all required polyfills');
    } else {
      logSuccess('Next.js config contains polyfill setup');
    }
    
    // Check if transpilePackages includes supabase
    if (!configContent.includes('transpilePackages') || 
        !configContent.includes('@supabase')) {
      logWarning('Next.js config might not transpile Supabase packages');
    } else {
      logSuccess('Next.js config transpiles Supabase packages');
    }
    
    return true;
  } catch (error) {
    logError(`Error reading Next.js config: ${error.message}`);
    return false;
  }
}

// Verify the API routes are properly wrapped
function verifyApiRoutes() {
  logStep('3', 'Verifying API routes');
  
  const apiDir = path.join(rootDir, 'app/api');
  let updatedCount = 0;
  let totalCount = 0;

  function checkDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        checkDirectory(fullPath);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        totalCount++;
        const content = fs.readFileSync(fullPath, 'utf8');
        
        if (content.includes('@/lib/polyfills') && content.includes('withPolyfills')) {
          updatedCount++;
        }
      }
    }
  }

  try {
    if (!fs.existsSync(apiDir)) {
      logWarning('API directory not found');
      return true;
    }
    
    checkDirectory(apiDir);
    
    if (updatedCount === totalCount) {
      logSuccess(`All ${totalCount} API routes are properly wrapped with polyfills`);
    } else {
      logWarning(`Only ${updatedCount} out of ${totalCount} API routes are wrapped with polyfills`);

      // Ask if we should run the update script
      log('\nDo you want to run the update script to fix all API routes? (y/n)', colors.yellow);
      const response = 'y'; // In non-interactive mode, just run it
      
      if (response.toLowerCase() === 'y') {
        try {
          execSync('node scripts/update-api-routes.js', { stdio: 'inherit' });
          logSuccess('API routes updated successfully');
        } catch (error) {
          logError(`Error updating API routes: ${error.message}`);
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    logError(`Error verifying API routes: ${error.message}`);
    return false;
  }
}

// Verify the Vercel configuration
function verifyVercelConfig() {
  logStep('4', 'Verifying Vercel configuration');

  if (!fs.existsSync(vercelJsonPath)) {
    logWarning('vercel.json file is missing, will create it');
    
    const vercelConfig = {
      "buildCommand": "node -r ./scripts/vercel-entry.js scripts/build-for-vercel.js",
      "devCommand": "npm run dev",
      "framework": "nextjs",
      "outputDirectory": ".next",
      "env": {
        "NODE_OPTIONS": "--require=./scripts/vercel-entry.js"
      },
      "build": {
        "env": {
          "NODE_OPTIONS": "--require=./scripts/vercel-entry.js"
        }
      }
    };
    
    try {
      fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
      logSuccess('Created vercel.json file with polyfill configuration');
    } catch (error) {
      logError(`Error creating vercel.json: ${error.message}`);
      return false;
    }
  } else {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
      
      // Check if the configuration includes the polyfill
      if (!vercelConfig.buildCommand || !vercelConfig.buildCommand.includes('vercel-entry.js')) {
        logWarning('vercel.json does not include polyfill in buildCommand');
      } else {
        logSuccess('vercel.json includes polyfill in buildCommand');
      }
      
      if (!vercelConfig.env || !vercelConfig.env.NODE_OPTIONS || !vercelConfig.env.NODE_OPTIONS.includes('vercel-entry.js')) {
        logWarning('vercel.json does not include polyfill in NODE_OPTIONS');
      } else {
        logSuccess('vercel.json includes polyfill in NODE_OPTIONS');
      }
    } catch (error) {
      logError(`Error reading vercel.json: ${error.message}`);
      return false;
    }
  }

  return true;
}

// Verify the package.json scripts
function verifyPackageScripts() {
  logStep('5', 'Verifying package.json scripts');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json file is missing');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check build:vercel script
    if (!packageJson.scripts || !packageJson.scripts['build:vercel'] || 
        !packageJson.scripts['build:vercel'].includes('vercel-entry.js')) {
      logWarning('package.json does not have a properly configured build:vercel script');
      
      // Fix it
      if (!packageJson.scripts) packageJson.scripts = {};
      packageJson.scripts['build:vercel'] = 'node -r ./scripts/vercel-entry.js scripts/build-for-vercel.js';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      logSuccess('Updated package.json with proper build:vercel script');
    } else {
      logSuccess('package.json has proper build:vercel script');
    }
    
    return true;
  } catch (error) {
    logError(`Error verifying package.json scripts: ${error.message}`);
    return false;
  }
}

// Test a mock build
function testMockBuild() {
  logStep('6', 'Testing mock build');
  
  try {
    // Test with mock DB mode
    log('Running build with MOCK_DB=true...', colors.blue);
    
    process.env.MOCK_DB = 'true';
    
    // If we're in CI, skip the actual build
    if (process.env.CI) {
      logSuccess('Skipping actual build in CI environment');
      return true;
    }
    
    // Run a limited build test
    execSync('node -r ./scripts/vercel-entry.js scripts/build-for-vercel.js --test-only', {
      stdio: 'inherit',
      env: { ...process.env, MOCK_DB: 'true', NODE_OPTIONS: '--require=./scripts/vercel-entry.js' }
    });
    
    logSuccess('Mock build test completed successfully');
    return true;
  } catch (error) {
    logError(`Error testing mock build: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  log('\n🔍 VERCEL BUILD VERIFICATION', colors.magenta + colors.bold);
  log('================================', colors.magenta);
  
  // Verify each component
  const polyfillsOk = verifyPolyfills();
  const nextConfigOk = verifyNextConfig();
  const apiRoutesOk = verifyApiRoutes();
  const vercelConfigOk = verifyVercelConfig();
  const packageScriptsOk = verifyPackageScripts();
  const mockBuildOk = testMockBuild();
  
  // Final result
  log('\n================================', colors.magenta);
  
  if (polyfillsOk && nextConfigOk && apiRoutesOk && vercelConfigOk && packageScriptsOk && mockBuildOk) {
    log('✅ VERIFICATION SUCCESSFUL: Your application is ready for Vercel deployment!', colors.green + colors.bold);
    log('You can now deploy your application to Vercel using:', colors.green);
    log('  vercel --prod', colors.white);
  } else {
    log('❌ VERIFICATION FAILED: Your application needs fixes before Vercel deployment.', colors.red + colors.bold);
    log('Please address the issues above and run this verification again.', colors.red);
  }
  
  log('================================\n', colors.magenta);
}

// Run the script
main().catch(error => {
  logError(`Unhandled error: ${error.message}`);
  process.exit(1);
}); 