#!/usr/bin/env node

/**
 * Pre-build Check Script
 * Verifies all necessary configurations before building the application
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: s => s, red: s => s, yellow: s => s, blue: s => s };

console.log(chalk.blue('=================================================='));
console.log(chalk.blue('Pre-build Check Script'));
console.log(chalk.blue('=================================================='));

let issues = [];
let warnings = [];

// Check if required directories exist
const requiredDirs = ['app', 'lib', 'components', 'hooks'];
console.log('Checking required directories...');
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    issues.push(`Missing directory: ${dir}`);
  }
});

// Check if mini-css-extract-plugin is installed
console.log('Checking required packages...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  if (!dependencies['mini-css-extract-plugin']) {
    issues.push('mini-css-extract-plugin is not installed');
  }
} catch (error) {
  issues.push('Could not read package.json');
}

// Check next.config.mjs
console.log('Checking next.config.mjs...');
try {
  const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
  
  if (!nextConfig.includes('MiniCssExtractPlugin')) {
    warnings.push('next.config.mjs does not explicitly use MiniCssExtractPlugin');
  }
  
  if (!nextConfig.includes('DefinePlugin') || !nextConfig.includes('global.self')) {
    issues.push('next.config.mjs does not properly handle self/window globals');
  }
} catch (error) {
  issues.push('Could not read next.config.mjs');
}

// Check for polyfills
console.log('Checking polyfills...');
if (!fs.existsSync('lib/complete-polyfills.js')) {
  issues.push('Missing polyfills file: lib/complete-polyfills.js');
} else {
  const polyfills = fs.readFileSync('lib/complete-polyfills.js', 'utf8');
  if (!polyfills.includes('global.self = global')) {
    issues.push('Polyfills do not set global.self');
  }
}

// Check environment variables
console.log('Checking environment setup...');
if (!fs.existsSync('.env.local')) {
  warnings.push('Missing .env.local file');
} else {
  const env = fs.readFileSync('.env.local', 'utf8');
  if (!env.includes('ADMIN_USERNAME') || !env.includes('ADMIN_PASSWORD')) {
    warnings.push('.env.local is missing admin credentials');
  }
}

// Check authentication setup
console.log('Checking authentication setup...');
if (!fs.existsSync('lib/auth.js')) {
  issues.push('Missing authentication module: lib/auth.js');
} else if (!fs.existsSync('app/admin/login/page.js')) {
  issues.push('Missing admin login page');
}

// Summary
console.log(chalk.blue('=================================================='));
if (issues.length > 0 || warnings.length > 0) {
  if (issues.length > 0) {
    console.log(chalk.red('Issues found:'));
    issues.forEach(issue => console.log(chalk.red(`- ${issue}`)));
  }
  
  if (warnings.length > 0) {
    console.log(chalk.yellow('Warnings:'));
    warnings.forEach(warning => console.log(chalk.yellow(`- ${warning}`)));
  }
  
  if (issues.length > 0) {
    console.log(chalk.red('Please fix these issues before building.'));
    process.exit(1);
  } else {
    console.log(chalk.yellow('You can proceed with the build, but consider addressing the warnings.'));
    process.exit(0);
  }
} else {
  console.log(chalk.green('All checks passed! Ready to build.'));
  process.exit(0);
} 