/**
 * Script to update all API routes with polyfill wrappers
 * Run with: node scripts/update-api-routes.js
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

// Regular expressions for matching and replacing
const exportRegex = /export (async function|function|const) (GET|POST|PUT|DELETE)[\s\n]*\(/g;
const importRegex = /^import\s+.*from\s+['"].*['"]/gm;

const POLYFILL_IMPORT = `// Import polyfills first
import '@/lib/polyfills';`;

const WRAPPER_IMPORT = `import { 
  withPolyfills, 
  withStaticBuildHandler,
  createSuccessResponse,
  createErrorResponse,
  isMockMode
} from '@/lib/api-wrapper';`;

/**
 * Process a file to add polyfill imports and wrappers
 */
async function processApiFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  const content = await readFile(filePath, 'utf8');
  
  // Skip if already using polyfills
  if (content.includes('@/lib/polyfills') || content.includes('withPolyfills')) {
    console.log(`  Already has polyfills, skipping.`);
    return false;
  }
  
  // Add imports if not already present
  let newContent = content;
  
  // Add polyfill import at the top
  if (!newContent.includes('@/lib/polyfills')) {
    newContent = `${POLYFILL_IMPORT}\n\n${newContent}`;
  }
  
  // Add wrapper import after other imports
  const imports = newContent.match(importRegex) || [];
  const lastImportIndex = imports.length > 0 
    ? newContent.lastIndexOf(imports[imports.length - 1]) + imports[imports.length - 1].length
    : 0;
  
  if (!newContent.includes('withPolyfills')) {
    const beforeImports = newContent.substring(0, lastImportIndex);
    const afterImports = newContent.substring(lastImportIndex);
    newContent = `${beforeImports}\n${WRAPPER_IMPORT}\n${afterImports}`;
  }
  
  // Replace export functions with wrapped versions
  newContent = newContent.replace(exportRegex, (match, funcType, method) => {
    return `export const ${method} = withPolyfills(\n  withStaticBuildHandler(${funcType} `;
  });
  
  // Fix function endings
  newContent = newContent.replace(/}\s*$/gm, '})\n);');
  
  // Write the updated content
  await writeFile(filePath, newContent);
  
  console.log(`  Updated successfully.`);
  return true;
}

/**
 * Recursively process all route.ts files in the api directory
 */
async function processDirectory(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  let modifiedCount = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      modifiedCount += await processDirectory(fullPath);
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      const isModified = await processApiFile(fullPath);
      if (isModified) modifiedCount++;
    }
  }
  
  return modifiedCount;
}

/**
 * Main function
 */
async function main() {
  console.log('Updating API routes with polyfill wrappers...');
  
  try {
    const modifiedCount = await processDirectory(API_DIR);
    console.log(`Done! ${modifiedCount} API routes updated.`);
  } catch (error) {
    console.error('Error updating API routes:', error);
    process.exit(1);
  }
}

// Run the script
main(); 