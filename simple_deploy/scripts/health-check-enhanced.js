#!/usr/bin/env node

/**
 * Enhanced Health Check Script for Tier'd Application
 * 
 * This script checks the health of deployed API endpoints and provides
 * detailed diagnostics to help identify issues.
 * 
 * Usage:
 *   node scripts/health-check-enhanced.js [site-url]
 * 
 * If site-url is not provided, it will default to localhost:3000
 */

// Import required modules
const fetch = require('node-fetch').default;
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Terminal colors
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Get the base URL from command line arguments or default to localhost
const baseUrl = process.argv[2] || 'http://localhost:3000';
console.log(`${colors.blue}Running health check against: ${colors.magenta}${baseUrl}${colors.reset}\n`);

// Timeout for requests (ms)
const REQUEST_TIMEOUT = 10000;

/**
 * Fetch data from a URL with timeout
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} The JSON response or error
 */
async function fetchData(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  const startTime = performance.now();
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    const responseTime = Math.round(performance.now() - startTime);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Invalid JSON response' };
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data,
      responseTime,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      data: { error: error.name === 'AbortError' ? 'Request timeout' : error.message },
      responseTime: Math.round(performance.now() - startTime),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Test an endpoint and validate response
 * @param {string} name - The name of the endpoint
 * @param {string} url - The URL to test
 * @param {Object} options - Fetch options
 * @param {Function} validator - Optional validation function
 */
async function testEndpoint(name, url, options = {}, validator = null) {
  console.log(`${colors.blue}Testing endpoint: ${colors.cyan}${name}${colors.reset}`);
  console.log(`${colors.blue}URL: ${colors.cyan}${url}${colors.reset}`);
  
  try {
    const result = await fetchData(url, options);
    
    const responseTimeColor = result.responseTime < 500 ? colors.green : 
                             result.responseTime < 1000 ? colors.yellow : colors.red;
    
    console.log(`${colors.blue}Status: ${result.ok ? colors.green : colors.red}${result.status}${colors.reset}`);
    console.log(`${colors.blue}Response Time: ${responseTimeColor}${result.responseTime}ms${colors.reset}`);
    
    if (result.ok) {
      if (validator) {
        try {
          const validationResult = validator(result.data);
          if (validationResult === true) {
            console.log(`${colors.green}✓ Validation passed${colors.reset}`);
          } else {
            console.log(`${colors.red}✗ Validation failed: ${validationResult}${colors.reset}`);
          }
        } catch (error) {
          console.log(`${colors.red}✗ Validation error: ${error.message}${colors.reset}`);
        }
      } else {
        console.log(`${colors.green}✓ Request successful${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ Request failed${colors.reset}`);
      console.log(`${colors.red}Error: ${JSON.stringify(result.data)}${colors.reset}`);
    }
    
    // Log a sample of the response data
    console.log(`${colors.blue}Response data sample:${colors.reset}`);
    console.log(JSON.stringify(result.data, null, 2).substring(0, 500) + (JSON.stringify(result.data, null, 2).length > 500 ? '...' : ''));
  } catch (error) {
    console.log(`${colors.red}✗ Test error: ${error.message}${colors.reset}`);
  }
  
  console.log(''); // Empty line for spacing
}

/**
 * Create validation functions for different endpoint types
 */
const validators = {
  healthCheck: (data) => {
    if (!data.success) return 'Missing success flag';
    if (!data.status) return 'Missing status';
    if (data.status !== 'ok') return `Status is not ok: ${data.status}`;
    return true;
  },
  
  products: (data) => {
    if (!data.success) return 'Missing success flag';
    if (!data.data) return 'Missing data object';
    if (!Array.isArray(data.data.products)) return 'Products is not an array';
    if (data.data.products.length === 0) return 'No products returned';
    return true;
  },
  
  voteStatus: (data) => {
    if (!data.success) return 'Missing success flag';
    if (!data.data) return 'Missing data object';
    if (data.data.data.productId === undefined) return 'Missing productId';
    if (data.data.data.hasVoted === undefined) return 'Missing hasVoted flag';
    return true;
  },
  
  voteSubmit: (data) => {
    if (!data.success) return 'Missing success flag';
    if (!data.data) return 'Missing data object';
    if (!data.data.voteStatus) return 'Missing voteStatus';
    if (!data.data.product) return 'Missing product data';
    return true;
  },
};

/**
 * Run all health checks
 */
async function runTests() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    endpoints: []
  };
  
  console.log(`${colors.magenta}=== ENHANCED HEALTH CHECK STARTED ====${colors.reset}\n`);
  
  // 1. Health Check API
  await testEndpoint(
    'Health Check',
    `${baseUrl}/api/health-check`,
    {},
    validators.healthCheck
  );
  
  // 2. Products API
  await testEndpoint(
    'Products Listing',
    `${baseUrl}/api/products`,
    {},
    validators.products
  );
  
  // 3. Products API with category filter
  await testEndpoint(
    'Products with Category Filter',
    `${baseUrl}/api/products?category=1`,
    {},
    validators.products
  );
  
  // 4. Products API with sorting
  await testEndpoint(
    'Products with Sorting',
    `${baseUrl}/api/products?sort=popular`,
    {},
    validators.products
  );
  
  // 5. Vote Status Check API
  await testEndpoint(
    'Vote Status Check',
    `${baseUrl}/api/vote?productId=1&clientId=test-client`,
    {},
    validators.voteStatus
  );
  
  // 6. Vote Submit API
  await testEndpoint(
    'Vote Submit',
    `${baseUrl}/api/vote`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 1,
        voteType: 1,
        clientId: 'test-client'
      }),
    },
    validators.voteSubmit
  );
  
  // 7. Check for Polyfill Status
  await testEndpoint(
    'Polyfill Status',
    `${baseUrl}/api/polyfill-status`,
    {}
  );
  
  console.log(`${colors.magenta}=== ENHANCED HEALTH CHECK COMPLETED ====${colors.reset}\n`);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Health check failed with error: ${error.message}${colors.reset}`);
  process.exit(1);
}); 