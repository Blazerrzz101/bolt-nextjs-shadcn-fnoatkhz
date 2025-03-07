#!/usr/bin/env node

/**
 * Pre-build Check Script
 * 
 * This script performs checks before building the application to catch common issues
 * that might cause build failures or runtime errors.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

console.log(chalk.blue('='.repeat(50)));
console.log(chalk.blue('Pre-build Check Script'));
console.log(chalk.blue('='.repeat(50)));

const issues = [];

// Check if data directory exists and has the necessary files
function checkDataDirectory() {
  console.log('Checking data directory...');
  
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    console.log(chalk.yellow('Data directory not found, creating it...'));
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Check for votes.json
  const votesPath = path.join(dataDir, 'votes.json');
  if (!fs.existsSync(votesPath)) {
    console.log(chalk.yellow('votes.json not found, creating it...'));
    
    const initialVoteState = {
      votes: {},
      voteCounts: {
        "p1": { upvotes: 5, downvotes: 2 },
        "p2": { upvotes: 10, downvotes: 3 },
        "p3": { upvotes: 7, downvotes: 1 },
        "p4": { upvotes: 8, downvotes: 4 },
        "p5": { upvotes: 12, downvotes: 2 },
        "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6": { upvotes: 12, downvotes: 2 },
        "c8d9e0f1-2a3b-4c5d-6e7f-8g9h0i1j2k3l": { upvotes: 10, downvotes: 3 },
        "j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6": { upvotes: 5, downvotes: 2 },
        "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6": { upvotes: 8, downvotes: 4 },
        "9dd2bfe2-6eef-40de-ae12-c35ff1975914": { upvotes: 7, downvotes: 1 }
      },
      lastUpdated: new Date().toISOString(),
      userVotes: []
    };
    
    fs.writeFileSync(votesPath, JSON.stringify(initialVoteState, null, 2));
  }
  
  // Check for activities.json
  const activitiesPath = path.join(dataDir, 'activities.json');
  if (!fs.existsSync(activitiesPath)) {
    console.log(chalk.yellow('activities.json not found, creating it...'));
    
    const initialActivities = {
      activities: []
    };
    
    fs.writeFileSync(activitiesPath, JSON.stringify(initialActivities, null, 2));
  }
  
  console.log(chalk.green('Data directory check passed'));
}

// Check if CSS files exist
function checkCssFiles() {
  console.log('Checking CSS files...');
  
  const globalsCss = path.join(process.cwd(), 'app', 'globals.css');
  if (!fs.existsSync(globalsCss)) {
    issues.push(`globals.css not found at ${globalsCss}`);
  }
  
  const animationsCss = path.join(process.cwd(), 'styles', 'animations.css');
  if (!fs.existsSync(animationsCss)) {
    issues.push(`animations.css not found at ${animationsCss}`);
  }
  
  if (issues.length === 0) {
    console.log(chalk.green('CSS files check passed'));
  }
}

// Check next.config.mjs
function checkNextConfig() {
  console.log('Checking next.config.mjs...');
  
  const configPath = path.join(process.cwd(), 'next.config.mjs');
  if (!fs.existsSync(configPath)) {
    issues.push('next.config.mjs not found');
    return;
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Check for self/window handling
  if (!configContent.includes('self') || !configContent.includes('window')) {
    issues.push('next.config.mjs does not properly handle self/window globals');
  }
  
  // Check for CSS handling
  if (!configContent.includes('MiniCssExtractPlugin')) {
    console.log(chalk.yellow('Warning: next.config.mjs does not use MiniCssExtractPlugin'));
  }
  
  if (issues.length === 0) {
    console.log(chalk.green('next.config.mjs check passed'));
  }
}

// Check for required npm packages
function checkPackages() {
  console.log('Checking required packages...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    issues.push('package.json not found');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredPackages = [
    'next', 'react', 'react-dom', '@tanstack/react-query', 
    'mini-css-extract-plugin', 'vercel', 'uuid'
  ];
  
  const missingPackages = requiredPackages.filter(pkg => !allDeps[pkg]);
  if (missingPackages.length > 0) {
    issues.push(`Missing required packages: ${missingPackages.join(', ')}`);
  }
  
  if (issues.length === 0) {
    console.log(chalk.green('Package check passed'));
  }
}

// Run all checks
function runChecks() {
  try {
    checkDataDirectory();
    checkCssFiles();
    checkNextConfig();
    checkPackages();
    
    console.log(chalk.blue('='.repeat(50)));
    
    if (issues.length > 0) {
      console.log(chalk.yellow('Issues found:'));
      issues.forEach(issue => console.log(chalk.yellow(`- ${issue}`)));
      console.log(chalk.yellow('Please fix these issues before building.'));
      process.exit(1);
    } else {
      console.log(chalk.green('All pre-build checks passed!'));
      process.exit(0);
    }
  } catch (error) {
    console.error(chalk.red('Error running pre-build checks:'), error);
    process.exit(1);
  }
}

// Run the checks
runChecks(); 