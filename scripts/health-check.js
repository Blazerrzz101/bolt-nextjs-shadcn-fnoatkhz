#!/usr/bin/env node

/**
 * Comprehensive health check script for Tier'd application
 * 
 * This script tests all critical API endpoints and features to ensure they're working properly.
 * Run this script with: node scripts/health-check.js [baseUrl]
 * 
 * Default baseUrl is http://localhost:3000
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

// Configuration
const baseUrl = process.argv[2] || 'http://localhost:3000';
const testClientId = `health-check-${uuidv4().slice(0, 8)}`;
const testProductId = 'p1';

console.log(chalk.blue('='.repeat(50)));
console.log(chalk.blue(`Tier'd Health Check - ${new Date().toISOString()}`));
console.log(chalk.blue('='.repeat(50)));
console.log(`Base URL: ${baseUrl}`);
console.log(`Test Client ID: ${testClientId}`);
console.log();

// Keep track of test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  endpoints: {}
};

// Use dynamic import for node-fetch
async function fetchData(url, options = {}) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

async function testEndpoint(name, url, options = {}, validator = null) {
  console.log(chalk.yellow(`Testing: ${name}`));
  console.log(`  URL: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await fetchData(url, options);
    const responseTime = Date.now() - startTime;
    
    let data;
    let isJson = false;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      isJson = true;
    } else {
      data = await response.text();
    }
    
    let success = response.status >= 200 && response.status < 300;
    
    // If validator function is provided, use it to determine success
    if (validator && isJson) {
      const validatorResult = validator(data);
      success = success && validatorResult.success;
      
      if (!validatorResult.success) {
        console.log(chalk.red(`  Validation failed: ${validatorResult.message}`));
      }
    }
    
    const result = {
      status: response.status,
      responseTime,
      success,
      data: isJson ? JSON.stringify(data).slice(0, 100) + (JSON.stringify(data).length > 100 ? '...' : '') : '(non-JSON response)',
    };
    
    results.endpoints[name] = result;
    
    if (success) {
      results.passed++;
      console.log(chalk.green(`  Success: ${response.status} (${responseTime}ms)`));
    } else {
      results.failed++;
      console.log(chalk.red(`  Failed: ${response.status} (${responseTime}ms)`));
      console.log(chalk.red(`  Response: ${isJson ? JSON.stringify(data, null, 2) : data}`));
    }
  } catch (error) {
    results.failed++;
    results.endpoints[name] = {
      success: false,
      error: error.message
    };
    console.log(chalk.red(`  Error: ${error.message}`));
  }
  
  console.log();
}

async function runTests() {
  // 1. Test system status
  await testEndpoint(
    'System Status',
    `${baseUrl}/api/system-status`,
    {},
    (data) => ({ 
      success: data.status === 'healthy' && data.version && data.environment, 
      message: 'Missing expected fields in system status response' 
    })
  );
  
  // 2. Test health check endpoint
  await testEndpoint(
    'Health Check',
    `${baseUrl}/api/health-check`,
    {},
    (data) => ({ 
      success: data.status === 'ok', 
      message: 'Health check did not return ok status' 
    })
  );
  
  // 3. Test products API
  await testEndpoint(
    'Products List',
    `${baseUrl}/api/products`,
    {},
    (data) => ({ 
      success: Array.isArray(data) && data.length > 0, 
      message: 'Products API did not return an array or returned empty array' 
    })
  );
  
  // 4. Test product details API
  await testEndpoint(
    'Product Details',
    `${baseUrl}/api/products/product?id=${testProductId}&clientId=${testClientId}`,
    {},
    (data) => ({ 
      success: data.success && data.product && data.product.id === testProductId, 
      message: 'Product details API did not return expected product' 
    })
  );
  
  // 5. Test vote status API
  await testEndpoint(
    'Vote Status',
    `${baseUrl}/api/vote?productId=${testProductId}&clientId=${testClientId}`,
    {},
    (data) => ({ 
      success: data.productId === testProductId && typeof data.upvotes === 'number', 
      message: 'Vote status API did not return expected data' 
    })
  );
  
  // 6. Test remaining votes API
  await testEndpoint(
    'Remaining Votes',
    `${baseUrl}/api/vote/remaining-votes?clientId=${testClientId}`,
    {},
    (data) => ({ 
      success: data.success && typeof data.remainingVotes === 'number', 
      message: 'Remaining votes API did not return expected data' 
    })
  );
  
  // 7. Test vote submission API
  await testEndpoint(
    'Vote Submission',
    `${baseUrl}/api/vote`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: testProductId,
        voteType: 1,
        clientId: testClientId
      })
    },
    (data) => ({ 
      success: data.success && data.productId === testProductId, 
      message: 'Vote submission API did not return expected response' 
    })
  );
  
  // 8. Test activities API
  await testEndpoint(
    'User Activities',
    `${baseUrl}/api/activities?clientId=${testClientId}`,
    {},
    (data) => ({ 
      success: Array.isArray(data), 
      message: 'Activities API did not return an array' 
    })
  );
  
  // 9. Test notifications API
  await testEndpoint(
    'Notifications',
    `${baseUrl}/api/notifications?clientId=${testClientId}`,
    {},
    (data) => ({ 
      success: Array.isArray(data), 
      message: 'Notifications API did not return an array' 
    })
  );
  
  // 10. Test vote toggle (removing previous vote)
  // First, let's submit a vote
  await fetchData(`${baseUrl}/api/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: testProductId,
      voteType: -1, // Use downvote to be different from the previous test
      clientId: `${testClientId}-toggle`
    })
  });
  
  // Then test toggling it
  await testEndpoint(
    'Vote Toggle',
    `${baseUrl}/api/vote`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: testProductId,
        voteType: -1,  // Same vote type should toggle it off
        clientId: `${testClientId}-toggle`
      })
    },
    (data) => ({ 
      success: data.success && data.productId === testProductId, 
      message: 'Vote toggle API did not return expected response' 
    })
  );
  
  // Print summary
  console.log(chalk.blue('='.repeat(50)));
  console.log(chalk.blue('Test Summary'));
  console.log(chalk.blue('='.repeat(50)));
  console.log(`Total tests: ${results.passed + results.failed + results.skipped}`);
  console.log(`Passed: ${chalk.green(results.passed)}`);
  console.log(`Failed: ${chalk.red(results.failed)}`);
  console.log(`Skipped: ${chalk.yellow(results.skipped)}`);
  console.log();
  
  // Detailed results
  console.log(chalk.blue('Detailed Results:'));
  Object.entries(results.endpoints).forEach(([name, result]) => {
    if (result.success) {
      console.log(`${chalk.green('✓')} ${name}: Status ${result.status} (${result.responseTime}ms)`);
    } else {
      console.log(`${chalk.red('✗')} ${name}: ${result.error || `Status ${result.status}`}`);
    }
  });
  
  console.log();
  console.log(chalk.blue('='.repeat(50)));
  
  // Exit with appropriate code
  if (results.failed > 0) {
    console.log(chalk.red('Health check failed! Some tests did not pass.'));
    process.exit(1);
  } else {
    console.log(chalk.green('Health check passed! All systems operational.'));
    process.exit(0);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(chalk.red('Error running health check:'), error);
  process.exit(1);
}); 