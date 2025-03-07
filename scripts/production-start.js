#!/usr/bin/env node

/**
 * Production Start Script
 * 
 * This script runs pre-startup checks and ensures all necessary
 * data files and directories exist before starting the application.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

console.log(chalk.blue('='.repeat(50)));
console.log(chalk.blue('Tier\'d Production Startup'));
console.log(chalk.blue('='.repeat(50)));

// Ensure data directory and files exist
function ensureDataFiles() {
  console.log('Ensuring data files exist...');
  
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    console.log(chalk.yellow('Creating data directory...'));
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Check for votes.json
  const votesPath = path.join(dataDir, 'votes.json');
  if (!fs.existsSync(votesPath)) {
    console.log(chalk.yellow('Creating votes.json...'));
    
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
    console.log(chalk.yellow('Creating activities.json...'));
    
    const initialActivities = {
      activities: []
    };
    
    fs.writeFileSync(activitiesPath, JSON.stringify(initialActivities, null, 2));
  }
  
  // Check for notifications.json
  const notificationsPath = path.join(dataDir, 'notifications.json');
  if (!fs.existsSync(notificationsPath)) {
    console.log(chalk.yellow('Creating notifications.json...'));
    
    const initialNotifications = {
      notifications: []
    };
    
    fs.writeFileSync(notificationsPath, JSON.stringify(initialNotifications, null, 2));
  }
  
  console.log(chalk.green('All data files verified!'));
}

// Check for corrupted state files and repair if needed
function checkStateIntegrity() {
  console.log('Checking state integrity...');
  
  const votesPath = path.join(process.cwd(), 'data', 'votes.json');
  if (fs.existsSync(votesPath)) {
    try {
      const voteData = JSON.parse(fs.readFileSync(votesPath, 'utf8'));
      
      // Check if the structure is valid
      if (!voteData.votes || !voteData.voteCounts || !voteData.lastUpdated) {
        throw new Error('Invalid votes.json structure');
      }
      
      // Validate vote counts
      let valid = true;
      Object.entries(voteData.voteCounts).forEach(([productId, counts]) => {
        if (typeof counts.upvotes !== 'number' || typeof counts.downvotes !== 'number') {
          valid = false;
        }
      });
      
      if (!valid) {
        throw new Error('Invalid vote counts');
      }
      
      console.log(chalk.green('votes.json integrity verified'));
    } catch (error) {
      console.log(chalk.red(`Error in votes.json: ${error.message}`));
      console.log(chalk.yellow('Attempting to repair...'));
      
      // Create backup
      const backupPath = `${votesPath}.backup-${Date.now()}`;
      fs.copyFileSync(votesPath, backupPath);
      console.log(chalk.yellow(`Created backup at: ${backupPath}`));
      
      // Reset to initial state
      const initialVoteState = {
        votes: {},
        voteCounts: {
          "p1": { upvotes: 5, downvotes: 2 },
          "p2": { upvotes: 10, downvotes: 3 },
          "p3": { upvotes: 7, downvotes: 1 },
          "p4": { upvotes: 8, downvotes: 4 },
          "p5": { upvotes: 12, downvotes: 2 }
        },
        lastUpdated: new Date().toISOString(),
        userVotes: []
      };
      
      fs.writeFileSync(votesPath, JSON.stringify(initialVoteState, null, 2));
      console.log(chalk.green('votes.json repaired'));
    }
  }
}

// Run health check
function runHealthCheck() {
  console.log('Running health check...');
  
  return new Promise((resolve, reject) => {
    const healthCheck = spawn('node', ['scripts/health-check.js', 'http://localhost:3000']);
    
    healthCheck.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    healthCheck.stderr.on('data', (data) => {
      console.error(chalk.red(data.toString()));
    });
    
    healthCheck.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('Health check passed!'));
        resolve();
      } else {
        console.log(chalk.yellow('Health check failed with code ' + code + ', but continuing startup...'));
        resolve();
      }
    });
  });
}

// Start the server
function startServer() {
  console.log(chalk.blue('Starting server...'));
  
  const nextStart = spawn('next', ['start']);
  
  nextStart.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  nextStart.stderr.on('data', (data) => {
    console.error(chalk.red(data.toString()));
  });
  
  nextStart.on('close', (code) => {
    console.log(chalk.red(`Server exited with code ${code}`));
    process.exit(code);
  });
}

// Main function
async function main() {
  try {
    // Run pre-startup checks
    ensureDataFiles();
    checkStateIntegrity();
    
    // Start the server
    startServer();
    
    // Wait a moment for the server to start, then run health check
    console.log(chalk.yellow('Waiting for server to start before health check...'));
    setTimeout(() => {
      runHealthCheck().catch(err => {
        console.error(chalk.red('Error running health check:'), err);
      });
    }, 5000);
  } catch (error) {
    console.error(chalk.red('Error during startup:'), error);
    process.exit(1);
  }
}

// Run the main function
main(); 