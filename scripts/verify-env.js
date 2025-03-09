#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * This script checks and fixes environment variables required for the application.
 * It verifies Supabase configuration and other critical environment variables.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
console.log(`${colors.blue}    Environment Configuration Checker   ${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}`);

// Required environment variables
const requiredEnvVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    example: 'https://your-project.supabase.co',
    critical: true
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous API key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: true
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key for admin operations',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: false
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    description: 'Public URL of the website',
    example: 'https://your-app.vercel.app',
    critical: true,
    default: 'https://tierd-app.vercel.app'
  },
  {
    name: 'DEPLOY_ENV',
    description: 'Deployment environment (development, production)',
    example: 'production',
    critical: true,
    default: 'production'
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_VOTES',
    description: 'Enable voting functionality',
    example: 'true',
    critical: true,
    default: 'true'
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_REVIEWS',
    description: 'Enable reviews functionality',
    example: 'true',
    critical: false,
    default: 'true'
  },
  {
    name: 'NEXT_PUBLIC_ENABLE_DISCUSSIONS',
    description: 'Enable discussions functionality',
    example: 'true',
    critical: false,
    default: 'true'
  },
  {
    name: 'NEXT_PUBLIC_MAX_VOTES_PER_DAY',
    description: 'Maximum votes per day',
    example: '10',
    critical: true,
    default: '10'
  }
];

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths to environment files
const envPaths = {
  local: path.join(process.cwd(), '.env.local'),
  template: path.join(process.cwd(), '.env.template'),
  vercel: path.join(process.cwd(), 'vercel.json')
};

// Check if .env.local exists, if not try to create from template
if (!fs.existsSync(envPaths.local)) {
  console.log(`${colors.yellow}No .env.local file found.${colors.reset}`);
  
  if (fs.existsSync(envPaths.template)) {
    console.log(`${colors.blue}Creating from template...${colors.reset}`);
    fs.copyFileSync(envPaths.template, envPaths.local);
    console.log(`${colors.green}Created .env.local from template.${colors.reset}`);
  } else {
    console.log(`${colors.blue}Creating new .env.local file...${colors.reset}`);
    // Create empty file
    fs.writeFileSync(envPaths.local, '# Environment Variables\n\n');
    console.log(`${colors.green}Created empty .env.local file.${colors.reset}`);
  }
}

// Read current environment variables
let envContent = fs.readFileSync(envPaths.local, 'utf8');
let missingVars = [];
let updated = false;

// Check if vercel.json exists and read it
let vercelConfig = null;
if (fs.existsSync(envPaths.vercel)) {
  try {
    vercelConfig = JSON.parse(fs.readFileSync(envPaths.vercel, 'utf8'));
    console.log(`${colors.green}Found vercel.json configuration.${colors.reset}`);
  } catch (err) {
    console.log(`${colors.red}Error parsing vercel.json: ${err.message}${colors.reset}`);
  }
}

// Check each required environment variable
console.log(`\n${colors.blue}Checking environment variables...${colors.reset}`);
requiredEnvVars.forEach(envVar => {
  // Check if variable exists in .env.local
  const regex = new RegExp(`^${envVar.name}=(.*)$`, 'm');
  const match = envContent.match(regex);
  
  if (!match) {
    missingVars.push(envVar);
    console.log(`${colors.red}❌ Missing: ${envVar.name}${envVar.critical ? ' (CRITICAL)' : ''}${colors.reset}`);
  } else {
    const value = match[1].trim();
    if (!value) {
      missingVars.push(envVar);
      console.log(`${colors.red}❌ Empty value: ${envVar.name}${envVar.critical ? ' (CRITICAL)' : ''}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Found: ${envVar.name}${colors.reset}`);
    }
  }
});

// Function to prompt for missing environment variables
function promptForMissingVars() {
  if (missingVars.length === 0) {
    console.log(`\n${colors.green}All required environment variables are set.${colors.reset}`);
    finishCheck();
    return;
  }

  const envVar = missingVars[0];
  missingVars = missingVars.slice(1);

  console.log(`\n${colors.yellow}Variable: ${envVar.name}${colors.reset}`);
  console.log(`${colors.cyan}Description: ${envVar.description}${colors.reset}`);
  console.log(`${colors.cyan}Example: ${envVar.example}${colors.reset}`);
  
  if (envVar.default) {
    rl.question(`Enter value (press Enter for default "${envVar.default}"): `, (answer) => {
      const value = answer.trim() || envVar.default;
      updateEnvVar(envVar.name, value);
      promptForMissingVars();
    });
  } else {
    rl.question('Enter value: ', (answer) => {
      if (!answer.trim() && envVar.critical) {
        console.log(`${colors.red}This is a critical variable and cannot be empty. Please provide a value.${colors.reset}`);
        missingVars.unshift(envVar); // Put it back at the front of the queue
        promptForMissingVars();
      } else {
        updateEnvVar(envVar.name, answer.trim());
        promptForMissingVars();
      }
    });
  }
}

// Function to update environment variable in .env.local and vercel.json
function updateEnvVar(name, value) {
  if (!value) return;
  
  const regex = new RegExp(`^${name}=.*$`, 'm');
  if (envContent.match(regex)) {
    // Update existing variable
    envContent = envContent.replace(regex, `${name}=${value}`);
  } else {
    // Add new variable
    envContent += `\n${name}=${value}`;
  }
  
  // Update vercel.json if it exists
  if (vercelConfig && vercelConfig.env) {
    vercelConfig.env[name] = value;
  }
  
  updated = true;
  console.log(`${colors.green}✅ Updated: ${name}${colors.reset}`);
}

// Function to finish the check and save files
function finishCheck() {
  if (updated) {
    // Save .env.local
    fs.writeFileSync(envPaths.local, envContent);
    console.log(`${colors.green}✅ Saved .env.local${colors.reset}`);
    
    // Save vercel.json if it exists
    if (vercelConfig) {
      fs.writeFileSync(envPaths.vercel, JSON.stringify(vercelConfig, null, 2));
      console.log(`${colors.green}✅ Updated vercel.json with environment variables${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.green}Environment check completed${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);
  
  rl.close();
}

// Start the prompt for missing variables
promptForMissingVars(); 