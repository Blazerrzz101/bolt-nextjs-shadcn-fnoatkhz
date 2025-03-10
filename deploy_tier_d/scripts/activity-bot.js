#!/usr/bin/env node

/**
 * Activity Bot for Tier'd Application
 * 
 * This script continuously simulates user activities like voting, browsing products,
 * checking votes, etc. to create realistic traffic patterns.
 */

const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t, magenta: (t) => t, cyan: (t) => t };

// Configuration
const config = {
  baseUrl: process.env.ACTIVITY_BOT_URL || 'http://localhost:3000',
  bots: parseInt(process.env.ACTIVITY_BOT_COUNT || '5', 10),
  activityInterval: parseInt(process.env.ACTIVITY_BOT_INTERVAL || '5000', 10), // ms between activities
  randomFactor: parseInt(process.env.ACTIVITY_BOT_RANDOM_FACTOR || '3000', 10), // +/- ms random variation
  testProducts: ['p1', 'p2', 'p3', 'p4', 'p5'],
  voteTypes: [1, -1],
  runTime: parseInt(process.env.ACTIVITY_BOT_RUNTIME || '0', 10) // 0 = run indefinitely
};

// Activity types
const ACTIVITIES = {
  CHECK_PRODUCT: 'check-product',
  VOTE: 'vote',
  TOGGLE_VOTE: 'toggle-vote',
  CHECK_VOTES_REMAINING: 'check-votes-remaining',
  CHECK_ACTIVITIES: 'check-activities',
  CHECK_NOTIFICATIONS: 'check-notifications',
  CHECK_MULTIPLE_PRODUCTS: 'check-multiple-products'
};

// Use dynamic import for node-fetch
async function fetchData(url, options = {}) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

// Bot class to simulate a user
class Bot {
  constructor(id) {
    this.id = id;
    this.clientId = `activity-bot-${uuidv4().slice(0, 8)}`;
    this.name = `Bot-${id}`;
    this.activitiesPerformed = 0;
    this.successfulActivities = 0;
    this.failedActivities = 0;
    this.lastActivity = null;
    this.lastActivityTime = null;
    this.productVotes = {}; // Keep track of products we've voted on
    this.isActive = true;
  }
  
  // Choose a random activity with weighted probabilities
  chooseActivity() {
    const weights = {
      [ACTIVITIES.CHECK_PRODUCT]: 30,
      [ACTIVITIES.VOTE]: 25,
      [ACTIVITIES.TOGGLE_VOTE]: 10,
      [ACTIVITIES.CHECK_VOTES_REMAINING]: 5,
      [ACTIVITIES.CHECK_ACTIVITIES]: 10,
      [ACTIVITIES.CHECK_NOTIFICATIONS]: 5,
      [ACTIVITIES.CHECK_MULTIPLE_PRODUCTS]: 15
    };
    
    // Special case - if we haven't voted on anything yet, don't toggle
    if (Object.keys(this.productVotes).length === 0) {
      weights[ACTIVITIES.TOGGLE_VOTE] = 0;
    }
    
    // Build weighted array for random selection
    const weightedActivities = [];
    Object.entries(weights).forEach(([activity, weight]) => {
      for (let i = 0; i < weight; i++) {
        weightedActivities.push(activity);
      }
    });
    
    return weightedActivities[Math.floor(Math.random() * weightedActivities.length)];
  }
  
  // Choose a random product ID
  chooseProduct() {
    return config.testProducts[Math.floor(Math.random() * config.testProducts.length)];
  }
  
  // Choose a product to toggle (one we've already voted on)
  chooseProductToToggle() {
    const votedProducts = Object.keys(this.productVotes);
    if (votedProducts.length === 0) return null;
    return votedProducts[Math.floor(Math.random() * votedProducts.length)];
  }
  
  // Perform a random activity
  async performActivity() {
    this.lastActivity = this.chooseActivity();
    this.lastActivityTime = new Date();
    
    try {
      switch (this.lastActivity) {
        case ACTIVITIES.CHECK_PRODUCT:
          await this.checkProduct();
          break;
        case ACTIVITIES.VOTE:
          await this.vote();
          break;
        case ACTIVITIES.TOGGLE_VOTE:
          await this.toggleVote();
          break;
        case ACTIVITIES.CHECK_VOTES_REMAINING:
          await this.checkVotesRemaining();
          break;
        case ACTIVITIES.CHECK_ACTIVITIES:
          await this.checkActivities();
          break;
        case ACTIVITIES.CHECK_NOTIFICATIONS:
          await this.checkNotifications();
          break;
        case ACTIVITIES.CHECK_MULTIPLE_PRODUCTS:
          await this.checkMultipleProducts();
          break;
      }
      
      this.activitiesPerformed++;
      this.successfulActivities++;
      return true;
    } catch (error) {
      this.activitiesPerformed++;
      this.failedActivities++;
      console.log(chalk.red(`${this.name} failed to ${this.lastActivity}: ${error.message}`));
      return false;
    }
  }
  
