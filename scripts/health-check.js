#!/usr/bin/env node

/**
 * Health Check Script
 * Verifies that the deployed application is working correctly by checking various endpoints
 */

const { fetch } = require('node-fetch');
const chalk = require('chalk') || { green: s => s, red: s => s, yellow: s => s, blue: s => s };

// Parse command line arguments
const args = process.argv.slice(2);
const baseUrl = args[0] || 'http://localhost:3000';

console.log(chalk.blue('=================================================='));
console.log(chalk.blue(`Health Check: ${baseUrl}`));
console.log(chalk.blue('=================================================='));

let failures = 0;

async function checkEndpoint(endpoint, description, expectedStatus = 200) {
  try {
    console.log(`Checking ${description}...`);
    const response = await fetch(`${baseUrl}${endpoint}`);
    
    if (response.status === expectedStatus) {
      console.log(chalk.green(`✓ ${description} is working (${response.status})`));
      return true;
    } else {
      console.log(chalk.red(`✗ ${description} returned status ${response.status}, expected ${expectedStatus}`));
      failures++;
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`✗ ${description} check failed: ${error.message}`));
    failures++;
    return false;
  }
}

async function checkApiEndpoint(endpoint, description, method = 'GET', body = null) {
  try {
    console.log(`Checking API: ${description}...`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.json();
    
    if (response.ok && data.success === true) {
      console.log(chalk.green(`✓ API ${description} is working (${response.status})`));
      return true;
    } else {
      console.log(chalk.red(`✗ API ${description} failed: ${data.error || 'Unknown error'}`));
      failures++;
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`✗ API ${description} check failed: ${error.message}`));
    failures++;
    return false;
  }
}

async function runHealthCheck() {
  try {
    // Check core pages
    await checkEndpoint('/', 'Home page');
    await checkEndpoint('/admin/login', 'Admin login page');
    
    // Check API endpoints
    await checkApiEndpoint('/api/health-check', 'Health check API');
    await checkApiEndpoint('/api/products', 'Products API');
    await checkApiEndpoint('/api/vote?productId=prod_1', 'Vote status API');
    await checkApiEndpoint('/api/reviews?productId=prod_1', 'Reviews API');
    
    // Try voting (should fail without clientId, but return 400 not 500)
    await checkApiEndpoint(
      '/api/vote', 
      'Vote API validation', 
      'POST', 
      { productId: 'prod_1', voteType: 1 }
    );
    
    // Try analytics (should give 401 without auth)
    await checkEndpoint('/api/analytics', 'Analytics API security', 401);
    
    // Summary
    console.log(chalk.blue('=================================================='));
    if (failures === 0) {
      console.log(chalk.green('All checks passed! The application is healthy.'));
    } else {
      console.log(chalk.red(`Health check completed with ${failures} failures.`));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error running health check:'), error);
    process.exit(1);
  }
}

// Run the health check
runHealthCheck(); 