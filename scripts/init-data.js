/**
 * Initialize data files for deployment
 * 
 * This script creates the necessary data files if they don't exist
 * Used during deployment to ensure data persistence works
 */

const fs = require('fs');
const path = require('path');

// Define paths
const DATA_DIR = path.resolve(process.cwd(), 'data');
const VOTES_FILE = path.resolve(DATA_DIR, 'votes.json');
const ACTIVITIES_FILE = path.resolve(DATA_DIR, 'activities.json');

try {
  console.log('Starting data initialization...');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    console.log('Creating data directory...');
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Initialize votes.json if it doesn't exist
  if (!fs.existsSync(VOTES_FILE)) {
    console.log('Initializing votes.json...');
    const initialVoteState = {
      votes: {},
      voteCounts: {},
      userVotes: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(VOTES_FILE, JSON.stringify(initialVoteState, null, 2));
  }

  // Initialize activities.json if it doesn't exist
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    console.log('Initializing activities.json...');
    const initialActivities = {
      activities: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(initialActivities, null, 2));
  }

  console.log('Data initialization completed!');
  process.exit(0); // Exit with success
} catch (error) {
  console.error('Error initializing data:', error);
  // Don't fail the build if this script has issues
  process.exit(0);
} 