  // Check a single product
  async checkProduct() {
    const productId = this.chooseProduct();
    const url = `${config.baseUrl}/api/products/product?id=${productId}&clientId=${this.clientId}`;
    const response = await fetchData(url);
    
    if (!response.ok) {
      throw new Error(`Failed to check product ${productId}: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  }
  
  // Check multiple products (product listing)
  async checkMultipleProducts() {
    const url = `${config.baseUrl}/api/products`;
    const response = await fetchData(url);
    
    if (!response.ok) {
      throw new Error(`Failed to check products: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  }
  
  // Vote on a product
  async vote() {
    const productId = this.chooseProduct();
    const voteType = config.voteTypes[Math.floor(Math.random() * config.voteTypes.length)];
    
    const url = `${config.baseUrl}/api/vote`;
    const response = await fetchData(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        voteType,
        clientId: this.clientId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to vote on ${productId}: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Record our vote for later toggling
      this.productVotes[productId] = voteType;
    }
    
    return data;
  }
  
  // Toggle a vote (change or remove)
  async toggleVote() {
    const productId = this.chooseProductToToggle();
    
    if (!productId) {
      // If we haven't voted on anything yet, just vote on something
      return await this.vote();
    }
    
    const voteType = this.productVotes[productId];
    
    const url = `${config.baseUrl}/api/vote`;
    const response = await fetchData(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        voteType,
        clientId: this.clientId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to toggle vote on ${productId}: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Vote was successfully toggled, update our record
      if (data.voteType === null) {
        delete this.productVotes[productId];
      } else {
        this.productVotes[productId] = data.voteType;
      }
    }
    
    return data;
  }
  
  // Check remaining votes
  async checkVotesRemaining() {
    const url = `${config.baseUrl}/api/vote/remaining-votes?clientId=${this.clientId}`;
    const response = await fetchData(url);
    
    if (!response.ok) {
      throw new Error(`Failed to check remaining votes: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  }
  
  // Check user activities
  async checkActivities() {
    const url = `${config.baseUrl}/api/activities?clientId=${this.clientId}`;
    const response = await fetchData(url);
    
    if (!response.ok) {
      throw new Error(`Failed to check activities: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  }
  
  // Check notifications
  async checkNotifications() {
    const url = `${config.baseUrl}/api/notifications?clientId=${this.clientId}`;
    const response = await fetchData(url);
    
    if (!response.ok) {
      throw new Error(`Failed to check notifications: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  }
}

// Manager class to orchestrate multiple bots
class BotManager {
  constructor() {
    this.bots = [];
    this.startTime = null;
    this.totalActivities = 0;
    this.successfulActivities = 0;
    this.failedActivities = 0;
    this.isRunning = false;
  }
  
  // Initialize bots
  initialize() {
    for (let i = 1; i <= config.bots; i++) {
      this.bots.push(new Bot(i));
    }
    console.log(chalk.green(`Initialized ${this.bots.length} activity bots`));
  }
  
  // Start the bots
  start() {
    this.isRunning = true;
    this.startTime = new Date();
    
    console.log(chalk.green(`Starting ${this.bots.length} activity bots at ${this.startTime.toISOString()}`));
    
    this.bots.forEach(bot => {
      this.scheduleNextActivity(bot);
    });
    
    // Start the status updater
    this.startStatusUpdates();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nGracefully shutting down bots...'));
      this.isRunning = false;
      this.bots.forEach(bot => bot.isActive = false);
      setTimeout(() => {
        process.exit(0);
      }, 500);
    });
    
    // If runtime is specified, stop after that time
    if (config.runTime > 0) {
      setTimeout(() => {
        console.log(chalk.yellow(`\nReached configured runtime of ${config.runTime} ms. Shutting down...`));
        this.isRunning = false;
        this.bots.forEach(bot => bot.isActive = false);
        setTimeout(() => {
          this.printFinalStats();
          process.exit(0);
        }, 1000);
      }, config.runTime);
    }
  }
  
  // Schedule the next activity for a bot
  scheduleNextActivity(bot) {
    if (!this.isRunning || !bot.isActive) return;
    
    // Randomize the interval slightly to make traffic more realistic
    const randomVariation = Math.floor(Math.random() * config.randomFactor) - (config.randomFactor / 2);
    const interval = Math.max(100, config.activityInterval + randomVariation);
    
    setTimeout(async () => {
      const success = await bot.performActivity();
      this.totalActivities++;
      
      if (success) {
        this.successfulActivities++;
      } else {
        this.failedActivities++;
      }
      
      // Schedule the next activity
      this.scheduleNextActivity(bot);
    }, interval);
  }
  
  // Start periodic status updates
  startStatusUpdates() {
    const updateInterval = 5000; // Update every 5 seconds
    
    const update = () => {
      if (!this.isRunning) return;
      this.printStatus();
      setTimeout(update, updateInterval);
    };
    
    // Start updates
    setTimeout(update, updateInterval);
  }
  
  // Print current status
  printStatus() {
    if (!this.isRunning) return;
    
    const now = new Date();
    const runtime = now - this.startTime;
    const runtimeInSeconds = Math.round(runtime / 1000);
    
    const activitiesPerSecond = Math.round((this.totalActivities / runtimeInSeconds) * 100) / 100;
    
    // Clear console and print stats
    console.clear();
    console.log(chalk.blue('='.repeat(80)));
    console.log(chalk.blue(`Tier'd Activity Bot - Running`));
    console.log(chalk.blue('='.repeat(80)));
    console.log(`Started: ${this.startTime.toISOString()} (${Math.round(runtime / 1000)} seconds ago)`);
    console.log(`Bots: ${this.bots.length}`);
    console.log(`Activity Interval: ${config.activityInterval}ms ± ${config.randomFactor / 2}ms`);
    console.log();
    
    console.log(chalk.cyan('Activity Statistics:'));
    console.log(`Total Activities: ${this.totalActivities}`);
    console.log(`Successful: ${chalk.green(this.successfulActivities)} (${Math.round(this.successfulActivities / this.totalActivities * 100)}%)`);
    console.log(`Failed: ${chalk.red(this.failedActivities)} (${Math.round(this.failedActivities / this.totalActivities * 100)}%)`);
    console.log(`Activities Per Second: ${activitiesPerSecond}`);
    console.log();
    
    console.log(chalk.cyan('Bot Status:'));
    this.bots.forEach(bot => {
      const successRate = bot.activitiesPerformed > 0 
        ? Math.round(bot.successfulActivities / bot.activitiesPerformed * 100) 
        : 0;
      
      const lastActivityTime = bot.lastActivityTime 
        ? `${Math.round((now - bot.lastActivityTime) / 1000)}s ago` 
        : 'never';
      
      console.log(`${bot.name}: ${bot.activitiesPerformed} activities (${successRate}% success), last: ${bot.lastActivity || 'none'} ${lastActivityTime}`);
    });
    console.log();
    
    console.log(chalk.blue('='.repeat(80)));
    console.log(`Press Ctrl+C to stop the bots`);
  }
  
  // Print final stats before exiting
  printFinalStats() {
    const now = new Date();
    const runtime = now - this.startTime;
    const runtimeInSeconds = Math.round(runtime / 1000);
    
    const activitiesPerSecond = Math.round((this.totalActivities / runtimeInSeconds) * 100) / 100;
    
    console.log(chalk.blue('='.repeat(80)));
    console.log(chalk.blue(`Tier'd Activity Bot - Final Report`));
    console.log(chalk.blue('='.repeat(80)));
    console.log(`Runtime: ${runtimeInSeconds} seconds`);
    console.log(`Bots: ${this.bots.length}`);
    console.log(`Total Activities: ${this.totalActivities}`);
    console.log(`Activities Per Second: ${activitiesPerSecond}`);
    console.log(`Success Rate: ${Math.round(this.successfulActivities / this.totalActivities * 100)}%`);
    console.log();
    
    const activityType = {};
    
    this.bots.forEach(bot => {
      const successRate = bot.activitiesPerformed > 0 
        ? Math.round(bot.successfulActivities / bot.activitiesPerformed * 100) 
        : 0;
      
      console.log(`${bot.name}: ${bot.activitiesPerformed} activities (${successRate}% success)`);
    });
    
    console.log(chalk.blue('='.repeat(80)));
  }
}

// Start the bot manager
const manager = new BotManager();
manager.initialize();
manager.start(); 