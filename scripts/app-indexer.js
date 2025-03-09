#!/usr/bin/env node

/**
 * App Indexer
 * 
 * This script analyzes the app directory structure and creates a simple index file
 * that helps Vercel build the app correctly by resolving dependencies and imports.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}       Next.js App Directory Indexer    ${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}`);

// Set up paths
const appDir = path.join(process.cwd(), 'app');
const outputFile = path.join(process.cwd(), 'app-index.json');
const configFile = path.join(process.cwd(), 'next.config.mjs');

// Function to walk directory and collect files
function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && !file.startsWith('node_modules')) {
        fileList = walkDir(filePath, fileList);
      }
    } else {
      if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file)) && 
          !file.startsWith('.') && 
          !file.includes('.test.') && 
          !file.includes('.spec.')) {
        fileList.push(path.relative(process.cwd(), filePath));
      }
    }
  });
  
  return fileList;
}

// Check if app directory exists
if (!fs.existsSync(appDir)) {
  console.log(`${colors.red}Error: app directory not found!${colors.reset}`);
  process.exit(1);
}

// Collect all files
console.log(`${colors.cyan}Indexing app directory...${colors.reset}`);
const allFiles = walkDir(appDir);
console.log(`${colors.green}Found ${allFiles.length} files${colors.reset}`);

// Extract routes and API routes
const routes = allFiles.filter(file => 
  file.includes('/page.') || 
  file.includes('/layout.') || 
  file.includes('/route.')
);

// Generate app index file
const appIndex = {
  appDir: 'app',
  timestamp: new Date().toISOString(),
  totalFiles: allFiles.length,
  routes: routes.map(route => ({
    path: route,
    type: route.includes('/api/') ? 'api' : 'page',
    dynamicParams: route.includes('[') && route.includes(']')
  }))
};

// Write the file
fs.writeFileSync(outputFile, JSON.stringify(appIndex, null, 2));
console.log(`${colors.green}App index saved to ${outputFile}${colors.reset}`);

// Update next.config.mjs to mark all routes as dynamic if not already done
console.log(`${colors.cyan}Checking Next.js config file...${colors.reset}`);
if (fs.existsSync(configFile)) {
  const config = fs.readFileSync(configFile, 'utf8');
  
  if (!config.includes('dynamicParams: true')) {
    console.log(`${colors.yellow}Warning: dynamicParams not set to true in next.config.mjs${colors.reset}`);
    console.log(`${colors.yellow}You may want to add this configuration for better dynamic route handling.${colors.reset}`);
  }
}

// Generate a simplified sitemap file
const sitemapContent = routes
  .filter(route => !route.includes('/api/') && !route.includes('/_'))
  .map(route => {
    // Convert path like app/products/[id]/page.tsx to /products/:id
    let urlPath = route
      .replace('app/', '/')
      .replace(/\/page\.(tsx|jsx|ts|js)$/, '')
      .replace(/\/layout\.(tsx|jsx|ts|js)$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1');
    
    // Handle root page
    if (urlPath === '//') urlPath = '/';
    
    return { path: urlPath };
  });

fs.writeFileSync(
  path.join(process.cwd(), 'sitemap.json'), 
  JSON.stringify(sitemapContent, null, 2)
);
console.log(`${colors.green}Sitemap generated${colors.reset}`);

console.log(`${colors.blue}========================================${colors.reset}`);
console.log(`${colors.green}Indexing completed successfully!${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}`); 