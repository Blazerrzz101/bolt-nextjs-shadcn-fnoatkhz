/**
 * Script to fix the API routes after the update script broke them
 * Run with: node scripts/fix-api-routes.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Paths
const APP_DIR = path.resolve(process.cwd(), 'app');
const API_DIR = path.resolve(APP_DIR, 'api');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Log with color
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Process a file to fix the syntax errors
 */
async function fixApiFile(filePath) {
  log(`Processing ${filePath}...`, colors.blue);
  
  // Read file content
  const content = await readFile(filePath, 'utf8');
  
  // Skip if already properly fixed
  if (!content.includes('withPolyfills') || !content.includes('withStaticBuildHandler')) {
    log(`  No polyfill wrappers found, skipping.`, colors.yellow);
    return false;
  }
  
  // Common patterns to fix
  const brokenExportPattern = /export const (GET|POST|PUT|DELETE) = withPolyfills\(\s*withStaticBuildHandler\((async function|function|const) \)/g;
  const fixedExportPattern = 'export const $1 = withPolyfills(\n  withStaticBuildHandler(async (request) =>';
  
  // Fix broken interface patterns
  const brokenInterfacePattern = /}\s*\)\s*\)\s*;/g;
  
  // Apply fixes
  let fixedContent = content
    // Fix the export pattern
    .replace(brokenExportPattern, fixedExportPattern)
    // Fix TypeScript interfaces
    .replace(/export (type|interface) ([a-zA-Z]+)[\s\n]*{([^}]+)}\s*\)\s*\)\s*;/g, 'export $1 $2 {\n$3}\n')
    // Fix dangling parentheses
    .replace(/}\s*\)\s*\)\s*;/g, '\n  });\n')
    // Fix broken function endings
    .replace(/}\s*\)\s*;/g, '\n  });\n')
    // Fix broken async function declarations
    .replace(/(async function|function) \)/g, 'async (request) =>')
    // Fix broken function syntax 
    .replace(/function \(/g, '(request) =>')
    // Fix double wrapper ends
    .replace(/\}\)\s*\n\s*\}\)\s*\n\s*\)\s*;/g, '  });\n')
    // Fix triple wrapper ends
    .replace(/\}\)\s*\n\s*\}\)\s*\n\s*\}\)\s*\n\s*\)\s*;/g, '  });\n');
  
  // Write the fixed content
  await writeFile(filePath, fixedContent);
  
  log(`  Fixed successfully.`, colors.green);
  return true;
}

/**
 * Recursively process all route.ts files in the api directory
 */
async function processDirectory(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  let fixedCount = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      fixedCount += await processDirectory(fullPath);
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      const isFixed = await fixApiFile(fullPath);
      if (isFixed) fixedCount++;
    }
  }
  
  return fixedCount;
}

/**
 * Main function
 */
async function main() {
  log('Fixing API routes with broken polyfill wrappers...', colors.cyan);
  
  try {
    const fixedCount = await processDirectory(API_DIR);
    log(`Done! ${fixedCount} API routes fixed.`, colors.green);
  } catch (error) {
    console.error('Error fixing API routes:', error);
    process.exit(1);
  }
}

// Run the script
main(); 