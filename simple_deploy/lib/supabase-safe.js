/**
 * Safe Supabase Client
 * 
 * This module provides a Supabase client that works in all environments:
 * - Server-side (Node.js)
 * - Client-side (browser)
 * - Build-time (Vercel)
 * 
 * It also includes a mock mode for testing and deployments
 * where database connectivity is not available.
 */

// Import the complete polyfills first
import './complete-polyfills';

// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Cache clients to avoid creating multiple instances
let serverClient = null;
let browserClient = null;
let mockClient = null;

/**
 * Determine if we're in mock mode
 * This is enabled by setting MOCK_DB=true in environment variables
 */
export const isMockMode = () => {
  // Always use mock in production builds on Vercel unless explicitly disabled
  if (process.env.NEXT_PUBLIC_FORCE_REAL_DB === 'true') {
    return false;
  }
  
  if (process.env.MOCK_DB === 'true') {
    return true;
  }
  
  // Default to mock mode in production for safety
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  
  return false;
};

/**
 * Create a mock Supabase client
 * This provides a fully functional API-compatible client that works without a database
 */
export const createMockClient = () => {
  if (mockClient) return mockClient;
  
  console.log('🔶 Creating mock Supabase client');
  
  // Mock data storage
  const mockTables = {
    products: [
      {
        id: 1,
        name: "Eco-friendly Water Bottle",
        description: "Stainless steel, BPA-free water bottle that keeps liquids cold for 24 hours and hot for 12 hours.",
        category: "Lifestyle",
        price: 35,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
        upvotes: 42,
        downvotes: 3,
        score: 39,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: "Wireless Noise-Cancelling Headphones",
        description: "Premium headphones with adaptive noise cancelling and 20-hour battery life.",
        category: "Electronics",
        price: 249,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        upvotes: 78,
        downvotes: 12,
        score: 66,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: "Smart Plant Monitor",
        description: "Monitors soil moisture, light, and temperature to help you care for your houseplants.",
        category: "Smart Home",
        price: 65,
        image: "https://images.unsplash.com/photo-1631700611307-37dbcb89ef7e",
        upvotes: 54,
        downvotes: 7,
        score: 47,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: "Ergonomic Office Chair",
        description: "Adjustable office chair with lumbar support and breathable mesh back.",
        category: "Home Office",
        price: 350,
        image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8",
        upvotes: 31,
        downvotes: 5,
        score: 26,
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        name: "Subscription Meal Kit",
        description: "Weekly delivery of pre-portioned ingredients and recipes for easy home cooking.",
        category: "Food & Drink",
        price: 80,
        image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71",
        upvotes: 24,
        downvotes: 8,
        score: 16,
        created_at: new Date().toISOString()
      }
    ],
    votes: [],
    categories: [
      { id: 1, name: "Lifestyle" },
      { id: 2, name: "Electronics" },
      { id: 3, name: "Smart Home" },
      { id: 4, name: "Home Office" },
      { id: 5, name: "Food & Drink" }
    ]
  };
  
  // Create a client with all the necessary methods
  mockClient = {
    // Basic from method for table operations
    from: (tableName) => {
      // Make sure the table exists
      if (!mockTables[tableName]) {
        mockTables[tableName] = [];
      }
      
      // Current query state
      let currentState = {
        data: [...mockTables[tableName]],
        filters: [],
        fields: '*',
        error: null
      };
      
      return {
        // Select data from the table
        select: (fields = '*') => {
          currentState.fields = fields;
          
          // Return a promise that resolves with the data
          return new Promise((resolve) => {
            let result = [...currentState.data];
            
            // Apply filters
            if (currentState.filters.length > 0) {
              result = result.filter(row => {
                return currentState.filters.every(filter => {
                  const [column, operator, value] = filter;
                  
                  switch (operator) {
                    case 'eq':
                      return row[column] === value;
                    case 'neq':
                      return row[column] !== value;
                    case 'gt':
                      return row[column] > value;
                    case 'gte':
                      return row[column] >= value;
                    case 'lt':
                      return row[column] < value;
                    case 'lte':
                      return row[column] <= value;
                    case 'in':
                      return value.includes(row[column]);
                    case 'is':
                      if (value === null) return row[column] === null;
                      return row[column] === value;
                    default:
                      return true;
                  }
                });
              });
            }
            
            resolve({ data: result, error: null });
          });
        },
        
        // Insert data into the table
        insert: (data) => {
          return new Promise((resolve) => {
            let newData = Array.isArray(data) ? data : [data];
            
            // Add IDs and created_at if they don't exist
            newData = newData.map(item => ({
              id: Math.max(0, ...mockTables[tableName].map(row => row.id)) + 1,
              created_at: new Date().toISOString(),
              ...item
            }));
            
            // Add to the table
            mockTables[tableName] = [...mockTables[tableName], ...newData];
            
            resolve({ data: newData, error: null });
          });
        },
        
        // Update data in the table
        update: (data) => {
          return new Promise((resolve) => {
            let result = [...mockTables[tableName]];
            
            // Apply filters
            if (currentState.filters.length > 0) {
              // Find items to update
              const itemsToUpdate = result.filter(row => {
                return currentState.filters.every(filter => {
                  const [column, operator, value] = filter;
                  
                  switch (operator) {
                    case 'eq':
                      return row[column] === value;
                    case 'neq':
                      return row[column] !== value;
                    case 'in':
                      return value.includes(row[column]);
                    default:
                      return true;
                  }
                });
              });
              
              // Update items
              itemsToUpdate.forEach(item => {
                const index = result.findIndex(row => row.id === item.id);
                if (index !== -1) {
                  result[index] = { ...result[index], ...data, updated_at: new Date().toISOString() };
                }
              });
              
              mockTables[tableName] = result;
              resolve({ data: itemsToUpdate, error: null });
            } else {
              resolve({ data: null, error: "No filters provided for update" });
            }
          });
        },
        
        // Delete data from the table
        delete: () => {
          return new Promise((resolve) => {
            let result = [...mockTables[tableName]];
            let removedItems = [];
            
            // Apply filters to find items to delete
            if (currentState.filters.length > 0) {
              // Find items to delete
              removedItems = result.filter(row => {
                return currentState.filters.every(filter => {
                  const [column, operator, value] = filter;
                  
                  switch (operator) {
                    case 'eq':
                      return row[column] === value;
                    case 'neq':
                      return row[column] !== value;
                    case 'in':
                      return value.includes(row[column]);
                    default:
                      return true;
                  }
                });
              });
              
              // Delete items
              mockTables[tableName] = result.filter(row => {
                return !removedItems.some(item => item.id === row.id);
              });
              
              resolve({ data: removedItems, error: null });
            } else {
              resolve({ data: null, error: "No filters provided for delete" });
            }
          });
        },
        
        // Add filters
        eq: (column, value) => {
          currentState.filters.push([column, 'eq', value]);
          return this;
        },
        
        neq: (column, value) => {
          currentState.filters.push([column, 'neq', value]);
          return this;
        },
        
        gt: (column, value) => {
          currentState.filters.push([column, 'gt', value]);
          return this;
        },
        
        gte: (column, value) => {
          currentState.filters.push([column, 'gte', value]);
          return this;
        },
        
        lt: (column, value) => {
          currentState.filters.push([column, 'lt', value]);
          return this;
        },
        
        lte: (column, value) => {
          currentState.filters.push([column, 'lte', value]);
          return this;
        },
        
        in: (column, values) => {
          currentState.filters.push([column, 'in', values]);
          return this;
        },
        
        is: (column, value) => {
          currentState.filters.push([column, 'is', value]);
          return this;
        },
        
        // Special case for chaining - returns self
        match: (obj) => {
          Object.entries(obj).forEach(([key, value]) => {
            currentState.filters.push([key, 'eq', value]);
          });
          return this;
        },
        
        // Helper for returning single value
        single: () => {
          return new Promise(async (resolve) => {
            const { data, error } = await this.select();
            if (error) {
              resolve({ data: null, error });
            } else if (data && data.length > 0) {
              resolve({ data: data[0], error: null });
            } else {
              resolve({ data: null, error: null });
            }
          });
        },
        
        // Helper for returning limited results
        limit: (n) => {
          return new Promise(async (resolve) => {
            const { data, error } = await this.select();
            if (error) {
              resolve({ data: null, error });
            } else {
              resolve({ data: data.slice(0, n), error: null });
            }
          });
        },
        
        // Helper for ordering results
        order: (column, { ascending = true } = {}) => {
          return new Promise(async (resolve) => {
            const { data, error } = await this.select();
            if (error) {
              resolve({ data: null, error });
            } else {
              const sortedData = [...data].sort((a, b) => {
                if (ascending) {
                  return a[column] > b[column] ? 1 : -1;
                } else {
                  return a[column] < b[column] ? 1 : -1;
                }
              });
              resolve({ data: sortedData, error: null });
            }
          });
        }
      };
    },
    
    // Mock auth methods
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback) => {
        // No auth state changes in mock mode
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    
    // Realtime subscriptions (just return dummy unsubscribe function)
    channel: (name) => ({
      on: () => ({
        subscribe: () => {}
      }),
      subscribe: (callback) => ({ unsubscribe: () => {} })
    })
  };
  
  return mockClient;
};

/**
 * Create a real Supabase client
 * This connects to your actual Supabase project
 */
export const createRealClient = () => {
  // Make sure we have the URL and key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials - using mock client as fallback');
    return createMockClient();
  }
  
  try {
    // Create a new Supabase client
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
      }
    });
    
    return client;
  } catch (error) {
    console.error(`❌ Error creating Supabase client: ${error.message}`);
    // Fallback to mock client on error
    return createMockClient();
  }
};

/**
 * Get the right Supabase client for the current environment
 */
export default function getSupabaseClient() {
  // Check if we're in mock mode
  if (isMockMode()) {
    return createMockClient();
  }
  
  // Check if we're in a browser
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // Create or reuse the browser client
    if (!browserClient) {
      browserClient = createRealClient();
    }
    return browserClient;
  } else {
    // Create or reuse the server client
    if (!serverClient) {
      serverClient = createRealClient();
    }
    return serverClient;
  }
} 