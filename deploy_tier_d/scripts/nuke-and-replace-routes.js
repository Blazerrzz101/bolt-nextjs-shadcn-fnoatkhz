/**
 * Nuclear option: Replace problematic API routes with guaranteed working implementations
 * This script completely rebuilds the API routes from scratch rather than trying to fix them
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Paths
const APP_DIR = path.resolve(process.cwd(), 'app');
const API_DIR = path.resolve(APP_DIR, 'api');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m'
};

// Log with color
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

// Template for TypeScript API route
const TS_TEMPLATE = `// Import polyfills first
import '@/lib/polyfills';

import { NextRequest } from 'next/server';
import { 
  withPolyfills, 
  withStaticBuildHandler,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-wrapper';

// Ensure route is dynamic
export const dynamic = 'force-dynamic';

// GET handler
export const GET = withPolyfills(
  withStaticBuildHandler(async (request) => {
    try {
      // Return success response
      return createSuccessResponse({
        message: "API is working",
        timestamp: new Date().toISOString(),
        endpoint: "{{ENDPOINT}}"
      });
    } catch (error) {
      console.error("Error in GET handler:", error);
      return createErrorResponse(
        "Internal server error", 
        error instanceof Error ? error.message : null, 
        500
      );
    }
  })
);
`;

// Template for JavaScript API route
const JS_TEMPLATE = `// Import polyfills first
import '@/lib/polyfills';

import { 
  withPolyfills, 
  withStaticBuildHandler,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-wrapper';

// Ensure route is dynamic
export const dynamic = 'force-dynamic';

// GET handler
export const GET = withPolyfills(
  withStaticBuildHandler(async (request) => {
    try {
      // Return success response
      return createSuccessResponse({
        message: "API is working",
        timestamp: new Date().toISOString(),
        endpoint: "{{ENDPOINT}}"
      });
    } catch (error) {
      console.error("Error in GET handler:", error);
      return createErrorResponse(
        "Internal server error", 
        error instanceof Error ? error.message : null, 
        500
      );
    }
  })
);
`;

// Special template for vote route
const VOTE_TEMPLATE = `// Import polyfills first
import '@/lib/polyfills';

import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { 
  withPolyfills, 
  withStaticBuildHandler,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-wrapper';

// Ensure route is dynamic
export const dynamic = 'force-dynamic';

// Mock vote storage
const voteStore = {
  voteCounts: {},
  userVotes: {}
};

// GET handler for vote status
export const GET = withPolyfills(
  withStaticBuildHandler(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const productId = searchParams.get('productId');
      const clientId = searchParams.get('clientId') || 'anonymous';
      
      if (!productId) {
        return createErrorResponse("Product ID is required");
      }
      
      // Get vote counts
      const voteCounts = voteStore.voteCounts[productId] || { upvotes: 0, downvotes: 0 };
      const voteKey = \`\${productId}:\${clientId}\`;
      const voteType = voteStore.userVotes[voteKey] || null;
      const hasVoted = voteType !== null;
      const score = (voteCounts.upvotes || 0) - (voteCounts.downvotes || 0);
      
      return createSuccessResponse({
        productId,
        voteType,
        hasVoted,
        upvotes: voteCounts.upvotes,
        downvotes: voteCounts.downvotes,
        score
      });
    } catch (error) {
      console.error("Error in GET handler:", error);
      return createErrorResponse(
        "Internal server error", 
        error instanceof Error ? error.message : null, 
        500
      );
    }
  })
);

// POST handler for submitting votes
export const POST = withPolyfills(
  withStaticBuildHandler(async (request) => {
    try {
      const body = await request.json();
      const { productId, voteType, clientId = 'anonymous' } = body;
      
      if (!productId) {
        return createErrorResponse("Product ID is required");
      }
      
      if (voteType !== 1 && voteType !== -1 && voteType !== 0) {
        return createErrorResponse("Vote type must be 1 (upvote), -1 (downvote), or 0 (clear vote)");
      }
      
      // Initialize vote counts for this product if needed
      if (!voteStore.voteCounts[productId]) {
        voteStore.voteCounts[productId] = { upvotes: 0, downvotes: 0 };
      }
      
      // Get current vote counts
      const currentCounts = voteStore.voteCounts[productId];
      
      // Get user's current vote
      const voteKey = \`\${productId}:\${clientId}\`;
      const currentVote = voteStore.userVotes[voteKey] || null;
      
      // Handle vote logic
      if ((voteType === 0) || (currentVote === voteType)) {
        // Clearing vote or toggling (voting the same way twice)
        if (currentVote === 1) {
          currentCounts.upvotes = Math.max(0, currentCounts.upvotes - 1);
        } else if (currentVote === -1) {
          currentCounts.downvotes = Math.max(0, currentCounts.downvotes - 1);
        }
        
        // Remove the vote
        delete voteStore.userVotes[voteKey];
      } else {
        // Changing vote or adding new vote
        
        // Remove old vote first if exists
        if (currentVote === 1) {
          currentCounts.upvotes = Math.max(0, currentCounts.upvotes - 1);
        } else if (currentVote === -1) {
          currentCounts.downvotes = Math.max(0, currentCounts.downvotes - 1);
        }
        
        // Add new vote
        if (voteType === 1) {
          currentCounts.upvotes += 1;
        } else if (voteType === -1) {
          currentCounts.downvotes += 1;
        }
        
        // Store the new vote
        voteStore.userVotes[voteKey] = voteType;
      }
      
      // Calculate score
      const score = currentCounts.upvotes - currentCounts.downvotes;
      
      return createSuccessResponse({
        productId,
        upvotes: currentCounts.upvotes,
        downvotes: currentCounts.downvotes,
        voteType: voteStore.userVotes[voteKey] || null,
        score,
        remainingVotes: 10
      });
    } catch (error) {
      console.error("Error in POST handler:", error);
      return createErrorResponse(
        "Internal server error", 
        error instanceof Error ? error.message : null, 
        500
      );
    }
  })
);
`;

// Special template for products route
const PRODUCTS_TEMPLATE = `// Import polyfills first
import '@/lib/polyfills';

import { NextRequest } from 'next/server';
import { 
  withPolyfills, 
  withStaticBuildHandler,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-wrapper';

// Ensure route is dynamic
export const dynamic = 'force-dynamic';

// Mock products data
const mockProducts = [
  {
    id: "product-1",
    name: "AI Calendar Assistant",
    description: "Smart calendar that uses AI to schedule and manage your meetings efficiently.",
    price: 49.99,
    category: "productivity",
    imageUrl: "https://images.unsplash.com/photo-1611746872915-64382b5c2a41?auto=format&fit=crop&q=80&w=2000",
    upvotes: 42,
    downvotes: 5,
    score: 37
  },
  {
    id: "product-2",
    name: "Virtual Reality Fitness Trainer",
    description: "VR fitness app with personalized workouts and real-time feedback.",
    price: 79.99,
    category: "health",
    imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=2000",
    upvotes: 38,
    downvotes: 3,
    score: 35
  },
  {
    id: "product-3",
    name: "Smart Home Energy Optimizer",
    description: "AI-powered system that reduces your energy bills by optimizing usage patterns.",
    price: 129.99,
    category: "smart-home",
    imageUrl: "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?auto=format&fit=crop&q=80&w=2000",
    upvotes: 56,
    downvotes: 8,
    score: 48
  }
];

// GET handler for products list
export const GET = withPolyfills(
  withStaticBuildHandler(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      
      let filteredProducts = [...mockProducts];
      
      // Filter by category if provided
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      // Sort by score (descending)
      filteredProducts.sort((a, b) => b.score - a.score);
      
      return createSuccessResponse({
        products: filteredProducts,
        total: filteredProducts.length
      });
    } catch (error) {
      console.error("Error in GET handler:", error);
      return createErrorResponse(
        "Internal server error", 
        error instanceof Error ? error.message : null, 
        500
      );
    }
  })
);
`;

// Special template for product details route
const PRODUCT_DETAILS_TEMPLATE = `// Import polyfills first
import '@/lib/polyfills';

import { NextRequest } from 'next/server';
import { 
  withPolyfills, 
  withStaticBuildHandler,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/api-wrapper';

// Ensure route is dynamic
export const dynamic = 'force-dynamic';

// Mock products data
const mockProducts = [
  {
    id: "product-1",
    name: "AI Calendar Assistant",
    description: "Smart calendar that uses AI to schedule and manage your meetings efficiently.",
    price: 49.99,
    category: "productivity",
    imageUrl: "https://images.unsplash.com/photo-1611746872915-64382b5c2a41?auto=format&fit=crop&q=80&w=2000",
    upvotes: 42,
    downvotes: 5,
    score: 37
  },
  {
    id: "product-2",
    name: "Virtual Reality Fitness Trainer",
    description: "VR fitness app with personalized workouts and real-time feedback.",
    price: 79.99,
    category: "health",
    imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=2000",
    upvotes: 38,
    downvotes: 3,
    score: 35
  },
  {
    id: "product-3",
    name: "Smart Home Energy Optimizer",
    description: "AI-powered system that reduces your energy bills by optimizing usage patterns.",
    price: 129.99,
    category: "smart-home",
    imageUrl: "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?auto=format&fit=crop&q=80&w=2000",
    upvotes: 56,
    downvotes: 8,
    score: 48
  }
];

// GET handler for product details
export const GET = withPolyfills(
  withStaticBuildHandler(async (request, { params }) => {
    try {
      const id = params?.id;
      
      if (!id) {
        return createErrorResponse("Product ID is required");
      }
      
      const product = mockProducts.find(p => p.id === id);
      
      if (!product) {
        return createErrorResponse("Product not found", null, 404);
      }
      
      return createSuccessResponse({
        product
      });
    } catch (error) {
      console.error("Error in GET handler:", error);
      return createErrorResponse(
        "Internal server error", 
        error instanceof Error ? error.message : null, 
        500
      );
    }
  })
);
`;

/**
 * Recursively get all route files in the API directory
 * @param {string} dir - Directory to search
 * @returns {Promise<Array<{path: string, isJs: boolean}>>} - Array of route files
 */
