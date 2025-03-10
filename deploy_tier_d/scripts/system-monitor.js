#!/usr/bin/env node

/**
 * System Monitor for Tier'd Application
 * 
 * This script continuously monitors the health of all system components,
 * verifies data integrity, and provides real-time status updates.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t, cyan: (t) => t };

// Configuration
const config = {
  // Base URL for API calls
  baseUrl: process.env.SYSTEM_MONITOR_URL || 'http://localhost:3000',
  // Monitoring interval in milliseconds
  interval: parseInt(process.env.SYSTEM_MONITOR_INTERVAL || '30000', 10),
  // Endpoints to monitor
  endpoints: [
    '/api/system-status',
    '/api/health-check',
    '/api/products',
    '/api/products/product?id=p1',
    '/api/vote?productId=p1&clientId=system-monitor',
    '/api/vote/remaining-votes?clientId=system-monitor',
    '/api/activities?clientId=system-monitor',
    '/api/notifications?clientId=system-monitor'
  ],
  // Data files to monitor
  dataFiles: [
    'data/votes.json',
    'data/activities.json',
    'data/notifications.json'
  ],
  // Voting test products
  testProducts: ['p1', 'p2', 'p3', 'p4', 'p5']
};

// Status tracking
const status = {
  lastCheck: new Date(),
  endpoints: {},
  dataFiles: {},
  voteTests: {},
  isRunning: true,
  errors: []
};

// Use dynamic import for node-fetch
async function fetchData(url, options = {}) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

// Format time difference
function formatTimeDiff(date1, date2) {
  const diff = Math.abs(date2 - date1);
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`;
  } else {
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

// Clear console and print header
function printHeader() {
  console.clear();
  console.log(chalk.blue('='.repeat(80)));
  console.log(chalk.blue(`Tier'd System Monitor - ${new Date().toISOString()}`));
  console.log(chalk.blue('='.repeat(80)));
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Monitoring interval: ${config.interval}ms`);
  console.log(`Last check: ${status.lastCheck.toISOString()} (${formatTimeDiff(status.lastCheck, new Date())})`);
  console.log();
}

// Check endpoints
async function checkEndpoints() {
  console.log(chalk.cyan('API Endpoints Status:'));
  
  for (const endpoint of config.endpoints) {
    const url = `${config.baseUrl}${endpoint}`;
    try {
      const startTime = Date.now();
      const response = await fetchData(url);
      const responseTime = Date.now() - startTime;
      
      const isOk = response.status >= 200 && response.status < 300;
      status.endpoints[endpoint] = {
        status: response.status,
        ok: isOk,
        responseTime,
        lastChecked: new Date()
      };
      
      console.log(`${isOk ? chalk.green('✓') : chalk.red('✗')} ${endpoint} - ${response.status} (${responseTime}ms)`);
    } catch (error) {
      status.endpoints[endpoint] = {
        status: 'Error',
        ok: false,
        error: error.message,
        lastChecked: new Date()
      };
      status.errors.push({
        type: 'Endpoint',
        endpoint,
        error: error.message,
        time: new Date()
      });
      console.log(`${chalk.red('✗')} ${endpoint} - Error: ${error.message}`);
    }
  }
  console.log();
}

// Check data files
function checkDataFiles() {
  console.log(chalk.cyan('Data Files Status:'));
  
  for (const file of config.dataFiles) {
    try {
      const filePath = path.join(process.cwd(), file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      let data;
      
      try {
        data = JSON.parse(content);
        status.dataFiles[file] = {
          exists: true,
          size: stats.size,
          valid: true,
          lastModified: stats.mtime,
          lastChecked: new Date()
        };
        console.log(`${chalk.green('✓')} ${file} - Valid (${Math.round(stats.size / 1024)} KB, modified ${formatTimeDiff(stats.mtime, new Date())})`);
      } catch (parseError) {
        status.dataFiles[file] = {
          exists: true,
          size: stats.size,
          valid: false,
          error: parseError.message,
          lastModified: stats.mtime,
          lastChecked: new Date()
        };
        status.errors.push({
          type: 'DataFile',
          file,
          error: parseError.message,
          time: new Date()
        });
        console.log(`${chalk.red('✗')} ${file} - Invalid JSON: ${parseError.message}`);
      }
    } catch (error) {
      status.dataFiles[file] = {
        exists: false,
        valid: false,
        error: error.message,
        lastChecked: new Date()
      };
      status.errors.push({
        type: 'DataFile',
        file,
        error: error.message,
        time: new Date()
      });
      console.log(`${chalk.red('✗')} ${file} - Error: ${error.message}`);
    }
  }
  console.log();
}

// Test vote functionality
async function testVoteFunctionality() {
  console.log(chalk.cyan('Vote Functionality Tests:'));
  
  const testProductId = config.testProducts[Math.floor(Math.random() * config.testProducts.length)];
  const clientId = `system-monitor-${Date.now()}`;
  
  try {
    // 1. Check vote status
    const statusUrl = `${config.baseUrl}/api/vote?productId=${testProductId}&clientId=${clientId}`;
    const statusResponse = await fetchData(statusUrl);
    const statusData = await statusResponse.json();
    
    if (!statusResponse.ok) {
      throw new Error(`Vote status check failed: ${statusResponse.status}`);
    }
    
    const initialUpvotes = statusData.upvotes || 0;
    const initialDownvotes = statusData.downvotes || 0;
    
    console.log(`${chalk.green('✓')} Initial vote status for ${testProductId}: ⬆️ ${initialUpvotes} ⬇️ ${initialDownvotes}`);
    
    // 2. Cast upvote
    const upvoteUrl = `${config.baseUrl}/api/vote`;
    const upvoteResponse = await fetchData(upvoteUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: testProductId,
        voteType: 1,
        clientId
      })
    });
    
    const upvoteData = await upvoteResponse.json();
    
    if (!upvoteResponse.ok || !upvoteData.success) {
      throw new Error(`Upvote failed: ${upvoteResponse.status}`);
    }
    
    console.log(`${chalk.green('✓')} Cast upvote: ⬆️ ${upvoteData.upvotes} ⬇️ ${upvoteData.downvotes}`);
    
    // 3. Toggle upvote (remove it)
    const toggleUrl = `${config.baseUrl}/api/vote`;
    const toggleResponse = await fetchData(toggleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: testProductId,
        voteType: 1,
        clientId
      })
    });
    
    const toggleData = await toggleResponse.json();
    
    if (!toggleResponse.ok || !toggleData.success) {
      throw new Error(`Vote toggle failed: ${toggleResponse.status}`);
    }
    
    console.log(`${chalk.green('✓')} Toggle vote: ⬆️ ${toggleData.upvotes} ⬇️ ${toggleData.downvotes}`);
    
    status.voteTests[testProductId] = {
      success: true,
      initialUpvotes,
      initialDownvotes,
      finalUpvotes: toggleData.upvotes,
      finalDownvotes: toggleData.downvotes,
      lastChecked: new Date()
    };
  } catch (error) {
    status.voteTests[testProductId] = {
      success: false,
      error: error.message,
      lastChecked: new Date()
    };
    status.errors.push({
      type: 'VoteTest',
      productId: testProductId,
      error: error.message,
      time: new Date()
    });
    console.log(`${chalk.red('✗')} Vote test for ${testProductId} failed: ${error.message}`);
  }
  console.log();
}

// Perform all checks
async function performChecks() {
  status.lastCheck = new Date();
  status.errors = [];
  
  printHeader();
  await checkEndpoints();
  checkDataFiles();
  await testVoteFunctionality();
  
  // Summary
  console.log(chalk.cyan('System Status Summary:'));
  
  const endpointResults = Object.values(status.endpoints);
  const endpointsOk = endpointResults.filter(e => e.ok).length;
  const endpointsTotal = endpointResults.length;
  
  const dataFilesResults = Object.values(status.dataFiles);
  const dataFilesOk = dataFilesResults.filter(f => f.valid).length;
  const dataFilesTotal = dataFilesResults.length;
  
  const voteTestsResults = Object.values(status.voteTests);
  const voteTestsOk = voteTestsResults.filter(t => t.success).length;
  const voteTestsTotal = voteTestsResults.length;
  
  console.log(`${endpointsOk === endpointsTotal ? chalk.green('✓') : chalk.red('✗')} API Endpoints: ${endpointsOk}/${endpointsTotal} OK`);
  console.log(`${dataFilesOk === dataFilesTotal ? chalk.green('✓') : chalk.red('✗')} Data Files: ${dataFilesOk}/${dataFilesTotal} Valid`);
  console.log(`${voteTestsOk === voteTestsTotal ? chalk.green('✓') : chalk.red('✗')} Vote Tests: ${voteTestsOk}/${voteTestsTotal} Successful`);
  
  const allOk = endpointsOk === endpointsTotal && dataFilesOk === dataFilesTotal && voteTestsOk === voteTestsTotal;
  console.log();
  console.log(`Overall System Status: ${allOk ? chalk.green('HEALTHY') : chalk.red('ISSUES DETECTED')}`);
  
  if (status.errors.length > 0) {
    console.log();
    console.log(chalk.red(`Errors (${status.errors.length}):`));
    status.errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.type}] ${error.time.toISOString()}: ${error.error}`);
    });
  }
  
  console.log();
  console.log(chalk.blue('='.repeat(80)));
  console.log(`Next check in ${config.interval / 1000} seconds...`);
}

// Main monitoring loop
function startMonitoring() {
  performChecks();
  
  const intervalId = setInterval(() => {
    if (status.isRunning) {
      performChecks();
    } else {
      clearInterval(intervalId);
      console.log(chalk.yellow('Monitoring stopped.'));
    }
  }, config.interval);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nGracefully shutting down...'));
    status.isRunning = false;
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });
}

// Run the monitor
startMonitoring(); 