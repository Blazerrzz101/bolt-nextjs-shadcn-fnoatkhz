#!/usr/bin/env node

/**
 * Fix Vote Counts Script
 * 
 * This script repairs inconsistencies between individual votes and vote counts
 * in the development mock data system. It's useful when:
 * - Vote counts get out of sync due to errors
 * - Data becomes corrupted during development
 * - Manual testing causes inconsistencies
 * 
 * Usage: node scripts/fix-votes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // For colorful console output

// Configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');

// Check if dry run is requested
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');

// Main function
async function fixVoteCounts() {
  console.log(chalk.blue('===================================='));
  console.log(chalk.blue('      Vote Count Repair Tool        '));
  console.log(chalk.blue('===================================='));
  
  if (DRY_RUN) {
    console.log(chalk.yellow('Running in DRY RUN mode - no changes will be saved'));
  }

  try {
    // Check if votes file exists
    if (!fs.existsSync(VOTES_FILE)) {
      console.log(chalk.red('Votes file not found. Nothing to repair.'));
      return;
    }

    // Read the votes file
    console.log(chalk.blue('Reading votes file...'));
    const rawData = fs.readFileSync(VOTES_FILE, 'utf8');
    const voteData = JSON.parse(rawData);

    // Validate structure
    if (!voteData.votes || !voteData.voteCounts) {
      console.log(chalk.red('Invalid vote data structure. Missing required properties.'));
      return;
    }

    // Count actual votes for each product
    console.log(chalk.blue('Analyzing votes...'));
    const actualCounts = {};
    let totalVotes = 0;

    // Iterate through votes (clientId:productId -> voteType)
    Object.entries(voteData.votes).forEach(([key, voteType]) => {
      // Extract product ID from the key (format: clientId:productId)
      const productId = key.split(':')[1];
      
      if (!productId) {
        console.log(chalk.yellow(`Found invalid vote key: ${key}`));
        return;
      }
      
      // Initialize count object if needed
      if (!actualCounts[productId]) {
        actualCounts[productId] = { upvotes: 0, downvotes: 0 };
      }
      
      // Count the vote based on type
      if (voteType === 1) {
        actualCounts[productId].upvotes++;
      } else if (voteType === -1) {
        actualCounts[productId].downvotes++;
      }
      
      totalVotes++;
    });

    console.log(chalk.green(`Found ${totalVotes} votes across ${Object.keys(actualCounts).length} products`));

    // Compare with stored counts and list inconsistencies
    let fixedProducts = 0;
    const inconsistencies = [];

    // Check each product
    Object.entries(actualCounts).forEach(([productId, counts]) => {
      const stored = voteData.voteCounts[productId] || { upvotes: 0, downvotes: 0 };
      const needsFix = 
        stored.upvotes !== counts.upvotes || 
        stored.downvotes !== counts.downvotes;
      
      if (needsFix) {
        inconsistencies.push({
          productId,
          stored: { ...stored },
          actual: { ...counts },
          difference: {
            upvotes: counts.upvotes - (stored.upvotes || 0),
            downvotes: counts.downvotes - (stored.downvotes || 0)
          }
        });
        
        // Update the vote counts if not in dry run mode
        if (!DRY_RUN) {
          voteData.voteCounts[productId] = { ...counts };
        }
        
        fixedProducts++;
      }
    });

    // Add missing products with zero counts
    Object.keys(voteData.voteCounts).forEach(productId => {
      if (!actualCounts[productId]) {
        console.log(chalk.yellow(`Product ${productId} has vote counts but no actual votes. Resetting to zero.`));
        
        if (!DRY_RUN) {
          voteData.voteCounts[productId] = { upvotes: 0, downvotes: 0 };
        }
        
        inconsistencies.push({
          productId,
          stored: { ...voteData.voteCounts[productId] },
          actual: { upvotes: 0, downvotes: 0 },
          difference: {
            upvotes: -voteData.voteCounts[productId].upvotes,
            downvotes: -voteData.voteCounts[productId].downvotes
          }
        });
        
        fixedProducts++;
      }
    });

    // Update score values for each product
    Object.entries(voteData.voteCounts).forEach(([productId, counts]) => {
      const score = (counts.upvotes || 0) - (counts.downvotes || 0);
      // This is optional as score is typically calculated at runtime,
      // but we could store it for performance reasons
    });

    // Display results
    if (inconsistencies.length > 0) {
      console.log(chalk.yellow(`Found ${inconsistencies.length} products with inconsistent vote counts:`));
      
      inconsistencies.forEach(({ productId, stored, actual, difference }) => {
        console.log(chalk.yellow(`\nProduct: ${productId}`));
        console.log(`  Stored: upvotes=${stored.upvotes}, downvotes=${stored.downvotes}`);
        console.log(`  Actual: upvotes=${actual.upvotes}, downvotes=${actual.downvotes}`);
        console.log(chalk.red(`  Difference: upvotes=${difference.upvotes > 0 ? '+' : ''}${difference.upvotes}, downvotes=${difference.downvotes > 0 ? '+' : ''}${difference.downvotes}`));
      });
      
      if (!DRY_RUN) {
        // Update timestamp and save the fixed data
        voteData.lastUpdated = new Date().toISOString();
        fs.writeFileSync(VOTES_FILE, JSON.stringify(voteData, null, 2), 'utf8');
        console.log(chalk.green(`\nFixes applied to ${fixedProducts} products and saved to ${VOTES_FILE}`));
      } else {
        console.log(chalk.yellow(`\nDRY RUN: ${fixedProducts} products would be fixed`));
      }
    } else {
      console.log(chalk.green('All vote counts are consistent! No fixes needed.'));
    }

  } catch (error) {
    console.error(chalk.red('Error fixing vote counts:'), error);
    process.exit(1);
  }
}

// Run the script
fixVoteCounts()
  .then(() => {
    console.log(chalk.blue('\nVote count repair complete.'));
  })
  .catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }); 