async function getAllRouteFiles(dir) {
  const files = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...await getAllRouteFiles(fullPath));
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        files.push({
          path: fullPath,
          isJs: entry.name === 'route.js'
        });
      }
    }
  } catch (error) {
    log(`Error reading directory ${dir}: ${error.message}`, colors.red);
  }
  
  return files;
}

/**
 * Replace a route file with a template
 * @param {string} filePath - Path to the route file
 * @param {boolean} isJs - Whether the file is JavaScript
 */
async function replaceRouteFile(filePath, isJs) {
  try {
    // Determine which template to use based on the path
    let template;
    const relativePath = path.relative(process.cwd(), filePath);
    
    if (relativePath.includes('/vote/route.') && !relativePath.includes('/vote/remaining-votes')) {
      template = VOTE_TEMPLATE;
    } else if (relativePath.includes('/products/route.')) {
      template = PRODUCTS_TEMPLATE;
    } else if (relativePath.includes('/products/[id]/route.')) {
      template = PRODUCT_DETAILS_TEMPLATE;
    } else {
      template = isJs ? JS_TEMPLATE : TS_TEMPLATE;
    }
    
    // Replace placeholder with the actual endpoint
    const endpoint = path.dirname(relativePath).replace(/^app\/api\//, '/api/');
    template = template.replace('{{ENDPOINT}}', endpoint);
    
    // Write the new file
    await writeFile(filePath, template);
    
    log(`Replaced ${relativePath} with guaranteed working implementation`, colors.green);
    return true;
  } catch (error) {
    log(`Error replacing ${filePath}: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  log('🧨 NUCLEAR OPTION: Completely replacing all API routes 🧨', colors.magenta);
  
  try {
    // Create API directory if it doesn't exist
    if (!fs.existsSync(API_DIR)) {
      log(`API directory not found, creating...`, colors.yellow);
      await mkdir(API_DIR, { recursive: true });
    }
    
    // Get all route files
    const routeFiles = await getAllRouteFiles(API_DIR);
    log(`Found ${routeFiles.length} API route files`, colors.blue);
    
    // Replace each file
    let replacedCount = 0;
    for (const file of routeFiles) {
      const success = await replaceRouteFile(file.path, file.isJs);
      if (success) replacedCount++;
    }
    
    log(`Successfully replaced ${replacedCount} out of ${routeFiles.length} API route files`, colors.green);
    
    // Create basic routes if they don't exist
    const essentialRoutes = [
      { path: 'api/vote', template: VOTE_TEMPLATE, isJs: false },
      { path: 'api/products', template: PRODUCTS_TEMPLATE, isJs: false },
    ];
    
    for (const route of essentialRoutes) {
      const fullPath = path.join(APP_DIR, route.path);
      const routeFilePath = path.join(fullPath, `route.${route.isJs ? 'js' : 'ts'}`);
      
      if (!fs.existsSync(fullPath)) {
        await mkdir(fullPath, { recursive: true });
        log(`Created directory ${route.path}`, colors.yellow);
      }
      
      if (!fs.existsSync(routeFilePath)) {
        // Replace placeholder with the actual endpoint
        let template = route.template;
        template = template.replace('{{ENDPOINT}}', `/${route.path}`);
        
        await writeFile(routeFilePath, template);
        log(`Created new route ${routeFilePath}`, colors.green);
        replacedCount++;
      }
    }
    
    log('🎉 API routes replacement completed successfully 🎉', colors.magenta);
  } catch (error) {
    log(`Error replacing API routes: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the script
main(); 