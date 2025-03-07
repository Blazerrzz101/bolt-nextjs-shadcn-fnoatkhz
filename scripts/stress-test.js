#!/usr/bin/env node

/**
 * Stress Test for Tier'd Voting System
 * 
 * This script simulates multiple users voting simultaneously to test
 * the robustness and performance of the voting system.
 */

const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t, magenta: (t) => t };

// Configuration
const config = {
  baseUrl: process.env.STRESS_TEST_URL || 'http://localhost:3000',
  users: parseInt(process.env.STRESS_TEST_USERS || '50', 10),
  votesPerUser: parseInt(process.env.STRESS_TEST_VOTES_PER_USER || '10', 10),
  concurrentRequests: parseInt(process.env.STRESS_TEST_CONCURRENT_REQUESTS || '10', 10),
  testProducts: ['p1', 'p2', 'p3', 'p4', 'p5'],
  voteTypes: [1, -1],
  delayBetweenBatches: 500 // milliseconds
};

// Use dynamic import for node-fetch
async function fetchData(url, options = {}) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

// Generate test users
function generateUsers() {
  const users = [];
  for (let i = 0; i < config.users; i++) {
    users.push({
      clientId: `stress-test-${uuidv4().slice(0, 8)}`,
      votesPlanned: config.votesPerUser,
      votesCompleted: 0,
      votesFailed: 0,
      startTime: null,
      endTime: null
    });
  }
  return users;
}

// Generate vote tasks
function generateVoteTasks(users) {
  const tasks = [];
  
  users.forEach(user => {
    for (let i = 0; i < user.votesPlanned; i++) {
      const productId = config.testProducts[Math.floor(Math.random() * config.testProducts.length)];
      const voteType = config.voteTypes[Math.floor(Math.random() * config.voteTypes.length)];
      
      tasks.push({
        user,
        productId,
        voteType,
        completed: false,
        success: false,
        error: null,
        responseTime: null
      });
    }
  });
  
  return tasks;
}

// Process a batch of vote tasks concurrently
async function processBatch(tasks, startIndex, batchSize) {
  const batch = tasks.slice(startIndex, startIndex + batchSize);
  if (batch.length === 0) return 0;
  
  const promises = batch.map(task => processTask(task));
  await Promise.all(promises);
  
  return batch.length;
}

// Process a single vote task
async function processTask(task) {
  if (!task.user.startTime) {
    task.user.startTime = new Date();
  }
  
  const url = `${config.baseUrl}/api/vote`;
  const startTime = Date.now();
  
  try {
    const response = await fetchData(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: task.productId,
        voteType: task.voteType,
        clientId: task.user.clientId
      })
    });
    
    const data = await response.json();
    task.responseTime = Date.now() - startTime;
    
    if (response.ok && data.success) {
      task.completed = true;
      task.success = true;
      task.user.votesCompleted++;
    } else {
      task.completed = true;
      task.success = false;
      task.error = `API Error: ${data.error || response.status}`;
      task.user.votesFailed++;
    }
  } catch (error) {
    task.completed = true;
    task.success = false;
    task.error = error.message;
    task.user.votesFailed++;
    task.responseTime = Date.now() - startTime;
  }
  
  // If user completed all planned votes, set end time
  if (task.user.votesCompleted + task.user.votesFailed >= task.user.votesPlanned) {
    task.user.endTime = new Date();
  }
  
  return task;
}

// Print progress
function printProgress(tasks, startTime) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const successfulTasks = tasks.filter(t => t.success).length;
  const failedTasks = tasks.filter(t => t.completed && !t.success).length;
  const completedPercent = Math.round(completedTasks / totalTasks * 100);
  const elapsedMs = Date.now() - startTime;
  const elapsedSeconds = Math.round(elapsedMs / 1000);
  
  const responseTimes = tasks.filter(t => t.success).map(t => t.responseTime);
  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) 
    : 0;
  
  const tasksPerSecond = elapsedSeconds > 0 ? Math.round(completedTasks / elapsedSeconds) : 0;
  
  console.clear();
  console.log(chalk.blue('='.repeat(80)));
  console.log(chalk.blue(`Tier'd Voting System Stress Test - ${new Date().toISOString()}`));
  console.log(chalk.blue('='.repeat(80)));
  console.log(`Configuration:`);
  console.log(`- Base URL: ${config.baseUrl}`);
  console.log(`- Simulated Users: ${config.users}`);
  console.log(`- Votes Per User: ${config.votesPerUser}`);
  console.log(`- Concurrent Requests: ${config.concurrentRequests}`);
  console.log();
  
  // Progress bar
  const progressBarWidth = 50;
  const filledBarWidth = Math.round(completedPercent / 100 * progressBarWidth);
  const emptyBarWidth = progressBarWidth - filledBarWidth;
  const progressBar = '[' + '='.repeat(filledBarWidth) + ' '.repeat(emptyBarWidth) + ']';
  
  console.log(`Progress: ${progressBar} ${completedPercent}%`);
  console.log();
  console.log(`Total Votes: ${totalTasks}`);
  console.log(`Completed: ${chalk.green(successfulTasks)} successful, ${chalk.red(failedTasks)} failed, ${totalTasks - completedTasks} pending`);
  console.log(`Elapsed Time: ${elapsedSeconds} seconds`);
  console.log(`Average Response Time: ${avgResponseTime} ms`);
  console.log(`Throughput: ${tasksPerSecond} votes/second`);
  
  if (failedTasks > 0) {
    console.log();
    console.log(chalk.red(`Errors (showing up to 5):`));
    const errors = tasks.filter(t => t.completed && !t.success).slice(0, 5);
    errors.forEach((task, index) => {
      console.log(`${index + 1}. User ${task.user.clientId}, Product ${task.productId}: ${task.error}`);
    });
  }
  
  if (completedTasks === totalTasks) {
    console.log();
    console.log(chalk.green(`Test completed!`));
    
    // User statistics
    const users = [...new Set(tasks.map(t => t.user))];
    const userDurations = users
      .filter(u => u.startTime && u.endTime)
      .map(u => u.endTime - u.startTime);
    
    const avgUserDuration = userDurations.length > 0 
      ? Math.round(userDurations.reduce((sum, dur) => sum + dur, 0) / userDurations.length) 
      : 0;
    
    console.log(`Average Time Per User: ${Math.round(avgUserDuration / 1000)} seconds`);
    console.log(`Test Duration: ${elapsedSeconds} seconds`);
  }
}

// Run the stress test
async function runStressTest() {
  console.log(chalk.blue('='.repeat(80)));
  console.log(chalk.blue(`Starting Tier'd Voting System Stress Test`));
  console.log(chalk.blue('='.repeat(80)));
  console.log(`Generating ${config.users} users with ${config.votesPerUser} votes each...`);
  
  const users = generateUsers();
  const tasks = generateVoteTasks(users);
  const totalTasks = tasks.length;
  
  console.log(`Generated ${totalTasks} vote tasks.`);
  console.log(`Starting test with ${config.concurrentRequests} concurrent requests...`);
  console.log();
  
  const startTime = Date.now();
  
  let processedTasks = 0;
  while (processedTasks < totalTasks) {
    const processed = await processBatch(tasks, processedTasks, config.concurrentRequests);
    processedTasks += processed;
    
    printProgress(tasks, startTime);
    
    if (processedTasks < totalTasks) {
      await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
    }
  }
  
  const endTime = Date.now();
  const durationSeconds = Math.round((endTime - startTime) / 1000);
  
  console.log();
  console.log(chalk.blue('='.repeat(80)));
  console.log(chalk.blue(`Stress Test Completed`));
  console.log(chalk.blue('='.repeat(80)));
  console.log(`Total Votes: ${totalTasks}`);
  console.log(`Successful: ${tasks.filter(t => t.success).length}`);
  console.log(`Failed: ${tasks.filter(t => t.completed && !t.success).length}`);
  console.log(`Total Duration: ${durationSeconds} seconds`);
  console.log(`Throughput: ${Math.round(totalTasks / durationSeconds)} votes/second`);
  
  const avgResponseTime = Math.round(
    tasks.filter(t => t.success)
      .reduce((sum, task) => sum + task.responseTime, 0) / 
    tasks.filter(t => t.success).length
  );
  
  console.log(`Average Response Time: ${avgResponseTime} ms`);
  
  // Check for patterns in failures
  const failedTasks = tasks.filter(t => t.completed && !t.success);
  if (failedTasks.length > 0) {
    const errorCounts = {};
    failedTasks.forEach(task => {
      const errorMsg = task.error || 'Unknown error';
      errorCounts[errorMsg] = (errorCounts[errorMsg] || 0) + 1;
    });
    
    console.log();
    console.log(chalk.red(`Error Summary:`));
    Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([error, count]) => {
        console.log(`- ${error}: ${count} occurrences (${Math.round(count / failedTasks.length * 100)}%)`);
      });
  }
}

// Run the stress test
runStressTest().catch(error => {
  console.error(chalk.red(`Fatal error: ${error.message}`));
  process.exit(1);
}); 